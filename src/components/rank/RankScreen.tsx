import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Podium from './Podium';
import Leaderboard from './Leaderboard';
import RankTiers from './RankTiers';
import CreatorBoard from './CreatorBoard';
import { useRating } from '@/hooks/useRating';
import { useAuthStore } from '@/store/authStore';
import { getRankByRating } from '@/utils/helpers';
import { hapticSelection } from '@/config/telegram';

type RankTab = 'weekly' | 'tiers' | 'creators';

interface RankScreenProps {
  onNavigate: (tab: string) => void;
}

export default function RankScreen({ onNavigate }: RankScreenProps) {
  const user = useAuthStore((s) => s.user);
  const { leaderboard, creatorBoard, loadLeaderboard, loadCreatorBoard, isLoading } = useRating();
  const [activeTab, setActiveTab] = useState<RankTab>('weekly');

  useEffect(() => {
    loadLeaderboard();
    loadCreatorBoard();
  }, [loadLeaderboard, loadCreatorBoard]);

  const tabs: { id: RankTab; label: string; icon: string }[] = [
    { id: 'weekly', label: 'Haftalik', icon: '🏆' },
    { id: 'tiers', label: 'Darajalar', icon: '📊' },
    { id: 'creators', label: 'Yaratuvchilar', icon: '🎨' },
  ];

  // Demo ma'lumotlar (backend bo'lmaganda)
  const demoLeaderboard = leaderboard.length > 0 ? leaderboard : [
    { telegramId: 1, firstName: 'Bobur', username: 'bobur', rating: 980, avatarUrl: null, cardsCreated: 45, totalLikes: 2400, totalMatches: 120, totalWins: 85, coinBalance: 5000, starBalance: 50, maxCardSlots: 20, lastName: null, id: 1, rank: 'memelord' as const, lastRewardWonAt: null, createdAt: '2026-01-01', lastActiveAt: '', dailyClaimedAt: null, isPremium: false, isBanned: false, isAmbassador: false, language: 'uz' },
    { telegramId: 2, firstName: 'Asadbek', username: 'asadbek', rating: 750, avatarUrl: null, cardsCreated: 38, totalLikes: 1800, totalMatches: 90, totalWins: 55, coinBalance: 3200, starBalance: 25, maxCardSlots: 15, lastName: null, id: 2, rank: 'funny' as const, lastRewardWonAt: null, createdAt: '2026-01-15', lastActiveAt: '', dailyClaimedAt: null, isPremium: false, isBanned: false, isAmbassador: false, language: 'uz' },
    { telegramId: 3, firstName: 'Diyor', username: 'diyor', rating: 620, avatarUrl: null, cardsCreated: 32, totalLikes: 1200, totalMatches: 70, totalWins: 40, coinBalance: 2800, starBalance: 15, maxCardSlots: 10, lastName: null, id: 3, rank: 'funny' as const, lastRewardWonAt: null, createdAt: '2026-02-01', lastActiveAt: '', dailyClaimedAt: null, isPremium: false, isBanned: false, isAmbassador: false, language: 'uz' },
    { telegramId: 4, firstName: 'Sherzod', username: 'sherzod', rating: 580, avatarUrl: null, cardsCreated: 25, totalLikes: 900, totalMatches: 65, totalWins: 35, coinBalance: 2100, starBalance: 10, maxCardSlots: 10, lastName: null, id: 4, rank: 'funny' as const, lastRewardWonAt: null, createdAt: '2026-02-10', lastActiveAt: '', dailyClaimedAt: null, isPremium: false, isBanned: false, isAmbassador: false, language: 'uz' },
    { telegramId: 5, firstName: 'Malika', username: 'malika', rating: 520, avatarUrl: null, cardsCreated: 18, totalLikes: 650, totalMatches: 50, totalWins: 28, coinBalance: 1800, starBalance: 8, maxCardSlots: 10, lastName: null, id: 5, rank: 'funny' as const, lastRewardWonAt: null, createdAt: '2026-02-20', lastActiveAt: '', dailyClaimedAt: null, isPremium: false, isBanned: false, isAmbassador: false, language: 'uz' },
    { telegramId: 6, firstName: 'Nodir', username: 'nodir', rating: 490, avatarUrl: null, cardsCreated: 12, totalLikes: 340, totalMatches: 45, totalWins: 22, coinBalance: 1500, starBalance: 5, maxCardSlots: 5, lastName: null, id: 6, rank: 'newbie' as const, lastRewardWonAt: null, createdAt: '2026-03-01', lastActiveAt: '', dailyClaimedAt: null, isPremium: false, isBanned: false, isAmbassador: false, language: 'uz' },
    { telegramId: 7, firstName: 'Jasur', username: 'jasur', rating: 420, avatarUrl: null, cardsCreated: 8, totalLikes: 180, totalMatches: 35, totalWins: 15, coinBalance: 900, starBalance: 3, maxCardSlots: 5, lastName: null, id: 7, rank: 'newbie' as const, lastRewardWonAt: null, createdAt: '2026-03-10', lastActiveAt: '', dailyClaimedAt: null, isPremium: false, isBanned: false, isAmbassador: false, language: 'uz' },
  ];

  const myRank = user ? getRankByRating(user.rating) : 'newbie';
  const myRating = user?.rating || 0;

  // Foydalanuvchi o'rnini topish
  const myPlace = demoLeaderboard.findIndex((u) => u.telegramId === user?.telegramId) + 1 || demoLeaderboard.length + 1;

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
        title="REYTING"
        showBack
        onBack={() => onNavigate('home')}
      />

      {/* Tab tugmalari */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '12px 16px 0',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                hapticSelection();
                setActiveTab(tab.id);
              }}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: '10px 10px 0 0',
                background: isActive
                  ? 'rgba(255, 0, 110, 0.1)'
                  : 'transparent',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid #ff006e'
                  : '2px solid transparent',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ff006e' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '13px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Kontent */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 16px)',
          overflowY: 'auto',
        }}
      >
        {isLoading && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
            }}
          >
            Yuklanmoqda...
          </div>
        )}

        {/* ======== HAFTALIK ======== */}
        {!isLoading && activeTab === 'weekly' && (
          <div>
            {/* Taymer */}
            <div
              style={{
                textAlign: 'center',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                ⏰ Yopilishiga:{' '}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--neon-pink)',
                }}
              >
                3 kun 12 soat 45 daqiqa
              </span>
            </div>

            {/* Podyum */}
            <Podium users={demoLeaderboard} currentUserId={user?.telegramId} />

            {/* Qolganlar */}
            <Leaderboard
              users={demoLeaderboard}
              currentUserId={user?.telegramId}
              startFrom={4}
            />

            {/* Sizning o'ringiz — pastda doim ko'rinadi */}
            {myPlace > 3 && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 0, 110, 0.06)',
                  border: '1px solid rgba(255, 0, 110, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#ff006e',
                    width: '30px',
                    textAlign: 'center',
                  }}
                >
                  #{myPlace}
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,0,110,0.3), rgba(255,0,110,0.15))',
                    border: '2px solid rgba(255,0,110,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {user?.firstName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ff006e',
                    }}
                  >
                    {user?.firstName || 'Siz'}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#ff006e',
                  }}
                >
                  {myRating}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ======== DARAJALAR ======== */}
        {!isLoading && activeTab === 'tiers' && (
          <RankTiers currentRank={myRank} currentRating={myRating} />
        )}

        {/* ======== YARATUVCHILAR ======== */}
        {!isLoading && activeTab === 'creators' && (
          <CreatorBoard users={creatorBoard.length > 0 ? creatorBoard : demoLeaderboard} currentUserId={user?.telegramId} />
        )}
      </div>
    </div>
  );
}
