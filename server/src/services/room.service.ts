import crypto from 'crypto';
import { query, queryOne } from '../config/database.js';
import { GAME } from '../config/constants.js';

/**
 * Xona kodi generatsiya
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Xona yaratish
 */
export async function createRoom(hostId: number, options: {
  maxPlayers?: number;
  roundsCount?: number;
  isPrivate?: boolean;
  gameMode?: string;
} = {}) {
  const roomCode = generateRoomCode();

  const room = await queryOne(
    `INSERT INTO rooms (room_code, host_id, max_players, rounds_count, is_private, game_mode)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      roomCode,
      hostId,
      options.maxPlayers || GAME.MAX_PLAYERS,
      options.roundsCount || GAME.DEFAULT_ROUNDS,
      options.isPrivate || false,
      options.gameMode || 'classic',
    ]
  );

  // Host ni birinchi o'yinchi sifatida qo'shish
  await query(
    `INSERT INTO room_players (room_id, user_id, seat_number, is_host, is_ready)
     VALUES ($1, $2, 1, true, true)`,
    [room!.id, hostId]
  );

  return getRoom(roomCode);
}

/**
 * Xona ma'lumotlari
 */
export async function getRoom(roomCode: string) {
  const room = await queryOne('SELECT * FROM rooms WHERE room_code = $1', [roomCode]);
  if (!room) return null;

  const players = await query(
    `SELECT rp.*, u.username, u.first_name, u.avatar_url, u.rating, u.rank
     FROM room_players rp
     JOIN users u ON u.id = rp.user_id
     WHERE rp.room_id = $1 AND rp.is_active = true
     ORDER BY rp.seat_number`,
    [room.id]
  );

  return { ...room, players };
}

/**
 * Xonaga qo'shilish
 */
export async function joinRoom(roomCode: string, userId: number) {
  const room = await queryOne<{ id: number; max_players: number; status: string }>(
    'SELECT id, max_players, status FROM rooms WHERE room_code = $1',
    [roomCode]
  );

  if (!room) throw new Error('Xona topilmadi');
  if (room.status !== 'waiting') throw new Error('O\'yun allaqachon boshlangan');

  // O'yinchi sonini tekshirish
  const playerCount = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM room_players WHERE room_id = $1 AND is_active = true',
    [room.id]
  );

  if (parseInt(playerCount!.count) >= room.max_players) {
    throw new Error('Xona to\'la');
  }

  // Allaqachon qo'shilganmi?
  const exists = await queryOne(
    'SELECT id FROM room_players WHERE room_id = $1 AND user_id = $2',
    [room.id, userId]
  );

  if (exists) throw new Error('Allaqachon xonadasiz');

  const seatNumber = parseInt(playerCount!.count) + 1;

  await query(
    `INSERT INTO room_players (room_id, user_id, seat_number)
     VALUES ($1, $2, $3)`,
    [room.id, userId, seatNumber]
  );

  return getRoom(roomCode);
}

/**
 * Xonadan chiqish
 */
export async function leaveRoom(roomCode: string, userId: number) {
  const room = await queryOne<{ id: number }>(
    'SELECT id FROM rooms WHERE room_code = $1',
    [roomCode]
  );

  if (!room) return;

  await query(
    `UPDATE room_players SET is_active = false, left_at = NOW()
     WHERE room_id = $1 AND user_id = $2`,
    [room.id, userId]
  );

  // Agar host chiqsa — boshqaga berish
  const host = await queryOne(
    'SELECT user_id FROM room_players WHERE room_id = $1 AND is_host = true AND is_active = true',
    [room.id]
  );

  if (!host) {
    const nextPlayer = await queryOne(
      `UPDATE room_players SET is_host = true
       WHERE room_id = $1 AND is_active = true
       AND id = (SELECT id FROM room_players WHERE room_id = $1 AND is_active = true ORDER BY seat_number LIMIT 1)
       RETURNING user_id`,
      [room.id]
    );

    if (nextPlayer) {
      await query('UPDATE rooms SET host_id = $1 WHERE id = $2', [nextPlayer.user_id, room.id]);
    }
  }
}

/**
 * Tayyor holat
 */
export async function setPlayerReady(roomCode: string, userId: number, ready: boolean) {
  const room = await queryOne<{ id: number }>(
    'SELECT id FROM rooms WHERE room_code = $1',
    [roomCode]
  );

  if (!room) throw new Error('Xona topilmadi');

  await query(
    'UPDATE room_players SET is_ready = $1 WHERE room_id = $2 AND user_id = $3',
    [ready, room.id, userId]
  );

  return getRoom(roomCode);
}
