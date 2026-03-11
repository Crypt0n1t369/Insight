# Festival Coordinator - Organizer Tools

## Overview

These tools help festival organizers manage volunteers, tasks, and rewards efficiently.

---

## Most Useful Organizer Tools (Priority Order)

### Tier 1: Essential (Must Have)

| Tool | Purpose | Command |
|------|---------|---------|
| **Dashboard** | Overview of festival status | `/fest_stats` |
| **Task Creator** | Create new tasks quickly | `/fest_create_task` |
| **Volunteer List** | See all volunteers + levels | `/fest_volunteers` |
| **Task Overview** | See all tasks + status | `/fest_all_tasks` |

### Tier 2: Important (Should Have)

| Tool | Purpose | Command |
|------|---------|---------|
| **Reward Creator** | Add new rewards | `/fest_add_reward` |
| **Vouch** | Boost a volunteer to Level 2 | `/fest_vouch @user` |
| **Assign Task** | Manually assign a task | `/fest_assign @user task_id` |
| **Remove Claim** | Cancel a task claim | `/fest_unclaim task_id` |

### Tier 3: Nice to Have

| Tool | Purpose | Command |
|------|---------|---------|
| **Broadcast** | Message all volunteers | `/fest_broadcast message` |
| **Leader Nomination** | Make someone a Lead | `/fest_promote @user` |
| **Export Data** | Download volunteer data | `/fest_export` |
| **Reset Volunteer** | Clear volunteer's progress | `/fest_reset @user` |

---

## Tool Details

### 1. Dashboard (`/fest_stats`)

Already implemented - shows:
- Total/completed tasks
- Volunteer count
- Completion rate

**Enhancement needed:** Add "needs attention" section (unclaimed critical tasks)

---

### 2. Task Creator (`/fest_create_task`)

Interactive wizard:

```
📝 Create New Task

1. Title: [text input]
2. Description: [text input]
3. Category: [Technical|Marketing|Operations|Creative|Logistics]
4. Points (10-100): [number]
5. Slots needed (1-10): [number]
6. Time estimate: [dropdown: 1hr, 2hr, 4hr, 6hr, 8hr]
7. Deadline: [date picker]
8. Min Level (1-3): [dropdown]
9. Critical? [Yes/No]

→ Create / Cancel
```

---

### 3. Volunteer List (`/fest_volunteers`)

```
👥 Volunteers (12)

Search: [___________]

Filter: [All] [Newcomer] [Active] [Trusted]

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ John D. | Skill 3 | 92% reliability
   5 tasks | 275 pts | 🏅🎯🔥

⭐ Sarah M. | Skill 2 | 85% reliability  
   3 tasks | 150 pts | 🏅🎯

⭐ Mike T. | Skill 1 | 40% reliability ⚠️
   1 task | 50 pts | 🎯
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 4. Task Overview (`/fest_all_tasks`)

```
📋 All Tasks (15)

Filter: [All] [Open] [In Progress] [Completed]

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CRITICAL: Sound Check - Main Stage
   👤 John D. (claimed) | ⏱️ 4hr | 50 pts

🟡 Welcome Desk (3/4 slots filled)
   👤 Sarah M., Mike T. | ⏱️ 4hr | 20 pts

🟢 Cleanup Crew (2/10 slots)
   Open | ⏱️ 2hr | 10 pts
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 5. Reward Creator (`/fest_add_reward`)

```
🎁 Add New Reward

1. Title: [text]
2. Description: [text]
3. Points cost: [number]
4. Quantity available: [number]

→ Create / Cancel
```

---

### 6. Vouch (`/fest_vouch @user`)

Simple command to boost a promising volunteer:
```
/vouch @johndoe

✅ Vouched for @johndoe!
They are now a Level 2 Trial Volunteer.
They can claim medium-difficulty tasks.
```

---

### 7. Assign Task (`/fest_assign @user task_id`)

Manually assign without volunteer claiming:
```
/assign @johndoe 5

✅ Assigned "Sound Check" to @johndoe
They will be notified automatically.
```

---

### 8. Remove Claim (`/fest_unclaim task_id`)

Cancel a problematic claim:
```
/unclaim 5

⚠️ Unclaim "Sound Check"?
Reason: [Volunteer no-show / Duplicate / Other]

→ Confirm / Cancel
```

---

### 9. Broadcast (`/fest_broadcast message`)

Message all volunteers:
```
/broadcast Reminder: Sound check meeting at 3pm tomorrow!

📢 Broadcast sent to 12 volunteers!
```

---

### 10. Leader Nomination (`/fest_promote @user`)

Make someone a team lead:
```
/promote @sarahm

👑 Nominated @sarahm as Lead Volunteer!

They can now:
- Create new tasks
- Approve critical role assignments
- Resolve disputes
```

---

## Permissions Matrix

| Action | Level 1 | Level 2 | Level 3 | Level 4 (Organizer) |
|--------|---------|---------|---------|---------------------|
| View tasks | ✅ | ✅ | ✅ | ✅ |
| Claim tasks | Easy only | Medium | All | All |
| Create tasks | ❌ | ❌ | ❌ | ✅ |
| Assign tasks | ❌ | ❌ | ❌ | ✅ |
| Verify others | ❌ | ❌ | ✅ | ✅ |
| Add rewards | ❌ | ❌ | ❌ | ✅ |
| Broadcast | ❌ | ❌ | ❌ | ✅ |
| Vouch | ❌ | ❌ | ✅ | ✅ |
| Promote to Lead | ❌ | ❌ | ❌ | ✅ |

---

## Quick Actions (Inline Keyboard)

On organizer dashboard:

```
[📝 New Task] [🎁 Add Reward] [👥 Volunteers]
[📋 All Tasks] [📢 Broadcast] [📊 Export]
```

---

## Next Implementation Priority

1. `/fest_volunteers` - See all volunteers
2. `/fest_create_task` - Interactive task creation
3. `/fest_vouch` - Quick vouch command
4. `/fest_assign` - Manual assignment
5. `/fest_add_reward` - Reward creation

---
