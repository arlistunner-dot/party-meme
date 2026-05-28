import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import { hapticImpact, hapticSuccess, hapticSelection } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';

interface RoomScreenProps {
  onNavigate: (tab: string) => void;
  initialMode?: 'create' | 'join';
  onStartGame?: () => void;
}

// Random kod generatsiya
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Simulyatsiya — o'yinchilar
const FAKE_PLAYERS = [
  { id: 'p1', name: 'Sardor', avatar: '😎', online: true },
  { id: 'p2', name: 'Dilnoza', avatar: '🤠', online: true },
  { id: 'p3', name: 'Javohir', avatar: '👻', online: true },
  { id: 'p4', name: 'Malika', avatar: '🦊', online: true },
  { id: 'p5', name: 'Sarvar', avatar: '🐼', online: false },
  { id: 'p6', name: 'Nodira', avatar: '🦁', online: true },
  { id: 'p7', name: 'Azizbek', avatar: '🐸', online: false },
];

export default function RoomScreen({ onNavigate, initialMode = 'create', onStartGame }: RoomScreenProps) {
  const { toast } = useToast();

  // CREATE mode
  const [roomCode] = useState(generateRoomCode);
  const [players, setPlayers] = useState<any[]>([
    { id: 'me', name: 'Siz', avatar: '🤖', isHost: true },
  ]);
  const [maxPlayers, setMaxPlayers] = useState(7);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // JOIN mode
  const [joinCode, setJoinCode] = useState('');

  // Simulyatsiya — o'yinchilar qo'shilishi (faqat create mode)
  useEffect(() => {
    if (initialMode !== 'create') return;
    if (players.length >= maxPlayers) return;

    const timer = setTimeout(() => {
      const available = FAKE_PLAYERS.filter(
        (p) => !players.find((pl) => pl.id === p.id)
      );
      if (available.length > 0) {
        const randomPlayer = available[Math.floor(Math.random() * available.length)];
        setPlayers((prev) => [...prev, randomPlayer]);
        hapticImpact('light');
      }
    }, 2000 + Math.random() * 3000);

    return () => clearTimeout(timer);
  }, [players.length, maxPlayers, initialMode]);

  // Min o'yinchi
  const MIN_PLAYERS = 4;
  const canStart = players.length >= MIN_PLAYERS;

  // Do'stlarni taklif qilish
  const handleInvite = () => {
    const tg = window.Telegram?.WebApp;
    const inviteText = `🎮 PARTY MEME - O'yinga qo'shiling!\n\n🔑 Xona kodi: ${roomCode}\n\nO'yinchi: ${players.length}/${maxPlayers}\n\nO'ynash uchun botga kiring!`;

    if (tg && typeof tg.switchInlineQuery === 'function') {
      try {
        tg.switchInlineQuery(inviteText);
      } catch {
        // Fallback
        copyCode();
      }
    } else {
      copyCode();
    }
  };

  // Kodni nusxalash
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      hapticSuccess();
      toast('Kod nusxalandi!', 'success');
    }).catch(() => {
      toast(`Xona kodi: ${roomCode}`, 'success');
    });
  };

  // ============ JOIN MODE ============
  if (initialMode === 'join') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          background: 'var(--bg-primary)',
        }}
      >
        <Header title="XONAGA QO'SHILISH" showBack onBack={() => onNavigate('home')} />

        <div
          style={{
            flex: 1,
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div style={{ fontSize: '48px' }}>🔗</div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#fff',
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
              fontSize: '28px',
              fontWeight: 700,
              color: '#2ed573',
              letterSpacing: '8px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          <button
            onClick={() => {
              if (joinCode.length >= 6) {
                hapticSuccess();
                toast('Xonaga qo\'shilish — tez orada', 'success');
              }
            }}
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
              color: joinCode.length >= 6 ? '#fff' : 'rgba(255,255,255,0.3)',
              cursor: joinCode.length >= 6 ? 'pointer' : 'not-allowed',
            }}
          >
            QO'SHILISH
          </button>

          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
            }}
          >
            Do'stingiz bergan 6 belgili kodni kiriting
          </div>
        </div>
      </div>
    );
  }

  // ============ CREATE MODE ============
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            hapticImpact('light');
            onNavigate('home');
          }}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#fff',
          }}
        >
          ←
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#fff',
            margin: 0,
          }}
        >
          XONA
        </h1>
        <button
          onClick={() => {
            hapticSelection();
            setShowSettings(!showSettings);
          }}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: showSettings
              ? 'rgba(255,0,110,0.15)'
              : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ⚙️
        </button>
      </div>

      {/* KONTENT */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* SOZLAMALAR */}
        {showSettings && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: 'fadeUp 0.2s ease forwards',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '12px',
              }}
            >
              ⚙️ XONA SOZLAMALARI
            </div>

            {/* O'yinchi soni */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '8px',
                }}
              >
                Maksimal o'yinchi soni
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      hapticSelection();
                      setMaxPlayers(num);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border:
                        maxPlayers === num
                          ? '1px solid rgba(255,0,110,0.5)'
                          : '1px solid rgba(255,255,255,0.06)',
                      background:
                        maxPlayers === num
                          ? 'rgba(255,0,110,0.12)'
                          : 'rgba(255,255,255,0.03)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: maxPlayers === num ? '#ff006e' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* XONA KODI */}
        <div
          style={{
            padding: '20px',
            borderRadius: '16px',
            background:
              'linear-gradient(135deg, rgba(255,0,110,0.08), rgba(155,93,229,0.05))',
            border: '2px dashed rgba(255,0,110,0.25)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '8px',
              letterSpacing: '2px',
            }}
          >
            XONA KODI
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '36px',
              fontWeight: 700,
              color: '#ff006e',
              letterSpacing: '8px',
              marginBottom: '12px',
            }}
          >
            {roomCode}
          </div>

          {/* Tugmalar */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={copyCode}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              📋 Nusxalash
            </button>
            <button
              onClick={handleInvite}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(0,136,204,0.2)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: '#0088cc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              ✈️ Telegram
            </button>
          </div>
        </div>

        {/* O'YINCHILAR RO'YXATI */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              👥 O'YINCHILAR
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: canStart ? '#2ed573' : 'rgba(255,255,255,0.4)',
              }}
            >
              {players.length}/{maxPlayers}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {players.map((player, i) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background:
                    i === 0
                      ? 'rgba(255,0,110,0.06)'
                      : 'rgba(255,255,255,0.03)',
                  border:
                    i === 0
                      ? '1px solid rgba(255,0,110,0.15)'
                      : '1px solid rgba(255,255,255,0.05)',
                  animation: 'fadeUp 0.3s ease forwards',
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    position: 'relative',
                  }}
                >
                  {player.avatar}
                  {/* Online belgisi */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#2ed573',
                      border: '2px solid var(--bg-primary)',
                    }}
                  />
                </div>

                {/* Ism */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff',
                    }}
                  >
                    {player.name}
                  </div>
                  {player.isHost && (
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        color: '#ff006e',
                      }}
                    >
                      ⭐ Xona egasi
                    </div>
                  )}
                </div>

                {/* Status */}
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#2ed573',
                  }}
                >
                  ✓ TAYYOR
                </div>
              </div>
            ))}

            {/* Bo'sh o'rinlar */}
            {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px dashed rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.015)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.15)',
                  }}
                >
                  Kutilmoqda...
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TAKLIF QILISH */}
        <button
          onClick={() => {
            hapticSelection();
            setShowInvite(!showInvite);
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1.5px dashed rgba(0,136,204,0.3)',
            background: 'rgba(0,136,204,0.05)',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            color: '#0088cc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          ✈️ DO'STLARNI TAKLIF QILISH
        </button>

        {/* Online do'stlar */}
        {showInvite && (
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: 'fadeUp 0.2s ease forwards',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '10px',
              }}
            >
              🟢 ONLAYN DO'STLAR
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {FAKE_PLAYERS.filter((p) => p.online).map((friend) => {
                const isInvited = players.find((p) => p.id === friend.id);
                return (
                  <div
                    key={friend.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{friend.avatar}</span>
                    <div
                      style={{
                        flex: 1,
                        fontFamily: 'var(--font-display)',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#fff',
                      }}
                    >
                      {friend.name}
                    </div>
                    <button
                      onClick={() => {
                        if (!isInvited) {
                          hapticSuccess();
                          toast(`${friend.name} ga taklif yuborildi!`, 'success');
                        }
                      }}
                      disabled={!!isInvited}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isInvited
                          ? 'rgba(46,213,115,0.12)'
                          : 'rgba(0,136,204,0.15)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: isInvited ? '#2ed573' : '#0088cc',
                        cursor: isInvited ? 'default' : 'pointer',
                      }}
                    >
                      {isInvited ? '✓ TAKLIF QILINDI' : 'TAKLIF'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PASTKI TUGMA — O'YIN BOSHLASH */}
      <div
        style={{
          padding: '12px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            if (!canStart) return;
            hapticSuccess();
            if (onStartGame) {
              onStartGame();
            } else {
              toast('O\'yin boshlanmoqda...', 'success');
            }
          }}
          disabled={!canStart}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            border: 'none',
            background: canStart
              ? 'linear-gradient(135deg, #ff006e, #ff4757)'
              : 'rgba(255,255,255,0.06)',
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: canStart ? '#fff' : 'rgba(255,255,255,0.2)',
            cursor: canStart ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          {canStart
            ? `▶ O'YIN BOSHLASH (${players.length} o'yinchi)`
            : `⏳ ${MIN_PLAYERS - players.length} TA O'YINCHI KERAK`}
        </button>
      </div>
    </div>
  );
}
