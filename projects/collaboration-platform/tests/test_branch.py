"""Tests for Credo Branch Service."""
import pytest
import sys
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.services.identity import IdentityService
from src.services.branch import BranchService


@pytest.fixture
async def setup_services():
    """Create fresh service instances."""
    identity = IdentityService()
    identity.users.clear()
    branch = BranchService()
    branch.branches.clear()
    return identity, branch


@pytest.fixture
async def creator_user(setup_services):
    """Create a test user."""
    identity, _ = await setup_services
    user = await identity.createAnonymousUser()
    return user


class TestBranchService:
    """Tests for BranchService."""
    
    @pytest.mark.asyncio
    async def test_create_branch(self, setup_services, creator_user):
        """Test creating a branch."""
        _, branch = await setup_services
        
        result = await branch.createBranch(creator_user.id, {
            title: "Test Branch",
            description: "A test branch"
        })
        
        assert result.id is not None
        assert result.title == "Test Branch"
        assert result.description == "A test branch"
        assert result.status == "active"
        assert result.parent_id is None
    
    @pytest.mark.asyncio
    async def test_create_child_branch(self, setup_services, creator_user):
        """Test creating a child branch."""
        _, branch = await setup_services
        
        parent = await branch.createBranch(creator_user.id, {
            title: "Parent Branch"
        })
        
        child = await branch.createBranch(creator_user.id, {
            title: "Child Branch",
            parent_id: parent.id
        })
        
        assert child.parent_id == parent.id
    
    @pytest.mark.asyncio
    async def test_get_branch_by_id(self, setup_services, creator_user):
        """Test retrieving branch by ID."""
        _, branch = await setup_services
        
        created = await branch.createBranch(creator_user.id, {
            title: "Test Branch"
        })
        
        retrieved = await branch.getBranchById(created.id)
        
        assert retrieved is not None
        assert retrieved.id == created.id
        assert retrieved.title == "Test Branch"
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_branch(self, setup_services):
        """Test getting nonexistent branch returns None."""
        _, branch = await setup_services
        
        result = await branch.getBranchById("nonexistent")
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_get_root_branches(self, setup_services, creator_user):
        """Test getting root branches (no parent)."""
        _, branch = await setup_services
        
        # Create root branch
        await branch.createBranch(creator_user.id, {
            title: "Root Branch"
        })
        
        result = await branch.getRootBranches()
        
        assert result.total == 1
        assert len(result.branches) == 1
    
    @pytest.mark.asyncio
    async def test_get_child_branches(self, setup_services, creator_user):
        """Test getting child branches."""
        _, branch = await setup_services
        
        parent = await branch.createBranch(creator_user.id, {
            title: "Parent"
        })
        
        await branch.createBranch(creator_user.id, {
            title: "Child 1",
            parent_id: parent.id
        })
        await branch.createBranch(creator_user.id, {
            title: "Child 2", 
            parent_id: parent.id
        })
        
        result = await branch.getChildBranches(parent.id)
        
        assert result.total == 2
        assert len(result.branches) == 2
    
    @pytest.mark.asyncio
    async def test_update_branch_status(self, setup_services, creator_user):
        """Test updating branch status."""
        _, branch = await setup_services
        
        created = await branch.createBranch(creator_user.id, {
            title: "Test Branch"
        })
        
        updated = await branch.updateBranchStatus(created.id, "archived")
        
        assert updated is not None
        assert updated.status == "archived"
    
    @pytest.mark.asyncio
    async def test_get_branch_tree(self, setup_services, creator_user):
        """Test getting branch tree."""
        _, branch = await setup_services
        
        root = await branch.createBranch(creator_user.id, {
            title: "Root"
        })
        
        child1 = await branch.createBranch(creator_user.id, {
            title: "Child 1",
            parent_id: root.id
        })
        
        await branch.createBranch(creator_user.id, {
            title: "Child 2",
            parent_id: root.id
        })
        
        tree = await branch.getBranchTree(root.id, 0, 2)
        
        assert tree is not None
        assert tree.title == "Root"
        assert len(tree.children) == 2
    
    @pytest.mark.asyncio
    async def test_pagination(self, setup_services, creator_user):
        """Test branch pagination."""
        _, branch = await setup_services
        
        # Create 5 branches
        for i in range(5):
            await branch.createBranch(creator_user.id, {
                title: f"Branch {i}"
            })
        
        result = await branch.getBranches({ limit: 2, offset: 0 })
        
        assert result.total == 5
        assert len(result.branches) == 2
    
    @pytest.mark.asyncio
    async def test_credibility_awarded_for_branch_creation(self, setup_services, creator_user):
        """Test that creating a branch awards credibility."""
        identity, branch = await setup_services
        
        # Get initial credibility
        initial_user = await identity.getUserById(creator_user.id)
        initial_score = initial_user.credibility_score
        
        # Create branch
        await branch.createBranch(creator_user.id, {
            title: "Test Branch"
        })
        
        # Check credibility increased
        updated_user = await identity.getUserById(creator_user.id)
        
        assert updated_user.credibility_score == initial_score + 5
