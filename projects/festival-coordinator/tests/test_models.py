"""
Festival Coordinator - Model Tests
Phase 1: Core Infrastructure Tests
"""

import pytest
from datetime import datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.models import (
    Base,
    Festival,
    FestivalStatus,
    TaskCategory,
    FestivalTask,
    TaskStatus,
    TaskClaim,
    ClaimStatus,
    Reward,
    ReputationLedger,
    Redemption,
    init_db,
)


@pytest.fixture
def engine():
    """Create in-memory SQLite engine for testing"""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    return engine


@pytest.fixture
def session(engine):
    """Create database session"""
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


class TestFestival:
    """Festival model tests"""

    def test_create_festival(self, session):
        """Test creating a festival"""
        festival = Festival(
            name="Summer Festival 2026",
            description="Annual summer music festival",
            start_date=datetime(2026, 7, 15),
            end_date=datetime(2026, 7, 20),
            status=FestivalStatus.PLANNING.value,
        )
        session.add(festival)
        session.commit()

        assert festival.id is not None
        assert festival.name == "Summer Festival 2026"
        assert festival.status == FestivalStatus.PLANNING.value

    def test_festival_default_status(self, session):
        """Test festival default status is planning"""
        festival = Festival(name="Test Festival")
        session.add(festival)
        session.commit()

        assert festival.status == FestivalStatus.PLANNING.value


class TestTaskCategory:
    """TaskCategory model tests"""

    def test_create_category(self, session):
        """Test creating a task category"""
        festival = Festival(name="Test Festival")
        session.add(festival)
        session.commit()

        category = TaskCategory(
            name="Technical",
            emoji="💻",
            festival_id=festival.id,
        )
        session.add(category)
        session.commit()

        assert category.id is not None
        assert category.name == "Technical"
        assert category.emoji == "💻"

    def test_category_relationship(self, session):
        """Test category-festival relationship"""
        festival = Festival(name="Test Festival")
        session.add(festival)
        session.commit()

        category = TaskCategory(name="Marketing", festival_id=festival.id)
        session.add(category)
        session.commit()

        assert category.festival.name == "Test Festival"


class TestFestivalTask:
    """FestivalTask model tests"""

    def test_create_task(self, session):
        """Test creating a festival task"""
        festival = Festival(name="Test Festival")
        session.add(festival)
        session.commit()

        category = TaskCategory(name="Operations", festival_id=festival.id)
        session.add(category)
        session.commit()

        task = FestivalTask(
            title="Setup Stage Equipment",
            description="Set up main stage audio and lighting",
            category_id=category.id,
            points_value=50,
            slots=3,
            time_estimate="4hrs",
            deadline=datetime(2026, 7, 14, 18, 0),
            festival_id=festival.id,
            created_by=1,
        )
        session.add(task)
        session.commit()

        assert task.id is not None
        assert task.title == "Setup Stage Equipment"
        assert task.points_value == 50
        assert task.status == TaskStatus.OPEN.value

    def test_task_default_status(self, session):
        """Test task default status is open"""
        festival = Festival(name="Test Festival")
        session.add(festival)
        session.commit()

        category = TaskCategory(name="Creative", festival_id=festival.id)
        session.add(category)
        session.commit()

        task = FestivalTask(
            title="Test Task",
            category_id=category.id,
            festival_id=festival.id,
        )
        session.add(task)
        session.commit()

        assert task.status == TaskStatus.OPEN.value


class TestTaskClaim:
    """TaskClaim model tests"""

    def test_create_claim(self, session):
        """Test creating a task claim"""
        festival = Festival(name="Test Festival")
        session.add(festival)
        session.commit()

        category = TaskCategory(name="Logistics", festival_id=festival.id)
        session.add(category)
        session.commit()

        task = FestivalTask(
            title="Distribute Water Bottles",
            category_id=category.id,
            festival_id=festival.id,
        )
        session.add(task)
        session.commit()

        claim = TaskClaim(
            task_id=task.id,
            member_id=42,
            status=ClaimStatus.PENDING.value,
        )
        session.add(claim)
        session.commit()

        assert claim.id is not None
        assert claim.member_id == 42
        assert claim.status == ClaimStatus.PENDING.value


class TestReward:
    """Reward model tests"""

    def test_create_reward(self, session):
        """Test creating a reward"""
        reward = Reward(
            title="VIP Backstage Pass",
            description="Access to backstage area",
            points_cost=200,
            emoji="⭐",
            quantity=10,
        )
        session.add(reward)
        session.commit()

        assert reward.id is not None
        assert reward.title == "VIP Backstage Pass"
        assert reward.points_cost == 200


class TestReputationLedger:
    """ReputationLedger model tests"""

    def test_create_ledger_entry(self, session):
        """Test creating a reputation entry"""
        ledger = ReputationLedger(
            member_id=42,
            points=50,
            reason="Completed task: Setup Stage Equipment",
            reference_type="task_verified",
            reference_id=1,
        )
        session.add(ledger)
        session.commit()

        assert ledger.id is not None
        assert ledger.member_id == 42
        assert ledger.points == 50


class TestIntegration:
    """Integration tests for full flows"""

    def test_full_task_flow(self, session):
        """Test complete task flow: create -> claim -> complete -> verify"""
        # Create festival
        festival = Festival(
            name="Test Festival",
            status=FestivalStatus.ACTIVE.value,
        )
        session.add(festival)
        session.commit()

        # Create category
        category = TaskCategory(name="Creative", emoji="🎨", festival_id=festival.id)
        session.add(category)
        session.commit()

        # Create task
        task = FestivalTask(
            title="Face Painting",
            description="Paint festival faces",
            category_id=category.id,
            points_value=30,
            slots=5,
            festival_id=festival.id,
        )
        session.add(task)
        session.commit()

        # Claim task
        claim = TaskClaim(
            task_id=task.id,
            member_id=1,
            status=ClaimStatus.PENDING.value,
        )
        session.add(claim)
        session.commit()

        # Complete task
        claim.status = ClaimStatus.COMPLETED.value
        claim.completed_at = datetime.utcnow()
        claim.verification_proof = "photo_url_here"
        session.commit()

        # Verify task (add reputation)
        task.status = TaskStatus.VERIFIED.value
        session.commit()

        reputation = ReputationLedger(
            member_id=1,
            points=task.points_value,
            reason=f"Completed: {task.title}",
            reference_type="task",
            reference_id=task.id,
        )
        session.add(reputation)
        session.commit()

        # Verify state
        assert claim.status == ClaimStatus.COMPLETED.value
        assert task.status == TaskStatus.VERIFIED.value
        assert reputation.points == 30

    def test_reward_redemption_flow(self, session):
        """Test reward redemption flow"""
        # Create reward
        reward = Reward(
            title="Free T-Shirt",
            points_cost=100,
            emoji="👕",
            quantity=50,
        )
        session.add(reward)
        session.commit()

        # Member has points
        ledger = ReputationLedger(
            member_id=1,
            points=150,
            reason="Initial bonus",
        )
        session.add(ledger)
        session.commit()

        # Redeem reward
        redemption = Redemption(
            member_id=1,
            reward_id=reward.id,
            points_spent=reward.points_cost,
            status="pending",
        )
        session.add(redemption)
        session.commit()

        # Verify
        assert redemption.points_spent == 100
        assert redemption.status == "pending"
