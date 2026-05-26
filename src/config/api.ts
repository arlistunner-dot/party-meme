// ===== API CONFIG =====
export const API_BASE = 'http://localhost:5000/api/v1';
export const WS_URL = 'http://localhost:5000';

export const API_CONFIG = {
  BASE_URL: API_BASE,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    TELEGRAM: '/auth/telegram',
  },
  USER: {
    ME: '/me',
    STATS: '/me/stats',
    DAILY_BONUS: '/me/daily-bonus',
    ADS_REWARD: '/ads/reward',
      LEADERBOARD: '/rating',
  LEADERBOARD_CREATORS: '/rating/creators',

  },
  ROOMS: {
    BASE: '/rooms',
    JOIN: (code: string) => `/rooms/${code}/join`,
    LEAVE: (code: string) => `/rooms/${code}/leave`,
    READY: (code: string) => `/rooms/${code}/ready`,
  },
  CARDS: {
    BASE: '/cards',
    MY: '/cards',
    ME_CARDS: '/cards',
    CREATE: '/cards',
    LIKE: (id: number) => `/cards/${id}/like`,
    FAVORITE: (id: number) => `/cards/${id}/favorite`,
    CARDS_FEATURED: '/cards',
    FEATURED: '/cards',
  },
  ME_CARDS: '/cards',
  CARDS_FEATURED: '/cards',
  DECKS: '/decks',
  SHOP: {
    BASE: '/shop',
    CARDS: '/shop/cards',
    COINS: '/shop/coins',
    SLOTS: '/shop/slots',
    DECKS: '/shop/decks',
    BUY_CARD: '/shop/buy-card',
    BUY_SLOTS: '/shop/buy-slots',
    BUY_COINS: '/shop/buy-coins',
  },
  RATING: {
    BASE: '/rating',
    LEADERBOARD: '/rating',
    ME: '/rating/me',
    WEEKLY: '/rating/weekly',
    CREATORS: '/rating/creators',
    TIERS: '/rating/tiers',
  },
};


// ===== API REQUEST FUNCTION =====
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  const token = localStorage.getItem('auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Xato' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
