import { api } from './api';
import type { User } from '@/types/user';

// Backend snake_case ni camelCase ga o'girish
function toUser(raw: Record<string, unknown>): User {
  return {
    id: raw.id as number,
    telegramId: (raw.telegramId ?? raw.telegram_id) as number,
    firstName: (raw.firstName ?? raw.first_name ?? '') as string,
    lastName: (raw.lastName ?? raw.last_name ?? null) as string | null,
    username: (raw.username ?? null) as string | null,
    avatarUrl: (raw.avatarUrl ?? raw.avatar_url ?? null) as string | null,
    rating: (raw.rating ?? 0) as number,
    rank: (raw.rank ?? 'newbie') as User['rank'],
    coinBalance: (raw.coinBalance ?? raw.coin_balance ?? 0) as number,
    starBalance: (raw.starBalance ?? raw.star_balance ?? 0) as number,
    maxCardSlots: (raw.maxCardSlots ?? raw.max_card_slots ?? 5) as number,
    totalMatches: (raw.totalMatches ?? raw.total_matches ?? 0) as number,
    totalWins: (raw.totalWins ?? raw.total_wins ?? 0) as number,
    totalLikes: (raw.totalLikes ?? raw.total_likes ?? 0) as number,
    cardsCreated: (raw.cardsCreated ?? raw.cards_created ?? 0) as number,
    createdAt: (raw.createdAt ?? raw.created_at ?? '') as string,
    lastActiveAt: (raw.lastActiveAt ?? raw.last_active_at ?? '') as string,
    dailyClaimedAt: (raw.dailyClaimedAt ?? raw.daily_claimed_at ?? null) as string | null,
    isPremium: (raw.isPremium ?? raw.is_premium ?? false) as boolean,
    isBanned: (raw.isBanned ?? raw.is_banned ?? false) as boolean,
    isAmbassador: (raw.isAmbassador ?? raw.is_ambassador ?? false) as boolean,
    language: (raw.language ?? 'uz') as string,
    lastRewardWonAt: (raw.lastRewardWonAt ?? raw.last_reward_won_at ?? null) as string | null,
  };
}

/**
 * Umumiy reyting
 */
export async function getLeaderboard(): Promise<User[]> {
  const data = await api.get<Record<string, unknown>[]>('/rating');
  return data.map(toUser);
}

/**
 * Yaratuvchilar reytingi
 */
export async function getCreatorLeaderboard(): Promise<User[]> {
  const data = await api.get<Record<string, unknown>[]>('/rating/creators');
  return data.map(toUser);
}
