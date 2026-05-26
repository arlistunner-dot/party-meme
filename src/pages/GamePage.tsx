import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameBoard from '@/components/game/GameBoard';
import { useGame } from '@/hooks/useGame';
import { useRoom } from '@/hooks/useRoom';
import { getStartingHand } from '@/utils/cardPool';
import type { HandCard } from '@/types/card';
import type { MatchResult, SpecialCardEvent } from '@/types/game';

export default function GamePage() {
  const navigate = useNavigate();
  const { room } = useRoom();
  const { phase, resetGame } = useGame();

  const [handCards, setHandCards] = useState<HandCard[]>([]);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [specialEvent, setSpecialEvent] = useState<SpecialCardEvent | null>(null);

  // Boshlang'ich kartalarni tarqatish
  useEffect(() => {
    const staticCards = getStartingHand(5);
    const cards: HandCard[] = staticCards.map((c) => ({
      cardId: c.id,
      text: c.text,
      type: c.type as 'red' | 'blue',
      isAd: false,
    }));
    setHandCards(cards);
  }, []);

  // O'yinni qayta boshlash
  const handlePlayAgain = useCallback(() => {
    setMatchResult(null);
    resetGame();
    const staticCards = getStartingHand(5);
    const cards: HandCard[] = staticCards.map((c) => ({
      cardId: c.id,
      text: c.text,
      type: c.type as 'red' | 'blue',
      isAd: false,
    }));
    setHandCards(cards);
  }, [resetGame]);

  // Bosh sahifaga qaytish
  const handleGoHome = useCallback(() => {
    resetGame();
    navigate('/');
  }, [resetGame, navigate]);

  return (
    <GameBoard
      handCards={handCards}
      matchResult={matchResult}
      specialEvent={specialEvent}
      onPlayAgain={handlePlayAgain}
      onGoHome={handleGoHome}
      onSpecialComplete={() => setSpecialEvent(null)}
      judgeName={undefined}
    />
  );
}
