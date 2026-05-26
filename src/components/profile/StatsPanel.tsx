import type { UserStats } from '@/types/user';

interface StatsPanelProps {
  stats: UserStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const items = [
    {
      label: 'O\'yinlar',
      value: stats.totalMatches,
      icon: '🎮',
      color: '#00b4d8',
    },
    {
      label: 'G\'alabalar',
      value: stats.totalWins,
      icon: '🏆',
      color: '#2ed573',
    },
    {
      label: 'G\'alaba %',
      value: `${stats.winRate}%`,
      icon: '📊',
      color: '#ffd700',
    },
    {
      label: 'Streak',
      value: stats.bestWinStreak,
      icon: '🔥',
      color: '#ff4757',
    },
    {
      label: 'Kartalar',
      value: stats.cardsCreated,
      icon: '🎨',
      color: '#9b5de5',
    },
    {
      label: 'Like\'lar',
      value: stats.cardsLiked,
      icon: '❤️',
      color: '#ff006e',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          style={{
            padding: '14px 8px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.04)',
            textAlign: 'center',
            animation: 'fadeUp 0.3s ease forwards',
            animationDelay: `${index * 0.05}s`,
            opacity: 0,
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '6px' }}>{item.icon}</div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 700,
              color: item.color,
              lineHeight: 1.1,
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              marginTop: '4px',
              letterSpacing: '0.3px',
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
