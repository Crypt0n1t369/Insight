"""
Festival Coordinator - Telegram Bot Handlers

Phase 2: Bot Commands
"""

from typing import Optional

from .service import TaskService, PointsService, RewardService, get_db


def format_festival_info(festival) -> str:
    """Format festival info as text"""
    status_emoji = {
        "planning": "📋",
        "active": "🎉",
        "completed": "✅",
        "cancelled": "❌"
    }
    
    emoji = status_emoji.get(festival.status, "📌")
    lines = [
        f"{emoji} *{festival.name}*",
        ""
    ]
    
    if festival.description:
        lines.append(festival.description)
        lines.append("")
    
    lines.append(f"📅 Status: {festival.status.title()}")
    
    if festival.start_date:
        lines.append(f"🗓️ Starts: {festival.start_date.strftime('%B %d, %Y')}")
    
    if festival.end_date:
        lines.append(f"🎯 Ends: {festival.end_date.strftime('%B %d, %Y')}")
    
    return "\n".join(lines)


def format_task_list(tasks) -> str:
    """Format task list as text"""
    if not tasks:
        return "📭 No tasks available"
    
    lines = ["*Available Tasks*", ""]
    
    for task in tasks:
        emoji = {
            "open": "⭕",
            "claimed": "🔵",
            "in_progress": "🟡",
            "completed": "🟢",
            "verified": "✅"
        }.get(task.status, "⚪")
        
        lines.append(f"{emoji} *{task.title}*")
        lines.append(f"   ID: `{task.id}` | Points: {task.points_value}")
        
        if task.time_estimate:
            lines.append(f"   ⏱️ {task.time_estimate}")
        
        if task.description:
            # Truncate long descriptions
            desc = task.description[:80] + "..." if len(task.description) > 80 else task.description
            lines.append(f"   📝 {desc}")
        
        lines.append("")
    
    return "\n".join(lines)


def format_task_detail(task) -> str:
    """Format single task detail"""
    lines = [
        f"📋 *{task.title}*",
        "",
        f"ID: `{task.id}`",
        f"Points: {task.points_value}",
        f"Status: {task.status}",
        ""
    ]
    
    if task.description:
        lines.append(f"__{task.description}__")
        lines.append("")
    
    if task.time_estimate:
        lines.append(f"⏱️ Est. Time: {task.time_estimate}")
    
    if task.deadline:
        lines.append(f"📅 Deadline: {task.deadline.strftime('%B %d, %Y %H:%M')}")
    
    return "\n".join(lines)


def format_my_tasks(tasks) -> str:
    """Format user's claimed tasks"""
    if not tasks:
        return "📭 You haven't claimed any tasks"
    
    lines = ["*Your Tasks*", ""]
    
    for task in tasks:
        status_emoji = {
            "claimed": "🔵",
            "in_progress": "🟡",
            "completed": "🟢",
            "verified": "✅"
        }
        
        emoji = status_emoji.get(task.status, "⚪")
        lines.append(f"{emoji} *{task.title}*")
        lines.append(f"   ID: `{task.id}` | Status: {task.status}")
        lines.append("")
    
    return "\n".join(lines)


def format_points_balance(member_id: int, balance: int) -> str:
    """Format points balance"""
    return f"💰 *Your Points: {balance}*"


def format_leaderboard(leaderboard, member_id: Optional[int] = None) -> str:
    """Format leaderboard"""
    if not leaderboard:
        return "🏆 No leaderboard data yet"
    
    lines = ["*🏆 Leaderboard*", ""]
    
    medals = ["🥇", "🥈", "🥉"]
    
    for i, (mid, points) in enumerate(leaderboard):
        medal = medals[i] if i < 3 else f"{i+1}."
        you = " (You)" if mid == member_id else ""
        lines.append(f"{medal} Member `{mid}`: {points} pts{you}")
    
    return "\n".join(lines)


def format_rewards(rewards) -> str:
    """Format rewards list"""
    if not rewards:
        return "🎁 No rewards available"
    
    lines = ["*🎁 Rewards Catalog*", ""]
    
    for reward in rewards:
        qty = f" ({reward.quantity} left)" if reward.quantity else ""
        emoji = reward.emoji or "🎁"
        lines.append(f"{emoji} *{reward.title}*")
        lines.append(f"   ID: `{reward.id}` | Cost: {reward.points_cost} pts{qty}")
        
        if reward.description:
            lines.append(f"   📝 {reward.description}")
        
        lines.append("")
    
    return "\n".join(lines)


