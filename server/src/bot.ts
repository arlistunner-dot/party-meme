import { TELEGRAM } from './config/constants.js';

const BOT_TOKEN = TELEGRAM.BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId: number, text: string, options?: Record<string, unknown>) {
  await fetch(`${API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options,
    }),
  });
}

function handleUpdate(update: Record<string, unknown>) {
  const message = update.message as Record<string, unknown> | undefined;
  if (!message) return;

  const chat = message.chat as Record<string, unknown>;
  const chatId = chat.id as number;
  const text = message.text as string | undefined;

  if (text === '/start') {
    sendMessage(
      chatId,
      `🎉 <b>Party Meme ga xush kelibsiz!</b>\n\n` +
      `Eng kulgili karta o'yini!\n\n` +
      `🎮 O'yin boshlash uchun pastdagi tugmani bosing.`,
      {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: '🎮 O\'YNA',
                web_app: {
                  url: process.env.WEB_APP_URL || 'https://lucky-adventure-production-1ca0.up.railway.app',
                },
              },
            ],
          ],
        }),
      }
    );
  } else if (text === '/help') {
    sendMessage(
      chatId,
      `📖 <b>Yordam</b>\n\n` +
      `/start - Boshlash\n` +
      `/help - Yordam\n` +
      `/rating - Reyting`
    );
  } else if (text === '/rating') {
    sendMessage(
      chatId,
      `🏆 <b>Haftalik TOP-3</b>\n\n` +
      `🥇 Bobur — 980 ball\n` +
      `🥈 Asadbek — 750 ball\n` +
      `🥉 Diyor — 620 ball`
    );
  }
}

let lastUpdateId = 0;

async function pollUpdates() {
  try {
    const response = await fetch(
      `${API_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`
    );
    const data = (await response.json()) as { ok: boolean; result: Record<string, unknown>[] };

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id as number;
        handleUpdate(update);
      }
    }
  } catch (err) {
    console.error('[Bot] Xato:', err);
  }
}

export function startBot() {
  if (!BOT_TOKEN || BOT_TOKEN === 'your_bot_token') {
    console.log('[Bot] Token topilmadi — bot ishlamaydi');
    return;
  }

  console.log('[Bot] Ishlamoqda...');
  setInterval(pollUpdates, 1000);
  pollUpdates();
}
