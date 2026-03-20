"""
Telegram Bot for Youth Empowerment Platform
Provides a chat interface for the vault and journey features
"""
import os
import logging
from typing import Optional
from pathlib import Path
import sys

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
# Import vault manager directly (API app not needed for bot)
from vault.manager import VaultManager

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Initialize services
vault_manager = VaultManager()
BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')

# User sessions storage (in-memory for MVP)
user_sessions: dict[int, dict] = {}


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command"""
    await update.message.reply_text(
        "🌟 Welcome to Youth Empowerment Platform!\n\n"
        "Create your vault to begin your hero's journey.\n"
        "Use /create to get started or /help for more options."
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help command"""
    await update.message.reply_text(
        "📖 Available commands:\n\n"
        "/start - Welcome message\n"
        "/help - Show this help\n"
        "/create - Create your vault\n"
        "/status - Check your journey status\n"
        "/logout - Log out of your vault"
    )


async def create_vault(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle vault creation via bot"""
    user_id = str(update.effective_user.id)
    username = update.effective_user.username or update.effective_user.first_name or "User"
    
    try:
        # Generate a secure passphrase (in production, prompt user)
        import secrets
        passphrase = secrets.token_hex(16)
        
        vault = vault_manager.create_vault(user_id, passphrase, username)
        
        user_sessions[update.effective_user.id] = {
            'user_id': user_id,
            'passphrase': passphrase,
            'vault_id': vault['vault_id']
        }
        
        await update.message.reply_text(
            f"✅ Vault created!\n\n"
            f"Your passphrase: `{passphrase}`\n\n"
            f"⚠️ Save this passphrase - you'll need it to access your vault!\n\n"
            f"Type /status to see your journey.",
            parse_mode='Markdown'
        )
    except Exception as e:
        await update.message.reply_text(
            f"❌ Error creating vault: {str(e)}"
        )


async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Check user journey status"""
    user_id = user_sessions.get(update.effective_user.id, {}).get('user_id')
    
    if not user_id:
        await update.message.reply_text(
            "You don't have a vault yet. Use /create to start your journey!"
        )
        return
    
    try:
        vault_data = vault_manager.get_vault(user_id)
        if vault_data:
            await update.message.reply_text(
                f"📊 Your Journey Status\n\n"
                f"Vault ID: {vault_data.get('vault_id', 'N/A')}\n"
                f"Character: {vault_data.get('character', {}).get('name', 'Not set')}\n"
                f"Current Phase: {vault_data.get('current_phase', 'beginner')}"
            )
        else:
            await update.message.reply_text("Vault not found.")
    except Exception as e:
        await update.message.reply_text(f"Error: {str(e)}")


async def logout_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Log out of vault"""
    user_id = update.effective_user.id
    if user_id in user_sessions:
        del user_sessions[user_id]
        await update.message.reply_text("✅ Logged out successfully!")
    else:
        await update.message.reply_text("You weren't logged in.")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle incoming messages"""
    await update.message.reply_text(
        "Thanks for your message! Use /help to see available commands."
    )


def run_bot():
    """Run the Telegram bot"""
    if not BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN not set - bot will not run")
        print("⚠️ TELEGRAM_BOT_TOKEN not set. Set it in .env to enable bot.")
        return
    
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("create", create_vault))
    application.add_handler(CommandHandler("status", status_command))
    application.add_handler(CommandHandler("logout", logout_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    logger.info("Starting Telegram bot...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    run_bot()