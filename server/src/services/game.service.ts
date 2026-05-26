import { query, queryOne } from '../config/database.js';
import { GAME } from '../config/constants.js';
import { addRating, getUser } from './user.service.js';
import { rewardMatchResult } from './economy.service.js';
import { RATING } from '../config/constants.js';

/**
 * Match boshlash
 */
export async function startMatch(roomId: number) {
  // Match yaratish
  const match = await queryOne(
    `INSERT INTO matches (room_id, total_rounds, total_players)
     SELECT $1, rounds_count,
       (SELECT COUNT(*) FROM room_players WHERE room_id = $1 AND is_active = true)
     FROM rooms WHERE id = $1
     RETURNING *`,
    [roomId]
  );

  // Xona holatini o'zgartirish
  await query(
    `UPDATE rooms SET status = 'playing', started_at = NOW() WHERE id = $1`,
    [roomId]
  );

  return match;
}

/**
 * Kartalarni tarqatish
 */
export async function distributeCards(roomId: number, userId: number) {
  // Standart to'plamdan tasodifiy ko'k kartalar
  const cards = await query(
    `SELECT id, text FROM cards
     WHERE type = 'blue' AND status = 'approved' AND deck_id = 1
     ORDER BY RANDOM()
     LIMIT $1`,
    [GAME.INITIAL_HAND_SIZE]
  );

  // Inventardan 2 ta qo'shish
  const inventoryCards = await query(
    `SELECT c.id, c.text FROM user_cards uc
     JOIN cards c ON c.id = uc.card_id
     WHERE uc.user_id = $1 AND c.type = 'blue' AND c.status = 'approved'
     ORDER BY RANDOM()
     LIMIT $2`,
    [userId, GAME.EXTRA_INVENTORY_CARDS]
  );

  const allCards = [...cards, ...inventoryCards];

  // Qo'lga saqlash
  await query(
    `UPDATE room_players SET hand_cards = $1
     WHERE room_id = $2 AND user_id = $3`,
    [JSON.stringify(allCards), roomId, userId]
  );

  return allCards;
}

/**
 * Javob qabul qilish
 */
export async function submitAnswer(roomId: number, userId: number, cardId: number) {
  // Karta textini olish
  const card = await queryOne<{ text: string }>(
    'SELECT text FROM cards WHERE id = $1',
    [cardId]
  );

  if (!card) throw new Error('Karta topilmadi');

  return { playerId: userId, cardId, text: card.text };
}

/**
 * Hakam tanlovi
 */
export async function judgeSelect(roomId: number, cardId: number, winnerId: number) {
  // G'olibga ball qo'shish
  await query(
    `UPDATE room_players SET score = score + 1
     WHERE room_id = $1 AND user_id = $2`,
    [roomId, winnerId]
  );

  // Karta statistikasini yangilash
  await query(
    'UPDATE cards SET win_count = win_count + 1 WHERE id = $1',
    [cardId]
  );

  // Reyting qo'shish
  await addRating(winnerId, RATING.ROUND_WIN, 'Round g\'alabasi');
}

/**
 * Match tugatish
 */
export async function endMatch(roomId: number) {
  // G'olibni aniqlash
  const winner = await queryOne<{ user_id: number }>(
    `SELECT user_id FROM room_players
     WHERE room_id = $1 AND is_active = true
     ORDER BY score DESC LIMIT 1`,
    [roomId]
  );

  if (!winner) return null;

  // Match natijasini saqlash
  const match = await queryOne<{ id: number }>(
    `UPDATE matches SET winner_id = $1
     WHERE room_id = $2 AND winner_id IS NULL
     RETURNING id`,
    [winner.user_id, roomId]
  );

  // Barcha o'yinchilarga mukofot
  const players = await query<{ user_id: number }>(
    'SELECT user_id FROM room_players WHERE room_id = $1 AND is_active = true',
    [roomId]
  );

  for (const player of players) {
    const isWinner = player.user_id === winner.user_id;

    // Tanga mukofot
    await rewardMatchResult(player.user_id, isWinner, false);

    // Reyting
    await addRating(player.user_id, RATING.MATCH_PLAY, 'Match o\'ynash');
    if (isWinner) {
      await addRating(player.user_id, RATING.MATCH_WIN, 'Match g\'alabasi');
    }

    // Statistika
    await query(
      `UPDATE users SET
        total_matches = total_matches + 1,
        total_wins = total_wins + ${isWinner ? 1 : 0}
       WHERE id = $1`,
      [player.user_id]
    );
  }

  // Xona holatini yangilash
  await query(
    `UPDATE rooms SET status = 'finished', finished_at = NOW() WHERE id = $1`,
    [roomId]
  );

  return { winnerId: winner.user_id, matchId: match?.id };
}
