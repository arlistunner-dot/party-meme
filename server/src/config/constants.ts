import dotenv from 'dotenv';
dotenv.config();

export const SERVER = {
  PORT: parseInt(process.env.PORT || '5000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const;

export const JWT = {
  SECRET: process.env.JWT_SECRET || 'change_this_in_production',
  EXPIRY: 900, // 15 daqiqa
} as const;

export const TELEGRAM = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME || 'party_meme_bot',
} as const;

export const GAME = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 6,
  DEFAULT_ROUNDS: 5,
  INITIAL_HAND_SIZE: 5,
  EXTRA_INVENTORY_CARDS: 2,
  NEW_CARDS_PER_ROUND: 5,
  ANSWER_TIMER: 30,
  JUDGE_TIMER: 20,
  ROOM_EXPIRE_SECONDS: 3600,
  ROOM_INACTIVE_SECONDS: 300,
} as const;

export const ECONOMY = {
  INITIAL_COINS: 500,
  INITIAL_SLOTS: 5,
  MATCH_WIN_COINS: 100,
  MATCH_PLAY_COINS: 30,
  DAILY_BONUS: 20,
  AD_VIEW_REWARD: 50,
  DAILY_AD_LIMIT: 5,
  DAILY_AD_TOTAL: 250,
  FRIEND_INVITE_COINS: 100,
  CARD_CREATE_COINS: 50,
  MATCH_WIN_DAILY_LIMIT: 10,
  MATCH_PLAY_DAILY_LIMIT: 20,
} as const;

export const RATING = {
  MATCH_PLAY: 10,
  ROUND_WIN: 30,
  MATCH_WIN: 100,
  CARD_LIKE: 5,
  DAILY_LOGIN: 5,
  FRIEND_INVITE: 20,
} as const;

export const MODERATION = {
  AUTO_REJECT_HOURS: 24,
  MAX_TEXT_LENGTH: 200,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
} as const;
