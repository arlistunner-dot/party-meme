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
        justifyContent: 'flex-end',
        height: '100dvh',
        padding: '20px',
        paddingBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ====== FON RASMI — OQARTRILGAN ====== */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/assets/game-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'rgba(0,0,0,0.25)',
        pointerEvents: 'none',
      }} />

      {/* Kontent — pastga joylashtirilgan */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: '280px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Animatsiya ikonka — kichikroq */}
        <div style={{
          fontSize: '48px', marginBottom: '12px',
          animation: 'pulse 1.5s ease infinite',
          filter: 'drop-shadow(0 0 12px rgba(166,77,255,0.4))',
        }}>
          🎮
        </div>

        {/* Sarlavha — neon bilan */}
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '16px',
          fontWeight: 700, color: '#fff', marginBottom: '4px',
          textShadow: '0 0 10px rgba(166,77,255,0.6), 0 0 20px rgba(77,163,255,0.3), 0 2px 8px rgba(0,0,0,0.8)',
          letterSpacing: '2px',
        }}>
          O'YINCHI QIDIRILMOQDA
        </div>

        {/* Soniya — kichikroq, neon */}
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '11px',
          color: 'rgba(77,163,255,0.8)', marginBottom: '20px',
          textShadow: '0 0 8px rgba(77,163,255,0.4)',
        }}>
          {players.length}/{TOTAL_PLAYERS} o'yinchi topildi{dots}
        </div>

        {/* Progress bar — neon */}
        <div style={{
          width: '100%', height: '6px', borderRadius: '3px',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(166,77,255,0.15)',
          overflow: 'hidden', marginBottom: '18px',
          boxShadow: '0 0 10px rgba(166,77,255,0.1)',
        }}>
          <div style={{
            width: `${progress}%`, height: '100%', borderRadius: '3px',
            background: 'linear-gradient(90deg, #A64DFF, #4DA3FF)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 12px rgba(166,77,255,0.5)',
          }} />
        </div>

        {/* O'yinchilar — kichikroq, neon border */}
        <div style={{
          width: '100%', display: 'flex', flexDirection: 'column',
          gap: '4px', marginBottom: '22px',
        }}>
          {Array.from({ length: TOTAL_PLAYERS }).map((_, i) => {
            const player = players[i];
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 10px', borderRadius: '8px',
                  background: player ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(10px)',
                  border: player
                    ? '1px solid rgba(166,77,255,0.2)'
                    : '1px solid rgba(255,255,255,0.04)',
                  boxShadow: player
                    ? '0 0 8px rgba(166,77,255,0.1), inset 0 0 8px rgba(166,77,255,0.03)'
                    : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: player ? 'rgba(166,77,255,0.15)' : 'rgba(0,0,0,0.3)',
                  border: player ? '1px solid rgba(166,77,255,0.25)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                  boxShadow: player ? '0 0 8px rgba(166,77,255,0.15)' : 'none',
                }}>
                  {player ? player.avatar : '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '11px',
                    fontWeight: 600,
                    color: player ? '#fff' : 'rgba(255,255,255,0.2)',
                    textShadow: player ? '0 0 6px rgba(166,77,255,0.2)' : 'none',
                  }}>
                    {player ? player.name : 'Kutilmoqda...'}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '9px',
                  fontWeight: 700,
                  color: player ? '#2ed573' : 'rgba(255,255,255,0.1)',
                  textShadow: player ? '0 0 8px rgba(46,213,115,0.4)' : 'none',
                }}>
                  {player ? '✓' : `${i + 1}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bekor qilish — kichik, neon border */}
        <button
          onClick={() => { hapticImpact('medium'); onCancel(); }}
          style={{
            padding: '8px 20px', borderRadius: '8px',
            border: '1px solid rgba(166,77,255,0.2)',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            fontFamily: 'var(--font-body)', fontSize: '11px',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 0 8px rgba(166,77,255,0.08)',
          }}
        >
          Bekor qilish
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(166,77,255,0.4)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 20px rgba(166,77,255,0.6)); }
        }
      `}</style>
    </div>
  );
}
