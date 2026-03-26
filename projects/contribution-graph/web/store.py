"""
Contribution Graph — In-Memory Store (Development)

Simple in-memory store backed by SQLite for development.
In production, replace with PostgresStore using psycopg2.

This module provides:
- InMemoryStore: Full in-memory implementation (resets on restart)
- SQLiteInMemoryStore: SQLite-backed (persists across restarts)

Both implement the same interface, swappable via the store class.
"""

import json
import sqlite3
import uuid
import time
import threading
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field, asdict


@dataclass
class StoredUser:
    telegram_user_id: int
    short_code: str
    display_name: str = ""
    current_phase: str = "new"
    notification_mode: str = "focus"
    map_version: int = 1
    last_active: float = field(default_factory=time.time)


class InMemoryStore:
    """
    Simple in-memory store for development.
    Data is lost on restart — use SQLiteInMemoryStore for persistence.
    """

    def __init__(self):
        self._users: dict[int, StoredUser] = {}
        self._short_codes: dict[str, int] = {}  # short_code → telegram_user_id
        self._signals: dict[int, list[dict]] = {}  # telegram_user_id → signals
        self._vectors: dict[int, dict[str, float]] = {}  # telegram_user_id → comparative_vector
        self._challenges: dict[int, list[dict]] = {}  # telegram_user_id → challenges
        self._lock = threading.Lock()

    def upsert_user(self, telegram_user_id: int, short_code: str, display_name: str = "", phase: str = "new"):
        with self._lock:
            user = StoredUser(
                telegram_user_id=telegram_user_id,
                short_code=short_code,
                display_name=display_name or f"User {telegram_user_id % 1000}",
                current_phase=phase,
            )
            self._users[telegram_user_id] = user
            self._short_codes[short_code] = telegram_user_id

    def get_user_by_short_code(self, short_code: str) -> Optional[dict]:
        uid = self._short_codes.get(short_code)
        if uid is None:
            return None
        user = self._users.get(uid)
        return asdict(user) if user else None

    def get_user(self, telegram_user_id: int) -> Optional[dict]:
        user = self._users.get(telegram_user_id)
        return asdict(user) if user else None

    def add_signal(self, user_id: int, signal_type: str, value: dict, confidence: float):
        with self._lock:
            self._signals.setdefault(user_id, []).append({
                "type": signal_type,
                "value": value,
                "confidence": confidence,
                "ts": time.time(),
            })

    def get_signals(self, telegram_user_id: int) -> list[dict]:
        return list(self._signals.get(telegram_user_id, []))

    def set_comparative_vector(self, user_id: int, vector: dict[str, float]):
        with self._lock:
            self._vectors[user_id] = vector

    def get_comparative_vector(self, telegram_user_id: int) -> dict[str, float]:
        return dict(self._vectors.get(telegram_user_id, {}))

    def add_challenge(self, user_id: int, challenge_id: str, challenge_type: str, status: str, evidence: dict = None):
        with self._lock:
            self._challenges.setdefault(user_id, []).append({
                "challenge_id": challenge_id,
                "challenge_type": challenge_type,
                "status": status,
                "evidence": evidence or {},
                "completed_at": time.time() if status == "completed" else None,
            })

    def get_challenges(self, telegram_user_id: int) -> list[dict]:
        return list(self._challenges.get(telegram_user_id, []))


