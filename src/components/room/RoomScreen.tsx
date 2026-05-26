import { useState } from 'react';
import Header from '@/components/common/Header';
import { hapticImpact } from '@/config/telegram';

interface RoomScreenProps {
  onNavigate: (tab: string) => void;
}

export default function RoomScreen({ onNavigate }: RoomScreenProps) {
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}
    >
      <Header
        title="XONA"
        showBack
        onBack={() => onNavigate('home')}
      />

      <div
        style={{
          flex: 1,
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {mode === 'menu' && (
          <>
            <button
              onClick={() => {
                hapticImpact('medium');
                setMode('create');
              }}
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255,0,110,0.2)',
                background: 'rgba(255,0,110,0.06)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎮</div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                XONA YARATISH
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                Do'stlaringizni taklif qiling
              </div>
            </button>

            <button
              onClick={() => {
                hapticImpact('medium');
                setMode('join');
              }}
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(46,213,115,0.2)',
                background: 'rgba(46,213,115,0.06)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔗</div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                XONAGA QO'SHILISH
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                Kodni kiriting va o'ynang
              </div>
            </button>
          </>
        )}

        {mode === 'create' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              paddingTop: '40px',
            }}
          >
            <div style={{ fontSize: '48px' }}>🎮</div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              XONA YARATILDI!
            </h2>

            <div
              style={{
                padding: '16px 32px',
                borderRadius: '14px',
                background: 'rgba(255,0,110,0.08)',
                border: '2px dashed rgba(255,0,110,0.25)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  marginBottom: '6px',
                }}
              >
                XONA KODI
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#ff006e',
                  letterSpacing: '8px',
                  textAlign: 'center',
                }}
              >
                AB3K7F
              </div>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              Kodni do'stlaringizga yuboring
            </div>

            <div
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                }}
              >
                O'yinchilar kutilmoqda... 1/4
              </div>
            </div>

            <button
              onClick={() => setMode('menu')}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Bekor qilish
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              paddingTop: '40px',
            }}
          >
            <div style={{ fontSize: '48px' }}>🔗</div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              XONA KODI
            </h2>

            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="KODNI KIRITING"
              maxLength={6}
              style={{
                width: '100%',
                maxWidth: '240px',
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.04)',
                border: '2px solid rgba(46,213,115,0.25)',
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 700,
                color: '#2ed573',
                letterSpacing: '8px',
                boxSizing: 'border-box',
              }}
            />

            <button
              onClick={() => hapticImpact('medium')}
              disabled={joinCode.length < 6}
              style={{
                width: '100%',
                maxWidth: '240px',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background:
                  joinCode.length >= 6
                    ? 'linear-gradient(135deg, #2ed573, #1abc9c)'
                    : 'rgba(255,255,255,0.06)',
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: joinCode.length >= 6 ? '#fff' : 'var(--text-muted)',
                cursor: joinCode.length >= 6 ? 'pointer' : 'not-allowed',
              }}
            >
              QO'SHILISH
            </button>

            <button
              onClick={() => setMode('menu')}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Orqaga
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
