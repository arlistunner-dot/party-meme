import { Button } from '@/components/common';
import AnswerReveal from './AnswerReveal';
import type { GameAnswer } from '@/types/game';

interface JudgePanelProps {
  answers: GameAnswer[];
  selectedCardId: number | null;
  onSelect: (cardId: number, playerId: number) => void;
  onConfirm: () => void;
  isMyTurnToJudge: boolean;
}

export default function JudgePanel({
  answers,
  selectedCardId,
  onSelect,
  onConfirm,
  isMyTurnToJudge,
}: JudgePanelProps) {
  if (!isMyTurnToJudge) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-xl)',
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          color: 'var(--text-muted)',
        }}
      >
        Hakam javoblarni ko'rib chiqmoqda...
        <div
          style={{
            marginTop: 'var(--space-md)',
            fontSize: '30px',
            animation: 'bounce 1s ease-in-out infinite',
          }}
        >
          ⚖️
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
      }}
    >
      {/* Sarlavha */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--neon-yellow)',
        }}
      >
        Eng kulgili javobni tanlang!
      </div>

      {/* Javoblar */}
      <AnswerReveal
        answers={answers}
        judgeId={1}
        onSelectAnswer={onSelect}
        selectedAnswerId={selectedCardId}
      />

      {/* Tasdiqlash tugmasi */}
      <div style={{ padding: '0 var(--space-md)' }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedCardId}
          onClick={onConfirm}
        >
          TANLASH
        </Button>
      </div>
    </div>
  );
}
