"""
Contribution Graph — Telegram Polling Bot

Polls the Telegram Bot API for updates and routes them to handlers.
Can run as a standalone process or be imported as a module.

Usage:
    python -m bot.polling

Requirements:
    TELEGRAM_BOT_TOKEN env var must be set.

Architecture:
    Long polling via getUpdates (offset-based).
    Stores last processed update_id to avoid reprocessing.
    User state is persisted to the configured store (InMemoryStore or SQLiteInMemoryStore).
"""

import os
import sys
import json
import time
import logging
import signal
import threading
from pathlib import Path
from typing import Optional

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import httpx
from bot.handlers import handle_update
from bot.states import UserState, Phase

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(levelname)s — %(message)s",
)
logger = logging.getLogger(__name__)

# =============================================================================
# CONFIG
# =============================================================================

TELEGRAM_API = "https://api.telegram.org"
POLL_TIMEOUT = 55  # seconds (Telegram's max is 60)
STATE_FILE = Path(__file__).parent.parent / "data" / "bot_state.json"
STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

# Import map store for syncing Telegram user data → web map
# This allows the bot to write user data that the CG Web server can then display
from web.store import SQLiteInMemoryStore

# Singleton map store — shared between bot and web
_map_store: Optional[SQLiteInMemoryStore] = None


def get_map_store() -> SQLiteInMemoryStore:
    """Get or create the shared SQLite map store."""
    global _map_store
    if _map_store is None:
        db_path = Path(__file__).parent.parent / "data" / "contribution_graph.db"
        _map_store = SQLiteInMemoryStore(str(db_path))
        logger.info(f"Map store initialized: {db_path}")
    return _map_store


def get_token() -> str:
    token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    if not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN environment variable is not set.")
    return token


def api_url(token: str, method: str) -> str:
    return f"{TELEGRAM_API}/bot{token}/{method}"


# =============================================================================
# USER STATE PERSISTENCE
# =============================================================================

class BotStateStore:
    """
    Persists user states and last processed update_id to disk.
    Loads on startup, saves on every state change.
    """

    def __init__(self, path: Path = STATE_FILE):
        self.path = path
        self.data: dict = {"users": {}, "last_update_id": 0}
        self._lock = threading.Lock()
        if path.exists():
            try:
                self.data = json.loads(path.read_text())
                logger.info(f"Loaded bot state: {len(self.data['users'])} users, last_update_id={self.data['last_update_id']}")
            except Exception as e:
                logger.warning(f"Could not load bot state: {e}. Starting fresh.")
                self.data = {"users": {}, "last_update_id": 0}

    def save(self):
        with self._lock:
            self.path.write_text(json.dumps(self.data, indent=2))

    def get_user_state(self, telegram_user_id: int) -> UserState:
        user_data = self.data["users"].get(str(telegram_user_id), {})
        return _dict_to_user_state(user_data, telegram_user_id)

    def save_user_state(self, state: UserState):
        with self._lock:
            self.data["users"][str(state.telegram_user_id)] = _user_state_to_dict(state)
        self.save()

    def get_last_update_id(self) -> int:
        return self.data.get("last_update_id", 0)

    def set_last_update_id(self, update_id: int):
        with self._lock:
            self.data["last_update_id"] = update_id
        self.save()


def _user_state_to_dict(state: UserState) -> dict:
    return {
        "phase": state.phase.value,
        "session_id": str(state.session_id) if state.session_id else None,
        "signals": [
            {
                "signal_type": s.signal_type.value,
                "value": s.value,
                "confidence": s.confidence,
                "question_id": s.question_id,
            }
            for s in state.signals
        ],
        "mirror_summary": state.mirror_summary,
        "chosen_challenge": state.chosen_challenge,
        "evidence": state.evidence,
        "quick_replies": state.quick_replies,
        "last_message_at": state.last_message_at,
    }


def _dict_to_user_state(data: dict, telegram_user_id: int) -> UserState:
    from uuid import UUID
    state = UserState(telegram_user_id=telegram_user_id)
    if not data:
        return state
    state.phase = Phase(data.get("phase", "new"))
    if data.get("session_id"):
        state.session_id = UUID(data["session_id"])
    from bot.states import ConversationSignal, SignalType
    for sig in data.get("signals", []):
        state.signals.append(ConversationSignal(
            signal_type=SignalType(sig["signal_type"]),
            value=sig["value"],
            confidence=sig["confidence"],
            question_id=sig["question_id"],
        ))
    state.mirror_summary = data.get("mirror_summary")
    state.chosen_challenge = data.get("chosen_challenge")
    state.evidence = data.get("evidence")
    state.quick_replies = data.get("quick_replies", [])
    state.last_message_at = data.get("last_message_at")
    return state


# =============================================================================
# TELEGRAM API CLIENT
# =============================================================================

