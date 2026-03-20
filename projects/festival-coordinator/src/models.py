"""
Festival Coordinator - Database Models

Phase 1: Core Infrastructure
Based on IMPLEMENTATION_PLAN.md
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    sessionmaker,
)


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


class FestivalStatus(str, Enum):
    """Festival status enum"""
    PLANNING = "planning"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskStatus(str, Enum):
    """Task status enum"""
    OPEN = "open"
    CLAIMED = "claimed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    VERIFIED = "verified"
    CANCELLED = "cancelled"


class ClaimStatus(str, Enum):
    """Task claim status enum"""
    PENDING = "pending"
    COMPLETED = "completed"
    VERIFIED = "verified"
    CANCELLED = "cancelled"


class Festival(Base):
    """Festival event"""
    __tablename__ = "festivals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    organization_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default=FestivalStatus.PLANNING.value
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Relationships
    categories: Mapped[list["TaskCategory"]] = relationship(
        "TaskCategory", back_populates="festival", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["FestivalTask"]] = relationship(
        "FestivalTask", back_populates="festival", cascade="all, delete-orphan"
    )


class TaskCategory(Base):
    """Task category for festival"""
    __tablename__ = "task_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    emoji: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    festival_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("festivals.id"), nullable=False
    )

    # Relationships
    festival: Mapped["Festival"] = relationship("Festival", back_populates="categories")
    tasks: Mapped[list["FestivalTask"]] = relationship(
        "FestivalTask", back_populates="category"
    )


class FestivalTask(Base):
    """Festival task"""
    __tablename__ = "festival_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("task_categories.id"), nullable=False
    )
    points_value: Mapped[int] = mapped_column(Integer, default=10)
    slots: Mapped[int] = mapped_column(Integer, default=1)
    time_estimate: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default=TaskStatus.OPEN.value)
    proof_photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    festival_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("festivals.id"), nullable=False
    )
    created_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # Relationships
    category: Mapped["TaskCategory"] = relationship(
        "TaskCategory", back_populates="tasks"
    )
    festival: Mapped["Festival"] = relationship("Festival", back_populates="tasks")
    claims: Mapped[list["TaskClaim"]] = relationship(
        "TaskClaim", back_populates="task", cascade="all, delete-orphan"
    )


class TaskClaim(Base):
    """Task claim by volunteer"""
    __tablename__ = "task_claims"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("festival_tasks.id"), nullable=False
    )
    member_id: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=ClaimStatus.PENDING.value)
    claimed_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    verification_proof: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    task: Mapped["FestivalTask"] = relationship("FestivalTask", back_populates="claims")


class Reward(Base):
    """Reward catalog item"""
    __tablename__ = "rewards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    points_cost: Mapped[int] = mapped_column(Integer, default=100)
    emoji: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    quantity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    festival_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("festivals.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class ReputationLedger(Base):
    """Reputation points ledger"""
    __tablename__ = "reputation_ledger"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    member_id: Mapped[int] = mapped_column(Integer, nullable=False)
    festival_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("festivals.id"), nullable=True
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(200), nullable=False)
    reference_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class Redemption(Base):
    """Reward redemption record"""
    __tablename__ = "redemptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    member_id: Mapped[int] = mapped_column(Integer, nullable=False)
    reward_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rewards.id"), nullable=False
    )
    points_spent: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    redeemed_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class DisputeStatus(str, Enum):
    """Dispute status enum"""
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class DisputeType(str, Enum):
    """Dispute type enum"""
    TASK_REJECTION = "task_rejection"  # Task verification rejected
    POINTS_DISPUTE = "points_dispute"  # Points not awarded correctly
    TASK_QUALITY = "task_quality"  # Work quality dispute
    NO_SHOW = "no_show"  # Claimed task but didn't complete


class Dispute(Base):
    """Task dispute record"""
    __tablename__ = "disputes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("festival_tasks.id"), nullable=False
    )
    claimant_id: Mapped[int] = mapped_column(Integer, nullable=False)  # Who filed
    respondent_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Who against (verifier)
    dispute_type: Mapped[str] = mapped_column(String(50), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default=DisputeStatus.OPEN.value
    )
    resolution: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


# Database setup helpers
def create_db_engine(database_url: str = "sqlite:///festival.db"):
    """Create database engine"""
    return create_engine(database_url, echo=False)


def init_db(engine):
    """Initialize database tables"""
    Base.metadata.create_all(engine)


def get_session(engine):
    """Get database session"""
    Session = sessionmaker(bind=engine)
    return Session()
