import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { formatNumber } from '@/utils/formatters';
import { hapticImpact, hapticSuccess, hapticError } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';
import { apiRequest } from '@/config/api';

interface HomeScreenProps {
  onPlay: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onNavigate: (tab: string) => void;
}

// Video limit — 24 soat ichida 5 ta
const MAX_VIDEOS = 5;

function getVideoCount(): { used: number; date: string } {
  try {
    const saved = localStorage.getItem('video_bonus_data');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date === today) {
        return data;
      }
    }
  } catch {}
  return { used: 0, date: new Date().toDateString() };
}

function saveVideoCount(used: number) {
  localStorage.setItem(
    'video_bonus_data',
    JSON.stringify({ used, date: new Date().toDateString() })
  );
}

// Telegram rewarded video ochish
function showRewardedVideo(): Promise<boolean> {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp;
    // @ts-expect-error — Telegram rewarded ads API
    const ads = tg?.Ads;

    if (ads && typeof ads.showRewardedVideo === 'function') {
      ads.showRewardedVideo((result: { rewarded?: boolean }) => {
        resolve(!!result?.rewarded);
      });
    } else {
      // Demo rejim — 2 soniya kutib true qaytarish
      console.log('[Ads] Telegram ads mavjud emas — demo rejim');
      setTimeout(() => resolve(true), 2000);
    }
  });
}

