"""
Tests for Youth Empowerment Platform API
"""
import pytest
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)


class TestHealthEndpoints:
    """Test health and root endpoints"""
    
    def test_root_returns_ok(self):
        """Test root endpoint returns ok status"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "youth-empowerment-platform"
    
    def test_health_returns_ok(self):
        """Test health endpoint returns ok status"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "vault_manager" in data
        assert "active_sessions" in data


class TestVaultCreation:
    """Test vault creation endpoint"""
    
    def test_create_vault_success(self):
        """Test creating a new vault with valid credentials"""
        user_id = f"test_user_{id(self)}"
        response = client.post("/vault/create", json={
            "user_id": user_id,
            "passphrase": "test_passphrase123",
            "username": "Test User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "created"
        assert "session_token" in data
        assert data["user_id"] == user_id
    
    def test_create_vault_duplicate_fails(self):
        """Test creating duplicate vault fails"""
        user_id = f"duplicate_test_{id(self)}"
        # First creation should succeed
        response1 = client.post("/vault/create", json={
            "user_id": user_id,
            "passphrase": "test_passphrase123"
        })
        assert response1.status_code == 200
        
        # Second creation should fail
        response2 = client.post("/vault/create", json={
            "user_id": user_id,
            "passphrase": "different_passphrase"
        })
        assert response2.status_code == 400


class TestVaultLogin:
    """Test vault login endpoint"""
    
    def test_login_success(self):
        """Test logging in with valid credentials"""
        user_id = f"login_test_{id(self)}"
        passphrase = "login_test_pass"
        
        # First create the vault
        client.post("/vault/create", json={
            "user_id": user_id,
            "passphrase": passphrase
        })
        
        # Then try to login
        response = client.post("/vault/login", json={
            "user_id": user_id,
            "passphrase": passphrase
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "logged_in"
        assert "session_token" in data
        assert data["user_id"] == user_id
    
    def test_login_invalid_credentials_fails(self):
        """Test login with wrong passphrase fails"""
        user_id = f"invalid_login_{id(self)}"
        
        # Create vault
        client.post("/vault/create", json={
            "user_id": user_id,
            "passphrase": "correct_pass"
        })
        
        # Try login with wrong passphrase
        response = client.post("/vault/login", json={
            "user_id": user_id,
            "passphrase": "wrong_pass"
        })
        assert response.status_code == 401


class TestVaultLogout:
    """Test vault logout endpoint"""
    
    def test_logout_success(self):
        """Test logout with valid session"""
        user_id = f"logout_test_{id(self)}"
        
        # Create and get session
        create_response = client.post("/vault/create", json={
            "user_id": user_id,
            "passphrase": "logout_pass"
        })
        session_token = create_response.json()["session_token"]
        
        # Logout
        response = client.post(f"/vault/logout?session_token={session_token}")
        assert response.status_code == 200
        assert response.json()["status"] == "logged_out"
    
    def test_logout_without_session(self):
        """Test logout without session returns ok"""
        response = client.post("/vault/logout")
        assert response.status_code == 200


class TestVaultStatus:
    """Test vault status endpoint"""
    
    def test_status_requires_auth(self):
        """Test vault status requires authentication"""
        response = client.get("/vault/status")
        assert response.status_code == 401
    
    def test_status_with_valid_session(self):
        """Test vault status with valid session (token as query param)"""
        user_id = f"status_test_{id(self)}"
        
        # Create vault and get session
        create_response = client.post("/vault/create", json={
            "user_id": user_id,
            "passphrase": "status_pass"
        })
        session_token = create_response.json()["session_token"]
        
        # Get status - API expects 'token' query param
        response = client.get(f"/vault/status?token={session_token}")
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user_id
        assert data["vault_exists"] is True
        assert data["session_active"] is True


class TestJourney:
    """Test journey endpoints"""
    
    def test_get_journey_requires_auth(self):
        """Test get journey requires authentication"""
        response = client.get("/journey/test_user")
        assert response.status_code == 401
    
    def test_get_journey_with_session(self):
        """Test get journey with valid session (token as query param)"""
        user_id = f"journey_test_{id(self)}"
        
        # Create vault and get session
        create_response = client.post("/vault/create", json={
            "user_id": user_id,
            "passphrase": "journey_pass"
        })
        session_token = create_response.json()["session_token"]
        
        # Get journey - API expects 'token' query param
        response = client.get(f"/journey/{user_id}?token={session_token}")
        assert response.status_code == 200
        data = response.json()
        assert "journey_stage" in data
    
    def test_advance_journey(self):
        """Test advancing journey stage"""
        user_id = f"advance_test_{id(self)}"
        
        # Create vault and get session
        create_response = client.post("/vault/create", json={
            "user_id": user_id,
            "passphrase": "advance_pass"
        })
        session_token = create_response.json()["session_token"]
        
        # Advance journey - API expects 'token' query param
        response = client.post(
            f"/journey/{user_id}/advance?reflection=Test+reflection&token={session_token}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "advanced"
        assert "new_stage" in data
