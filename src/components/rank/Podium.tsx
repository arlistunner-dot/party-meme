import type { User } from '@/types/user';
import { getRankByRating } from '@/utils/helpers';

interface PodiumProps {
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

export default function Podium({ users, currentUserId }: PodiumProps) {
  if (users.length < 3) return null;

  // 1-o'rin o'rtada, 2-chapda, 3-o'ngda
  const podium = [
    { user: users[1], place: 2, medal: '🥈', height: 90, color: '#c0c0c0' },
    { user: users[0], place: 1, medal: '🥇', height: 120, color: '#ffd700' },
    { user: users[2], place: 3, medal: '🥉', height: 70, color: '#cd7f32' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '6px',
        padding: '20px 10px 0',
        marginBottom: '16px',
      }}
    >
      {podium.map(({ user, place, medal, height, color }) => {
        const rank = getRankByRating(user.rating);
        const rankColor = rankColors[rank] || '#5a5a72';
        const isMe = user.telegramId === currentUserId;

        return (
          <div
            key={place}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: place === 1 ? 1.2 : 1,
              animation: 'fadeUp 0.4s ease forwards',
              animationDelay: `${place === 2 ? 0 : place === 1 ? 0.15 : 0.3}s`,
              opacity: 0,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                position: 'relative',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: place === 1 ? '56px' : '46px',
                  height: place === 1 ? '56px' : '46px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${rankColor}44, ${rankColor}22)`,
                  border: `3px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: place === 1 ? '22px' : '18px',
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: `0 0 20px ${color}33`,
                }}
              >
                {user.firstName.charAt(0).toUpperCase()}
              </div>

              {/* Medal */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: place === 1 ? '20px' : '16px',
                  filter: `drop-shadow(0 0 6px ${color}88)`,
                }}
              >
                {medal}
              </div>
            </div>

            {/* Ism */}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: place === 1 ? '13px' : '11px',
                fontWeight: 700,
                color: isMe ? '#ff006e' : '#fff',
                textAlign: 'center',
                marginBottom: '2px',
                maxWidth: '70px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textShadow: isMe ? '0 0 10px rgba(255,0,110,0.5)' : 'none',
              }}
            >
              {user.firstName}
              {isMe && (
                <span style={{ fontSize: '9px', marginLeft: '2px' }}>(Siz)</span>
              )}
            </div>

            {/* Reyting */}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: place === 1 ? '15px' : '12px',
                fontWeight: 700,
                color: color,
                marginBottom: '10px',
              }}
            >
              {user.rating}
            </div>

            {/* Podyum ustuni */}
            <div
              style={{
                width: place === 1 ? '80px' : '64px',
                height: `${height}px`,
                borderRadius: '10px 10px 0 0',
                background: `linear-gradient(180deg, ${color}33, ${color}11)`,
                border: `1px solid ${color}22`,
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '10px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: place === 1 ? '24px' : '18px',
                  fontWeight: 700,
                  color: `${color}88`,
                }}
              >
                {place}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
