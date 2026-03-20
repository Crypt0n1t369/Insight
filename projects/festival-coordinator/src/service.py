"""
Festival Coordinator - Task Management Service

Phase 2: Bot Commands
"""

from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import and_
from sqlalchemy.orm import Session

from .models import (
    Festival,
    FestivalTask,
    TaskCategory,
    TaskClaim,
    ClaimStatus,
    TaskStatus,
    ReputationLedger,
    Reward,
    Redemption,
    Dispute,
    DisputeStatus,
    DisputeType,
    get_session,
    create_db_engine,
)


# Point values
POINTS_TASK_COMPLETE = {
    'small': 10,    # <2hrs
    'medium': 25,  # 2-4hrs  
    'large': 50    # 4hrs+
}

POINTS_VERIFICATION = 5      # For verifying others
POINTS_PEER_VERIFIED = 15    # When your work is verified


class TaskService:
    """Task management service"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_active_festival(self) -> Optional[Festival]:
        """Get the currently active festival"""
        return self.session.query(Festival).filter(
            Festival.status == "active"
        ).first()
    
    def get_festival_by_id(self, festival_id: int) -> Optional[Festival]:
        """Get festival by ID"""
        return self.session.query(Festival).filter(
            Festival.id == festival_id
        ).first()
    
    def list_festivals(self, status: Optional[str] = None):
        """List all festivals, optionally filtered by status"""
        query = self.session.query(Festival)
        if status:
            query = query.filter(Festival.status == status)
        return query.order_by(Festival.created_at.desc()).all()
    
    def get_tasks(
        self,
        festival_id: int,
        category_id: Optional[int] = None,
        status: Optional[str] = None
    ):
        """Get tasks for a festival"""
        query = self.session.query(FestivalTask).filter(
            FestivalTask.festival_id == festival_id
        )
        if category_id:
            query = query.filter(FestivalTask.category_id == category_id)
        if status:
            query = query.filter(FestivalTask.status == status)
        else:
            # Default: show open tasks
            query = query.filter(FestivalTask.status == TaskStatus.OPEN.value)
        return query.order_by(FestivalTask.created_at.desc()).all()
    
    def get_task_by_id(self, task_id: int) -> Optional[FestivalTask]:
        """Get task by ID"""
        return self.session.query(FestivalTask).filter(
            FestivalTask.id == task_id
        ).first()
    
    def get_my_tasks(self, festival_id: int, member_id: int):
        """Get tasks claimed by a member"""
        return self.session.query(FestivalTask).join(TaskClaim).filter(
            and_(
                FestivalTask.festival_id == festival_id,
                TaskClaim.member_id == member_id,
                TaskClaim.status.in_([
                    ClaimStatus.PENDING.value,
                    ClaimStatus.COMPLETED.value
                ])
            )
        ).all()
    
    def claim_task(self, task_id: int, member_id: int) -> tuple[bool, str]:
        """Claim a task for a member"""
        task = self.get_task_by_id(task_id)
        if not task:
            return False, "Task not found"
        
        if task.status != TaskStatus.OPEN.value:
            return False, f"Task is not available (status: {task.status})"
        
        # Check if member already has pending claims
        existing = self.session.query(TaskClaim).filter(
            and_(
                TaskClaim.member_id == member_id,
                TaskClaim.status == ClaimStatus.PENDING.value
            )
        ).first()
        
        if existing:
            return False, "You already have a pending task claim"
        
        # Create claim
        claim = TaskClaim(
            task_id=task_id,
            member_id=member_id,
            status=ClaimStatus.PENDING.value
        )
        task.status = TaskStatus.CLAIMED.value
        self.session.add(claim)
        self.session.commit()
        
        return True, f"Task '{task.title}' claimed!"
    
    def complete_task(
        self,
        task_id: int,
        member_id: int,
        proof: Optional[str] = None
    ) -> tuple[bool, str]:
        """Mark a task as completed"""
        task = self.get_task_by_id(task_id)
        if not task:
            return False, "Task not found"
        
        # Find the claim
        claim = self.session.query(TaskClaim).filter(
            and_(
                TaskClaim.task_id == task_id,
                TaskClaim.member_id == member_id,
                TaskClaim.status == ClaimStatus.PENDING.value
            )
        ).first()
        
        if not claim:
            return False, "You haven't claimed this task"
        
        if task.status != TaskStatus.CLAIMED.value:
            return False, f"Task is not in claimed status"
        
        # Update claim and task
        claim.status = ClaimStatus.COMPLETED.value
        claim.completed_at = datetime.utcnow()
        claim.verification_proof = proof
        task.status = TaskStatus.COMPLETED.value
        self.session.commit()
        
        return True, f"Task '{task.title}' marked as complete! Waiting for verification."
    
    def verify_task(
        self,
        task_id: int,
        verifier_id: int
    ) -> tuple[bool, str]:
        """Verify a completed task"""
        task = self.get_task_by_id(task_id)
        if not task:
            return False, "Task not found"
        
        if task.status != TaskStatus.COMPLETED.value:
            return False, "Task is not awaiting verification"
        
        # Find the claim
        claim = self.session.query(TaskClaim).filter(
            and_(
                TaskClaim.task_id == task_id,
                TaskClaim.status == ClaimStatus.COMPLETED.value
            )
        ).first()
        
        if not claim:
            return False, "No completion claim found"
        
        # Update status
        claim.status = ClaimStatus.VERIFIED.value
        task.status = TaskStatus.VERIFIED.value
        
        # Award points
        points_service = PointsService(self.session)
        points_service.award_points(
            member_id=claim.member_id,
            points=task.points_value,
            reason=f"Task completed: {task.title}",
            reference_type="task",
            reference_id=task_id
        )
        
        # Award verifier points
        if verifier_id != claim.member_id:
            points_service.award_points(
                member_id=verifier_id,
                points=POINTS_VERIFICATION,
                reason=f"Verified task: {task.title}",
                reference_type="verification",
                reference_id=task_id
            )
        
        self.session.commit()
        
        return True, f"Task verified! Points awarded."
    
    def create_task(
        self,
        festival_id: int,
        title: str,
        category_id: int,
        description: Optional[str] = None,
        points_value: int = 10,
        slots: int = 1,
        time_estimate: Optional[str] = None,
        deadline: Optional[datetime] = None,
        created_by: Optional[int] = None
    ) -> FestivalTask:
        """Create a new task"""
        task = FestivalTask(
            festival_id=festival_id,
            title=title,
            description=description,
            category_id=category_id,
            points_value=points_value,
            slots=slots,
            time_estimate=time_estimate,
            deadline=deadline,
            created_by=created_by,
            status=TaskStatus.OPEN.value
        )
        self.session.add(task)
        self.session.commit()
        return task

    def release_stale_claims(
        self,
        hours: int = 24
    ) -> list[dict]:
        """
        Phase 4: No-show timeout - Release tasks that have been claimed
        but not completed within the specified timeout period.
        
        Returns list of released task info.
        """
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        # Find claims that are pending beyond the timeout
        stale_claims = self.session.query(TaskClaim).filter(
            and_(
                TaskClaim.status == ClaimStatus.PENDING.value,
                TaskClaim.claimed_at < cutoff
            )
        ).all()
        
        released = []
        for claim in stale_claims:
            task = self.get_task_by_id(claim.task_id)
            if task and task.status == TaskStatus.CLAIMED.value:
                # Release the task back to open
                task.status = TaskStatus.OPEN.value
                claim.status = ClaimStatus.CANCELLED.value
                
                released.append({
                    'task_id': task.id,
                    'task_title': task.title,
                    'member_id': claim.member_id,
                    'claimed_at': claim.claimed_at.isoformat(),
                    'released_at': datetime.utcnow().isoformat()
                })
        
        if released:
            self.session.commit()
        
        return released


class PointsService:
    """Points and reputation service"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_balance(self, member_id: int, festival_id: Optional[int] = None) -> int:
        """Get point balance for a member"""
        query = self.session.query(ReputationLedger).filter(
            ReputationLedger.member_id == member_id
        )
        if festival_id:
            query = query.filter(ReputationLedger.festival_id == festival_id)
        
        total = query.all()
        return sum(entry.points for entry in total)
    
    def award_points(
        self,
        member_id: int,
        points: int,
        reason: str,
        festival_id: Optional[int] = None,
        reference_type: Optional[str] = None,
        reference_id: Optional[int] = None
    ) -> ReputationLedger:
        """Award points to a member"""
        entry = ReputationLedger(
            member_id=member_id,
            festival_id=festival_id,
            points=points,
            reason=reason,
            reference_type=reference_type,
            reference_id=reference_id
        )
        self.session.add(entry)
        self.session.commit()
        return entry
    
    def get_leaderboard(
        self,
        festival_id: Optional[int] = None,
        limit: int = 10
    ):
        """Get top volunteers by points"""
        from sqlalchemy import func
        
        query = self.session.query(
            ReputationLedger.member_id,
            func.sum(ReputationLedger.points).label('total')
        )
        
        if festival_id:
            query = query.filter(ReputationLedger.festival_id == festival_id)
        
        results = query.group_by(ReputationLedger.member_id).order_by(
            func.sum(ReputationLedger.points).desc()
        ).limit(limit).all()
        
        return [(row.member_id, row.total) for row in results]
    
    def get_history(
        self,
        member_id: int,
        festival_id: Optional[int] = None
    ):
        """Get point history for a member"""
        query = self.session.query(ReputationLedger).filter(
            ReputationLedger.member_id == member_id
        )
        if festival_id:
            query = query.filter(ReputationLedger.festival_id == festival_id)
        return query.order_by(ReputationLedger.created_at.desc()).all()


