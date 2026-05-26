import { useState, useCallback } from 'react';
import Header from '@/components/common/Header';
import StatsPanel from './StatsPanel';
import BadgesList from './BadgesList';
import RankBadge from './RankBadge';
import { useAuthStore } from '@/store/authStore';
import { getRankByRating } from '@/utils/helpers';
import { formatNumber } from '@/utils/formatters';
import { hapticImpact, hapticSuccess, hapticError } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';
import type { User } from '@/types/user';

interface ProfileScreenProps {
  onNavigate: (tab: string) => void;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('Party Meme o\'yinchisi 🎉');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Demo ma'lumotlar (backend bo'lmaganda)
  const demoUser = user || {
    id: 1,
    telegramId: 123456,
    firstName: 'Foydalanuvchi',
    lastName: null as string | null,
    username: 'player1',
    avatarUrl: null as string | null,
    rating: 750,
    rank: 'funny' as const,
    coinBalance: 2350,
    starBalance: 15,
    maxCardSlots: 5,
    totalMatches: 45,
    totalWins: 28,
    totalLikes: 156,
    cardsCreated: 8,
    createdAt: '2026-03-15',
    lastActiveAt: new Date().toISOString(),
    dailyClaimedAt: null,
    isPremium: false,
    isBanned: false,
    isAmbassador: false,
    language: 'uz',
    lastRewardWonAt: null,
  };

  const rank = getRankByRating(demoUser.rating);

  const stats = {
    totalMatches: demoUser.totalMatches,
    totalWins: demoUser.totalWins,
    winRate: demoUser.totalMatches > 0
      ? Math.round((demoUser.totalWins / demoUser.totalMatches) * 100)
      : 0,
    bestWinStreak: 7,
    currentWinStreak: 3,
    cardsCreated: demoUser.cardsCreated,
    cardsLiked: demoUser.totalLikes,
    rating: demoUser.rating,
    rank,
    rankProgress: 0,
    nextRankAt: null,
  };

  // Profil tahrirlash
  const handleEditStart = useCallback(() => {
    hapticImpact('light');
    setEditName(demoUser.firstName);
    setEditUsername(demoUser.username || '');
    setIsEditing(true);
  }, [demoUser]);

  const handleEditSave = useCallback(() => {
    if (!editName.trim()) {
      hapticError();
      toast('Ism bo\'sh bo\'lmasligi kerak', 'error');
      return;
    }

    // Demo rejimda — localStorage ga saqlash
    const updatedUser = {
      ...demoUser,
      firstName: editName.trim(),
      username: editUsername.trim() || null,
      lastName: editBio.trim() || null,
    };

    localStorage.setItem('demo_user', JSON.stringify(updatedUser));
    setUser(updatedUser as User);

    hapticSuccess();
    setIsEditing(false);
    toast('Profil yangilandi!', 'success');
  }, [editName, editUsername, editBio, demoUser, toast, setUser]);

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

  // Sana formatlash
  const joinDate = new Date(demoUser.createdAt).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
  });

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
        title="PROFIL"
        showBack
        onBack={() => onNavigate('home')}
        rightAction={
          <button
            onClick={() => {
              hapticImpact('light');
              setShowSettings(!showSettings);
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
        }
      />

      <div
        style={{
          flex: 1,
          padding: '20px 16px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
        }}
      >
        {/* ======== PROFIL KARTASI ======== */}
        <div
          style={{
            padding: '24px 20px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(155,93,229,0.08), rgba(255,0,110,0.06))',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            position: 'relative',
          }}
        >
          {/* Tahrirlash tugmasi */}
          {!isEditing && (
            <button
              onClick={handleEditStart}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ✏️
            </button>
          )}

          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: editAvatar
                  ? `url(${editAvatar}) center/cover`
                  : 'linear-gradient(135deg, rgba(155,93,229,0.3), rgba(255,0,110,0.3))',
                border: '3px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
                color: '#fff',
                overflow: 'hidden',
              }}
            >
              {!editAvatar && demoUser.firstName.charAt(0).toUpperCase()}
            </div>

            {/* Avatar tahrirlash */}
            {isEditing && (
              <label
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#ff006e',
                  border: '2px solid var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px',
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

          {/* Ism / Username */}
          {isEditing ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                maxWidth: '250px',
              }}
            >
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ismingiz"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
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
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                  boxSizing: 'border-box',
                }}
              />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Bio"
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                  resize: 'none',
                  minHeight: '40px',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleEditSave}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff006e, #ff4757)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  SAQLASH
                </button>
                <button
                  onClick={handleEditCancel}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
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
                  fontSize: '20px',
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
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: '6px',
                  }}
                >
                  @{demoUser.username}
                </div>
              )}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.55)',
                  fontStyle: 'italic',
                }}
              >
                {editBio}
              </div>
            </div>
          )}

          {/* A'zo bo'lgan sana */}
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            📅 A'zo: {joinDate}
          </div>
        </div>

        {/* ======== BALANS KARTASI ======== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          {/* Reyting */}
          <div
            style={{
              padding: '14px 10px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>⭐</div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {formatNumber(demoUser.rating)}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.5px',
              }}
            >
              REYTING
            </div>
          </div>

          {/* Tanga */}
          <div
            style={{
              padding: '14px 10px',
              borderRadius: '14px',
              background: 'rgba(255,215,0,0.04)',
              border: '1px solid rgba(255,215,0,0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>🪙</div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 700,
                color: '#ffd700',
              }}
            >
              {formatNumber(demoUser.coinBalance)}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.5px',
              }}
            >
              TANGA
            </div>
          </div>

          {/* Stars */}
          <div
            style={{
              padding: '14px 10px',
              borderRadius: '14px',
              background: 'rgba(0,180,216,0.04)',
              border: '1px solid rgba(0,180,216,0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>💎</div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 700,
                color: '#00b4d8',
              }}
            >
              {demoUser.starBalance}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.5px',
              }}
            >
              STARS
            </div>
          </div>
        </div>

        {/* ======== DARAJA ======== */}
        <RankBadge rank={rank} rating={demoUser.rating} />

        {/* ======== STATISTIKA ======== */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 12px',
            }}
          >
            📊 Statistika
          </h3>
          <StatsPanel stats={stats} />
        </div>

        {/* ======== NISHONLAR ======== */}
        <BadgesList unlockedBadgeIds={['winner', 'creator', 'social']} />

        {/* ======== SOZLAMALAR PANELI ======== */}
        {showSettings && (
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 12px',
              }}
            >
              ⚙️ Sozlamalar
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 8px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    width: '100%',
                    textAlign: 'left',
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
                      color: 'var(--text-primary)',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.value && (
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.value}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