export default function HomeScreen({ onPlay, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const { toast } = useToast();

  const [videoData, setVideoData] = useState(getVideoCount());
  const [isWatching, setIsWatching] = useState(false);
  const [bonusEvents, setBonusEvents] = useState<Record<string, unknown>[]>([]);

  const videosLeft = MAX_VIDEOS - videoData.used;
  const showDailyBonus = videosLeft > 0;

  // Bonus eventlarni yuklash
  useEffect(() => {
    async function loadEvents() {
      try {
        const events = (await apiRequest('/bonus-events')) as Record<string, unknown>[];
        if (Array.isArray(events)) {
          setBonusEvents(events.filter((e: Record<string, unknown>) => e.active));
        }
      } catch {
        // API yo'q bo'lsa — e'tiborsiz
      }
    }
    loadEvents();
  }, []);

  // Har soniyada video ma'lumotini yangilash
  useEffect(() => {
    const interval = setInterval(() => {
      setVideoData(getVideoCount());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Video ko'rish va bonus olish
  const handleWatchVideo = useCallback(async () => {
    if (isWatching) return;
    setIsWatching(true);
    hapticImpact('medium');

    try {
      const rewarded = await showRewardedVideo();

      if (rewarded) {
        // Backend ga yuborish
        try {
          const result = (await apiRequest('/me/video-bonus', {
            method: 'POST',
          })) as { earned: number };

          hapticSuccess();
          toast(`+${result.earned} coin olindi!`, 'success');
          await refreshUser();
        } catch {
          // Backend ishlamasa — demo hisoblash
          const earned = Math.floor(Math.random() * 20) + 10;
          hapticSuccess();
          toast(`+${earned} coin olindi! (demo)`, 'success');
        }

        // Video hisobini yangilash
        const newUsed = videoData.used + 1;
        saveVideoCount(newUsed);
        setVideoData({ used: newUsed, date: new Date().toDateString() });
      } else {
        toast('Video to\'liq ko\'rilmadi', 'error');
      }
    } catch {
      hapticError();
      toast('Video yuklashda xato', 'error');
    } finally {
      setIsWatching(false);
    }
  }, [isWatching, videoData, toast, refreshUser]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ======== FON RASMI ======== */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          backgroundImage: 'url(/assets/home-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#0a0a0f',
        }}
      />

      {/* Qorong'u overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ======== KONTENT ======== */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '0 20px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
        }}
      >
        {/* ---- TEPADA BO'SH JOY ---- */}
        <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 15px)' }} />

        {/* ---- BONUS EVENTLAR — faqat faol bo'lsa ko'rinadi ---- */}
        {bonusEvents.map((event, index) => (
          <div
            key={(event as Record<string, unknown>).id as number || index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              marginBottom: '6px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(155,93,229,0.15), rgba(255,0,110,0.1))',
              border: '1px solid rgba(155,93,229,0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                {(event as Record<string, unknown>).icon as string || '🎉'}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {(event as Record<string, unknown>).title as string || 'Maxsus bonus'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  {(event as Record<string, unknown>).description as string || 'Cheklangan vaqt'}
                </div>
              </div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#9b5de5',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(155,93,229,0.15)',
              }}
            >
              +{(event as Record<string, unknown>).reward as number || 50} 🪙
            </div>
          </div>
        ))}

        {/* ---- KUNLIK BONUS — faqat limit bo'lsa ko'rinadi ---- */}
        {showDailyBonus && (
          <div
            style={{
              marginTop: '8px',
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 0, 110, 0.12)',
              animation: 'fadeUp 0.4s ease forwards',
            }}
          >
            {/* Sarlavha */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🎁</span>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    Kunlik bonus
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    Video ko'rganingizda bonus oling
                  </div>
                </div>
              </div>

              {/* Qolgan limit */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  background: 'rgba(255, 0, 110, 0.1)',
                  border: '1px solid rgba(255, 0, 110, 0.15)',
                }}
              >
                <span style={{ fontSize: '12px' }}>🎬</span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#ff006e',
                  }}
                >
                  {videosLeft}/{MAX_VIDEOS}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.06)',
                marginBottom: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(videoData.used / MAX_VIDEOS) * 100}%`,
                  height: '100%',
                  borderRadius: '2px',
                  background: 'linear-gradient(90deg, #ff006e, #ff4757)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            {/* Dotlar — nechta qolganini ko'rsatadi */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '14px',
              }}
            >
              {Array.from({ length: MAX_VIDEOS }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background:
                      i < videoData.used
                        ? '#ff006e'
                        : 'rgba(255,255,255,0.12)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Video tugmasi */}
            <button
              onClick={handleWatchVideo}
              disabled={isWatching}
              style={{
                width: '100%',
                padding: '11px 20px',
                borderRadius: '10px',
                border: 'none',
                background: isWatching
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, #ff006e 0%, #ff4757 100%)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: isWatching ? 'rgba(255,255,255,0.3)' : '#fff',
                cursor: isWatching ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isWatching
                  ? 'none'
                  : '0 3px 15px rgba(255, 0, 110, 0.3)',
              }}
            >
              {isWatching ? 'KO\'RILMOQDA...' : '▶ VIDEO KO\'RISH'}
            </button>

            {/* Qolgan vaqt */}
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.25)',
                textAlign: 'center',
                marginTop: '8px',
              }}
            >
              {videosLeft > 0
                ? `Yana ${videosLeft} ta video ko'rishingiz mumkin`
                : 'Ertaga qaytang!'}
            </div>
          </div>
        )}

        {/* ---- MARKAZIY BO'SH JOY ---- */}
        <div style={{ flex: 1 }} />

        {/* ---- TUGMALAR — PIRAMIDA ---- */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          {/* O'YNASH */}
          <button
            onClick={() => {
              hapticImpact('heavy');
              onPlay();
            }}
            style={{
              width: '100%',
              maxWidth: '340px',
              padding: '15px 24px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff006e 0%, #ff4757 100%)',
              boxShadow: '0 4px 20px rgba(255, 0, 110, 0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
              fontFamily: 'var(--font-display)',
              fontSize: '17px',
              fontWeight: 700,
              letterSpacing: '3px',
              color: '#fff',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => ((e.target as HTMLElement).style.transform = 'scale(0.96)')}
            onMouseUp={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
          >
            ▶ O'YNASH
          </button>

          {/* XONA YARATISH */}
          <button
            onClick={() => {
              hapticImpact('medium');
              onCreateRoom();
            }}
            style={{
              width: '100%',
              maxWidth: '270px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1.5px solid rgba(0, 180, 216, 0.35)',
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '2px',
              color: '#00b4d8',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => ((e.target as HTMLElement).style.transform = 'scale(0.96)')}
            onMouseUp={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
          >
            + XONA YARATISH
          </button>

          {/* XONAGA QO'SHILISH */}
          <button
            onClick={() => {
              hapticImpact('medium');
              onJoinRoom();
            }}
            style={{
              width: '100%',
              maxWidth: '210px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1.5px solid rgba(46, 213, 115, 0.25)',
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '2px',
              color: '#2ed573',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => ((e.target as HTMLElement).style.transform = 'scale(0.96)')}
            onMouseUp={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
          >
            🔗 QO'SHILISH
          </button>
        </div>
      </div>
    </div>
  );
}
