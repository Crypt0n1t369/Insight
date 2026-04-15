import 'dotenv/config';
import { BOT_TOKEN } from './src/config.js';
import { initializeDatabase } from './src/db/index.js';
import { buildBot } from './src/bot/index.js';

console.log('[DEBUG] TOKEN_OK:', !!BOT_TOKEN);

async function test() {
  try {
    console.log('[DEBUG] Calling initializeDatabase...');
    await initializeDatabase();
    console.log('[DEBUG] DB_OK');
  } catch(e) {
    console.error('[DEBUG] initializeDatabase FAILED:', e.message);
    process.exit(1);
  }

  try {
    console.log('[DEBUG] Calling buildBot...');
    const bot = await buildBot();
    console.log('[DEBUG] BOT_BUILT_OK');
    console.log('[DEBUG] Starting polling...');
    await bot.start();
    console.log('[DEBUG] RUNNING');
  } catch(e) {
    console.error('[DEBUG] buildBot/start FAILED:', e.message);
    console.error('[DEBUG] STACK:', e.stack?.split('\n').slice(0,5).join('\n'));
    process.exit(1);
  }
}

test();
