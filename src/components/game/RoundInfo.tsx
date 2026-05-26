import Timer from '@/components/common/Timer';
import type { GamePhase } from '@/types/game';

interface RoundInfoProps {
  currentRound: number;
  totalRounds: number;
  phase: GamePhase;
  timerSeconds: number;
  timerRunning: boolean;
  judgeName?: string;
  isMyTurnToJudge: boolean;
  onTimeUp: () => void;
}

function getPhaseText(phase: GamePhase, isJudge: boolean): string {
  switch (phase) {
    case 'answering':
      return isJudge ? 'Javoblar kutilmoqda...' : 'Javobni tanlang!';
    case 'revealing':
      return 'Javoblar ochildi!';
    case 'judging':
      return isJudge ? 'Eng yaxshi javobni tanlang!' : 'Hakam tanlamoqda...';
    case 'democratic':
      return 'Ovoz bering!';
    case 'round_result':
      return 'Round natijasi';
    case 'match_end':
      return 'O\'yun tugadi!';
    default:
      return 'Kutilmoqda...';
  }
}

export default function RoundInfo({
  currentRound,
  totalRounds,
  phase,
  timerSeconds,
  timerRunning,
  judgeName,
  isMyTurnToJudge,
  onTimeUp,
}: RoundInfoProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-md)',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Round ma'lumoti */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          ROUND {currentRound}/{totalRounds}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: isMyTurnToJudge ? 'var(--neon-yellow)' : 'var(--text-muted)',
          }}
        >
          {getPhaseText(phase, isMyTurnToJudge)}
        </div>
      </div>

      {/* Hakam */}
      {judgeName && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ fontSize: '14px' }}>⚖️</span>
          <span>{judgeName}</span>
        </div>
      )}

      {/* Taymer */}
      <Timer
        seconds={timerSeconds}
        isRunning={timerRunning}
        onTimeUp={onTimeUp}
        warningAt={10}
        size="md"
      />
    </div>
  );
}
