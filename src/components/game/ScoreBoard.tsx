import Avatar from '@/components/common/Avatar';
import type { PlayerScore } from '@/types/game';

interface ScoreBoardProps {
  scores: PlayerScore[];
  currentUserId?: number;
  compact?: boolean; // Kichik ko'rinish (o'yin paytida)
}

export default function ScoreBoard({
  scores,
  currentUserId,
  compact = false,
}: ScoreBoardProps) {
  // Ball bo'yicha saralash
  const sorted = [...scores].sort((a, b) => b.score - a.score);

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          overflowX: 'auto',
          padding: 'var(--space-sm)',
        }}
      >
        {sorted.map((player, index) => {
          const isMe = player.playerId === currentUserId;
          return (
            <div
              key={player.playerId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                background: isMe
                  ? 'rgba(255, 0, 110, 0.15)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: isMe
                  ? '1px solid rgba(255, 0, 110, 0.3)'
                  : '1px solid transparent',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                #{index + 1}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {player.firstName}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: index === 0 ? 'var(--neon-yellow)' : 'var(--text-secondary)',
                }}
              >
                {player.score}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // To'liq ko'rinish
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
        padding: 'var(--space-md)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: 'var(--space-sm)',
        }}
      >
        BALLAR JADVALI
      </h3>

      {sorted.map((player, index) => {
        const isMe = player.playerId === currentUserId;
        const medals = ['🥇', '🥈', '🥉'];

        return (
          <div
            key={player.playerId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: '10px var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: isMe
                ? 'rgba(255, 0, 110, 0.1)'
                : 'rgba(255, 255, 255, 0.03)',
              border: isMe
                ? '1px solid rgba(255, 0, 110, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.05)',
              animation: 'fadeUp 0.3s ease forwards',
              animationDelay: `${index * 0.05}s`,
              opacity: 0,
            }}
          >
            {/* O'rin */}
            <span style={{ fontSize: '18px', width: '28px', textAlign: 'center' }}>
              {medals[index] || `#${index + 1}`}
            </span>

            {/* Ism */}
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {player.firstName}
              </span>
            </div>

            {/* Ball */}
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 700,
                color: index === 0 ? 'var(--neon-yellow)' : 'var(--text-primary)',
              }}
            >
              {player.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
