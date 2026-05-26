/**
 * PARTY MEME – Barcha o'yin sozlamalari va konstantalari
 * Manba: Texnik Vazifa hujjati
 */

// ============================================
// O'YIN SOZLAMALARI
// ============================================

export const GAME = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 6,
  DEFAULT_ROUNDS: 5,
  MAX_ROUNDS: 7,
  INITIAL_HAND_SIZE: 5,
  EXTRA_INVENTORY_CARDS: 2,
  NEW_CARDS_PER_ROUND: 5,
} as const;

export const TIMER = {
  ANSWER: 30,        // Javob tanlash – soniya
  JUDGE: 20,         // Hakam tanlash – soniya
  DEMOCRATIC: 15,    // Demokratik ovoz – soniya
  CARD_DISTRIBUTE: 5, // Karta tarqatish – soniya
  ROUND_TOTAL: 60,   // Umumiy 1 round ~ soniya
  MATCH_DURATION: 7,  // Bitta match ~ daqiqa
  ROOM_EXPIRE: 3600,  // Xona yashash muddati – soniya (1 soat)
  ROOM_INACTIVE: 300, // Inaktivdan keyin o'chirish – soniya (5 daqiqa)
} as const;

// ============================================
// REYTING MANBALARI
// ============================================

export const RATING = {
  MATCH_PLAY: 10,
  ROUND_WIN: 30,
  MATCH_WIN: 100,
  CARD_LIKE: 5,        // Har 1 layk
  DAILY_LOGIN: 5,
  FRIEND_INVITE: 20,
  WEEKLY_TOP_1: 250,
  WEEKLY_TOP_2: 150,
  WEEKLY_TOP_3: 100,
  FEATURED_CARD: 500,
} as const;

// ============================================
// DARAJALAR (RANKS)
// ============================================

export interface RankTier {
  id: string;
  name: string;
  nameUz: string;
  minRating: number;
  maxRating: number | null;
  cardCreation: string;
  privileges: string[];
}

export const RANKS: RankTier[] = [
  {
    id: 'newbie',
    name: 'YANGI O\'YINCHI',
    nameUz: 'Yangi O\'yinchi',
    minRating: 0,
    maxRating: 499,
    cardCreation: 'YO\'Q',
    privileges: ['Faqat o\'ynash'],
  },
  {
    id: 'funny',
    name: 'KULGICH',
    nameUz: 'Kulgich',
    minRating: 500,
    maxRating: 999,
    cardCreation: '1 ta / oy',
    privileges: ['Oddiy nishon'],
  },
  {
    id: 'memelord',
    name: 'MEMELOG',
    nameUz: 'Memelord',
    minRating: 1000,
    maxRating: 1999,
    cardCreation: '1 ta / hafta',
    privileges: ['2 ta nishon', 'Profil ramkasi'],
  },
  {
    id: 'factory',
    name: 'KULGI ZAVODI',
    nameUz: 'Kulgi Zavodi',
    minRating: 2000,
    maxRating: 4999,
    cardCreation: '3 ta / hafta',
    privileges: ['Eksklyuziv nishon', 'Avtomoderatsiya'],
  },
  {
    id: 'legend',
    name: 'LEGENDA',
    nameUz: 'Legenda',
    minRating: 5000,
    maxRating: null,
    cardCreation: '5 ta / hafta',
    privileges: ['Barcha huquqlar', 'Beta-test'],
  },
  {
    id: 'ambassador',
    name: 'AMBASSADOR',
    nameUz: 'Ambassador',
    minRating: -1,
    maxRating: null,
    cardCreation: 'Cheksiz',
    privileges: ['Faqat maxsus taklif bilan'],
  },
] as const;

// ============================================
// KULGI TANGASI (KOIN) MANBALARI
// ============================================

export const COIN_EARN = {
  MATCH_WIN: 100,
  MATCH_WIN_DAILY_LIMIT: 10,
  MATCH_PLAY: 30,
  MATCH_PLAY_DAILY_LIMIT: 20,
  AD_VIEW: 50,
  AD_VIEW_DAILY_LIMIT: 5,
  DAILY_BONUS: 20,
  FRIEND_INVITE: 100,
  CARD_CREATE_APPROVED: 50,
  WEEKLY_TOP: [500, 400, 300, 250, 200, 150, 120, 110, 105, 100], // 1-10 o'rin
} as const;

