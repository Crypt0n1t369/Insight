"""
Festival Coordinator - Telegram Bot Entry Point
Wires handlers.py command functions to Telegram commands.
Uses python-telegram-bot v20+ API (Application builder).
Admin IDs: ADMIN_TELEGRAM_IDS env var (comma-separated).
"""
import logging, os
from functools import wraps
from typing import Optional
from telegram import Update
from telegram.ext import (
    Application, CommandHandler, ContextTypes,
    ConversationHandler, MessageHandler, filters,
)
from src.handlers import (
    handle_festival, handle_tasks, handle_claim, handle_my_tasks,
    handle_complete, handle_verify, handle_points, handle_leaderboard,
    handle_rewards, handle_redeem, handle_create_task, handle_add_reward,
)
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ADMIN_IDS = set()
for p in os.getenv("ADMIN_TELEGRAM_IDS", "").split(","):
    p = p.strip()
    if p:
        ADMIN_IDS.add(int(p))
logging.basicConfig(format="%(asctime)s %(levelname)s %(name)s: %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)
(AWAIT_TASK_FESTIVAL_ID, AWAIT_TASK_TITLE, AWAIT_TASK_CATEGORY,
 AWAIT_TASK_DESC, AWAIT_TASK_POINTS, AWAIT_TASK_TIME, AWAIT_TASK_CONFIRM,
 AWAIT_REWARD_TITLE, AWAIT_REWARD_COST, AWAIT_REWARD_EMOJI,
 AWAIT_REWARD_DESC, AWAIT_REWARD_QTY, AWAIT_REWARD_CONFIRM) = range(13)
def extract_args(text, expected):
    parts = (text or "").strip().split(maxsplit=expected)
    while len(parts) < expected: parts.append("")
    return parts[:expected]
async def error_handler(update, context):
    logger.exception("Error: %s", update)
    if isinstance(update, Update) and update.message:
        await update.message.reply_text("An unexpected error occurred.")
async def cmd_start(update, context):
    u = update.effective_user
    await update.message.reply_text(f"Hi {u.first_name}! Festival Coordinator. /festival /tasks /claim /my_tasks /complete /verify /points /leaderboard /rewards /redeem /create_task /add_reward /cancel", parse_mode="Markdown")
async def cmd_festival(update, context):
    args = extract_args(context.args_text, 1)
    fid = int(args[0]) if args[0].isdigit() else None
    await update.message.reply_text(handle_festival(fid), parse_mode="Markdown")
async def cmd_tasks(update, context):
    args = extract_args(context.args_text, 2)
    fid = int(args[0]) if args[0].isdigit() else None
    cid = int(args[1]) if args[1].isdigit() else None
    await update.message.reply_text(handle_tasks(fid, cid), parse_mode="Markdown")
async def cmd_claim(update, context):
    if not context.args: await update.message.reply_text("Usage: /claim <task_id>"); return
    try: tid = int(context.args[0])
    except ValueError: await update.message.reply_text("Invalid task ID."); return
    await update.message.reply_text(handle_claim(tid, update.effective_user.id))
async def cmd_my_tasks(update, context):
    args = extract_args(context.args_text, 1)
    fid = int(args[0]) if args[0].isdigit() else None
    await update.message.reply_text(handle_my_tasks(fid, update.effective_user.id))
async def cmd_complete(update, context):
    if not context.args: await update.message.reply_text("Usage: /complete <task_id> [proof]"); return
    try: tid = int(context.args[0])
    except ValueError: await update.message.reply_text("Invalid task ID."); return
    proof = " ".join(context.args[1:]) if len(context.args) > 1 else None
    await update.message.reply_text(handle_complete(tid, update.effective_user.id, proof))
async def cmd_verify(update, context):
    if not context.args: await update.message.reply_text("Usage: /verify <task_id>"); return
    try: tid = int(context.args[0])
    except ValueError: await update.message.reply_text("Invalid task ID."); return
    await update.message.reply_text(handle_verify(tid, update.effective_user.id))
async def cmd_points(update, context):
    args = extract_args(context.args_text, 1)
    fid = int(args[0]) if args[0].isdigit() else None
    await update.message.reply_text(handle_points(fid, update.effective_user.id), parse_mode="Markdown")
async def cmd_leaderboard(update, context):
    args = extract_args(context.args_text, 1)
    fid = int(args[0]) if args[0].isdigit() else None
    await update.message.reply_text(handle_leaderboard(fid, update.effective_user.id), parse_mode="Markdown")
async def cmd_rewards(update, context):
    args = extract_args(context.args_text, 1)
    fid = int(args[0]) if args[0].isdigit() else None
    await update.message.reply_text(handle_rewards(fid), parse_mode="Markdown")
async def cmd_redeem(update, context):
    if not context.args: await update.message.reply_text("Usage: /redeem <reward_id>"); return
    try: rid = int(context.args[0])
    except ValueError: await update.message.reply_text("Invalid reward ID."); return
    await update.message.reply_text(handle_redeem(rid, update.effective_user.id))
async def cmd_cancel(update, context):
    await update.message.reply_text("Cancelled.")
    return ConversationHandler.END
def _admin_check(update):
    uid = update.effective_user.id if update.effective_user else 0
    return not ADMIN_IDS or uid in ADMIN_IDS

async def create_task_start(update, context):
    if not _admin_check(update): await update.message.reply_text('Admin only.'); return
    await update.message.reply_text('Create Task Admin. Step 1/6 - Festival ID:', parse_mode='Markdown')
    return AWAIT_TASK_FESTIVAL_ID
async def create_task_festival_id(update, context):
    t = update.message.text.strip()
    if not t.isdigit(): await update.message.reply_text('Must be a number.'); return AWAIT_TASK_FESTIVAL_ID
    context.bot_data['task_festival_id'] = int(t)
    await update.message.reply_text('Step 2/6 - Task Title:', parse_mode='Markdown')
    return AWAIT_TASK_TITLE
async def create_task_title(update, context):
    t = update.message.text.strip()
    if not t: await update.message.reply_text('Cannot be empty.'); return AWAIT_TASK_TITLE
    context.bot_data['task_title'] = t
    await update.message.reply_text('Step 3/6 - Category ID:', parse_mode='Markdown')
    return AWAIT_TASK_CATEGORY
async def create_task_category(update, context):
    t = update.message.text.strip()
    if not t.isdigit(): await update.message.reply_text('Must be a number.'); return AWAIT_TASK_CATEGORY
    context.bot_data['task_category_id'] = int(t)
    await update.message.reply_text('Step 4/6 - Description (or skip):', parse_mode='Markdown')
    return AWAIT_TASK_DESC
async def create_task_desc(update, context):
    t = update.message.text.strip()
    context.bot_data['task_description'] = None if t.lower() == 'skip' else t
    await update.message.reply_text('Step 5/6 - Points Value (default 10):', parse_mode='Markdown')
    return AWAIT_TASK_POINTS
async def create_task_points(update, context):
    t = update.message.text.strip()
    context.bot_data['task_points'] = int(t) if t.isdigit() else 10
    await update.message.reply_text('Step 6/6 - Time Estimate (or skip):', parse_mode='Markdown')
    return AWAIT_TASK_TIME
async def create_task_time(update, context):
    t = update.message.text.strip()
    context.bot_data['task_time_estimate'] = None if t.lower() == 'skip' else t
    d = context.bot_data
    await update.message.reply_text(
        f'Confirm: FID={d['task_festival_id']}, Title={d['task_title']}, Cat={d['task_category_id']}, '
        f'Desc={d.get('task_description') or 'None'}, Pts={d['task_points']}, Time={d.get('task_time_estimate') or 'None'}. Reply yes to confirm.',
        parse_mode='Markdown')
    return AWAIT_TASK_CONFIRM
async def create_task_confirm(update, context):
    t = update.message.text.strip().lower()
    if t not in ('yes', 'y'): await update.message.reply_text('Cancelled.'); return ConversationHandler.END
    d = context.bot_data
    try:
        result = handle_create_task(festival_id=d['task_festival_id'], title=d['task_title'],
            category_id=d['task_category_id'], member_id=update.effective_user.id,
            description=d.get('task_description'), points_value=d.get('task_points', 10),
            time_estimate=d.get('task_time_estimate'))
    except Exception as e:
        logger.exception('create_task error'); await update.message.reply_text(f'Error: {e}'); return ConversationHandler.END
    await update.message.reply_text(result, parse_mode='Markdown')
    for k in list(context.bot_data.keys()):
        if k.startswith('task_'): del context.bot_data[k]
    return ConversationHandler.END


async def add_reward_start(update, context):
    if not _admin_check(update): await update.message.reply_text('Admin only.'); return
    await update.message.reply_text('Add Reward Admin. Step 1/5 - Reward Title:', parse_mode='Markdown')
    return AWAIT_REWARD_TITLE
async def add_reward_title(update, context):
    t = update.message.text.strip()
    if not t: await update.message.reply_text('Cannot be empty.'); return AWAIT_REWARD_TITLE
    context.bot_data['reward_title'] = t
    await update.message.reply_text('Step 2/5 - Points Cost:', parse_mode='Markdown')
    return AWAIT_REWARD_COST
async def add_reward_cost(update, context):
    t = update.message.text.strip()
    if not t.isdigit(): await update.message.reply_text('Must be a number.'); return AWAIT_REWARD_COST
    context.bot_data['reward_points_cost'] = int(t)
    await update.message.reply_text('Step 3/5 - Emoji (or skip):', parse_mode='Markdown')
    return AWAIT_REWARD_EMOJI
async def add_reward_emoji(update, context):
    t = update.message.text.strip()
    context.bot_data['reward_emoji'] = None if t.lower() == 'skip' else t
    await update.message.reply_text('Step 4/5 - Description (or skip):', parse_mode='Markdown')
    return AWAIT_REWARD_DESC
async def add_reward_desc(update, context):
    t = update.message.text.strip()
    context.bot_data['reward_description'] = None if t.lower() == 'skip' else t
    await update.message.reply_text('Step 5/5 - Quantity (number or skip for unlimited):', parse_mode='Markdown')
    return AWAIT_REWARD_QTY
async def add_reward_qty(update, context):
    t = update.message.text.strip()
    if t.lower() == 'skip': context.bot_data['reward_quantity'] = None
    elif t.isdigit(): context.bot_data['reward_quantity'] = int(t)
    else: await update.message.reply_text('Must be a number or skip.'); return AWAIT_REWARD_QTY
    d = context.bot_data
    await update.message.reply_text(
        "Confirm: Title=" + d['reward_title'] + ", Cost=" + str(d['reward_points_cost']) + "pts, "
        "Emoji=" + str(d.get('reward_emoji') or 'None') + ", Desc=" + str(d.get('reward_description') or 'None') + ", "
        "Qty=" + str(d.get('reward_quantity') or 'Unlimited') + ". Reply yes to confirm."
    )
    return AWAIT_REWARD_CONFIRM
async def add_reward_confirm(update, context):
    t = update.message.text.strip().lower()
    if t not in ('yes', 'y'): await update.message.reply_text('Cancelled.'); return ConversationHandler.END
    d = context.bot_data
    try:
        result = handle_add_reward(title=d['reward_title'], points_cost=d['reward_points_cost'],
            emoji=d.get('reward_emoji'), description=d.get('reward_description'),
            quantity=d.get('reward_quantity'))
    except Exception as e:
        logger.exception('add_reward error'); await update.message.reply_text(f'Error: {e}'); return ConversationHandler.END
    await update.message.reply_text(result, parse_mode='Markdown')
    for k in list(context.bot_data.keys()):
        if k.startswith('reward_'): del context.bot_data[k]
    return ConversationHandler.END


def main():
    if not BOT_TOKEN: raise RuntimeError('TELEGRAM_BOT_TOKEN env var not set.')
    app = (Application.builder().token(BOT_TOKEN).read_timeout(30).write_timeout(30).build())
    app.add_handler(CommandHandler('start', cmd_start))
    app.add_handler(CommandHandler('festival', cmd_festival))
    app.add_handler(CommandHandler('tasks', cmd_tasks))
    app.add_handler(CommandHandler('claim', cmd_claim))
    app.add_handler(CommandHandler('my_tasks', cmd_my_tasks))
    app.add_handler(CommandHandler('complete', cmd_complete))
    app.add_handler(CommandHandler('verify', cmd_verify))
    app.add_handler(CommandHandler('points', cmd_points))
    app.add_handler(CommandHandler('leaderboard', cmd_leaderboard))
    app.add_handler(CommandHandler('rewards', cmd_rewards))
    app.add_handler(CommandHandler('redeem', cmd_redeem))
    app.add_handler(CommandHandler('cancel', cmd_cancel))
    app.add_handler(ConversationHandler(
        entry_points=[CommandHandler('create_task', create_task_start)],
        states={
            AWAIT_TASK_FESTIVAL_ID: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_task_festival_id)],
            AWAIT_TASK_TITLE: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_task_title)],
            AWAIT_TASK_CATEGORY: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_task_category)],
            AWAIT_TASK_DESC: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_task_desc)],
            AWAIT_TASK_POINTS: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_task_points)],
            AWAIT_TASK_TIME: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_task_time)],
            AWAIT_TASK_CONFIRM: [MessageHandler(filters.TEXT & ~filters.COMMAND, create_task_confirm)],
        },
        fallbacks=[CommandHandler('cancel', cmd_cancel)],
    ))
    app.add_handler(ConversationHandler(
        entry_points=[CommandHandler('add_reward', add_reward_start)],
        states={
            AWAIT_REWARD_TITLE: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_reward_title)],
            AWAIT_REWARD_COST: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_reward_cost)],
            AWAIT_REWARD_EMOJI: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_reward_emoji)],
            AWAIT_REWARD_DESC: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_reward_desc)],
            AWAIT_REWARD_QTY: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_reward_qty)],
            AWAIT_REWARD_CONFIRM: [MessageHandler(filters.TEXT & ~filters.COMMAND, add_reward_confirm)],
        },
        fallbacks=[CommandHandler('cancel', cmd_cancel)],
    ))
    app.add_error_handler(error_handler)
    logger.info('Bot starting. Admin IDs: %s', ADMIN_IDS)
    app.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    main()
