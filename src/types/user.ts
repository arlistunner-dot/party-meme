/**
 * Foydalanuvchi tiplari
 */

export type UserRank =
  | 'newbie'
  | 'funny'
  | 'memelord'
  | 'factory'
  | 'legend'
  | 'ambassador';

export interface User {
  id: number;
  telegramId: number;
  username: string | null;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  rating: number;
  rank: UserRank;
  coinBalance: number;
  starBalance: number;
  maxCardSlots: number;
  totalMatches: number;
  totalWins: number;
  totalLikes: number;
  cardsCreated: number;
  lastRewardWonAt: string | null;
  createdAt: string;
  lastActiveAt: string;
  dailyClaimedAt: string | null;
  isPremium: boolean;
  isBanned: boolean;
  isAmbassador: boolean;
  language: string;
}

export interface UserStats {
  totalMatches: number;
  totalWins: number;
  winRate: number;
  bestWinStreak: number;
  currentWinStreak: number;
  cardsCreated: number;
  cardsLiked: number;
  rating: number;
  rank: UserRank;
  rankProgress: number;   // 0-100%
  nextRankAt: number | null;
}

export interface UserProfile {
  user: User;
  stats: UserStats;
  badges: string[];
  recentCards: Card[];
}

// Card tiplari card.ts da aniqlanadi, shuning uchun import
import type { Card } from './card';