// ============================================
// BOSHLANG'ICH AKKAUNT
// ============================================

export const INITIAL_ACCOUNT = {
  RATING: 0,
  COINS: 500,
  STARS: 0,
  CARD_SLOTS: 5,
  STARTING_CARDS: 3,     // 3 ta Standart Ko'k karta
  CAN_CREATE_CARDS: false, // Reyting 500+ talab qilinadi
  DAILY_AD_LIMIT: 5,
  DAILY_AD_REWARD: 250,  // 5 ta reklama = 250 tanga
} as const;

// ============================================
// TANGA NARXLARI (STARS BILAN)
// ============================================

export interface CoinPackage {
  id: string;
  coins: number;
  starsPrice: number;
  bonus: number;        // Foizda
  badge?: string;       // Sovg'a nishon
  frame?: string;       // Sovg'a ramka
}

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'pack_500',
    coins: 500,
    starsPrice: 50,
    bonus: 0,
  },
  {
    id: 'pack_1200',
    coins: 1200,
    starsPrice: 100,
    bonus: 10,
  },
  {
    id: 'pack_3000',
    coins: 3000,
    starsPrice: 250,
    bonus: 15,
  },
  {
    id: 'pack_7000',
    coins: 7000,
    starsPrice: 500,
    bonus: 25,
    badge: 'VIP',
  },
  {
    id: 'pack_15000',
    coins: 15000,
    starsPrice: 1000,
    bonus: 40,
    frame: 'Eksklyuziv ramka',
  },
] as const;

// ============================================
// SLOT NARXLARI
// ============================================

export interface SlotTier {
  minSlot: number;
  maxSlot: number;
  pricePerSlot: number;
}

export const SLOT_PRICES: SlotTier[] = [
  { minSlot: 6, maxSlot: 10, pricePerSlot: 300 },
  { minSlot: 11, maxSlot: 20, pricePerSlot: 500 },
  { minSlot: 21, maxSlot: 30, pricePerSlot: 1000 },
] as const;

// ============================================
// KARTA TO'PLAMLARI (DECKS)
// ============================================

export interface DeckInfo {
  id: string;
  name: string;
  nameUz: string;
  type: 'free' | 'coin' | 'star';
  price: number;
  description: string;
}

export const DECKS: DeckInfo[] = [
  {
    id: 'standard',
    name: 'STANDART',
    nameUz: 'Standart',
    type: 'free',
    price: 0,
    description: '500+ qizil va 2000+ ko\'k karta.',
  },
  {
    id: 'national',
    name: 'MILLIY',
    nameUz: 'Milliy',
    type: 'free',
    price: 0,
    description: 'Milliy hazil-mutoyibalar.',
  },
  {
    id: 'adult',
    name: '18+',
    nameUz: '18+',
    type: 'star',
    price: 0,
    description: 'Kattalar uchun content.',
  },
  {
    id: 'tech',
    name: 'TEXNALOGIYA',
    nameUz: 'Texnologiya',
    type: 'coin',
    price: 200,
    description: 'IT, kripto mavzular.',
  },
  {
    id: 'sport',
    name: 'SPORT',
    nameUz: 'Sport',
    type: 'coin',
    price: 200,
    description: 'Futbol, boks, e-sport.',
  },
  {
    id: 'exclusive',
    name: 'EKSKLYUZIV',
    nameUz: 'Eksklyuziv',
    type: 'star',
    price: 300,
    description: 'Cheklangan sonli kartalar.',
  },
  {
    id: 'featured',
    name: 'TANLANGAN',
    nameUz: 'Tanlangan',
    type: 'free',
    price: 0,
    description: 'Har oy eng yaxshi 50 foydalanuvchi kartasi.',
  },
  {
    id: 'ad',
    name: 'REKLAMA',
    nameUz: 'Reklama',
    type: 'free',
    price: 0,
    description: 'Faqat platform tomonidan yaratiladi.',
  },
] as const;

