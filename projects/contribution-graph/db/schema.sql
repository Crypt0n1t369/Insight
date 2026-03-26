-- Contribution Graph — Database Schema
-- Based on: IDENTITY-ARCHITECTURE.md
-- Generated: 2026-03-26
-- Status: Foundation schema (Phase 0 build target)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CORE USER PROFILE
-- Linked to Telegram user_id as primary key
-- =============================================================================
CREATE TABLE users (
    telegram_user_id  BIGINT PRIMARY KEY,  -- From Telegram message (set by Telegram, not user)
    short_code       VARCHAR(12) UNIQUE NOT NULL,  -- e.g. CG-X7K2M9
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_mode VARCHAR(20) DEFAULT 'focus',  -- 'full' | 'focus' | 'off'
    current_phase    VARCHAR(30),  -- e.g. 'discovery_1', 'mirror', 'first_stretch'
    current_session_id UUID,
    map_public       BOOLEAN DEFAULT TRUE,  -- Shareable map page requires no auth
    display_name     VARCHAR(100),
    referrer_code    VARCHAR(12)  -- Who referred them (short_code of referrer)
);

-- Index for short_code lookups (rate-limited, needs index)
CREATE INDEX idx_users_short_code ON users(short_code);

-- Index for re-engagement queries (users inactive > N days)
CREATE INDEX idx_users_last_active ON users(last_active);

-- =============================================================================
-- BEHAVIORAL SIGNALS
-- Accumulated per user, collected across all sessions
-- =============================================================================
CREATE TABLE signals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
    signal_type     VARCHAR(30) NOT NULL,  -- e.g. 'intrinsic_motivation', 'synthesis_quality'
    value           JSONB NOT NULL,       -- Raw signal data
    confidence      FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),  -- 0-1
    source_session  UUID,  -- Which conversation session this came from
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for per-user signal queries
CREATE INDEX idx_signals_user_id ON signals(user_id);
-- Index for signal type aggregation
CREATE INDEX idx_signals_type ON signals(signal_type);
-- GIN index on JSONB value for flexible querying
CREATE INDEX idx_signals_value ON signals USING GIN (value);

-- =============================================================================
-- COMPARATIVE VECTOR
-- Computed advantage map, evolves over time (updated after 3+ sessions or 15+ challenges)
-- =============================================================================
CREATE TABLE comparative_vector (
    user_id          BIGINT PRIMARY KEY REFERENCES users(telegram_user_id) ON DELETE CASCADE,
    vector           JSONB NOT NULL,  -- e.g. {"pattern_recognition": 0.82, "synthesis": 0.65, ...}
    confidence       JSONB NOT NULL,  -- Confidence per dimension: {"pattern_recognition": 0.9, ...}
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version          INT DEFAULT 1
);

-- =============================================================================
-- CHALLENGE HISTORY
-- Tracks challenges completed/abandoned + evidence
-- =============================================================================
CREATE TABLE challenge_history (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
    challenge_type   VARCHAR(30) NOT NULL,  -- e.g. 'impact', 'creative', 'business'
    challenge_id     VARCHAR(30) NOT NULL,  -- e.g. 'improve_001', 'create_portfolio'
    status           VARCHAR(20) NOT NULL DEFAULT 'in_progress',  -- 'in_progress' | 'completed' | 'abandoned'
    evidence         JSONB,  -- What the user produced
    peer_attestation JSONB,  -- Peer validation if applicable
    completed_at     TIMESTAMP WITH TIME ZONE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for per-user challenge history
CREATE INDEX idx_challenges_user_id ON challenge_history(user_id);
-- Index for challenge status filtering
CREATE INDEX idx_challenges_status ON challenge_history(status);
-- Index for challenge type filtering
CREATE INDEX idx_challenges_type ON challenge_history(challenge_type);

-- =============================================================================
-- MAP VERSION HISTORY
-- For "your map just updated" re-engagement feature
-- =============================================================================
CREATE TABLE map_versions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
    version      INT NOT NULL,
    snapshot     JSONB NOT NULL,  -- Full map snapshot at this version
    change_note  VARCHAR(100),    -- "Completed first challenge" / "New pattern detected"
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, version)
);

