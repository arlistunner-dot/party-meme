import { create } from 'zustand';
import type { Room, RoomPlayer, BrandTheme } from '@/types/room';
import type { GameMode } from '@/config/constants';

interface RoomState {
  room: Room | null;
  isInRoom: boolean;
  isLoading: boolean;
  error: string | null;
}

interface RoomActions {
  setRoom: (room: Room) => void;
  clearRoom: () => void;
  updateStatus: (status: Room['status']) => void;
  addPlayer: (player: RoomPlayer) => void;
  removePlayer: (userId: number) => void;
  updatePlayer: (userId: number, updates: Partial<RoomPlayer>) => void;
  setPlayerReady: (userId: number, ready: boolean) => void;
  setBrandTheme: (theme: BrandTheme | null) => void;
  setGameMode: (mode: GameMode) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRoomStore = create<RoomState & RoomActions>((set) => ({
  // Holat
  room: null,
  isInRoom: false,
  isLoading: false,
  error: null,

  // Harakatlar
  setRoom: (room) => set({ room, isInRoom: true, error: null }),

  clearRoom: () => set({ room: null, isInRoom: false, error: null }),

  updateStatus: (status) =>
    set((state) => ({
      room: state.room ? { ...state.room, status } : null,
    })),

  addPlayer: (player) =>
    set((state) => {
      if (!state.room) return state;
      const exists = state.room.players.some((p) => p.userId === player.userId);
      if (exists) return state;
      return {
        room: {
          ...state.room,
          players: [...state.room.players, player],
        },
      };
    }),

  removePlayer: (userId) =>
    set((state) => {
      if (!state.room) return state;
      return {
        room: {
          ...state.room,
          players: state.room.players.filter((p) => p.userId !== userId),
        },
      };
    }),

  updatePlayer: (userId, updates) =>
    set((state) => {
      if (!state.room) return state;
      return {
        room: {
          ...state.room,
          players: state.room.players.map((p) =>
            p.userId === userId ? { ...p, ...updates } : p
          ),
        },
      };
    }),

  setPlayerReady: (userId, ready) =>
    set((state) => {
      if (!state.room) return state;
      return {
        room: {
          ...state.room,
          players: state.room.players.map((p) =>
            p.userId === userId ? { ...p, isReady: ready } : p
          ),
        },
      };
    }),

  setBrandTheme: (theme) =>
    set((state) => ({
      room: state.room
        ? {
            ...state.room,
            brandTheme: theme,
            isBranded: theme !== null,
          }
        : null,
    })),

  setGameMode: () => {
    // Xona yaratishda o'rnatiladi
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
