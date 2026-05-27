import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { hapticImpact, hapticSuccess, hapticError } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';
import { apiRequest } from '@/config/api';

interface HomeScreenProps {
  onPlay: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onNavigate: (tab: string) => void;
}

const MAX_VIDEOS = 5;

function getVideoCount(): { used: number; date: string } {
  try {
    const saved = localStorage.getItem('video_bonus_data');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === new Date().toDateString()) return data;
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

function showRewardedVideo(): Promise<boolean> {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp;
    // @ts-expect-error
    const ads = tg?.Ads;
    if (ads && typeof ads.showRewardedVideo === 'function') {
      ads.showRewardedVideo((result: { rewarded?: boolean }) => {
        resolve(!!result?.rewarded);
      });
    } else {
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

  useEffect(() => {
    async function loadEvents() {
      try {
        const events = (await apiRequest('/bonus-events')) as Record<string, unknown>[];
        if (Array.isArray(events)) {
          setBonusEvents(events.filter((e) => e.active));
        }
      } catch {}
    }
    loadEvents();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setVideoData(getVideoCount()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWatchVideo = useCallback(async () => {
    if (isWatching) return;
    setIsWatching(true);
    hapticImpact('medium');
    try {
      const rewarded = await showRewardedVideo();
      if (rewarded) {
        try {
          const result = (await apiRequest('/me/video-bonus', {
            method: 'POST',
          })) as { earned: number };
          hapticSuccess();
          toast(`+${result.earned} coin!`, 'success');
          await refreshUser();
        } catch {
          const earned = Math.floor(Math.random() * 20) + 10;
          hapticSuccess();
          toast(`+${earned} coin! (demo)`, 'success');
        }
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
        minHeight: '100vh',
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* FON RASMI */}
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

      {/* KONTENT */}
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
        {/* TEPADA BO'SH JOY */}
        <div style={{ height: '8px' }} />

        {/* BONUS EVENTLAR */}
        {bonusEvents.map((event, index) => (
          <div
            key={(event.id as number) || index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              marginBottom: '4px',
              borderRadius: '8px',
              background: 'rgba(155,93,229,0.1)',
              border: '1px solid rgba(155,93,229,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>{(event.icon as string) || '🎉'}</span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {(event.title as string) || 'Maxsus bonus'}
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '10px',
                fontWeight: 700,
                color: '#9b5de5',
              }}
            >
              +{(event.reward as number) || 50} 🪙
            </span>
          </div>
        ))}

        {/* KUNLIK BONUS — ixcham satr */}
        {showDailyBonus && (
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 0, 110, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 0, 110, 0.15)',
              boxShadow: '0 2px 12px rgba(255, 0, 110, 0.1)',
              animation: 'fadeUp 0.4s ease forwards',
            }}
          >
            <span style={{ fontSize: '20px' }}>🎁</span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.3,
                }}
              >
                Kunlik bonus
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: '2px',
                }}
              >
                {videosLeft} ta video qoldi
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {Array.from({ length: MAX_VIDEOS }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background:
                      i < videoData.used
                        ? '#ff006e'
                        : 'rgba(255,255,255,0.15)',
                    boxShadow:
                      i < videoData.used
                        ? '0 0 6px rgba(255,0,110,0.4)'
                        : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleWatchVideo}
              disabled={isWatching}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isWatching
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, #ff006e, #ff4757)',
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: isWatching ? 'rgba(255,255,255,0.3)' : '#fff',
                cursor: isWatching ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isWatching
                  ? 'none'
                  : '0 2px 10px rgba(255, 0, 110, 0.3)',
              }}
            >
              {isWatching ? '...' : `▶ ${videosLeft}`}
            </button>
          </div>
        )}

        {/* MARKAZIY BO'SH JOY — logo uchun */}
        <div style={{ flex: 1, minHeight: '40px' }} />

        {/* TUGMALAR — PIRAMIDA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
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
