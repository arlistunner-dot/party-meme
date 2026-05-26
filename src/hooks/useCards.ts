import { useCallback, useState } from 'react';
import * as cardService from '@/services/cardService';
import type { Card, CreateCardRequest, UserCard } from '@/types/card';

export function useCards() {
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [featuredCards, setFeaturedCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mening kartalarimni yuklash
  const loadMyCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cards = await cardService.getMyCards();
      setMyCards(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kartalarni yuklashda xato');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // "Tanlangan" kartalarni yuklash
  const loadFeaturedCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const cards = await cardService.getFeaturedCards();
      setFeaturedCards(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tanlangan kartalarni yuklashda xato');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Karta yaratish
  const createCard = useCallback(async (data: CreateCardRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const card = await cardService.createCard(data);
      return card;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Karta yaratishda xato';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kartani o'chirish
  const deleteCard = useCallback(async (cardId: number) => {
    try {
      await cardService.deleteCard(cardId);
      setMyCards((prev) => prev.filter((c) => c.cardId !== cardId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kartani o\'chirishda xato');
    }
  }, []);

  return {
    myCards,
    featuredCards,
    isLoading,
    error,
    loadMyCards,
    loadFeaturedCards,
    createCard,
    deleteCard,
  };
}
