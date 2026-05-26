/**
 * Karta tiplari
 */

export type CardType = 'red' | 'blue' | 'ad';

export type CardStatus = 'pending' | 'approved' | 'rejected' | 'featured';

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Card {
  id: number;
  type: CardType;
  text: string;
  deckId: number | null;
  authorId: number | null;
  status: CardStatus;
  isAd: boolean;
  adBrand: string | null;
  moderatedAt: string | null;
  moderatedBy: number | null;
  usesCount: number;
  winCount: number;
  likesCount: number;
  dislikesCount: number;
  rarity: CardRarity;
  isLimited: boolean;
  maxCopies: number | null;
  createdAt: string;
}

/**
 * Foydalanuvchi inventaridagi karta
 */
export interface UserCard {
  id: number;
  userId: number;
  cardId: number;
  card: Card;
  acquiredAt: string;
  isFavorite: boolean;
}

/**
 * Qo'ldagi karta (o'yin paytida)
 */
export interface HandCard {
  cardId: number;
  text: string;
  type: CardType;
  isAd: boolean;
  adBrand?: string;
}

/**
 * Karta yaratish so'rovi
 */
export interface CreateCardRequest {
  type: 'red' | 'blue';
  text: string;
  deckId?: number;
  imageBase64?: string;
  imageFormat?: 'jpg' | 'jpeg' | 'png' | 'gif';
}

/**
 * Javob (o'yin paytida yuboriladi)
 */
export interface GameAnswer {
  playerId: number;
  cardId: number;
  text: string;
  isRevealed: boolean;
  isWinner: boolean;
}
