import { RANKS } from '@/config/constants';
import type { UserRank } from '@/types/user';
import { getRankProgress } from '@/utils/helpers';

interface RankBadgeProps {
  rank: UserRank;
  rating: number;
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

export default function RankBadge({ rank, rating }: RankBadgeProps) {
  const rankInfo = RANKS.find((r) => r.id === rank);
  const nextRank = RANKS.find(
    (r) => r.id !== 'ambassador' && rating < r.minRating
  );
  const progress = getRankProgress(rating);
  const icon = rankIcons[rank] || '🌱';
  const color = rankColors[rank] || '#5a5a72';

  return (
    <div
      style={{
        padding: '18px 16px',
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${color}11, ${color}08)`,
        border: `1px solid ${color}22`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {/* Ikonka */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${color}25, ${color}12)`,
            border: `1px solid ${color}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          {/* Daraja nomi */}
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 700,
              color: color,
              marginBottom: '2px',
            }}
          >
            {rankInfo?.nameUz || 'Yangi'}
          </div>

          {/* Reyting */}
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            {rating} {nextRank ? `/ ${nextRank.minRating}` : ''} reyting
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: '5px',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Imtiyozlar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
          }}
        >
          ✏️ {rankInfo?.cardCreation || 'Yo\'q'}
        </div>
        {rankInfo?.privileges.map((priv) => (
          <div
            key={priv}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}
          >
            {priv}
          </div>
        ))}
      </div>
    </div>
  );
}
