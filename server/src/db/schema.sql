-- ============================================
-- PARTY MEME — Database Schema
-- ============================================

-- Foydalanuvchilar
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(32),
  first_name VARCHAR(64) NOT NULL,
  last_name VARCHAR(64),
  avatar_url TEXT,
  bio VARCHAR(200) DEFAULT '',
  rating INTEGER DEFAULT 0,
  rank VARCHAR(32) DEFAULT 'newbie',
  coin_balance INTEGER DEFAULT 500,
  star_balance INTEGER DEFAULT 0,
  max_card_slots INTEGER DEFAULT 5,
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  cards_created INTEGER DEFAULT 0,
  last_reward_won_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  daily_claimed_at TIMESTAMP,
  is_premium BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  is_ambassador BOOLEAN DEFAULT FALSE,
  language VARCHAR(5) DEFAULT 'uz'
);

-- Kartalar
CREATE TABLE IF NOT EXISTS cards (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('red', 'blue', 'ad')),
  text TEXT,
  image_url TEXT,
  deck_id BIGINT,
  author_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  is_ad BOOLEAN DEFAULT FALSE,
  ad_brand VARCHAR(100),
  moderated_at TIMESTAMP,
  moderated_by BIGINT,
  uses_count INTEGER DEFAULT 0,
  win_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  rarity VARCHAR(20) DEFAULT 'common',
  is_limited BOOLEAN DEFAULT FALSE,
  max_copies INTEGER,
  price_coins INTEGER DEFAULT 0,
  price_stars INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- To'plamlar
CREATE TABLE IF NOT EXISTS decks (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_uz VARCHAR(50) NOT NULL,
  type VARCHAR(10) DEFAULT 'free' CHECK (type IN ('free', 'coin', 'star')),
  price INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Foydalanuvchi kartalari (inventar)
CREATE TABLE IF NOT EXISTS user_cards (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, card_id)
);

-- Xonalar
CREATE TABLE IF NOT EXISTS rooms (
  id BIGSERIAL PRIMARY KEY,
  room_code VARCHAR(8) UNIQUE NOT NULL,
  host_id BIGINT NOT NULL REFERENCES users(id),
  max_players INTEGER DEFAULT 6,
  rounds_count INTEGER DEFAULT 5,
  is_private BOOLEAN DEFAULT FALSE,
  is_branded BOOLEAN DEFAULT FALSE,
  brand_theme JSONB,
  status VARCHAR(20) DEFAULT 'waiting',
  game_mode VARCHAR(20) DEFAULT 'classic',
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Xona o'yinchilari
CREATE TABLE IF NOT EXISTS room_players (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seat_number INTEGER,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  hand_cards JSONB DEFAULT '[]',
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  UNIQUE(room_id, user_id)
);

-- Matchlar
CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT NOT NULL REFERENCES rooms(id),
  winner_id BIGINT REFERENCES users(id),
  total_rounds INTEGER,
  total_players INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  played_at TIMESTAMP DEFAULT NOW()
);

-- Tranzaksiyalar
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('earn', 'spend', 'purchase', 'reward', 'refund')),
  currency VARCHAR(10) NOT NULL
    CHECK (currency IN ('coin', 'star')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reklama kampaniyalari
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id BIGSERIAL PRIMARY KEY,
  brand_name VARCHAR(100) NOT NULL,
  brand_logo_url TEXT,
  campaign_type VARCHAR(20)
    CHECK (campaign_type IN ('card_back', 'red_card', 'golden', 'room')),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  budget_usd DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Nishonlar
CREATE TABLE IF NOT EXISTS user_badges (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Do'stlar / Takflinomalar
CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_id BIGINT NOT NULL REFERENCES users(id),
  referred_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Indekslar
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_rating ON users(rating DESC);
CREATE INDEX idx_cards_type ON cards(type);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_author ON cards(author_id);
CREATE INDEX idx_room_players_room ON room_players(room_id);
CREATE INDEX idx_room_players_user ON room_players(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_user_cards_user ON user_cards(user_id);
CREATE INDEX idx_matches_room ON matches(room_id);
