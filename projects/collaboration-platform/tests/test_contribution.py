"""Tests for Credo Contribution Service."""
import pytest
import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.services.identity import IdentityService
from src.services.branch import BranchService
from src.services.contribution import ContributionService


@pytest.fixture
async def setup_services():
    """Create fresh service instances."""
    identity = IdentityService()
    identity.users.clear()
    branch = BranchService()
    branch.branches.clear()
    contribution = ContributionService()
    contribution.contributions.clear()
    return identity, branch, contribution


@pytest.fixture
async def test_user(setup_services):
    """Create a test user."""
    identity, _, _ = await setup_services
    user = await identity.createAnonymousUser()
    return user


@pytest.fixture
async def test_branch(setup_services, test_user):
    """Create a test branch."""
    _, branch, _ = await setup_services
    b = await branch.createBranch(test_user.id, {
        title: "Test Branch"
    })
    return b


class TestContributionService:
    """Tests for ContributionService."""
    
    @pytest.mark.asyncio
    async def test_create_contribution(self, setup_services, test_user, test_branch):
        """Test creating a contribution."""
        _, _, contribution = await setup_services
        
        result = await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Test idea"
        })
        
        assert result.id is not None
        assert result.content == "Test idea"
        assert result.type == "idea"
        assert result.endorsements == 0
    
    @pytest.mark.asyncio
    async def test_create_nested_contribution(self, setup_services, test_user, test_branch):
        """Test creating a nested contribution (reply)."""
        _, _, contribution = await setup_services
        
        parent = await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Parent idea"
        })
        
        child = await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "comment",
            content: "Reply",
            parent_id: parent.id
        })
        
        assert child.parent_id == parent.id
    
    @pytest.mark.asyncio
    async def test_get_contribution_by_id(self, setup_services, test_user, test_branch):
        """Test getting contribution by ID."""
        _, _, contribution = await setup_services
        
        created = await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Test"
        })
        
        retrieved = await contribution.getContributionById(created.id)
        
        assert retrieved is not None
        assert retrieved.id == created.id
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_contribution(self, setup_services):
        """Test getting nonexistent contribution returns None."""
        _, _, contribution = await setup_services
        
        result = await contribution.getContributionById("nonexistent")
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_get_branch_contributions(self, setup_services, test_user, test_branch):
        """Test getting branch contributions."""
        _, _, contribution = await setup_services
        
        await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Idea 1"
        })
        await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Idea 2"
        })
        
        result = await contribution.getBranchContributions(test_branch.id)
        
        assert result.total == 2
        assert len(result.contributions) == 2
    
    @pytest.mark.asyncio
    async def test_filter_contributions_by_type(self, setup_services, test_user, test_branch):
        """Test filtering contributions by type."""
        _, _, contribution = await setup_services
        
        await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "An idea"
        })
        await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "question",
            content: "A question"
        })
        
        ideas = await contribution.getBranchContributions(test_branch.id, {
            type: "idea"
        })
        
        assert ideas.total == 1
        assert ideas.contributions[0].type == "idea"
    
    @pytest.mark.asyncio
    async def test_get_top_level_contributions(self, setup_services, test_user, test_branch):
        """Test getting top-level (non-reply) contributions."""
        _, _, contribution = await setup_services
        
        parent = await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Parent"
        })
        
        await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "comment",
            content: "Reply",
            parent_id: parent.id
        })
        
        ideas = await contribution.getIdeas(test_branch.id)
        
        assert ideas.total == 1
        assert ideas.contributions[0].parent_id is None
    
    @pytest.mark.asyncio
    async def test_endorse_contribution(self, setup_services, test_user, test_branch):
        """Test endorsing a contribution."""
        _, _, contribution = await setup_services
        
        contrib = await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Test idea"
        })
        
        endorsed = await contribution.endorse(contrib.id, test_user.id)
        
        assert endorsed is not None
        assert endorsed.endorsements == 1
    
    @pytest.mark.asyncio
    async def test_contributions_sorted_by_endorsements(self, setup_services, test_user, test_branch):
        """Test contributions are sorted by endorsements."""
        _, _, contribution = await setup_services
        
        low = await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Low endorsed"
        })
        high = await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "High endorsed"
        })
        
        # Endorse high one
        await contribution.endorse(high.id, test_user.id)
        await contribution.endorse(high.id, test_user.id)
        await contribution.endorse(high.id, test_user.id)
        
        result = await contribution.getBranchContributions(test_branch.id)
        
        assert result.contributions[0].id == high.id
    
    @pytest.mark.asyncio
    async def test_get_user_contributions(self, setup_services, test_user, test_branch):
        """Test getting user's contributions."""
        _, _, contribution = await setup_services
        
        await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Idea 1"
        })
        await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "question",
            content: "Question"
        })
        
        user_contribs = await contribution.getUserContributions(test_user.id)
        
        assert len(user_contribs) == 2
    
    @pytest.mark.asyncio
    async def test_credibility_awarded_by_type(self, setup_services, test_user, test_branch):
        """Test that credibility is awarded based on contribution type."""
        identity, _, contribution = await setup_services
        
        # Create different types and check credibility
        await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "An idea"
        })
        
        user = await identity.getUserById(test_user.id)
        
        # idea = 3 points
        assert user.credibility_score == 3
    
    @pytest.mark.asyncio
    async def test_endorsement_awards_credibility(self, setup_services, test_user, test_branch, setup_services):
        """Test that endorsing awards credibility to author."""
        identity, _, contribution = await setup_services
        
        contrib = await contribution.createContribution(test_user.id, {
            branch_id: test_branch.id,
            type: "idea",
            content: "Test"
        })
        
        # Get another user to endorse
        other_user = await identity.createAnonymousUser()
        
        await contribution.endorse(contrib.id, other_user.id)
        
        author = await identity.getUserById(test_user.id)
        
        # Author gets 1 point per endorsement
        assert author.credibility_score > 3  # Initial 3 + endorsement
