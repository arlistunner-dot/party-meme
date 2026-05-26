import { useEffect, useCallback } from 'react';
import RoundInfo from './RoundInfo';
import AnswerReveal from './AnswerReveal';
import JudgePanel from './JudgePanel';
import ScoreBoard from './ScoreBoard';
import WinnerScreen from './WinnerScreen';
import SpecialCards from './SpecialCards';
import CardStack from '@/components/cards/CardStack';
import CardHand from '@/components/cards/CardHand';
import { Button } from '@/components/common';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import type { HandCard } from '@/types/card';
import type { MatchResult, SpecialCardEvent } from '@/types/game';
import { TIMER } from '@/config/constants';

interface GameBoardProps {
  handCards: HandCard[];
  matchResult: MatchResult | null;
  specialEvent: SpecialCardEvent | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onSpecialComplete: () => void;
  judgeName?: string;
}

export default function GameBoard({
  handCards,
  matchResult,
  specialEvent,
  onPlayAgain,
  onGoHome,
  onSpecialComplete,
  judgeName,
}: GameBoardProps) {
  const { user } = useAuth();
  const {
    phase,
    currentRound,
    totalRounds,
    redCard,
    judgeId,
    answers,
    scores,
    timer,
    isAdRound,
    isMyTurnToJudge,
    submitAnswer,
    judgeSelect,
  } = useGame();

  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  // Karta tanlash
  const handleCardSelect = useCallback((cardId: number) => {
    setSelectedCardId(cardId);
  }, []);

  // Javob yuborish
  const handleSubmit = useCallback(() => {
    if (selectedCardId !== null) {
      submitAnswer(selectedCardId);
      setSelectedCardId(null);
    }
  }, [selectedCardId, submitAnswer]);

  // Hakam tanlash
  const handleJudgeSelect = useCallback((cardId: number, playerId: number) => {
    judgeSelect(cardId);
    // playerId ham kerak bo'ladi
  }, [judgeSelect]);

  // Match tugaganda natija
  if (matchResult) {
    return (
      <WinnerScreen
        result={matchResult}
        currentUserId={user?.telegramId}
        onPlayAgain={onPlayAgain}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <div
      className="app-bg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Maxsus karta hodisasi */}
      <SpecialCards event={specialEvent} onComplete={onSpecialComplete} />

      {/* Yuqori panel – Round info */}
      <div style={{ padding: 'var(--space-md)' }}>
        <RoundInfo
          currentRound={currentRound}
          totalRounds={totalRounds}
          phase={phase}
          timerSeconds={timer.secondsLeft}
          timerRunning={timer.isRunning}
          judgeName={judgeName}
          isMyTurnToJudge={isMyTurnToJudge}
          onTimeUp={() => {
            // Vaqt tugadi
          }}
        />
      </div>

      {/* Compact scoreboard */}
      {scores.length > 0 && (
        <ScoreBoard scores={scores} currentUserId={user?.telegramId} compact />
      )}

      {/* Asosiy o'yin maydoni */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Qizil karta (savol) */}
        {redCard && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 'var(--space-md)',
            }}
          >
            <CardStack
              text={redCard.text}
              isAd={redCard.isAd}
              adBrand={redCard.adBrand}
              roundNumber={currentRound}
              totalRounds={totalRounds}
            />
          </div>
        )}

        {/* Javoblar ochilishi */}
        {phase === 'revealing' && (
          <AnswerReveal answers={answers} judgeId={judgeId} />
        )}

        {/* Hakam paneli */}
        {phase === 'judging' && (
          <JudgePanel
            answers={answers}
            selectedCardId={null}
            onSelect={handleJudgeSelect}
            onConfirm={() => {}}
            isMyTurnToJudge={isMyTurnToJudge}
          />
        )}
      </div>

      {/* Pastki panel – Qo'ldagi kartalar */}
      {phase === 'answering' && !isMyTurnToJudge && (
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <CardHand
            cards={handCards}
            selectedCardId={selectedCardId}
            onSelect={handleCardSelect}
          />

          {/* Yuborish tugmasi */}
          <div style={{ padding: '0 var(--space-md) var(--space-lg)' }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={selectedCardId === null}
              onClick={handleSubmit}
            >
              YUBORISH
            </Button>
          </div>
        </div>
      )}

      {/* Natija ekranida full scoreboard */}
      {phase === 'round_result' && (
        <div style={{ padding: 'var(--space-md)' }}>
          <ScoreBoard scores={scores} currentUserId={user?.telegramId} />
        </div>
      )}
    </div>
  );
}
