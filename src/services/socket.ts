import { io, Socket } from 'socket.io-client';
import { API_CONFIG, WS_EVENTS } from '@/config/api';
import { getTelegramInitData } from '@/config/telegram';

let socket: Socket | null = null;

/**
 * Socket.io ulanishini yaratadi
 */
export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  socket = io(API_CONFIG.WS_URL, {
    auth: {
      token: getTelegramInitData(),
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Ulandi:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Uzildi:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Ulanish xatosi:', error.message);
  });

  return socket;
}

/**
 * Socket instanceni oladi
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Ulanishni uzadi
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Xonaga qo'shilish
 */
export function joinRoom(roomCode: string, userId: number): void {
  socket?.emit(WS_EVENTS.ROOM_JOIN, { roomCode, userId });
}

/**
 * Xonadan chiqish
 */
export function leaveRoom(roomCode: string): void {
  socket?.emit(WS_EVENTS.ROOM_LEAVE, { roomCode });
}

/**
 * Tayyor ekanligini bildirish
 */
export function setReady(roomCode: string, ready: boolean): void {
  socket?.emit(WS_EVENTS.ROOM_READY, { roomCode, ready });
}

/**
 * Javob yuborish
 */
export function sendAnswer(cardId: number): void {
  socket?.emit(WS_EVENTS.GAME_ANSWER, { cardId });
}

/**
 * Hakam tanlovi
 */
export function sendJudgeChoice(selectedCardId: number): void {
  socket?.emit(WS_EVENTS.GAME_JUDGE, { selectedCardId });
}

/**
 * Chat xabari
 */
export function sendChatMessage(message: string): void {
  socket?.emit(WS_EVENTS.GAME_CHAT, { message });
}

export { WS_EVENTS };
