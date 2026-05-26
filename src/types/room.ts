/**
 * Xona (Room) tiplari
 */

export type RoomStatus =
  | 'created'
  | 'waiting'
  | 'starting'
  | 'playing'
  | 'finished'
  | 'closed';

export interface Room {
  id: number;
  roomCode: string;
  hostId: number;
  maxPlayers: number;
  deckIds: number[];
  roundsCount: number;
  isPrivate: boolean;
  isBranded: boolean;
  brandTheme: BrandTheme | null;
  status: RoomStatus;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  expiresAt: string;
  players: RoomPlayer[];
}

export interface RoomPlayer {
  id: number;
  roomId: number;
  userId: number;
  username: string;
  firstName: string;
  avatarUrl: string | null;
  seatNumber: number;
  score: number;
  isHost: boolean;
  isReady: boolean;
  isActive: boolean;
  handCards: HandCard[];
  joinedAt: string;
  leftAt: string | null;
}

/**
 * Brend mavzusi (Branded Room)
 */
export interface BrandTheme {
  brandName: string;
  brandLogoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  bgImageUrl: string | null;
  cardBackUrl: string | null;
  winAnimationUrl: string | null;
  winSound: string | null;
}

/**
 * Xona yaratish so'rovi
 */
export interface CreateRoomRequest {
  maxPlayers?: number;
  deckIds?: number[];
  roundsCount?: number;
  isPrivate?: boolean;
  gameMode?: 'classic' | 'quick' | 'team' | 'thematic';
}

/**
 * Xona qo'shilish so'rovi
 */
export interface JoinRoomRequest {
  roomCode: string;
}

import type { HandCard } from './card';
