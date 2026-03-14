# Youth Empowerment Platform

AI-powered platform for youth development with encrypted vaults, character-guided journeys, and opportunity matching.

## Quick Start

```bash
# Activate virtual environment
source venv/bin/activate

# Start the API server
cd src
python -m uvicorn api.main:app --host 0.0.0.0 --port 3003

# Run tests
python -m pytest tests/ -v
```

## Features

- **Zero-Knowledge Encrypted Vaults** - User-owned data with client-side encryption
- **AI Agent System** - Personal AI agents for guidance
- **Character/NPC System** - Personality-driven characters for engagement
- **Hero's Journey Tracking** - Progression system for personal growth
- **Opportunity Matching** - AI-powered matching to opportunities

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `POST /vault/create` | Create new vault |
| `POST /vault/login` | Login to vault |
| `POST /vault/logout` | Logout |
| `GET /vault/status` | Get vault status (auth required) |
| `GET /journey` | Get journey progress (auth required) |
| `POST /journey/advance` | Advance journey step (auth required) |

## Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **Encryption**: Cryptography (Fernet)
- **Testing**: Pytest

## Ports

- API: 3003

## Tests

```
13 tests passing:
- Health endpoints: 2 tests
- Vault creation: 2 tests
- Vault login: 2 tests
- Vault logout: 2 tests
- Vault status: 2 tests
- Journey: 3 tests
```
