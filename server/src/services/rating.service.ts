import { query, queryOne } from '../config/database.js';

/**
 * Reyting jadvalini olish
 */
export async function getRating(limit: number = 50, offset: number = 0) {
  const leaders = await query(
    `SELECT id, first_name, last_name, username, avatar_url,
            rating, rank, total_matches, total_wins, is_premium
     FROM users
     WHERE is_banned = false
     ORDER BY rating DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return leaders;
}

/**
 * Foydalanuvchi reytingdagi o'rnini olish
 */
export async function getUserRank(userId: number) {
  const user = await queryOne<{ rating: number }>(
    'SELECT rating FROM users WHERE id = $1',
    [userId]
  );

  if (!user) throw new Error('Foydalanuvchi topilmadi');

  const position = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM users WHERE rating > $1 AND is_banned = false',
    [user.rating]
  );

  return {
    rating: user.rating,
    position: position ? parseInt(position.count) + 1 : 1,
  };
}

/**
 * Haftalik eng yaxshi o'yinchilar
 */
export async function getWeeklyTop(limit: number = 10) {
  const leaders = await query(
    `SELECT id, first_name, last_name, username, avatar_url,
            rating, rank, total_wins
     FROM users
     WHERE is_banned = false
       AND last_active_at > NOW() - INTERVAL '7 days'
     ORDER BY rating DESC
     LIMIT $1`,
    [limit]
  );
  return leaders;
}

/**
 * Yaratuvchilar reytingi
 */
export async function getCreatorTop(limit: number = 50) {
  const creators = await query(
    `SELECT id, first_name, last_name, username, avatar_url,
            rating, rank, cards_created, total_likes, total_matches, total_wins
     FROM users
     WHERE is_banned = false AND cards_created > 0
     ORDER BY cards_created DESC, total_likes DESC
     LIMIT $1`,
    [limit]
  );
  return creators;
}
