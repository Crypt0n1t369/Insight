// telegram_delivery.js
// Lightweight Telegram delivery module to post resume briefs to Telegram
// Secrets loaded from environment: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

const https = require('https');

function configureTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error('Telegram token or chat_id not configured in environment');
  }
  return { token, chatId };
}

async function postResumeBrief(payload) {
  // payload should be an object with fields: header, completed, inProgress, nextActions, blockers, risk, budget
  const { token, chatId } = configureTelegram();
  // Build a compact message body
  const lines = [];
  lines.push(`${payload.header || ''}`);
  if (payload.completed) lines.push(`Completed: ${payload.completed}`);
  if (payload.inProgress) lines.push(`In progress: ${payload.inProgress}`);
  if (payload.nextActions && payload.nextActions.length) {
    lines.push('Next actions:');
    payload.nextActions.forEach((a,i)=> lines.push(`  ${i+1}. ${a}`));
  }
  if (payload.blockers) lines.push(`Blockers: ${payload.blockers}`);
  if (payload.risk) lines.push(`Risk: ${payload.risk}`);
  if (payload.budget) lines.push(`Budget: ${payload.budget}`);
  const text = lines.join('\n');

  const url = `/bot${token}/sendMessage`;
  const data = new URLSearchParams({ chat_id: chatId, text: text, parse_mode: 'Markdown' });
  const options = {
    hostname: 'api.telegram.org',
    path: url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.toString().length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let buf = '';
      res.on('data', (d) => buf += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: 'ok', body: buf });
        } else {
          reject(new Error(`Telegram respond ${res.statusCode}: ${buf}`));
        }
      });
    });
    req.on('error', (e)=> reject(e));
    req.write(data.toString());
    req.end();
  });
}

module.exports = { postResumeBrief };
