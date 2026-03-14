"""
FastAPI server for Youth Empowerment Platform
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
import uuid
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from vault import VaultManager
from pathlib import Path

# Initialize vault manager
vault_manager = VaultManager()

# In-memory session store (for MVP - replace with secure session in production)
# Key: session_token, Value: {user_id, passphrase}
user_sessions: Dict[str, Dict[str, str]] = {}


def get_current_session(token: Optional[str] = None) -> Dict[str, str]:
    """Get current user session from token"""
    if not token:
        raise HTTPException(status_code=401, detail="No session token provided")
    
    if token not in user_sessions:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    return user_sessions[token]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup/shutdown"""
    # Startup
    print("Starting Youth Empowerment Platform API...")
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="Youth Empowerment Platform API",
    description="API for youth empowerment with user-owned vaults",
    version="0.1.0",
    lifespan=lifespan
)


# Request/Response Models
class CreateVaultRequest(BaseModel):
    user_id: str
    passphrase: str
    username: Optional[str] = ""


class VaultData(BaseModel):
    private: Optional[Dict[str, Any]] = None
    public: Optional[Dict[str, Any]] = None


class LoginRequest(BaseModel):
    user_id: str
    passphrase: str


class UpdateFieldRequest(BaseModel):
    field: str
    value: Any


# Health endpoint
@app.get("/")
def root():
    """Health check"""
    return {
        "status": "ok",
        "service": "youth-empowerment-platform",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    """Detailed health check"""
    import os
    return {
        "status": "ok",
        "service": "youth-empowerment-platform",
        "version": "0.1.0",
        "vault_manager": "ready" if vault_manager else "not_initialized",
        "active_sessions": len(user_sessions),
        "platform": os.uname().sysname if hasattr(os, 'uname') else "unknown"
    }


# Vault endpoints
@app.post("/vault/create")
def create_vault(request: CreateVaultRequest):
    """Create new user vault"""
    try:
        result = vault_manager.create_vault(
            request.user_id,
            request.passphrase,
            request.username or ""
        )
        
        # Create session token
        session_token = str(uuid.uuid4())
        user_sessions[session_token] = {
            "user_id": request.user_id,
            "passphrase": request.passphrase
        }
        
        return {
            "status": "created",
            "session_token": session_token,
            "user_id": request.user_id
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/vault/login")
def login(request: LoginRequest):
    """Login to existing vault"""
    try:
        # Verify vault exists and passphrase is correct
        vault_manager.load_vault(request.user_id, request.passphrase)
        
        # Create session token
        session_token = str(uuid.uuid4())
        user_sessions[session_token] = {
            "user_id": request.user_id,
            "passphrase": request.passphrase
        }
        
        return {
            "status": "logged_in",
            "session_token": session_token,
            "user_id": request.user_id
        }
    
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/vault/logout")
def logout(session_token: Optional[str] = None):
    """Logout - invalidate session"""
    if session_token and session_token in user_sessions:
        del user_sessions[session_token]
    
    return {"status": "logged_out"}


@app.get("/vault/status")
def vault_status(session: Dict = Depends(get_current_session)):
    """Check vault status"""
    user_id = session["user_id"]
    passphrase = session["passphrase"]
    
    exists = vault_manager.vault_exists(user_id)
    
    return {
        "user_id": user_id,
        "vault_exists": exists,
        "session_active": True
    }


@app.get("/vault/{user_id}")
def get_vault(
    user_id: str,
    session: Dict = Depends(get_current_session)
):
    """Get user vault data"""
    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        data = vault_manager.load_vault(user_id, session["passphrase"])
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.put("/vault/{user_id}")
def update_vault(
    user_id: str,
    data: VaultData,
    session: Dict = Depends(get_current_session)
):
    """Update vault data"""
    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        vault_manager.save_vault(
            user_id,
            session["passphrase"],
            data.dict(exclude_none=True)
        )
        return {"status": "saved"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.patch("/vault/{user_id}/{zone}")
def update_vault_field(
    user_id: str,
    zone: str,
    request: UpdateFieldRequest,
    session: Dict = Depends(get_current_session)
):
    """Update specific field in vault"""
    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    if zone not in ("private", "public"):
        raise HTTPException(status_code=400, detail="Invalid zone")
    
    try:
        if zone == "private":
            vault_manager.update_private(
                user_id,
                session["passphrase"],
                {request.field: request.value}
            )
        else:
            vault_manager.update_public(
                user_id,
                session["passphrase"],
                {request.field: request.value}
            )
        
        return {"status": "updated", "field": request.field}
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Journey endpoints
@app.get("/journey/{user_id}")
def get_journey(
    user_id: str,
    session: Dict = Depends(get_current_session)
):
    """Get user's journey stage"""
    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        stage = vault_manager.get_journey_stage(user_id, session["passphrase"])
        return {"user_id": user_id, "journey_stage": stage}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/journey/{user_id}/advance")
def advance_journey(
    user_id: str,
    reflection: str = "",
    session: Dict = Depends(get_current_session)
):
    """Advance to next journey stage"""
    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        new_stage = vault_manager.advance_journey(
            user_id,
            session["passphrase"],
            reflection
        )
        return {
            "status": "advanced",
            "new_stage": new_stage
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
