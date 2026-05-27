import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getRankByRating } from '@/utils/helpers';
import { formatNumber } from '@/utils/formatters';
import { hapticImpact, hapticSuccess, hapticError } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';

interface ProfileScreenProps {
  onNavigate: (tab: string) => void;
}

const EDIT_COST = 500;

function getEditCount(): number {
  try {
    return parseInt(localStorage.getItem('profile_edit_count') || '0', 10);
  } catch { return 0; }
}

function incrementEditCount() {
  const count = getEditCount() + 1;
  localStorage.setItem('profile_edit_count', String(count));
}

function getRankTitle(rank: string): string {
  const titles: Record<string, string> = {
    newbie: 'Yangi o\'yinchi',
    beginner: 'Boshlang\'ich',
    funny: 'Kulgili',
    pro: 'Professional',
    master: 'Usta',
    legend: 'Afsona',
    champion: 'Chempion',
  };
  return titles[rank] || 'O\'yinchi';
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Telegram dan foydalanuvchi ma'lumotlari
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  // Boshlang'ich ma'lumotlar — Telegram dan
  const demoUser = user || {
    id: 1,
    telegramId: tgUser?.id || 123456,
    firstName: tgUser?.first_name || 'Foydalanuvchi',
    lastName: tgUser?.last_name || null,
    username: tgUser?.username || 'player1',
    avatarUrl: tgUser?.photo_url || null,
    rating: 750,
    coinBalance: 2350,
    starBalance: 15,
    maxCardSlots: 5,
    totalMatches: 45,
    totalWins: 28,
    totalLikes: 156,
    cardsCreated: 8,
    createdAt: '2026-03-15',
    isAdmin: false,
    rank: 'funny' as const,
  };

  // Avatar URL — Telegram dan yoki edit dan
  const avatarSrc = editAvatar || demoUser.avatarUrl || null;

  const rank = getRankByRating(demoUser.rating);
  const rankTitle = getRankTitle(rank);
  const editCount = getEditCount();
  const isFirstEdit = editCount === 0;

  // Nishonlar
  const badges = [
    { id: 'winner', icon: '🏆', name: 'G\'olib', unlocked: demoUser.totalWins >= 10 },
    { id: 'creator', icon: '🎨', name: 'Yaratuvchi', unlocked: demoUser.cardsCreated >= 5 },
    { id: 'social', icon: '❤️', name: 'Ijtimoiy', unlocked: demoUser.totalLikes >= 50 },
    { id: 'veteran', icon: '⭐', name: 'Veteran', unlocked: demoUser.totalMatches >= 100 },
    { id: 'streak', icon: '🔥', name: 'Seriya', unlocked: false },
  ];
  const unlockedBadges = badges.filter((b) => b.unlocked);

  // Profil tahrirlash boshlash
  const handleEditStart = useCallback(() => {
    hapticImpact('light');

    if (!isFirstEdit && demoUser.coinBalance < EDIT_COST) {
      hapticError();
      toast(`Tahrirlash uchun ${EDIT_COST} tanga kerak!`, 'error');
      return;
    }

    setEditName(demoUser.firstName);
    setEditUsername(demoUser.username || '');
    setEditAvatar(avatarSrc);
    setIsEditing(true);
  }, [demoUser, isFirstEdit, avatarSrc, toast]);

  // Saqlash
  const handleEditSave = useCallback(() => {
    if (!editName.trim()) {
      hapticError();
      toast('Ism bo\'sh bo\'lmasligi kerak', 'error');
      return;
    }

    // Coin yechish
    if (!isFirstEdit) {
      const newBalance = demoUser.coinBalance - EDIT_COST;
      const updatedUser = {
        ...demoUser,
        firstName: editName.trim(),
        username: editUsername.trim() || null,
        avatarUrl: editAvatar,
        coinBalance: newBalance,
      };
      localStorage.setItem('demo_user', JSON.stringify(updatedUser));
      setUser(updatedUser as any);
      toast(`-${EDIT_COST} tanga yechildi`, 'success');
    } else {
      const updatedUser = {
        ...demoUser,
        firstName: editName.trim(),
        username: editUsername.trim() || null,
        avatarUrl: editAvatar,
      };
      localStorage.setItem('demo_user', JSON.stringify(updatedUser));
      setUser(updatedUser as any);
    }

    incrementEditCount();
    hapticSuccess();
    setIsEditing(false);
    toast('Profil yangilandi!', 'success');
  }, [editName, editUsername, editAvatar, demoUser, isFirstEdit, toast, setUser]);

  // Bekor qilish
  const handleEditCancel = useCallback(() => {
    hapticImpact('light');
    setIsEditing(false);
  }, []);

  // Rasm tanlash
  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setEditAvatar(url);
      hapticSuccess();
    },
    []
  );

  const joinDate = new Date(demoUser.createdAt).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
  });

  const winRate = demoUser.totalMatches > 0
    ? Math.round((demoUser.totalWins / demoUser.totalMatches) * 100)
    : 0;

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
        }}
      >
        <button
          onClick={() => onNavigate('home')}
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
          PROFIL
        </h1>
        <button
          onClick={() => {
            hapticImpact('light');
            setShowSettings(true);
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
            fontSize: '15px',
          }}
        >
          ⚙️
        </button>
      </div>

      {/* ASOSIY KONTENT — scroll yo'q */}
      <div
        style={{
          flex: 1,
          padding: '0 16px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 8px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'hidden',
        }}
      >
        {/* PROFIL KARTASI */}
        <div
          style={{
            padding: '20px 16px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(155,93,229,0.08), rgba(255,0,110,0.06))',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Tahrirlash tugmasi */}
          {!isEditing && (
            <button
              onClick={handleEditStart}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✏️
            </button>
          )}

          {/* NISHONLAR — avatar tepasida */}
          {unlockedBadges.length > 0 && !isEditing && (
            <div
              style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '-4px',
              }}
            >
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    border: '2px solid rgba(255,215,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    boxShadow: '0 2px 8px rgba(255,215,0,0.2)',
                  }}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
          )}

          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: avatarSrc
                  ? `url(${avatarSrc}) center/cover no-repeat`
                  : 'linear-gradient(135deg, rgba(155,93,229,0.3), rgba(255,0,110,0.3))',
                border: '3px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: 700,
                color: '#fff',
                overflow: 'hidden',
              }}
            >
              {!avatarSrc && demoUser.firstName.charAt(0).toUpperCase()}
            </div>

            {/* Avatar tahrirlash */}
            {isEditing && (
              <label
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#ff006e',
                  border: '2px solid var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Ism / Username / Status */}
          {isEditing ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                width: '100%',
                maxWidth: '240px',
              }}
            >
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ismingiz"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#fff',
                  boxSizing: 'border-box',
                }}
              />
              <input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Username"
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleEditSave}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff006e, #ff4757)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {isFirstEdit ? 'SAQLASH (BEPUL)' : `SAQLASH (-${EDIT_COST} 🪙)`}
                </button>
                <button
                  onClick={handleEditCancel}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                  }}
                >
                  BEKOR
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0 0 2px',
                }}
              >
                {demoUser.firstName} {demoUser.lastName || ''}
              </h2>
              {demoUser.username && (
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.4)',
                    marginBottom: '4px',
                  }}
                >
                  @{demoUser.username}
                </div>
              )}
              {/* Status — avtomatik */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: demoUser.isAdmin ? '#ffd700' : '#9b5de5',
                  background: demoUser.isAdmin
                    ? 'rgba(255,215,0,0.1)'
                    : 'rgba(155,93,229,0.1)',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  display: 'inline-block',
                }}
              >
                {demoUser.isAdmin ? '👑 Admin' : `🎮 ${rankTitle}`}
              </div>
            </div>
          )}

          {/* A'zo bo'lgan sana */}
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            📅 A'zo: {joinDate}
          </div>
        </div>

        {/* BALANS + STATISTIKA — bitta qator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {[
            { icon: '⭐', value: formatNumber(demoUser.rating), label: 'REYTING', color: '#fff' },
            { icon: '🪙', value: formatNumber(demoUser.coinBalance), label: 'TANGA', color: '#ffd700' },
            { icon: '💎', value: String(demoUser.starBalance), label: 'STARS', color: '#00b4d8' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: '10px 6px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '14px', marginBottom: '2px' }}>{item.icon}</div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: item.color,
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.5px',
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* STATISTIKA — ixcham */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {[
            { value: String(demoUser.totalMatches), label: 'O\'yin' },
            { value: String(demoUser.totalWins), label: 'Yutuq' },
            { value: `${winRate}%`, label: 'Foiz' },
            { value: String(demoUser.cardsCreated), label: 'Karta' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: '8px 4px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* NISHONLAR — to'liq ro'yxat */}
        <div style={{ flexShrink: 0 }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 8px',
              letterSpacing: '1px',
            }}
          >
            🏅 NISHONLAR
          </h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {badges.map((badge) => (
              <div
                key={badge.id}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: badge.unlocked
                    ? 'rgba(255,215,0,0.08)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${badge.unlocked ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.04)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  opacity: badge.unlocked ? 1 : 0.3,
                }}
              >
                <span style={{ fontSize: '13px' }}>{badge.icon}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    color: badge.unlocked ? '#ffd700' : 'rgba(255,255,255,0.3)',
                    fontWeight: badge.unlocked ? 600 : 400,
                  }}
                >
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======== SOZLAMALAR MODAL — ekran markazida ======== */}
      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '340px',
              maxHeight: '80vh',
              borderRadius: '20px',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              overflowY: 'auto',
              animation: 'fadeUp 0.3s ease forwards',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                ⚙️ Sozlamalar
              </span>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                ✕
              </button>
            </div>

            {/* Sozlamalar ro'yxati */}
            <div style={{ padding: '8px 0' }}>
              {[
                { icon: '🔔', label: 'Bildirishnomalar', value: 'Yoqilgan' },
                { icon: '🔊', label: 'Ovoz effektlari', value: 'Yoqilgan' },
                { icon: '🌙', label: 'Qorong\'u rejim', value: 'Yoqilgan' },
                { icon: '🌐', label: 'Til', value: 'O\'zbek' },
                { icon: '❓', label: 'Yordam', value: '' },
                { icon: '📜', label: 'Foydalanish shartlari', value: '' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    hapticImpact('light');
                    toast(`${item.label} — tez orada`, 'success');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>
                    {item.icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#fff',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.value && (
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {item.value}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
