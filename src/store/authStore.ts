import { create } from 'zustand';
import type { User } from '@/types/user';
import { loginWithTelegram } from '@/services/authService';
import { apiRequest } from '@/config/api';

// snake_case ni camelCase ga o'girish
function toCamelUser(raw: Record<string, unknown>): User {
  return {
    id: raw.id as number,
    telegramId: (raw.telegramId ?? raw.telegram_id) as number,
    firstName: (raw.firstName ?? raw.first_name ?? 'O\'yinchi') as string,
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
    createdAt: (raw.createdAt ?? raw.created_at ?? new Date().toISOString()) as string,
    lastActiveAt: (raw.lastActiveAt ?? raw.last_active_at ?? new Date().toISOString()) as string,
    dailyClaimedAt: (raw.dailyClaimedAt ?? raw.daily_claimed_at ?? null) as string | null,
    isPremium: (raw.isPremium ?? raw.is_premium ?? false) as boolean,
    isBanned: (raw.isBanned ?? raw.is_banned ?? false) as boolean,
    isAmbassador: (raw.isAmbassador ?? raw.is_ambassador ?? false) as boolean,
    language: (raw.language ?? 'uz') as string,
    lastRewardWonAt: (raw.lastRewardWonAt ?? raw.last_reward_won_at ?? null) as string | null,
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  claimDailyBonus: () => Promise<{ earned: number } | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,

  setUser: (user) =>
    set({ user, isAuthenticated: true }),

  setToken: (token) =>
    set({ token }),

  login: async () => {
    set({ isLoading: true });
    try {
      const result = await loginWithTelegram();
      const user = toCamelUser(result.user as Record<string, unknown>);
      set({
        user,
        token: result.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      console.error('[AuthStore] Login xato:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('demo_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  refreshUser: async () => {
    try {
      const raw = (await apiRequest('/me')) as Record<string, unknown>;
      const user = toCamelUser(raw);
      set({ user });
    } catch (err) {
      console.error('[AuthStore] Refresh xato:', err);
    }
  },

  claimDailyBonus: async () => {
    try {
      const result = (await apiRequest('/me/daily-bonus', {
        method: 'POST',
      })) as { coins: number; earned: number };

      const currentUser = get().user;
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            coinBalance: result.coins,
            dailyClaimedAt: new Date().toISOString(),
          },
        });
      }

      return { earned: result.earned };
    } catch (err) {
      console.error('[AuthStore] Bonus xato:', err);
      return null;
    }
  },
}));