class TelegramBot:
    def __init__(self, token: str, store: BotStateStore):
        self.token = token
        self.store = store
        self.http = httpx.Client(timeout=POLL_TIMEOUT + 5)
        self.running = False

    def _get_updates(self, offset: int) -> list[dict]:
        """Fetch updates from Telegram using long polling"""
        resp = self.http.get(
            api_url(self.token, "getUpdates"),
            params={"offset": offset, "timeout": POLL_TIMEOUT},
        )
        resp.raise_for_status()
        data = resp.json()
        if not data.get("ok"):
            logger.error(f"Telegram API error: {data}")
            return []
        return data.get("result", [])

    def _send_message(self, chat_id: int, text: str, reply_markup: dict = None) -> bool:
        """Send a text message to a Telegram chat"""
        payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
        if reply_markup:
            payload["reply_markup"] = json.dumps(reply_markup)
        try:
            resp = self.http.post(api_url(self.token, "sendMessage"), json=payload)
            resp.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Failed to send message to {chat_id}: {e}")
            return False

    def _build_reply_markup(self, state: UserState) -> Optional[dict]:
        """Build Telegram reply markup from quick replies"""
        if not state.quick_replies:
            return None
        keyboard = [[{"text": r}] for r in state.quick_replies]
        return {"keyboard": keyboard, "resize_keyboard": True, "one_time_keyboard": False}

    def process_update(self, update: dict) -> bool:
        """Process a single Telegram update"""
        message = update.get("message", {})
        if not message:
            return True  # Not a message — skip

        chat_id = message.get("chat", {}).get("id")
        text = message.get("text", "").strip()
        telegram_user_id = message.get("from", {}).get("id")
        from_user = message.get("from", {})

        if not telegram_user_id or not chat_id:
            return True  # Malformed update

        # Load user state
        state = self.store.get_user_state(telegram_user_id)

        # Route to handlers
        import asyncio
        try:
            response = asyncio.run(handle_update(update, state))
        except Exception as e:
            logger.exception(f"Error handling update for user {telegram_user_id}: {e}")
            response = "Something went wrong. Please try again or type /start to begin fresh."

        # Send response if non-empty
        if response:
            reply_markup = self._build_reply_markup(state)
            self._send_message(chat_id, response, reply_markup)

        # Save updated state to JSON (bot state)
        self.store.save_user_state(state)

        # Sync to map store (SQLite) so CG Web can display user's map
        self._sync_to_map_store(telegram_user_id, from_user, state)

        return True

    def _sync_to_map_store(self, telegram_user_id: int, from_user: dict, state: UserState):
        """
        Sync Telegram user conversation state → CG Web SQLite map store.
        
        This ensures that when users complete onboarding via Telegram,
        their signals and progress automatically appear on contributiongraph.ai/map.
        
        Args:
            telegram_user_id: The user's Telegram ID
            from_user: The Telegram 'from' object (has first_name, last_name)
            state: The current UserState after processing the update
        """
        try:
            from db.identity import generate_short_code
            
            map_store = get_map_store()
            short_code = generate_short_code(telegram_user_id)
            
            # Build display name from Telegram profile
            first_name = from_user.get("first_name", "")
            last_name = from_user.get("last_name", "")
            display_name = f"{first_name} {last_name}".strip() or f"User {telegram_user_id % 1000}"
            
            # Upsert user to map store
            map_store.upsert_user(
                telegram_user_id=telegram_user_id,
                short_code=short_code,
                display_name=display_name,
                phase=state.phase.value,
            )
            
            # Sync signals to map store
            for sig in state.signals:
                map_store.add_signal(
                    user_id=telegram_user_id,
                    signal_type=sig.signal_type.value,
                    value=sig.value,
                    confidence=sig.confidence,
                )
            
            # Sync comparative vector if signals exist
            if state.comparative_vector:
                map_store.set_comparative_vector(
                    user_id=telegram_user_id,
                    vector=state.comparative_vector,
                )
            
            # Sync challenge completion if phase is COMPLETED
            if state.phase.value == "completed" and state.chosen_challenge:
                challenge = state.chosen_challenge
                map_store.add_challenge(
                    user_id=telegram_user_id,
                    challenge_id=challenge.get("id", "unknown"),
                    challenge_type=challenge.get("type", "unknown"),
                    status="completed",
                    evidence=state.evidence or {},
                )
            
            logger.debug(f"Synced user {telegram_user_id} to map store: phase={state.phase.value}")
        except Exception as e:
            logger.exception(f"Failed to sync user {telegram_user_id} to map store: {e}")
            # Don't raise — map store sync failure shouldn't break bot functionality

    def run(self):
        """Main polling loop"""
        logger.info("Telegram bot starting...")
        self.running = True
        offset = self.store.get_last_update_id() + 1

        while self.running:
            try:
                updates = self._get_updates(offset)
                for update in updates:
                    update_id = update.get("update_id", 0)
                    try:
                        self.process_update(update)
                    except Exception as e:
                        logger.exception(f"Error processing update {update_id}: {e}")
                    offset = update_id + 1

                if updates:
                    self.store.set_last_update_id(offset - 1)

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 409:
                    logger.warning("Conflict: another bot instance is running. Sleeping 10s.")
                    time.sleep(10)
                else:
                    logger.error(f"HTTP error: {e}. Retrying in 5s.")
                    time.sleep(5)
            except Exception as e:
                logger.exception(f"Unexpected error in poll loop: {e}. Sleeping 5s.")
                time.sleep(5)

        logger.info("Telegram bot stopped.")

    def stop(self):
        self.running = False


# =============================================================================
# MAIN
# =============================================================================

def main():
    token = get_token()
    store = BotStateStore()

    bot = TelegramBot(token, store)

    # Handle graceful shutdown
    def signal_handler(sig, frame):
        logger.info("Shutdown signal received.")
        bot.stop()
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    logger.info(f"Bot polling as: https://t.me/")
    try:
        bot.run()
    except KeyboardInterrupt:
        bot.stop()


if __name__ == "__main__":
    main()
