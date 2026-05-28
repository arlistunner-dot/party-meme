import { useState, useEffect, useCallback } from 'react';
import { hapticSuccess, hapticImpact } from '@/config/telegram';

interface GameMatchmakingProps {
  onReady: () => void;
  onCancel: () => void;
}

// Simulyatsiya — keyin backendga ulanadi
function generateFakePlayer(index: number): { id: string; name: string; avatar: string } {
  const names = [
    'Sardor', 'Dilnoza', 'Javohir', 'Malika', 'Sarvar',
    'Nodira', 'Azizbek', 'Zulayxo', 'Botir', 'Gulsanam',
    'Otabek', 'Rayhona', 'Sherzod', 'Maftuna', 'Davron',
  ];
  const avatars = ['😎', '🤠', '👻', '🦊', '🐼', '🦁', '🐸', '🦄', '🤖', '👽'];
  return {
    id: `player_${index}_${Date.now()}`,
    name: names[Math.floor(Math.random() * names.length)],
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
  };
}

export default function GameMatchmaking({ onReady, onCancel }: GameMatchmakingProps) {
  const [players, setPlayers] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [dots, setDots] = useState('');

  const TOTAL_PLAYERS = 7;

  // Animatsiya nuqtalar
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Simulyatsiya — o'yinchilar qo'shilishi
  useEffect(() => {
    if (players.length >= TOTAL_PLAYERS) {
      // Hamma to'plandi — tayyor
      const timer = setTimeout(() => {
        hapticSuccess();
        onReady();
      }, 800);
      return () => clearTimeout(timer);
    }

    // Tasodifiy vaqtda yangi o'yinchi qo'shiladi
    const delay = 800 + Math.random() * 2000;
    const timer = setTimeout(() => {
      const newPlayer = generateFakePlayer(players.length + 1);
      setPlayers((prev) => [...prev, newPlayer]);
      hapticImpact('light');
    }, delay);

    return () => clearTimeout(timer);
  }, [players.length, onReady]);

  const progress = (players.length / TOTAL_PLAYERS) * 100;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        padding: '20px',
        position: 'relative',
      }}
    >
      {/* Fon dekoratsiya */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,0,110,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Animatsiya ikonka */}
      <div
        style={{
          fontSize: '64px',
          marginBottom: '20px',
          animation: 'pulse 1.5s ease infinite',
        }}
      >
        🎮
      </div>

      {/* Sarlavha */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '6px',
        }}
      >
        O'YINCHI QIDIRILMOQDA
      </div>

      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '28px',
        }}
      >
        {players.length}/{TOTAL_PLAYERS} o'yinchi topildi{dots}
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '300px',
          height: '8px',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #ff006e, #ff4757)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 12px rgba(255,0,110,0.4)',
          }}
        />
      </div>

      {/* O'yinchilar ro'yxati */}
      <div
        style={{
          width: '100%',
          maxWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginBottom: '30px',
        }}
      >
        {Array.from({ length: TOTAL_PLAYERS }).map((_, i) => {
          const player = players[i];
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: player
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(255,255,255,0.015)',
                border: `1px solid ${
                  player ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'
                }`,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: player
                    ? 'rgba(255,0,110,0.1)'
                    : 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                {player ? player.avatar : '?'}
              </div>

              {/* Ism */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: player ? '#fff' : 'rgba(255,255,255,0.15)',
                  }}
                >
                  {player ? player.name : 'Kutilmoqda...'}
                </div>
              </div>

              {/* Holat */}
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: player ? '#2ed573' : 'rgba(255,255,255,0.1)',
                }}
              >
                {player ? '✓' : `${i + 1}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bekor qilish */}
      <button
        onClick={() => {
          hapticImpact('medium');
          onCancel();
        }}
        style={{
          padding: '10px 24px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
        }}
      >
        Bekor qilish
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
