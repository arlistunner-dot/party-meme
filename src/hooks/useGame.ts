import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import { hapticSuccess, hapticError, hapticImpact } from '@/config/telegram';
import type { GameAnswer, RedCard, PlayerScore } from '@/types/game';

export function useGame() {
  const store = useGameStore();
  const { emit, on, off } = useSocket();
  const { user } = useAuth();

  // Javob yuborish
  const submitAnswer = useCallback(
    (cardId: number) => {
      emit('game:answer', { cardId });
      hapticImpact('medium');
    },
    [emit]
  );

  // Hakam tanlovi
  const judgeSelect = useCallback(
    (selectedCardId: number) => {
      emit('game:judge', { selectedCardId });
      hapticSuccess();
    },
    [emit]
  );

  // Socket hodisalarini tinglash
  useEffect(() => {
    // Round boshlash
    const handleRoundStart = (data: {
      round: number;
      redCard: RedCard;
      judgeId: number;
      isAdCard: boolean;
    }) => {
      store.startRound(data.redCard, data.judgeId, data.isAdCard);
      hapticImpact('heavy');
    };

    // Javoblar ochilishi
    const handleAnswersRevealed = (data: { answers: GameAnswer[] }) => {
      data.answers.forEach((a) => store.addAnswer(a));
      store.revealAnswers();
    };

    // Round natijasi
    const handleRoundResult = (data: {
      winnerId: number;
      cardId: number;
      scores: PlayerScore[];
      isAdWinner: boolean;
    }) => {
      store.setWinner(data.cardId, data.winnerId);
      store.updateScores(data.scores);
      store.endRound();

      if (data.winnerId === user?.telegramId) {
        hapticSuccess();
      }
    };

    // Match tugadi
    const handleMatchEnd = (data: {
      finalScores: PlayerScore[];
      winnerId: number;
    }) => {
      store.endMatch();
      store.updateScores(data.finalScores);

      if (data.winnerId === user?.telegramId) {
        hapticSuccess();
      } else {
        hapticImpact('light');
      }
    };

    // Taymer
    const handleTimer = (data: { secondsLeft: number; phase: string }) => {
      store.setTimer({
        secondsLeft: data.secondsLeft,
        phase: data.phase as never,
        isRunning: data.secondsLeft > 0,
      });

      if (data.secondsLeft <= 5 && data.secondsLeft > 0) {
        hapticImpact('light');
      }
    };

    on('game:round_start', handleRoundStart);
    on('game:answers_revealed', handleAnswersRevealed);
    on('game:round_result', handleRoundResult);
    on('game:match_end', handleMatchEnd);
    on('game:timer', handleTimer);

    return () => {
      off('game:round_start', handleRoundStart);
      off('game:answers_revealed', handleAnswersRevealed);
      off('game:round_result', handleRoundResult);
      off('game:match_end', handleMatchEnd);
      off('game:timer', handleTimer);
    };
  }, [on, off, store, user]);

  return {
    phase: store.phase,
    currentRound: store.currentRound,
    totalRounds: store.totalRounds,
    redCard: store.currentRedCard,
    judgeId: store.currentJudgeId,
    answers: store.answers,
    scores: store.scores,
    timer: store.timer,
    isAdRound: store.isAdRound,
    isMyTurnToJudge: store.currentJudgeId === user?.telegramId,
    submitAnswer,
    judgeSelect,
    resetGame: store.resetGame,
  };
}
