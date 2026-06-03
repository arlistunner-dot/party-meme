import { useState, useEffect } from 'react';
import { hapticSuccess, hapticImpact } from '@/config/telegram';

interface GameMatchmakingProps {
  onReady: () => void;
  onCancel: () => void;
}

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

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (players.length >= TOTAL_PLAYERS) {
      const timer = setTimeout(() => {
        hapticSuccess();
        onReady();
      }, 800);
      return () => clearTimeout(timer);
    }

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
        height: '100dvh',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ====== FON RASMI ====== */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/assets/game-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'rgba(0,0,0,0.6)',
        pointerEvents: 'none',
      }} />

      {/* Kontent */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: '320px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Animatsiya ikonka */}
        <div style={{
          fontSize: '64px', marginBottom: '20px',
          animation: 'pulse 1.5s ease infinite',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
        }}>
          🎮
        </div>

        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '20px',
          fontWeight: 700, color: '#fff', marginBottom: '6px',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        }}>
          O'YINCHI QIDIRILMOQDA
        </div>

        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '14px',
          color: 'rgba(255,255,255,0.7)', marginBottom: '28px',
          textShadow: '0 2px 6px rgba(0,0,0,0.7)',
        }}>
          {players.length}/{TOTAL_PLAYERS} o'yinchi topildi{dots}
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: '8px', borderRadius: '4px',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden', marginBottom: '24px',
        }}>
          <div style={{
            width: `${progress}%`, height: '100%', borderRadius: '4px',
            background: 'linear-gradient(90deg, #ff006e, #ff4757)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 14px rgba(255,0,110,0.5)',
          }} />
        </div>

        {/* O'yinchilar ro'yxati */}
        <div style={{
          width: '100%', display: 'flex', flexDirection: 'column',
          gap: '6px', marginBottom: '30px',
        }}>
          {Array.from({ length: TOTAL_PLAYERS }).map((_, i) => {
            const player = players[i];
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '10px',
                  background: player ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${player ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: player ? 'rgba(255,0,110,0.2)' : 'rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '17px',
                  boxShadow: player ? '0 0 10px rgba(255,0,110,0.15)' : 'none',
                }}>
                  {player ? player.avatar : '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '13px',
                    fontWeight: 600,
                    color: player ? '#fff' : 'rgba(255,255,255,0.25)',
                    textShadow: player ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
                  }}>
                    {player ? player.name : 'Kutilmoqda...'}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '11px',
                  fontWeight: 700,
                  color: player ? '#2ed573' : 'rgba(255,255,255,0.15)',
                  textShadow: player ? '0 0 8px rgba(46,213,115,0.3)' : 'none',
                }}>
                  {player ? '✓' : `${i + 1}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bekor qilish */}
        <button
          onClick={() => { hapticImpact('medium'); onCancel(); }}
          style={{
            padding: '10px 24px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Bekor qilish
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