class SQLiteInMemoryStore:
    """
    SQLite-backed store — persists across restarts.
    Use this for development. In production, swap for PostgresStore.
    """

    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = str(Path(__file__).parent.parent / "data" / "contribution_graph.db")
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._db = sqlite3.connect(db_path, check_same_thread=False)
        self._db.row_factory = sqlite3.Row
        self._lock = threading.Lock()
        self._init_schema()

    def _init_schema(self):
        """Initialize the SQLite database schema.
        
        Note: schema.sql (PostgreSQL) is NOT used here. The PostgreSQL schema
        is for production use with PostgresStore. This inline schema is the
        SQLite-compatible equivalent for development/persistence.
        """
        self._db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                telegram_user_id INTEGER PRIMARY KEY,
                short_code TEXT UNIQUE NOT NULL,
                display_name TEXT DEFAULT '',
                current_phase TEXT DEFAULT 'new',
                notification_mode TEXT DEFAULT 'focus',
                map_version INTEGER DEFAULT 1,
                last_active REAL DEFAULT (strftime('%s','now'))
            );
            CREATE TABLE IF NOT EXISTS signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                signal_type TEXT NOT NULL,
                value TEXT NOT NULL,
                confidence REAL NOT NULL,
                ts REAL DEFAULT (strftime('%s','now'))
            );
            CREATE TABLE IF NOT EXISTS comparative_vector (
                user_id INTEGER PRIMARY KEY,
                vector TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS challenges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                challenge_id TEXT NOT NULL,
                challenge_type TEXT NOT NULL,
                status TEXT DEFAULT 'in_progress',
                evidence TEXT DEFAULT '{}',
                completed_at REAL
            );
            CREATE INDEX IF NOT EXISTS idx_signals_user ON signals(user_id);
            CREATE INDEX IF NOT EXISTS idx_challenges_user ON challenges(user_id);
        """)
        self._db.commit()

    def upsert_user(self, telegram_user_id: int, short_code: str, display_name: str = "", phase: str = "new"):
        with self._lock:
            self._db.execute("""
                INSERT INTO users (telegram_user_id, short_code, display_name, current_phase)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(telegram_user_id) DO UPDATE SET
                    short_code=excluded.short_code,
                    display_name=excluded.display_name,
                    current_phase=excluded.current_phase,
                    last_active=strftime('%s','now')
            """, (telegram_user_id, short_code, display_name or f"User {telegram_user_id % 1000}", phase))
            self._db.commit()

    def get_user_by_short_code(self, short_code: str) -> Optional[dict]:
        with self._lock:
            row = self._db.execute(
                "SELECT * FROM users WHERE short_code = ?", (short_code,)
            ).fetchone()
            return dict(row) if row else None

    def get_user(self, telegram_user_id: int) -> Optional[dict]:
        with self._lock:
            row = self._db.execute(
                "SELECT * FROM users WHERE telegram_user_id = ?", (telegram_user_id,)
            ).fetchone()
            return dict(row) if row else None

    def add_signal(self, user_id: int, signal_type: str, value: dict, confidence: float):
        with self._lock:
            self._db.execute(
                "INSERT INTO signals (user_id, signal_type, value, confidence) VALUES (?, ?, ?, ?)",
                (user_id, signal_type, json.dumps(value), confidence)
            )
            self._db.execute(
                "UPDATE users SET last_active = strftime('%s','now') WHERE telegram_user_id = ?",
                (user_id,)
            )
            self._db.commit()

    def get_signals(self, telegram_user_id: int) -> list[dict]:
        with self._lock:
            rows = self._db.execute(
                "SELECT signal_type, value, confidence, ts FROM signals WHERE user_id = ? ORDER BY ts",
                (telegram_user_id,)
            ).fetchall()
            return [{"type": r[0], "value": json.loads(r[1]), "confidence": r[2], "ts": r[3]} for r in rows]

    def set_comparative_vector(self, user_id: int, vector: dict[str, float]):
        with self._lock:
            self._db.execute(
                "INSERT INTO comparative_vector (user_id, vector) VALUES (?, ?)"
                " ON CONFLICT(user_id) DO UPDATE SET vector=excluded.vector",
                (user_id, json.dumps(vector))
            )
            self._db.commit()

    def get_comparative_vector(self, telegram_user_id: int) -> dict[str, float]:
        with self._lock:
            row = self._db.execute(
                "SELECT vector FROM comparative_vector WHERE user_id = ?", (telegram_user_id,)
            ).fetchone()
            return json.loads(row[0]) if row else {}

    def add_challenge(self, user_id: int, challenge_id: str, challenge_type: str, status: str, evidence: dict = None):
        with self._lock:
            completed_at = time.time() if status == "completed" else None
            self._db.execute(
                "INSERT INTO challenges (user_id, challenge_id, challenge_type, status, evidence, completed_at)"
                " VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, challenge_id, challenge_type, status, json.dumps(evidence or {}), completed_at)
            )
            self._db.commit()

    def get_challenges(self, telegram_user_id: int) -> list[dict]:
        with self._lock:
            rows = self._db.execute(
                "SELECT challenge_id, challenge_type, status, evidence, completed_at FROM challenges WHERE user_id = ?",
                (telegram_user_id,)
            ).fetchall()
            return [{"challenge_id": r[0], "challenge_type": r[1], "status": r[2], "evidence": json.loads(r[3]), "completed_at": r[4]} for r in rows]
