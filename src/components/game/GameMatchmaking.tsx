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
        height: '100dvh',
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
        background: 'rgba(0,0,0,0.2)',
        pointerEvents: 'none',
      }} />

      {/* ====== BO'SH YUQORI QISM — LOGO KO'RINADI ====== */}
      <div style={{ flex: 1 }} />

      {/* ====== KONTENT — ENG PASTDA ====== */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%',
        padding: '0 16px 12px 16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Ikonka — juda kichik */}
        <div style={{
          fontSize: '32px', marginBottom: '6px',
          animation: 'pulse 1.5s ease infinite',
          filter: 'drop-shadow(0 0 10px rgba(166,77,255,0.4))',
        }}>
          🎮
        </div>

        {/* Sarlavha — kichik, neon */}
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '13px',
          fontWeight: 700, color: '#fff', marginBottom: '3px',
          textShadow: '0 0 10px rgba(166,77,255,0.5), 0 2px 6px rgba(0,0,0,0.8)',
          letterSpacing: '1.5px',
        }}>
          O'YINCHI QIDIRILMOQDA
        </div>

        {/* Soniya — juda kichik */}
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '9px',
          color: 'rgba(77,163,255,0.8)', marginBottom: '10px',
          textShadow: '0 0 6px rgba(77,163,255,0.3)',
        }}>
          {players.length}/{TOTAL_PLAYERS} o'yinchi topildi{dots}
        </div>

        {/* Progress bar — ingichka */}
        <div style={{
          width: '100%', maxWidth: '240px', height: '4px', borderRadius: '2px',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(166,77,255,0.12)',
          overflow: 'hidden', marginBottom: '10px',
          boxShadow: '0 0 6px rgba(166,77,255,0.08)',
        }}>
          <div style={{
            width: `${progress}%`, height: '100%', borderRadius: '2px',
            background: 'linear-gradient(90deg, #A64DFF, #4DA3FF)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 10px rgba(166,77,255,0.4)',
          }} />
        </div>

        {/* O'yinchilar — kompakt */}
        <div style={{
          width: '100%', maxWidth: '260px',
          display: 'flex', flexDirection: 'column',
          gap: '3px', marginBottom: '12px',
        }}>
          {Array.from({ length: TOTAL_PLAYERS }).map((_, i) => {
            const player = players[i];
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 8px', borderRadius: '6px',
                  background: player ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(8px)',
                  border: player
                    ? '1px solid rgba(166,77,255,0.2)'
                    : '1px solid rgba(255,255,255,0.03)',
                  boxShadow: player
                    ? '0 0 6px rgba(166,77,255,0.08)'
                    : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: player ? 'rgba(166,77,255,0.15)' : 'rgba(0,0,0,0.3)',
                  border: player ? '1px solid rgba(166,77,255,0.2)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px',
                }}>
                  {player ? player.avatar : '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '10px',
                    fontWeight: 600,
                    color: player ? '#fff' : 'rgba(255,255,255,0.15)',
                    textShadow: player ? '0 0 4px rgba(166,77,255,0.15)' : 'none',
                  }}>
                    {player ? player.name : 'Kutilmoqda...'}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '8px',
                  fontWeight: 700,
                  color: player ? '#2ed573' : 'rgba(255,255,255,0.08)',
                  textShadow: player ? '0 0 6px rgba(46,213,115,0.3)' : 'none',
                }}>
                  {player ? '✓' : `${i + 1}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bekor qilish — kichik */}
        <button
          onClick={() => { hapticImpact('medium'); onCancel(); }}
          style={{
            padding: '6px 16px', borderRadius: '6px',
            border: '1px solid rgba(166,77,255,0.15)',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            fontFamily: 'var(--font-body)', fontSize: '10px',
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          }}
        >
          Bekor qilish
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(166,77,255,0.4)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 16px rgba(166,77,255,0.6)); }
        }
      `}</style>
    </div>
  );
}