class RewardService:
    """Rewards catalog service"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def list_rewards(self, festival_id: Optional[int] = None):
        """List available rewards"""
        query = self.session.query(Reward)
        if festival_id:
            query = query.filter(Reward.festival_id == festival_id)
        return query.filter(
            Reward.quantity == None  # noqa: E711 - no quantity limit
        ).union(
            query.filter(Reward.quantity > 0)
        ).all()
    
    def get_reward_by_id(self, reward_id: int) -> Optional[Reward]:
        """Get reward by ID"""
        return self.session.query(Reward).filter(Reward.id == reward_id).first()
    
    def redeem_reward(
        self,
        reward_id: int,
        member_id: int
    ) -> tuple[bool, str]:
        """Redeem a reward for points"""
        reward = self.get_reward_by_id(reward_id)
        if not reward:
            return False, "Reward not found"
        
        if reward.quantity is not None and reward.quantity <= 0:
            return False, "Reward is out of stock"
        
        # Check balance
        points_service = PointsService(self.session)
        balance = points_service.get_balance(member_id)
        
        if balance < reward.points_cost:
            return False, f"Insufficient points. Need {reward.points_cost}, have {balance}"
        
        # Deduct points
        points_service.award_points(
            member_id=member_id,
            points=-reward.points_cost,
            reason=f"Redeemed: {reward.title}",
            reference_type="reward",
            reference_id=reward_id
        )
        
        # Create redemption record
        redemption = Redemption(
            member_id=member_id,
            reward_id=reward_id,
            points_spent=reward.points_cost,
            status="pending"
        )
        
        # Decrease quantity if applicable
        if reward.quantity is not None:
            reward.quantity -= 1
        
        self.session.add(redemption)
        self.session.commit()
        
        return True, f"Redeemed '{reward.title}'! {reward.points_cost} points deducted."
    
    def create_reward(
        self,
        title: str,
        points_cost: int,
        description: Optional[str] = None,
        emoji: Optional[str] = None,
        quantity: Optional[int] = None,
        festival_id: Optional[int] = None
    ) -> Reward:
        """Create a new reward"""
        reward = Reward(
            title=title,
            description=description,
            points_cost=points_cost,
            emoji=emoji,
            quantity=quantity,
            festival_id=festival_id
        )
        self.session.add(reward)
        self.session.commit()
        return reward


class DisputeService:
    """Dispute resolution service"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create_dispute(
        self,
        task_id: int,
        claimant_id: int,
        dispute_type: str,
        reason: str,
        respondent_id: Optional[int] = None
    ) -> tuple[bool, str]:
        """Create a new dispute"""
        # Verify task exists
        task_service = TaskService(self.session)
        task = task_service.get_task_by_id(task_id)
        if not task:
            return False, "Task not found"
        
        # Create dispute
        dispute = Dispute(
            task_id=task_id,
            claimant_id=claimant_id,
            respondent_id=respondent_id,
            dispute_type=dispute_type,
            reason=reason,
            status=DisputeStatus.OPEN.value
        )
        self.session.add(dispute)
        self.session.commit()
        
        return True, f"Dispute filed for task #{task_id}. Our team will review."
    
    def get_dispute_by_id(self, dispute_id: int) -> Optional[Dispute]:
        """Get dispute by ID"""
        return self.session.query(Dispute).filter(
            Dispute.id == dispute_id
        ).first()
    
    def get_my_disputes(self, member_id: int) -> list[Dispute]:
        """Get disputes filed by or against a member"""
        return self.session.query(Dispute).filter(
            (Dispute.claimant_id == member_id) | 
            (Dispute.respondent_id == member_id)
        ).order_by(Dispute.created_at.desc()).all()
    
    def get_open_disputes(self, festival_id: Optional[int] = None) -> list[Dispute]:
        """Get all open disputes"""
        query = self.session.query(Dispute).filter(
            Dispute.status.in_([
                DisputeStatus.OPEN.value,
                DisputeStatus.UNDER_REVIEW.value
            ])
        )
        return query.order_by(Dispute.created_at.asc()).all()
    
    def resolve_dispute(
        self,
        dispute_id: int,
        resolver_id: int,
        resolution: str,
        accept_claim: bool,
        adjust_points: Optional[int] = None
    ) -> tuple[bool, str]:
        """Resolve a dispute"""
        dispute = self.get_dispute_by_id(dispute_id)
        if not dispute:
            return False, "Dispute not found"
        
        if dispute.status in [DisputeStatus.RESOLVED.value, DisputeStatus.REJECTED.value]:
            return False, "Dispute already resolved"
        
        dispute.status = DisputeStatus.RESOLVED.value if accept_claim else DisputeStatus.REJECTED.value
        dispute.resolution = resolution
        dispute.resolved_by = resolver_id
        dispute.resolved_at = datetime.utcnow()
        
        # If claim accepted, handle point adjustments
        if accept_claim and adjust_points:
            points_service = PointsService(self.session)
            task = TaskService(self.session).get_task_by_id(dispute.task_id)
            
            if task and adjust_points > 0:
                # Award points to claimant
                points_service.award_points(
                    member_id=dispute.claimant_id,
                    points=adjust_points,
                    reason=f"Dispute resolved: {resolution}",
                    reference_type="dispute",
                    reference_id=dispute_id
                )
        
        self.session.commit()
        
        return True, f"Dispute #{dispute_id} resolved: {'Accepted' if accept_claim else 'Rejected'}"
    
    def escalate_dispute(self, dispute_id: int) -> tuple[bool, str]:
        """Escalate a dispute for higher-level review"""
        dispute = self.get_dispute_by_id(dispute_id)
        if not dispute:
            return False, "Dispute not found"
        
        if dispute.status != DisputeStatus.OPEN.value:
            return False, "Can only escalate open disputes"
        
        dispute.status = DisputeStatus.UNDER_REVIEW.value
        self.session.commit()
        
        return True, "Dispute escalated for review"