# Command handlers
def handle_festival(festival_id: Optional[int] = None) -> str:
    """Handle /festival command"""
    db = get_db()
    service = TaskService(db)
    
    if festival_id:
        festival = service.get_festival_by_id(festival_id)
    else:
        festival = service.get_active_festival()
    
    if not festival:
        return "❌ No active festival found"
    
    # Get task count
    tasks = service.get_tasks(festival.id)
    task_count = len(tasks)
    
    info = format_festival_info(festival)
    info += f"\n📋 {task_count} tasks available"
    
    return info


def handle_tasks(festival_id: Optional[int] = None, category_id: Optional[int] = None) -> str:
    """Handle /tasks command"""
    db = get_db()
    service = TaskService(db)
    
    if festival_id:
        festival = service.get_festival_by_id(festival_id)
    else:
        festival = service.get_active_festival()
    
    if not festival:
        return "❌ No active festival found"
    
    tasks = service.get_tasks(festival.id, category_id=category_id)
    return format_task_list(tasks)


def handle_claim(task_id: int, member_id: int) -> str:
    """Handle /claim command"""
    db = get_db()
    service = TaskService(db)
    
    success, message = service.claim_task(task_id, member_id)
    return message


def handle_my_tasks(festival_id: Optional[int], member_id: int) -> str:
    """Handle /my_tasks command"""
    db = get_db()
    service = TaskService(db)
    
    if festival_id:
        festival = service.get_festival_by_id(festival_id)
    else:
        festival = service.get_active_festival()
    
    if not festival:
        return "❌ No active festival found"
    
    tasks = service.get_my_tasks(festival.id, member_id)
    return format_my_tasks(tasks)


def handle_complete(task_id: int, member_id: int, proof: Optional[str] = None) -> str:
    """Handle /complete command"""
    db = get_db()
    service = TaskService(db)
    
    success, message = service.complete_task(task_id, member_id, proof)
    return message


def handle_verify(task_id: int, verifier_id: int) -> str:
    """Handle /verify command"""
    db = get_db()
    service = TaskService(db)
    
    success, message = service.verify_task(task_id, verifier_id)
    return message


def handle_points(festival_id: Optional[int], member_id: int) -> str:
    """Handle /points command"""
    db = get_db()
    service = PointsService(db)
    
    balance = service.get_balance(member_id, festival_id)
    return format_points_balance(member_id, balance)


def handle_leaderboard(festival_id: Optional[int], member_id: Optional[int] = None) -> str:
    """Handle /leaderboard command"""
    db = get_db()
    service = PointsService(db)
    
    leaderboard = service.get_leaderboard(festival_id)
    return format_leaderboard(leaderboard, member_id)


def handle_rewards(festival_id: Optional[int] = None) -> str:
    """Handle /rewards command"""
    db = get_db()
    service = RewardService(db)
    
    rewards = service.list_rewards(festival_id)
    return format_rewards(rewards)


def handle_redeem(reward_id: int, member_id: int) -> str:
    """Handle /redeem command"""
    db = get_db()
    service = RewardService(db)
    
    success, message = service.redeem_reward(reward_id, member_id)
    return message


def handle_create_task(
    festival_id: int,
    title: str,
    category_id: int,
    member_id: int,
    description: Optional[str] = None,
    points_value: int = 10,
    time_estimate: Optional[str] = None
) -> str:
    """Handle /create_task command (admin)"""
    db = get_db()
    service = TaskService(db)
    
    # TODO: Add admin check
    task = service.create_task(
        festival_id=festival_id,
        title=title,
        category_id=category_id,
        description=description,
        points_value=points_value,
        time_estimate=time_estimate,
        created_by=member_id
    )
    
    return f"✅ Task created! ID: `{task.id}`"


def handle_add_reward(
    title: str,
    points_cost: int,
    emoji: Optional[str] = None,
    description: Optional[str] = None,
    quantity: Optional[int] = None,
    festival_id: Optional[int] = None
) -> str:
    """Handle /add_reward command (admin)"""
    db = get_db()
    service = RewardService(db)
    
    # TODO: Add admin check
    reward = service.create_reward(
        title=title,
        points_cost=points_cost,
        emoji=emoji,
        description=description,
        quantity=quantity,
        festival_id=festival_id
    )
    
    return f"✅ Reward created! ID: `{reward.id}`"
