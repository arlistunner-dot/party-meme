import { query, queryOne } from '../config/database.js';
import { RATING, ECONOMY } from '../config/constants.js';

/**
 * Foydalanuvchi ma'lumotlari
 */
export async function getUser(userId: number) {
  return queryOne('SELECT * FROM users WHERE id = $1', [userId]);
}

/**
 * Statistika
 */
export async function getUserStats(userId: number) {
  const user = await queryOne<{
    total_matches: number;
    total_wins: number;
    cards_created: number;
    total_likes: number;
    rating: number;
    rank: string;
  }>(
    `SELECT total_matches, total_wins, cards_created, total_likes, rating, rank
     FROM users WHERE id = $1`,
    [userId]
  );

  if (!user) throw new Error('Foydalanuvchi topilmadi');

  return {
    totalMatches: user.total_matches,
    totalWins: user.total_wins,
    winRate: user.total_matches > 0
      ? Math.round((user.total_wins / user.total_matches) * 100)
      : 0,
    cardsCreated: user.cards_created,
    cardsLiked: user.total_likes,
    rating: user.rating,
    rank: user.rank,
  };
}

/**
 * Kunlik bonus olish
 */
export async function claimDailyBonus(userId: number) {
  const user = await queryOne<{ daily_claimed_at: string | null; coin_balance: number }>(
    'SELECT daily_claimed_at, coin_balance FROM users WHERE id = $1',
    [userId]
  );

  if (!user) throw new Error('Foydalanuvchi topilmadi');

  // Tekshirish: bugun olganmi?
  if (user.daily_claimed_at) {
    const lastClaim = new Date(user.daily_claimed_at).toDateString();
    const today = new Date().toDateString();
    if (lastClaim === today) {
      throw new Error('Bugungi bonus allaqachon olindi');
    }
  }

  const newBalance = user.coin_balance + ECONOMY.DAILY_BONUS;

  await query(
    `UPDATE users
     SET coin_balance = $1, daily_claimed_at = NOW()
     WHERE id = $2`,
    [newBalance, userId]
  );

  await query(
    `INSERT INTO transactions (user_id, type, currency, amount, balance_after, description)
     VALUES ($1, 'earn', 'coin', $2, $3, 'Kunlik bonus')`,
    [userId, ECONOMY.DAILY_BONUS, newBalance]
  );

  return { coins: newBalance, earned: ECONOMY.DAILY_BONUS };
}

/**
 * Reyting qo'shish
 */
export async function addRating(userId: number, amount: number, reason: string) {
  const user = await queryOne<{ rating: number; rank: string }>(
    'SELECT rating, rank FROM users WHERE id = $1',
    [userId]
  );

  if (!user) return;

  const newRating = user.rating + amount;
  const newRank = calculateRank(newRating);

  await query(
    'UPDATE users SET rating = $1, rank = $2 WHERE id = $3',
    [newRating, newRank, userId]
  );

  return { rating: newRating, rank: newRank };
}

/**
 * Daraja hisoblash
 */
function calculateRank(rating: number): string {
  if (rating >= 5000) return 'legend';
  if (rating >= 2000) return 'factory';
  if (rating >= 1000) return 'memelord';
  if (rating >= 500) return 'funny';
  return 'newbie';
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