class AnalyticsService:
    """Analytics and reporting service for Festival Coordinator"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_festival_stats(self, festival_id: int) -> dict:
        """Get comprehensive festival statistics"""
        # Total tasks
        total_tasks = self.session.query(FestivalTask).filter(
            FestivalTask.festival_id == festival_id
        ).count()
        
        # Tasks by status
        tasks_by_status = {}
        for status in TaskStatus:
            count = self.session.query(FestivalTask).filter(
                and_(
                    FestivalTask.festival_id == festival_id,
                    FestivalTask.status == status.value
                )
            ).count()
            tasks_by_status[status.value] = count
        
        # Total claims
        total_claims = self.session.query(TaskClaim).join(FestivalTask).filter(
            FestivalTask.festival_id == festival_id
        ).count()
        
        # Claims by status
        claims_by_status = {}
        for status in ClaimStatus:
            count = self.session.query(TaskClaim).join(FestivalTask).filter(
                and_(
                    FestivalTask.festival_id == festival_id,
                    TaskClaim.status == status.value
                )
            ).count()
            claims_by_status[status.value] = count
        
        # Points awarded
        points_awarded = self.session.query(ReputationLedger).filter(
            ReputationLedger.festival_id == festival_id
        ).count()
        
        # Total points value
        total_points = self.session.query(ReputationLedger).filter(
            ReputationLedger.festival_id == festival_id
        ).all()
        total_points_value = sum(p.points for p in total_points)
        
        # Rewards redeemed (join through Reward to get festival_id)
        redemptions = self.session.query(Redemption).join(
            Reward, Redemption.reward_id == Reward.id
        ).filter(
            Reward.festival_id == festival_id
        ).count()
        
        # Disputes (join through FestivalTask to get festival_id)
        disputes = self.session.query(Dispute).join(
            FestivalTask, Dispute.task_id == FestivalTask.id
        ).filter(
            FestivalTask.festival_id == festival_id
        ).count()
        
        return {
            "total_tasks": total_tasks,
            "tasks_by_status": tasks_by_status,
            "total_claims": total_claims,
            "claims_by_status": claims_by_status,
            "points_awarded_count": points_awarded,
            "total_points_value": total_points_value,
            "rewards_redeemed": redemptions,
            "total_disputes": disputes,
            "completion_rate": round((tasks_by_status.get(TaskStatus.COMPLETED.value, 0) / total_tasks * 100) if total_tasks > 0 else 0, 1),
            "verification_rate": round((claims_by_status.get(ClaimStatus.VERIFIED.value, 0) / total_claims * 100) if total_claims > 0 else 0, 1)
        }
    
    def get_leaderboard(self, festival_id: int, limit: int = 10) -> list[dict]:
        """Get top volunteers by points"""
        # Get all points records for this festival
        records = self.session.query(ReputationLedger).filter(
            ReputationLedger.festival_id == festival_id
        ).all()
        
        # Aggregate points per member
        member_points = {}
        for record in records:
            if record.member_id not in member_points:
                member_points[record.member_id] = {"member_id": record.member_id, "points": 0}
            member_points[record.member_id]["points"] += record.points
        
        # Sort and return top members
        sorted_members = sorted(member_points.values(), key=lambda x: x["points"], reverse=True)[:limit]
        
        return [
            {"rank": idx + 1, "member_id": m["member_id"], "points": m["points"]}
            for idx, m in enumerate(sorted_members)
        ]
    
    def get_category_breakdown(self, festival_id: int) -> list[dict]:
        """Get task breakdown by category"""
        categories = self.session.query(TaskCategory).filter(
            TaskCategory.festival_id == festival_id
        ).all()
        
        breakdown = []
        for cat in categories:
            total = self.session.query(FestivalTask).filter(
                FestivalTask.category_id == cat.id
            ).count()
            completed = self.session.query(FestivalTask).filter(
                and_(
                    FestivalTask.category_id == cat.id,
                    FestivalTask.status == TaskStatus.COMPLETED.value
                )
            ).count()
            
            breakdown.append({
                "category_id": cat.id,
                "category_name": cat.name,
                "emoji": cat.emoji,
                "total_tasks": total,
                "completed_tasks": completed,
                "completion_rate": round((completed / total * 100) if total > 0 else 0, 1)
            })
        
        return breakdown
    
    def get_member_activity(self, festival_id: int, member_id: int) -> dict:
        """Get activity summary for a specific member"""
        # Tasks claimed
        claims = self.session.query(TaskClaim).join(FestivalTask).filter(
            and_(
                FestivalTask.festival_id == festival_id,
                TaskClaim.member_id == member_id
            )
        ).all()
        
        completed = sum(1 for c in claims if c.status == ClaimStatus.COMPLETED.value)
        verified = sum(1 for c in claims if c.status == ClaimStatus.VERIFIED.value)
        
        # Points earned
        points = self.session.query(ReputationLedger).filter(
            and_(
                ReputationLedger.festival_id == festival_id,
                ReputationLedger.member_id == member_id
            )
        ).all()
        
        total_points = sum(p.points for p in points)
        
        # Disputes
        disputes = self.session.query(Dispute).filter(
            (Dispute.claimant_id == member_id) | 
            (Dispute.respondent_id == member_id)
        ).count()
        
        return {
            "tasks_claimed": len(claims),
            "tasks_completed": completed,
            "tasks_verified": verified,
            "total_points_earned": total_points,
            "disputes_involved": disputes,
            "completion_rate": round((completed / len(claims) * 100) if len(claims) > 0 else 0, 1)
        }
    
    def get_noshow_tasks(self, festival_id: int, hours: int = 24) -> list[dict]:
        """Get tasks with claims that have timed out (no completion)"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        claims = self.session.query(TaskClaim, FestivalTask).join(
            FestivalTask, TaskClaim.task_id == FestivalTask.id
        ).filter(
            and_(
                FestivalTask.festival_id == festival_id,
                TaskClaim.status == ClaimStatus.PENDING.value,
                TaskClaim.claimed_at < cutoff
            )
        ).all()
        
        return [
            {
                "task_id": task.id,
                "task_title": task.title,
                "claim_id": claim.id,
                "claimed_at": claim.claimed_at.isoformat() if claim.claimed_at else None,
                "hours_elapsed": int((datetime.utcnow() - claim.claimed_at).total_seconds() / 3600) if claim.claimed_at else 0
            }
            for claim, task in claims
        ]


# Database initialization
_engine = None
_session = None


def get_db():
    """Get database session (singleton)"""
    global _engine, _session
    if _engine is None:
        _engine = create_db_engine()
    if _session is None:
        _session = get_session(_engine)
    return _session
