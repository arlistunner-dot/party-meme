import type { User } from '@/types/user';
import { getRankByRating } from '@/utils/helpers';

interface LeaderboardProps {
  users: User[];
  currentUserId?: number;
  startFrom?: number;
}

const rankColors: Record<string, string> = {
  newbie: '#5a5a72',
  funny: '#2ed573',
  memelord: '#00b4d8',
  factory: '#9b5de5',
  legend: '#ffd700',
  ambassador: '#ff006e',
};

export default function Leaderboard({
  users,
  currentUserId,
  startFrom = 4,
}: LeaderboardProps) {
  // Faqat 4-o'rindan boshlab
  const list = users.slice(startFrom - 1);

  if (list.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '24px',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-muted)',
        }}
      >
        Hali boshqa o'yinchilar yo'q
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {list.map((user, index) => {
        const place = startFrom + index;
        const isMe = user.telegramId === currentUserId;
        const rank = getRankByRating(user.rating);
        const color = rankColors[rank] || '#5a5a72';

        return (
          <div
            key={user.telegramId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: isMe
                ? 'rgba(255, 0, 110, 0.08)'
                : 'rgba(255, 255, 255, 0.02)',
              border: isMe
                ? '1px solid rgba(255, 0, 110, 0.15)'
                : '1px solid rgba(255, 255, 255, 0.03)',
              animation: 'fadeUp 0.3s ease forwards',
              animationDelay: `${index * 0.04}s`,
              opacity: 0,
            }}
          >
            {/* O'rin raqami */}
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                width: '24px',
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              {place}
            </span>

            {/* Avatar */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}33, ${color}15)`,
                border: `2px solid ${color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {user.firstName.charAt(0).toUpperCase()}
            </div>

            {/* Ism */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isMe ? '#ff006e' : 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.firstName}
                {isMe && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#ff006e',
                      marginLeft: '6px',
                      fontWeight: 700,
                    }}
                  >
                    (Siz)
                  </span>
                )}
              </div>
            </div>

            {/* Reyting */}
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              {user.rating}
            </span>
          </div>
        );
      })}
    </div>
  );
}
