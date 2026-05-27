import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getRankByRating } from '@/utils/helpers';
import { formatNumber } from '@/utils/formatters';
import { hapticImpact, hapticSuccess, hapticError } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';
import type { User } from '@/types/user';

interface ProfileScreenProps {
  onNavigate: (tab: string) => void;
}

const EDIT_COST = 500;

function getEditCount(): number {
  try {
    return parseInt(localStorage.getItem('profile_edit_count') || '0', 10);
  } catch {
    return 0;
  }
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
  const [selectedBadge, setSelectedBadge] = useState<string | null>(
    localStorage.getItem('selected_badge') || null
  );
  const [showBadgePicker, setShowBadgePicker] = useState(false);

  // Telegram dan foydalanuvchi ma'lumotlari
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  // Asosiy ma'lumotlar
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

  const avatarSrc = editAvatar || demoUser.avatarUrl || null;
  const rank = getRankByRating(demoUser.rating);
  const rankTitle = getRankTitle(rank);
  const editCount = getEditCount();
  const isFirstEdit = editCount === 0;

  // Nishonlar ro'yxati
  const badges = [
    { id: 'winner', icon: '🏆', name: 'G\'olib', unlocked: demoUser.totalWins >= 10 },
    { id: 'creator', icon: '🎨', name: 'Yaratuvchi', unlocked: demoUser.cardsCreated >= 5 },
    { id: 'social', icon: '❤️', name: 'Ijtimoiy', unlocked: demoUser.totalLikes >= 50 },
    { id: 'veteran', icon: '⭐', name: 'Veteran', unlocked: demoUser.totalMatches >= 100 },
    { id: 'streak', icon: '🔥', name: 'Seriya', unlocked: false },
    { id: 'collector', icon: '🎴', name: 'Kollektor', unlocked: false },
    { id: 'legend', icon: '👑', name: 'Afsona', unlocked: false },
    { id: 'diamond', icon: '💎', name: 'Olmos', unlocked: false },
  ];
  const unlockedBadges = badges.filter((b) => b.unlocked);
  const activeBadge = selectedBadge
    ? badges.find((b) => b.id === selectedBadge && b.unlocked)
    : null;

  // Statistika
  const winRate =
    demoUser.totalMatches > 0
      ? Math.round((demoUser.totalWins / demoUser.totalMatches) * 100)
      : 0;

  const joinDate = new Date(demoUser.createdAt).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
  });

  // ===================== HANDLERS =====================

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

  const handleEditSave = useCallback(() => {
    if (!editName.trim()) {
      hapticError();
      toast('Ism bo\'sh bo\'lmasligi kerak', 'error');
      return;
    }

    const newBalance = isFirstEdit
      ? demoUser.coinBalance
      : demoUser.coinBalance - EDIT_COST;

    const updatedUser: User = {
      ...(demoUser as User),
      firstName: editName.trim(),
      username: editUsername.trim() || null,
      avatarUrl: editAvatar || demoUser.avatarUrl,
      coinBalance: newBalance,
    };

    localStorage.setItem('demo_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    incrementEditCount();

    hapticSuccess();
    setIsEditing(false);
    toast(
      isFirstEdit
        ? 'Profil yangilandi! (bepul)'
        : `Profil yangilandi! -${EDIT_COST} tanga`,
      'success'
    );
  }, [editName, editUsername, editAvatar, demoUser, isFirstEdit, toast, setUser]);

  const handleEditCancel = useCallback(() => {
    hapticImpact('light');
    setIsEditing(false);
  }, []);

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

  const handleSelectBadge = useCallback(
    (badgeId: string | null) => {
      hapticImpact('light');
      setSelectedBadge(badgeId);
      if (badgeId) {
        localStorage.setItem('selected_badge', badgeId);
      } else {
        localStorage.removeItem('selected_badge');
      }
      setShowBadgePicker(false);
    },
    []
  );

  // ===================== RENDER =====================

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
      {/* ============ HEADER ============ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
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

      {/* ============ ASOSIY KONTENT ============ */}
      <div
        style={{
          flex: 1,
          padding: '0 16px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 8px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          overflow: 'hidden',
        }}
      >
        {/* ======== PROFIL KARTASI ======== */}
        <div
          style={{
            padding: '18px 16px',
            borderRadius: '20px',
            background:
              'linear-gradient(135deg, rgba(155,93,229,0.08), rgba(255,0,110,0.06))',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
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
                zIndex: 10,
              }}
            >
              ✏️
            </button>
          )}

          {/* === AVATAR + NISHON wrapper === */}
          <div
            style={{
              position: 'relative',
              width: '72px',
              height: '72px',
            }}
          >
            {/* TANLANGAN NISHON — bosh kiyimdek, rasm yonida qiyshiq */}
            {activeBadge && !isEditing && (
              <div
                onClick={() => setShowBadgePicker(true)}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-18px',
                  fontSize: '22px',
                  transform: 'rotate(-25deg)',
                  filter: 'drop-shadow(0 2px 6px rgba(255,215,0,0.5))',
                  zIndex: 5,
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                title={activeBadge.name}
              >
                {activeBadge.icon}
              </div>
            )}

            {/* Nishon tanlash tugmasi — agar nishon tanlanmagan bo'lsa */}
            {!activeBadge && !isEditing && unlockedBadges.length > 0 && (
              <button
                onClick={() => setShowBadgePicker(true)}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-12px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'rgba(255,215,0,0.12)',
                  border: '1px dashed rgba(255,215,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '10px',
                  color: 'rgba(255,215,0,0.6)',
                  zIndex: 5,
                  padding: 0,
                }}
                title="Nishon tanlash"
              >
                +
              </button>
            )}

            {/* Avatar */}
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

            {/* Avatar tahrirlash — faqat edit rejimda */}
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
                  zIndex: 10,
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

          {/* === ISM / USERNAME / STATUS === */}
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
                  outline: 'none',
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
                  outline: 'none',
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
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {isFirstEdit ? '✓ BEPUL' : `✓ -${EDIT_COST} 🪙`}
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
                    fontSize: '11px',
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
              {/* Status — avtomatik, o'zgartrish mumkin emas */}
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

          {/* A'zo sana */}
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

        {/* ======== BALANS ======== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {[
            {
              icon: '⭐',
              value: formatNumber(demoUser.rating),
              label: 'REYTING',
              color: '#fff',
            },
            {
              icon: '🪙',
              value: formatNumber(demoUser.coinBalance),
              label: 'TANGA',
              color: '#ffd700',
            },
            {
              icon: '💎',
              value: String(demoUser.starBalance),
              label: 'STARS',
              color: '#00b4d8',
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: '8px 6px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '14px', marginBottom: '2px' }}>
                {item.icon}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: item.color,
                  lineHeight: 1.2,
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

        {/* ======== STATISTIKA ======== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {[
            { value: String(demoUser.totalMatches), label: 'O\'yin', icon: '🎮' },
            { value: String(demoUser.totalWins), label: 'Yutuq', icon: '🏅' },
            { value: `${winRate}%`, label: 'Foiz', icon: '📊' },
            { value: String(demoUser.cardsCreated), label: 'Karta', icon: '🎴' },
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
              <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                {item.icon}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.2,
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

        {/* ======== NISHONLAR — to'liq ro'yxat ======== */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                margin: 0,
                letterSpacing: '1px',
              }}
            >
              🏅 NISHONLAR
            </h3>
            {unlockedBadges.length > 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                {unlockedBadges.length}/{badges.length} ochildi
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => {
                  if (badge.unlocked) {
                    hapticImpact('light');
                    setShowBadgePicker(true);
                  }
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  background: badge.unlocked
                    ? selectedBadge === badge.id
                      ? 'rgba(255,215,0,0.15)'
                      : 'rgba(255,215,0,0.06)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    badge.unlocked
                      ? selectedBadge === badge.id
                        ? 'rgba(255,215,0,0.4)'
                        : 'rgba(255,215,0,0.15)'
                      : 'rgba(255,255,255,0.04)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: badge.unlocked ? 1 : 0.3,
                  cursor: badge.unlocked ? 'pointer' : 'default',
                }}
              >
                <span style={{ fontSize: '12px' }}>{badge.icon}</span>
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============ NISHON TANLASH MODAL ============ */}
      {showBadgePicker && (
        <div
          onClick={() => setShowBadgePicker(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
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
              maxWidth: '300px',
              borderRadius: '20px',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              animation: 'fadeUp 0.25s ease forwards',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                🏅 Bosh kiyim tanlash
              </span>
              <button
                onClick={() => setShowBadgePicker(false)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.5)',
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Nishonlar ro'yxati */}
            <div style={{ padding: '8px 10px' }}>
              {/* Nishonsiz */}
              <button
                onClick={() => handleSelectBadge(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: !selectedBadge
                    ? 'rgba(255,0,110,0.1)'
                    : 'transparent',
                  border: !selectedBadge
                    ? '1px solid rgba(255,0,110,0.2)'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  width: '100%',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    width: '28px',
                    textAlign: 'center',
                  }}
                >
                  🚫
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: '#fff',
                    flex: 1,
                  }}
                >
                  Nishonsiz
                </span>
                {!selectedBadge && (
                  <span style={{ fontSize: '13px', color: '#ff006e' }}>✓</span>
                )}
              </button>

              {/* Ochilgan nishonlar */}
              {unlockedBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => handleSelectBadge(badge.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background:
                      selectedBadge === badge.id
                        ? 'rgba(255,215,0,0.1)'
                        : 'transparent',
                    border:
                      selectedBadge === badge.id
                        ? '1px solid rgba(255,215,0,0.2)'
                        : '1px solid transparent',
                    cursor: 'pointer',
                    width: '100%',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '18px',
                      width: '28px',
                      textAlign: 'center',
                    }}
                  >
                    {badge.icon}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: '#fff',
                      flex: 1,
                      textAlign: 'left',
                    }}
                  >
                    {badge.name}
                  </span>
                  {selectedBadge === badge.id && (
                    <span style={{ fontSize: '13px', color: '#ffd700' }}>
                      ✓
                    </span>
                  )}
                </button>
              ))}

              {/* Yopish tugmasi */}
              <button
                onClick={() => setShowBadgePicker(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.04)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  marginTop: '4px',
                }}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ SOZLAMALAR MODAL ============ */}
      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
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
              animation: 'fadeUp 0.25s ease forwards',
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
                position: 'sticky',
                top: 0,
                background: '#1a1a2e',
                zIndex: 1,
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
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Sozlamalar ro'yxati */}
            <div style={{ padding: '4px 0' }}>
              {[
                { icon: '🔔', label: 'Bildirishnomalar', value: 'Yoqilgan' },
                { icon: '🔊', label: 'Ovoz effektlari', value: 'Yoqilgan' },
                { icon: '🌙', label: 'Qorong\'u rejim', value: 'Yoqilgan' },
                { icon: '🌐', label: 'Til', value: 'O\'zbek' },
                { icon: '❓', label: 'Yordam', value: '' },
                { icon: '📜', label: 'Foydalanish shartlari', value: '' },
                {
                  icon: '🚪',
                  label: 'Chiqish',
                  value: '',
                  danger: true,
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    hapticImpact('light');
                    if (item.danger) {
                      toast('Sessiya tugatildi', 'success');
                      setShowSettings(false);
                    } else {
                      toast(`${item.label} — tez orada`, 'success');
                    }
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
                >
                  <span
                    style={{
                      fontSize: '16px',
                      width: '24px',
                      textAlign: 'center',
                    }}
                  >
                    {item.icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: (item as any).danger ? '#ff4757' : '#fff',
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