// ============================================
// NISHONLAR (BADGES)
// ============================================

export interface BadgeInfo {
  id: string;
  name: string;
  nameUz: string;
  description: string;
  icon: string;
}

export const BADGES: BadgeInfo[] = [
  {
    id: 'winner',
    name: 'G\'olip',
    nameUz: 'G\'olip',
    description: 'Birinchi match g\'alabasi',
    icon: '🏆',
  },
  {
    id: 'streak',
    name: 'Streak',
    nameUz: 'Streak',
    description: '3 ta ketma-ket match g\'alabasi',
    icon: '🔥',
  },
  {
    id: 'creator',
    name: 'Yaratuvchi',
    nameUz: 'Yaratuvchi',
    description: '10 ta karta yaratish',
    icon: '🎨',
  },
  {
    id: 'trending',
    name: 'Trenddagi',
    nameUz: 'Trenddagi',
    description: 'Bitta karta 100+ like',
    icon: '📈',
  },
  {
    id: 'vip',
    name: 'VIP',
    nameUz: 'VIP',
    description: 'Bir marta Stars xarid qilgani uchun',
    icon: '💎',
  },
  {
    id: 'champion',
    name: 'Chempion',
    nameUz: 'Chempion',
    description: 'Haftalik TOP-10',
    icon: '🥇',
  },
  {
    id: 'featured',
    name: 'Tanlangan',
    nameUz: 'Tanlangan',
    description: '"Tanlangan" ga kiritilgan karta',
    icon: '⭐',
  },
  {
    id: 'ambassador',
    name: 'AMBASSADOR',
    nameUz: 'Ambassador',
    description: 'Platform tomonidan maxsus tanlangan',
    icon: '👑',
  },
  {
    id: 'social',
    name: 'Jamoatchi',
    nameUz: 'Jamoatchi',
    description: '50 ta do\'st taklif qilgan',
    icon: '🤝',
  },
] as const;

// ============================================
// RASM YUKLASH
// ============================================

export const IMAGE_UPLOAD = {
  FORMATS: ['jpg', 'jpeg', 'png', 'gif'],
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  TARGET_WIDTH: 1080,
  TARGET_HEIGHT: 1080,
  COMPRESSED_MAX_KB: 300,
  WEBP_QUALITY: 85,
} as const;

// ============================================
// "TANLANGAN" – OYLIK KARTA TANLOVI
// ============================================

export const FEATURED_CONTEST = {
  SUBMISSION_START: 1,    // Oy kuni
  SUBMISSION_END: 7,
  VOTING_START: 8,
  VOTING_END: 14,
  MODERATION_START: 15,
  MODERATION_END: 20,
  ANNOUNCEMENT_START: 21,
  ANNOUNCEMENT_END: 25,
  REWARD_START: 26,
  REWARD_END: 30,
  FEATURED_COUNT: 50,     // Tanlangan kartalar soni
  SHORTLIST_COUNT: 100,   // Admin tanlaydigan son
} as const;

export const FEATURED_REWARDS = {
  FIRST_PLACE: {
    rating: 1000,
    coins: 5000,
    badge: 'Oy Afsonasi',
    premium: '1 oy Telegram Premium',
  },
  SECOND_THIRD: {
    rating: 500,
    coins: 2000,
    badge: 'Silver Creator',
  },
  FOURTH_TENTH: {
    rating: 200,
    coins: 1000,
    badge: 'Bronze Creator',
  },
  ELEVENTH_FIFTIETH: {
    rating: 100,
    coins: 500,
  },
} as const;

// ============================================
// REKLAMA KARTALARI
// ============================================

export const AD_CARD = {
  RED_CARD_FREQUENCY: 10,       // Har 10 ta Qizil kartadan 1 tasi
  GOLDEN_JOKER_PER_MATCH: 1,    // Har matchda 0-1 ta
  GOLDEN_JOKER_MULTIPLIER: 2,   // G'olib bo'lsa 2x tanga
} as const;

