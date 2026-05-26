import { useCallback } from 'react';
import { useRoomStore } from '@/store/roomStore';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import * as roomService from '@/services/roomService';
import type { CreateRoomRequest } from '@/types/room';

export function useRoom() {
  const store = useRoomStore();
  const { emit, on, off } = useSocket();
  const { user } = useAuth();

  // Xona yaratish
  const createRoom = useCallback(
    async (data: CreateRoomRequest) => {
      try {
        store.setLoading(true);
        store.setError(null);
        const room = await roomService.createRoom(data);
        store.setRoom(room);
        return room;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Xona yaratishda xato';
        store.setError(message);
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  // Xonaga qo'shilish (API + Socket)
  const joinRoom = useCallback(
    async (roomCode: string) => {
      try {
        store.setLoading(true);
        store.setError(null);

        // API orqali qo'shilish
        const room = await roomService.joinRoom({ roomCode });
        store.setRoom(room);

        // Socket orqali xabardor qilish
        if (user) {
          emit('room:join', { roomCode, userId: user.telegramId });
        }

        return room;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Xonaga qo\'shilishda xato';
        store.setError(message);
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store, emit, user]
  );

  // Xonadan chiqish
  const leaveRoom = useCallback(async () => {
    const room = store.room;
    if (!room) return;

    try {
      await roomService.leaveRoom(room.roomCode);
      emit('room:leave', { roomCode: room.roomCode });
      store.clearRoom();
    } catch (err) {
      console.error('[Room] Chiqishda xato:', err);
    }
  }, [store, emit]);

  // Tayyor
  const setReady = useCallback(
    (ready: boolean) => {
      const room = store.room;
      if (!room || !user) return;

      store.setPlayerReady(user.telegramId, ready);
      emit('room:ready', { roomCode: room.roomCode, ready });
    },
    [store, emit, user]
  );

  // Socket hodisalarini tinglash
  const listenRoomEvents = useCallback(() => {
    on('room:updated', (data) => {
      if (data.players) {
        // O'yinchilar ro'yxatini yangilash
        data.players.forEach((p: { userId: number; isReady: boolean; score: number }) => {
          store.updatePlayer(p.userId, p);
        });
      }
      if (data.status) {
        store.updateStatus(data.status);
      }
    });

    on('player:disconnected', (data: { userId: number }) => {
      store.removePlayer(data.userId);
    });
  }, [on, store]);

  const stopListening = useCallback(() => {
    off('room:updated', () => {});
    off('player:disconnected', () => {});
  }, [off]);

  return {
    room: store.room,
    isInRoom: store.isInRoom,
    isLoading: store.isLoading,
    error: store.error,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    listenRoomEvents,
    stopListening,
  };
}
