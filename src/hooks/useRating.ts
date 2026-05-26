import { useCallback, useState } from 'react';
import * as ratingService from '@/services/ratingService';
import type { User } from '@/types/user';

export function useRating() {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [creatorBoard, setCreatorBoard] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ratingService.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('[Rating] Reytingni yuklashda xato:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCreatorBoard = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ratingService.getCreatorLeaderboard();
      setCreatorBoard(data);
    } catch (err) {
      console.error('[Rating] Yaratuvchilar reytingini yuklashda xato:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    leaderboard,
    creatorBoard,
    isLoading,
    loadLeaderboard,
    loadCreatorBoard,
  };
}
