import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/common/Toast';
import { hapticSuccess, hapticImpact } from '@/config/telegram';
import { INITIAL_ACCOUNT } from '@/config/constants';

interface DailyBonusProps {
  onClaimAdReward?: () => void;
}

export default function DailyBonus({ onClaimAdReward }: DailyBonusProps) {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const [canClaim, setCanClaim] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [adViewed, setAdViewed] = useState(0);
  const [showReward, setShowReward] = useState(false);

  // Kunlik bonus holatini tekshirish
  useEffect(() => {
    if (!user) return;
    const lastClaim = user.dailyClaimedAt;
    if (!lastClaim) {
      setCanClaim(true);
      return;
    }
    const lastDate = new Date(lastClaim).toDateString();
    const today = new Date().toDateString();
    setCanClaim(lastDate !== today);
  }, [user]);

  // Kunlik bonus olish
  const handleClaim = useCallback(() => {
    if (!canClaim) return;
    hapticSuccess();
    setClaimed(true);
    setShowReward(true);
    toast(`+${INITIAL_ACCOUNT.DAILY_AD_REWARD} tanga olindi!`, 'success');
    setTimeout(() => setShowReward(false), 2000);
  }, [canClaim, toast]);

  // Reklama ko'rish
  const handleWatchAd = useCallback(() => {
    if (adViewed >= INITIAL_ACCOUNT.DAILY_AD_LIMIT) return;
    hapticImpact('light');
    setAdViewed((prev) => prev + 1);
    onClaimAdReward?.();
    toast(`+${INITIAL_ACCOUNT.DAILY_AD_REWARD / INITIAL_ACCOUNT.DAILY_AD_LIMIT} tanga!`, 'success');
  }, [adViewed, onClaimAdReward, toast]);

  return (
    <div
      style={{
        margin: '0 var(--space-lg)',
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(155, 93, 229, 0.1))',
        border: '1px solid rgba(255, 0, 110, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dekorativ nur */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,0,110,0.2), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Sarlavha */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-md)',
        }}
      >
        🎁 Kunlik bonus
      </div>

      {/* Reklama ko'rish progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-md)',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(adViewed / INITIAL_ACCOUNT.DAILY_AD_LIMIT) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--neon-pink), var(--neon-purple))',
              borderRadius: '3px',
              transition: 'width var(--transition-normal)',
            }}
          />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          {adViewed}/{INITIAL_ACCOUNT.DAILY_AD_LIMIT}
        </span>
      </div>

      {/* Tavsif */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-md)',
        }}
      >
        {INITIAL_ACCOUNT.DAILY_AD_LIMIT} ta reklama ko'ring = {INITIAL_ACCOUNT.DAILY_AD_REWARD} tanga
      </div>

      {/* Tugmalar */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <Button
          variant={claimed ? 'ghost' : 'success'}
          size="sm"
          disabled={!canClaim || claimed}
          onClick={handleClaim}
        >
          {claimed ? 'Olindi ✓' : canClaim ? 'KUNLIK BONUS' : 'Ertaga'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={adViewed >= INITIAL_ACCOUNT.DAILY_AD_LIMIT}
          onClick={handleWatchAd}
        >
          KO'RISH ({adViewed}/{INITIAL_ACCOUNT.DAILY_AD_LIMIT})
        </Button>
      </div>

      {/* Mukofot animatsiyasi */}
      {showReward && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--accent-secondary)',
            animation: 'scoreAdd 1.5s ease forwards',
            pointerEvents: 'none',
          }}
        >
          +{INITIAL_ACCOUNT.DAILY_AD_REWARD} 🪙
        </div>
      )}
    </div>
  );
}
