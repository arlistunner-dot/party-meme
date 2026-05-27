import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { hapticImpact, hapticSuccess, hapticError } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';

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

  const videosLeft = MAX_VIDEOS - videoData.used;
  const showDailyBonus = videosLeft > 0;

  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp;
      if (tg) tg.expand();
    } catch {}
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
        const earned = Math.floor(Math.random() * 20) + 10;
        hapticSuccess();
        toast(`+${earned} coin!`, 'success');
        if (refreshUser) await refreshUser();
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
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0f',
      }}
    >
      {/* FON */}
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

      {/* Overlay */}
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

      {/* KONTENT — spacer yo'q, hammasi birgalikda */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          padding: '20px',
          gap: '10px',
        }}
      >
        {/* KUNLIK BONUS — tugmalar USTIDA */}
        {showDailyBonus && (
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 0, 110, 0.15)',
              border: '2px solid rgba(255, 0, 110, 0.4)',
              boxShadow: '0 4px 20px rgba(255, 0, 110, 0.2)',
            }}
          >
            <span style={{ fontSize: '22px' }}>🎁</span>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display), sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                Kunlik bonus
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: '2px',
                }}
              >
                {videosLeft} ta video qoldi
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: MAX_VIDEOS }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: i < videoData.used ? '#ff006e' : 'rgba(255,255,255,0.2)',
                    boxShadow: i < videoData.used ? '0 0 6px #ff006e' : 'none',
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
                background: isWatching ? 'rgba(255,255,255,0.1)' : '#ff006e',
                fontFamily: 'var(--font-display), sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                cursor: isWatching ? 'default' : 'pointer',
              }}
            >
              {isWatching ? '...' : `▶ ${videosLeft}`}
            </button>
          </div>
        )}

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
            boxShadow: '0 4px 20px rgba(255, 0, 110, 0.35)',
            fontFamily: 'var(--font-display), sans-serif',
            fontSize: '17px',
            fontWeight: 700,
            letterSpacing: '3px',
            color: '#fff',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
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
            fontFamily: 'var(--font-display), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '2px',
            color: '#00b4d8',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          + XONA YARATISH
        </button>

        {/* QO'SHILISH */}
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
            fontFamily: 'var(--font-display), sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '2px',
            color: '#2ed573',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          🔗 QO'SHILISH
        </button>
      </div>
    </div>
  );
}
