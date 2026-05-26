import type { User } from '@/types/user';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: unknown;
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
        colorScheme?: string;
      };
    };
  }
}

function getTelegramInitData(): string | null {
  return window.Telegram?.WebApp?.initData || null;
}

export async function loginWithTelegram() {
  const initData = getTelegramInitData();

  // Telegram ichida bo'lmasa — demo rejim
  if (!initData || initData.length === 0) {
    console.log('[Auth] Telegram initData topilmadi — demo rejim');

    // Backenddan demo token olish
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initdata: 'demo' }),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('auth_token', result.token);
        return result;
      }
    } catch (err) {
      console.error('[Auth] Backend demo xato:', err);
    }

    // Backend ishlamasa — localStorage dan o'qish
    return { token: 'demo_token', user: getDemoUser() };
  }

  // Telegram ichida — haqiqiy login
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initdata: initData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    localStorage.setItem('auth_token', result.token);
    return result;
  } catch (err) {
    console.error('[Auth] Backend xato:', err);
    return { token: 'demo_token', user: getDemoUser() };
  }
}

function getDemoUser() {
  const saved = localStorage.getItem('demo_user');
  if (saved) {
    try {
      return JSON.parse(saved) as User;
    } catch {
      localStorage.removeItem('demo_user');
    }
  }

  return {
    id: 1,
    telegramId: 123456,
    firstName: 'O\'yinchi',
    lastName: null as string | null,
    username: 'player1',
    avatarUrl: null as string | null,
    rating: 750,
    rank: 'funny' as const,
    coinBalance: 2350,
    starBalance: 15,
    maxCardSlots: 5,
    totalMatches: 45,
    totalWins: 28,
    totalLikes: 156,
    cardsCreated: 8,
    createdAt: '2026-03-15',
    lastActiveAt: new Date().toISOString(),
    dailyClaimedAt: null,
    isPremium: false,
    isBanned: false,
    isAmbassador: false,
    language: 'uz',
    lastRewardWonAt: null,
  };
}
