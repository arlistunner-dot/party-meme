import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { JWT, TELEGRAM, ECONOMY } from '../config/constants.js';
import { queryOne, query } from '../config/database.js';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Telegram initData ni tekshiradi
 */
function validateInitData(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    params.delete('hash');

    const sorted = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(TELEGRAM.BOT_TOKEN)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(sorted)
      .digest('hex');

    if (calculatedHash !== hash) {
      return null;
    }

    const authDate = parseInt(params.get('auth_date') || '0');
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return null;
    }

    const userStr = params.get('user');
    if (!userStr) return null;

    return JSON.parse(userStr) as TelegramUser;
  } catch {
    return null;
  }
}

/**
 * Telegram initData bilan autentifikatsiya
 */
export async function authenticateTelegram(initData: string) {
  // Demo rejim — Telegram tashqarisida
  if (initData === 'demo') {
    const demoTelegramId = 999999;

    let user = await queryOne(
      'SELECT * FROM users WHERE telegram_id = $1',
      [demoTelegramId]
    );

    if (!user) {
      user = await queryOne(
        `INSERT INTO users (
          telegram_id, username, first_name,
          coin_balance, max_card_slots, language
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [demoTelegramId, 'demo_player', 'Demo O\'yinchi', 2350, 5, 'uz']
      );
    }

    const token = jwt.sign(
      { userId: user!.id, telegramId: demoTelegramId },
      JWT.SECRET,
      { expiresIn: 86400 }
    );

    return { token, user };
  }

  // 1. initData ni tekshirish
  const tgUser = validateInitData(initData);
  if (!tgUser) {
    throw new Error('Noto\'g\'ri Telegram ma\'lumotlari');
  }

  // 2. Foydalanuvchini DB dan topish
  let user = await queryOne<{ id: number }>(
    'SELECT id FROM users WHERE telegram_id = $1',
    [tgUser.id]
  );

  // 3. Yangi foydalanuvchi yaratish
  if (!user) {
    user = await queryOne<{ id: number }>(
      `INSERT INTO users (
        telegram_id, username, first_name, last_name,
        avatar_url, is_premium, coin_balance, max_card_slots,
        language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        tgUser.id,
        tgUser.username || null,
        tgUser.first_name,
        tgUser.last_name || null,
        tgUser.photo_url || null,
        tgUser.is_premium || false,
        ECONOMY.INITIAL_COINS,
        ECONOMY.INITIAL_SLOTS,
        tgUser.language_code || 'uz',
      ]
    );
  }

  if (!user) {
    throw new Error('Foydalanuvchi yaratishda xato');
  }

  // 4. Last active yangilash
  await query(
    'UPDATE users SET last_active_at = NOW() WHERE id = $1',
    [user.id]
  );

  // 5. JWT token yaratish
  const token = jwt.sign(
    { userId: user.id, telegramId: tgUser.id },
    JWT.SECRET,
    { expiresIn: JWT.EXPIRY }
  );

  // 6. To'liq foydalanuvchi ma'lumotlari
  const fullUser = await queryOne(
    `SELECT * FROM users WHERE id = $1`,
    [user.id]
  );

  return { token, user: fullUser };
}

/**
 * Profilni yangilash
 */
export async function updateUser(
  userId: number,
  data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
    language?: string;
  }
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.firstName !== undefined) {
    fields.push(`first_name = $${paramIndex++}`);
    values.push(data.firstName);
  }
  if (data.lastName !== undefined) {
    fields.push(`last_name = $${paramIndex++}`);
    values.push(data.lastName);
  }
  if (data.username !== undefined) {
    fields.push(`username = $${paramIndex++}`);
    values.push(data.username);
  }
  if (data.bio !== undefined) {
    fields.push(`bio = $${paramIndex++}`);
    values.push(data.bio);
  }
  if (data.avatarUrl !== undefined) {
    fields.push(`avatar_url = $${paramIndex++}`);
    values.push(data.avatarUrl);
  }
  if (data.language !== undefined) {
    fields.push(`language = $${paramIndex++}`);
    values.push(data.language);
  }

  if (fields.length === 0) {
    throw new Error('Yangilash uchun ma\'lumot yo\'q');
  }

  values.push(userId);

  const user = await queryOne(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (!user) {
    throw new Error('Foydalanuvchi topilmadi');
  }

  return user;
}