-- Index for latest map version lookup
CREATE INDEX idx_map_versions_user_version ON map_versions(user_id, version DESC);

-- =============================================================================
-- CONVERSATION SESSIONS
-- Full conversation history for resuming where users left off
-- =============================================================================
CREATE TABLE conversation_sessions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      BIGINT NOT NULL REFERENCES users(telegram_user_id) ON DELETE CASCADE,
    phase        VARCHAR(30) NOT NULL,  -- e.g. 'discovery_1', 'mirror', 'first_stretch'
    messages     JSONB NOT NULL,        -- Full conversation: [{"role": "user", "content": "...", "ts": ...}, ...]
    ended_at     TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for per-user session queries
CREATE INDEX idx_sessions_user_id ON conversation_sessions(user_id);
-- Index for finding active/incomplete sessions
CREATE INDEX idx_sessions_ended_at ON conversation_sessions(ended_at) WHERE ended_at IS NULL;

-- =============================================================================
-- SHORT CODE RATE LIMITING
-- Tracks verification attempts per IP for short_code lookup
-- =============================================================================
CREATE TABLE short_code_attempts (
    ip_address    INET NOT NULL,
    attempted_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    short_code    VARCHAR(12),
    success       BOOLEAN
);

-- Index for rate limiting (3 attempts per minute per IP)
CREATE INDEX idx_attempts_ip_minute ON short_code_attempts(ip_address, attempted_at DESC);
-- Periodic cleanup of old attempts (run via cron or extension)
CREATE INDEX idx_attempts_cleanup ON short_code_attempts(attempted_at) WHERE attempted_at < NOW() - INTERVAL '1 hour';

-- =============================================================================
-- TRIGGERS & AUTOMATIONS
-- =============================================================================

-- Auto-update `last_active` on users table when they have new signals/sessions
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET last_active = NOW() WHERE telegram_user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_signals_last_active
    AFTER INSERT ON signals
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

CREATE TRIGGER trg_sessions_last_active
    AFTER INSERT ON conversation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

-- Auto-increment map version on significant changes
CREATE OR REPLACE FUNCTION bump_map_version()
RETURNS TRIGGER AS $$
DECLARE
    next_ver INT;
BEGIN
    SELECT COALESCE(MAX(version), 0) + 1 INTO next_ver
    FROM map_versions WHERE user_id = NEW.user_id;
    INSERT INTO map_versions (user_id, version, snapshot, change_note)
    VALUES (NEW.user_id, next_ver, NEW.snapshot, NEW.change_note);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Row-Level Security (RLS)
-- Users can only see their own data
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparative_vector ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;

-- Note: The map_versions and challenge_history can be PUBLIC (map is shareable)
-- Only conversation_sessions and signals need RLS

-- =============================================================================
-- NOTES FOR IMPLEMENTATION
-- =============================================================================
-- 1. Short_code generation: server-side only, uses cryptographically secure randomness
--    The same telegram_user_id always gets the same short_code (deterministic with SERVER_SECRET)
--    Format: CG-[A-Z0-9]{6} (6 chars after prefix)
--
-- 2. Telegram user_id comes from message.from.id (set by Telegram infrastructure, not user)
--    This prevents ID spoofing
--
-- 3. Map page is public by default (shareable URL) — this is intentional
--    Users control what appears on their map
--
-- 4. Rate limiting: max 3 short_code verification attempts per minute per IP
--    Implemented at application layer, not DB layer
--
-- 5. Notification modes:
--    - full: all re-engagement triggers active
--    - focus: only challenge completed + map milestone (2-3/week max)
--    - off: user must initiate all return visits
