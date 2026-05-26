import { api } from './api';
import { API_ENDPOINTS } from '@/config/api';
import type { Card, CreateCardRequest, UserCard } from '@/types/card';

// Backend flat data ni UserCard formatiga o'girish
function toUserCard(raw: Record<string, unknown>): UserCard {
  return {
    id: raw.id as number,
    cardId: (raw.cardId ?? raw.card_id) as number,
    acquiredAt: (raw.acquiredAt ?? raw.acquired_at) as string,
    isFavorite: (raw.isFavorite ?? raw.is_favorite ?? false) as boolean,
    card: {
      id: (raw.cardId ?? raw.card_id ?? raw.id) as number,
      type: (raw.type ?? 'blue') as string,
      text: (raw.text ?? '') as string,
      imageUrl: (raw.imageUrl ?? raw.image_url ?? null) as string | null,
      rarity: (raw.rarity ?? 'common') as string,
      status: 'approved',
      likesCount: (raw.likesCount ?? raw.likes_count ?? 0) as number,
      priceCoins: (raw.priceCoins ?? raw.price_coins ?? 0) as number,
    } as Card,
  };
}

/**
 * Foydalanuvchi kartalari
 */
export async function getMyCards(): Promise<UserCard[]> {
  const data = await api.get<Record<string, unknown>[]>(API_ENDPOINTS.ME_CARDS);
  return data.map(toUserCard);
}

/**
 * Karta yaratish
 */
export async function createCard(data: CreateCardRequest): Promise<Card> {
  return api.post<Card>(API_ENDPOINTS.ME_CARDS, data);
}

/**
 * Kartani o'chirish
 */
export async function deleteCard(cardId: number): Promise<void> {
  return api.delete(`${API_ENDPOINTS.ME_CARDS}/${cardId}`);
}

/**
 * Tanlangan kartalar
 */
export async function getFeaturedCards(): Promise<Card[]> {
  return api.get<Card[]>(API_ENDPOINTS.CARDS_FEATURED);
}

/**
 * To'plamlar
 */
export async function getDecks() {
  return api.get(API_ENDPOINTS.DECKS);
}