export const AD_PRICING = {
  CARD_BACK: { price: 200, impressions: 50000 },
  SPONSORED_RED: { price: 500, impressions: 100000, duration: '1 hafta' },
  GOLDEN_CARD: { price: 800, interactions: 50000, duration: '1 hafta', count: 1000 },
  BRANDED_ROOM: { price: 1500, sessions: 30000 },
} as const;

// ============================================
// OYLIK MUKOFOTLAR (STARS CHIQIM)
// ============================================

export const MONTHLY_REWARDS = {
  WEEKLY_TOP_1: 50,
  WEEKLY_TOP_2: 35,
  WEEKLY_TOP_3: 20,
  BEST_CREATOR: { premium: '1 oy', count: 1 },
  BEST_CARD: { stars: 100, count: 1 },
  RANDOM_WINNER: {
    premium: 'Telegram Premium (3 oy)',
    stars: 500,
    badge: 'Oylik Afsona',
    cooldown: 90, // kun – takrorlanmaslik
    minMatches: 20,
    minCards: 30,
    minLikesPerCard: 5,
  },
} as const;

export const ECONOMY_BALANCE = {
  MAX_REWARD_OUT_PERCENT: 10,    // Chiqim kirimning 10% dan oshmasligi kerak
  REVENUE_SPLIT: {
    ADS: 55,
    COIN_SALES: 25,
    COSMETICS: 20,
  },
} as const;

// ============================================
// AUTOMATIK TOZALASH
// ============================================

export const AUTO_CLEANUP = {
  INACTIVE_DAYS: 60,        // Kun
  MIN_LIKES_THRESHOLD: 5,
  SAFE_LIKES_THRESHOLD: 10, // 10+ like = hech qachon o'chmaydi
  ARCHIVE_DAYS: 90,         // O'chirishdan oldin arxiv
  CRON_SCHEDULE: '0 0 1 * *', // Har oy 1-kuni
} as const;

// ============================================
// XAVFSIZLIK
// ============================================

export const SECURITY = {
  JWT_EXPIRY: 900,           // 15 daqiqa (soniyada)
  RATE_LIMIT: 100,           // req/min
  MAX_REPORTS_TO_BAN: 3,     // Nechta report dan ban
  MODERATION_HOURS: 24,      // Moderatsiya vaqti (soat)
} as const;

// ============================================
// RASMLAR YO'LLARI
// ============================================

export const ASSETS = {
  LOGO: '/assets/logo.svg',
  RED_CARD_BG: '/assets/cards/red-bg.svg',
  BLUE_CARD_BG: '/assets/cards/blue-bg.svg',
  AD_CARD_BG: '/assets/cards/ad-bg.svg',
  GOLDEN_CARD_BG: '/assets/cards/golden-bg.svg',
  CONFETTI: '/assets/animations/confetti.json',
  TROPHY: '/assets/animations/trophy.json',
  DEFAULT_AVATAR: '/assets/default-avatar.svg',
} as const;

// ============================================
// O'YIN REJIMLARI
// ============================================

export type GameMode = 'classic' | 'quick' | 'team' | 'thematic';

export interface GameModeConfig {
  id: GameMode;
  name: string;
  nameUz: string;
  rounds: number;
  timerSeconds: number;
  description: string;
}

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'classic',
    name: 'KLASSIK',
    nameUz: 'Klassik',
    rounds: 5,
    timerSeconds: 30,
    description: 'Standart 5-7 round. Navbatma-navbat hakam.',
  },
  {
    id: 'quick',
    name: 'TEZKOR',
    nameUz: 'Tezkor',
    rounds: 3,
    timerSeconds: 15,
    description: '3 round. Vaqti 15 soniya.',
  },
  {
    id: 'team',
    name: 'KOMANDAVIY',
    nameUz: 'Komandaviy',
    rounds: 5,
    timerSeconds: 30,
    description: '4x4 yoki 3x3. Guruh ichida 1 ta umumiy javob tanlash.',
  },
  {
    id: 'thematic',
    name: 'MAVZULI',
    nameUz: 'Mavzuli',
    rounds: 5,
    timerSeconds: 30,
    description: 'Faqat ma\'lum kategoriyadagi kartalar.',
  },
] as const;
