import { RANKS } from '@/config/constants';
import type { UserRank } from '@/types/user';

interface RankTiersProps {
  currentRank?: UserRank;
  currentRating?: number;
}

const rankIcons: Record<string, string> = {
  newbie: '🌱',
  funny: '😄',
  memelord: '🎭',
  factory: '🏭',
  legend: '👑',
  ambassador: '⭐',
};

const rankColors: Record<string, string> = {
  newbie: '#5a5a72',
  funny: '#2ed573',
  memelord: '#00b4d8',
  factory: '#9b5de5',
  legend: '#ffd700',
  ambassador: '#ff006e',
};

export default function RankTiers({
  currentRank = 'newbie',
  currentRating = 0,
}: RankTiersProps) {
  // Yuqoridan pastga tartiblash
  const sorted = [...RANKS].reverse();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {sorted.map((rank, index) => {
        const isCurrent = rank.id === currentRank;
        const color = rankColors[rank.id] || '#5a5a72';
        const icon = rankIcons[rank.id] || '🌱';

        // Progress hisoblash
        let progress = 0;
        if (rank.id === 'ambassador') {
          progress = 0;
        } else if (rank.maxRating === null) {
          progress = currentRating >= rank.minRating ? 100 : 0;
        } else if (currentRating >= rank.minRating && currentRating <= rank.maxRating) {
          progress = Math.round(
            ((currentRating - rank.minRating) / (rank.maxRating - rank.minRating)) * 100
          );
        } else if (currentRating > (rank.maxRating || 0)) {
          progress = 100;
        }

        const isLocked = rank.id === 'ambassador';
        const isPast =
          rank.id !== 'ambassador' &&
          rank.maxRating !== null &&
          currentRating > (rank.maxRating || 0);

        return (
          <div
            key={rank.id}
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: isCurrent
                ? `linear-gradient(135deg, ${color}12, ${color}06)`
                : 'rgba(255,255,255,0.02)',
              border: isCurrent
                ? `1px solid ${color}33`
                : '1px solid rgba(255,255,255,0.03)',
              animation: 'fadeUp 0.3s ease forwards',
              animationDelay: `${index * 0.06}s`,
              opacity: 0,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Glow effekt — joriy daraja uchun */}
            {isCurrent && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: color,
                  boxShadow: `0 0 12px ${color}66`,
                  borderRadius: '4px 0 0 4px',
                }}
              />
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {/* Ikonka */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${color}22, ${color}10)`,
                  border: `1px solid ${color}28`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0,
                  filter: isLocked ? 'grayscale(0.7)' : 'none',
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                {icon}
              </div>

              {/* Ma'lumot */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isCurrent ? color : 'var(--text-primary)',
                    }}
                  >
                    {rank.nameUz}
                    {isCurrent && (
                      <span
                        style={{
                          fontSize: '10px',
                          marginLeft: '6px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: `${color}20`,
                          color: color,
                          fontWeight: 700,
                        }}
                      >
                        SIZ
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {isLocked
                      ? 'Faqat taklif'
                      : `${rank.minRating}${rank.maxRating ? ` - ${rank.maxRating}` : '+'}`}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: '5px',
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: isPast ? '100%' : `${progress}%`,
                      height: '100%',
                      background: isPast
                        ? `${color}55`
                        : `linear-gradient(90deg, ${color}, ${color}aa)`,
                      borderRadius: '3px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>

                {/* Imtiyozlar */}
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    marginTop: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.03)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    ✏️ {rank.cardCreation}
                  </span>
                  {rank.privileges.slice(0, 2).map((priv) => (
                    <span
                      key={priv}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.03)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {priv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
