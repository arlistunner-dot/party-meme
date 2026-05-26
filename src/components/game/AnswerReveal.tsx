import BlueCard from '@/components/cards/BlueCard';
import type { GameAnswer } from '@/types/game';

interface AnswerRevealProps {
  answers: GameAnswer[];
  judgeId: number | null;
  onSelectAnswer?: (cardId: number, playerId: number) => void;
  selectedAnswerId?: number | null;
}

export default function AnswerReveal({
  answers,
  judgeId,
  onSelectAnswer,
  selectedAnswerId,
}: AnswerRevealProps) {
  // Javoblar soniga qarab grid
  const gridCols = answers.length <= 3 ? answers.length : answers.length <= 6 ? 2 : 2;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {answers.map((answer, index) => (
        <div
          key={`${answer.playerId}-${answer.cardId}`}
          className="answer-revealed"
          style={{
            animationDelay: `${index * 0.15}s`,
            opacity: 0,
          }}
        >
          <BlueCard
            cardId={answer.cardId}
            text={answer.text}
            isRevealed={answer.isRevealed}
            isWinner={answer.isWinner}
            isAd={false}
            isSelected={selectedAnswerId === answer.cardId}
            onSelect={
              judgeId && onSelectAnswer
                ? () => onSelectAnswer(answer.cardId, answer.playerId)
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}
