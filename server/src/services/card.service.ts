import { query, queryOne } from '../config/database.js';

/**
 * Foydalanuvchi kartalarini olish (inventar)
 */
export async function getUserCards(userId: number) {
  const cards = await query(
    `SELECT uc.id, uc.card_id, uc.acquired_at, uc.is_favorite,
            c.type, c.text, c.image_url, c.rarity, c.price_coins
     FROM user_cards uc
     JOIN cards c ON c.id = uc.card_id
     WHERE uc.user_id = $1
     ORDER BY uc.acquired_at DESC`,
    [userId]
  );
  return cards;
}

/**
 * Karta yaratish
 */
export async function createCard(
  userId: number,
  data: { type: 'red' | 'blue'; text: string; imageUrl?: string }
) {
  if (!data.text || data.text.trim().length === 0) {
    throw new Error('Karta matni bo\'sh bo\'lmasligi kerak');
  }

  const card = await queryOne(
    `INSERT INTO cards (type, text, image_url, author_id, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [data.type, data.text.trim(), data.imageUrl || null, userId]
  );

  // Kartalar sonini oshirish
  await query(
    'UPDATE users SET cards_created = cards_created + 1 WHERE id = $1',
    [userId]
  );

  return card;
}

/**
 * Kartani sevimlilarga qo'shish/o'chirish
 */
export async function toggleFavorite(userId: number, cardId: number) {
  const existing = await queryOne(
    'SELECT id, is_favorite FROM user_cards WHERE user_id = $1 AND card_id = $2',
    [userId, cardId]
  );

  if (!existing) {
    throw new Error('Karta inventarda topilmadi');
  }

  await query(
    'UPDATE user_cards SET is_favorite = NOT is_favorite WHERE user_id = $1 AND card_id = $2',
    [userId, cardId]
  );

  return { success: true };
}
