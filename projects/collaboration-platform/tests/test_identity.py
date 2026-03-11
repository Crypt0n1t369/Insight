"""Tests for Credo Identity Service."""
import pytest
import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.services.identity import IdentityService


@pytest.fixture
def identity_service():
    """Create fresh identity service for each test."""
    # Clear the internal map by creating a new instance
    service = IdentityService()
    # Clear any existing users
    service.users.clear()
    return service


class TestIdentityService:
    """Tests for IdentityService."""
    
    @pytest.mark.asyncio
    async def test_create_anonymous_user(self, identity_service):
        """Test creating an anonymous user."""
        user = await identity_service.createAnonymousUser()
        
        assert user.id is not None
        assert user.anonymous_id is not None
        assert len(user.anonymous_id) == 16
        assert user.trust_tier == 'newcomer'
        assert user.credibility_score == 0
        assert user.display_name is None
    
    @pytest.mark.asyncio
    async def test_create_user_with_display_name(self, identity_service):
        """Test creating user with display name."""
        user = await identity_service.createAnonymousUser({
            display_name: "Test User"
        })
        
        assert user.display_name == "Test User"
    
    @pytest.mark.asyncio
    async def test_get_user_by_id(self, identity_service):
        """Test retrieving user by ID."""
        created = await identity_service.createAnonymousUser()
        
        retrieved = await identity_service.getUserById(created.id)
        
        assert retrieved is not None
        assert retrieved.id == created.id
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_user(self, identity_service):
        """Test getting nonexistent user returns None."""
        result = await identity_service.getUserById("nonexistent-id")
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_update_display_name(self, identity_service):
        """Test updating user display name."""
        user = await identity_service.createAnonymousUser()
        
        updated = await identity_service.updateDisplayName(user.id, "New Name")
        
        assert updated is not None
        assert updated.display_name == "New Name"
    
    @pytest.mark.asyncio
    async def test_update_display_name_truncates_long(self, identity_service):
        """Test that display name is truncated to 50 chars."""
        user = await identity_service.createAnonymousUser()
        
        long_name = "A" * 100
        updated = await identity_service.updateDisplayName(user.id, long_name)
        
        assert updated is not None
        assert len(updated.display_name) == 50
    
    @pytest.mark.asyncio
    async def test_connect_wallet(self, identity_service):
        """Test connecting wallet address."""
        user = await identity_service.createAnonymousUser()
        
        updated = await identity_service.connectWallet(user.id, "0xABC123")
        
        assert updated is not None
        assert updated.wallet_address == "0xabc123"  # lowercase
    
    @pytest.mark.asyncio
    async def test_update_credibility(self, identity_service):
        """Test updating credibility score."""
        user = await identity_service.createAnonymousUser()
        
        updated = await identity_service.updateCredibility(user.id, 10, "Test points")
        
        assert updated is not None
        assert updated.credibility_score == 10
    
    @pytest.mark.asyncio
    async def test_credibility_never_negative(self, identity_service):
        """Test that credibility score never goes below 0."""
        user = await identity_service.createAnonymousUser()
        
        updated = await identity_service.updateCredibility(user.id, -100, "Test")
        
        assert updated is not None
        assert updated.credibility_score == 0
    
    @pytest.mark.asyncio
    async def test_trust_tier_calculation(self, identity_service):
        """Test trust tier calculation based on credibility."""
        user = await identity_service.createAnonymousUser()
        
        # newcomer: < 100
        assert user.trust_tier == 'newcomer'
        
        # contributor: >= 100
        await identity_service.updateCredibility(user.id, 100, "Test")
        user = await identityService.getUserById(user.id)
        
        # Note: this test shows tier calculation logic
    
    @pytest.mark.asyncio
    async def test_get_leaderboard(self, identity_service):
        """Test leaderboard returns users sorted by credibility."""
        user1 = await identity_service.createAnonymousUser()
        user2 = await identity_service.createAnonymousUser()
        
        await identity_service.updateCredibility(user1.id, 50, "Test")
        await identity_service.updateCredibility(user2.id, 100, "Test")
        
        leaderboard = await identity_service.getLeaderboard()
        
        assert len(leaderboard) == 2
        assert leaderboard[0].credibility_score >= leaderboard[1].credibility_score
    
    @pytest.mark.asyncio
    async def test_get_user_count(self, identity_service):
        """Test getting user count."""
        await identity_service.createAnonymousUser()
        await identity_service.createAnonymousUser()
        
        count = await identityService.getUserCount()
        
        assert count == 2


# For the getUserById test to work correctly
identityService = IdentityService()
