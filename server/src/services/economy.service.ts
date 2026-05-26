import { query, queryOne } from '../config/database.js';
import { ECONOMY } from '../config/constants.js';

/**
 * Tanga qo'shish
 */
export async function addCoins(
  userId: number,
  amount: number,
  reason: string,
  referenceId?: number
) {
  const user = await queryOne<{ coin_balance: number }>(
    'SELECT coin_balance FROM users WHERE id = $1',
    [userId]
  );

  if (!user) throw new Error('Foydalanuvchi topilmadi');

  const newBalance = user.coin_balance + amount;

  await query(
    'UPDATE users SET coin_balance = $1 WHERE id = $2',
    [newBalance, userId]
  );

  await query(
    `INSERT INTO transactions (user_id, type, currency, amount, balance_after, description, reference_id)
     VALUES ($1, 'earn', 'coin', $2, $3, $4, $5)`,
    [userId, amount, newBalance, reason, referenceId || null]
  );

  return newBalance;
}

/**
 * Tanga sarflash
 */
export async function spendCoins(
  userId: number,
  amount: number,
  reason: string,
  referenceId?: number
) {
  const user = await queryOne<{ coin_balance: number }>(
    'SELECT coin_balance FROM users WHERE id = $1',
    [userId]
  );

  if (!user) throw new Error('Foydalanuvchi topilmadi');
  if (user.coin_balance < amount) {
    throw new Error('Tangalar yetarli emas');
  }

  const newBalance = user.coin_balance - amount;

  await query(
    'UPDATE users SET coin_balance = $1 WHERE id = $2',
    [newBalance, userId]
  );

  await query(
    `INSERT INTO transactions (user_id, type, currency, amount, balance_after, description, reference_id)
     VALUES ($1, 'spend', 'coin', $2, $3, $4, $5)`,
    [userId, -amount, newBalance, reason, referenceId || null]
  );

  return newBalance;
}

/**
 * Stars qo'shish
 */
export async function addStars(userId: number, amount: number, reason: string) {
  const user = await queryOne<{ star_balance: number }>(
    'SELECT star_balance FROM users WHERE id = $1',
    [userId]
  );

  if (!user) throw new Error('Foydalanuvchi topilmadi');

  const newBalance = user.star_balance + amount;

  await query(
    'UPDATE users SET star_balance = $1 WHERE id = $2',
    [newBalance, userId]
  );

  await query(
    `INSERT INTO transactions (user_id, type, currency, amount, balance_after, description)
     VALUES ($1, 'earn', 'star', $2, $3, $4)`,
    [userId, amount, newBalance, reason]
  );

  return newBalance;
}

/**
 * Match natijasi bo'yicha mukofot
 */
export async function rewardMatchResult(
  userId: number,
  isWinner: boolean,
  isAdWinner: boolean
) {
  const rewards = [];

  // Match o'ynash mukofoti
  const playReward = ECONOMY.MATCH_PLAY_COINS;
  await addCoins(userId, playReward, 'Match o\'ynash');
  rewards.push({ reason: 'match_play', amount: playReward });

  // G'olib mukofoti
  if (isWinner) {
    const winReward = isAdWinner
      ? ECONOMY.MATCH_WIN_COINS * 2  // Reklama kartasi 2x
      : ECONOMY.MATCH_WIN_COINS;
    await addCoins(userId, winReward, 'Match g\'alabasi');
    rewards.push({ reason: 'match_win', amount: winReward });
  }

  return rewards;
}

/**
 * Reklama ko'rish mukofoti
 */
export async function claimAdReward(userId: number) {
  // Kunlik limit tekshirish (Redis orqali)
  const key = `ad_views:${userId}:${new Date().toDateString()}`;
  const { getRedis, incrRedis, expireRedis } = await import('../config/redis.js');

  const current = await getRedis(key);
  const count = current ? parseInt(current) : 0;

  if (count >= ECONOMY.DAILY_AD_LIMIT) {
    throw new Error('Kunlik reklama limiti tugadi');
  }

  await incrRedis(key);
  if (count === 0) {
    await expireRedis(key, 86400); // 24 soat
  }

  const newBalance = await addCoins(userId, ECONOMY.AD_VIEW_REWARD, 'Reklama ko\'rish');

  return { coins: newBalance, earned: ECONOMY.AD_VIEW_REWARD, viewed: count + 1 };
}
