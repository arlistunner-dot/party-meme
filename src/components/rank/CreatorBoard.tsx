import type { User } from '@/types/user';
import { getRankByRating } from '@/utils/helpers';

interface CreatorBoardProps {
  users: User[];
  currentUserId?: number;
}

const rankColors: Record<string, string> = {
  newbie: '#5a5a72',
  funny: '#2ed573',
  memelord: '#00b4d8',
  factory: '#9b5de5',
  legend: '#ffd700',
  ambassador: '#ff006e',
};

export default function CreatorBoard({ users, currentUserId }: CreatorBoardProps) {
  if (users.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>🎨</div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            marginBottom: '6px',
          }}
        >
          Hali yaratuvchilar yo'q
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          Birinchi karta yarating va TOP ga kiring!
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {users.map((user, index) => {
        const place = index + 1;
        const isMe = user.telegramId === currentUserId;
        const rank = getRankByRating(user.rating);
        const color = rankColors[rank] || '#5a5a72';
        const medals = ['🥇', '🥈', '🥉'];

        return (
          <div
            key={user.telegramId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '14px',
              background: isMe
                ? 'rgba(155, 93, 229, 0.08)'
                : 'rgba(255, 255, 255, 0.02)',
              border: isMe
                ? '1px solid rgba(155, 93, 229, 0.15)'
                : '1px solid rgba(255, 255, 255, 0.03)',
              animation: 'fadeUp 0.3s ease forwards',
              animationDelay: `${index * 0.05}s`,
              opacity: 0,
            }}
          >
            {/* O'rin */}
            <span
              style={{
                width: '24px',
                textAlign: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                fontSize: place <= 3 ? '18px' : '13px',
                fontWeight: 700,
                color: place <= 3 ? 'inherit' : 'var(--text-muted)',
              }}
            >
              {medals[place - 1] || `#${place}`}
            </span>

            {/* Avatar */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}33, ${color}15)`,
                border: `2px solid ${color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
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
                  color: isMe ? '#9b5de5' : 'var(--text-primary)',
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
                      color: '#9b5de5',
                      marginLeft: '6px',
                      fontWeight: 700,
                    }}
                  >
                    (Siz)
                  </span>
                )}
              </div>
            </div>

            {/* Statistika */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: 'flex-end',
                }}
              >
                <span style={{ fontSize: '12px' }}>🎨</span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#9b5de5',
                  }}
                >
                  {user.cardsCreated}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  justifyContent: 'flex-end',
                  marginTop: '2px',
                }}
              >
                <span style={{ fontSize: '10px' }}>❤️</span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {user.totalLikes}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
