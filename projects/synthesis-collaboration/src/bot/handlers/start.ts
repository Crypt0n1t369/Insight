import { Context } from 'grammy';

export async function handleStart(ctx: Context) {
  if (ctx.chat.type === 'private') {
    await ctx.reply(
      `👋 *Welcome to Synthesis Collaboration*

A collaborative intelligence engine that transforms group conversations into structured synthesis.

*Get started:*
1. Add me to a Telegram group
2. Create a project: /new-project <name>
3. Define a challenge: /define-challenge <what problem are you solving?>
4. Everyone adds insights: /insight <their input>
5. Generate synthesis: /generate

Questions? Type /help for all commands.`,
      { parse_mode: 'Markdown' }
    );
  } else {
    await ctx.reply('✅ Bot is active. Type /new-project <name> to start a collaboration session.');
  }
}
