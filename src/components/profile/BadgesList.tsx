import { BADGES } from '@/config/constants';

interface BadgesListProps {
  unlockedBadgeIds: string[];
}

export default function BadgesList({ unlockedBadgeIds }: BadgesListProps) {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 12px',
        }}
      >
        🏅 Nishonlar
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            marginLeft: '8px',
          }}
        >
          {unlockedBadgeIds.length}/{BADGES.length}
        </span>
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {BADGES.map((badge, index) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);

          return (
            <div
              key={badge.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '14px 8px',
                borderRadius: '12px',
                background: isUnlocked
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(255, 255, 255, 0.015)',
                border: isUnlocked
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(255, 255, 255, 0.03)',
                opacity: isUnlocked ? 1 : 0.35,
                filter: isUnlocked ? 'none' : 'grayscale(0.8)',
                animation: 'fadeUp 0.3s ease forwards',
                animationDelay: `${index * 0.04}s`,
                opacity: 0,
              }}
            >
              <span style={{ fontSize: '24px', lineHeight: 1 }}>{badge.icon}</span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {badge.nameUz}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
