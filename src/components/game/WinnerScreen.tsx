import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/common';
import Avatar from '@/components/common/Avatar';
import type { MatchResult } from '@/types/game';
import { formatRatingChange } from '@/utils/formatters';
import { hapticSuccess } from '@/config/telegram';

interface WinnerScreenProps {
  result: MatchResult;
  currentUserId?: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function WinnerScreen({
  result,
  currentUserId,
  onPlayAgain,
  onGoHome,
}: WinnerScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const isWinner = result.winnerId === currentUserId;
  const myRating = result.ratingChanges.find((r) => r.playerId === currentUserId);
  const myReward = result.coinRewards.find((r) => r.playerId === currentUserId);

  // Konfetti
  const createConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

  useEffect(() => {
    hapticSuccess();
    createConfetti();
    setTimeout(() => setShowContent(true), 500);
  }, [createConfetti]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: 'var(--space-lg)',
      }}
    >
      {/* Konfetti */}
      {showConfetti && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                background: [
                  'var(--neon-pink)',
                  'var(--neon-blue)',
                  'var(--neon-green)',
                  'var(--neon-yellow)',
                  'var(--neon-purple)',
                ][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}

      {/* Kontent */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-lg)',
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.6s ease',
        }}
      >
        {/* G'olib sarlavhasi */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--neon-yellow)',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
            textAlign: 'center',
          }}
        >
          {isWinner ? "G'OLIB! 🏆" : "O'YUN TUGADI!"}
        </div>

        {/* G'olib ma'lumoti */}
        <div style={{ textAlign: 'center' }}>
          <Avatar
            src={null}
            name={result.winnerName}
            size="xl"
            rank="legend"
          />
          <div
            style={{
              marginTop: 'var(--space-md)',
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {result.winnerName}
          </div>
        </div>

        {/* Natijalar */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-xl)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Reyting */}
          {myRating && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  letterSpacing: '1px',
                }}
              >
                REYTING
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: myRating.change > 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
                }}
              >
                {formatRatingChange(myRating.change)}
              </div>
            </div>
          )}

          {/* Tanga */}
          {myReward && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  letterSpacing: '1px',
                }}
              >
                TANGA
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--accent-secondary)',
                }}
              >
                +{myReward.amount}
              </div>
            </div>
          )}
        </div>

        {/* Tugmalar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', width: '100%', maxWidth: '300px' }}>
          <Button variant="primary" size="lg" fullWidth onClick={onPlayAgain}>
            YANA O'YNASH
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={onGoHome}>
            BOSH SAHIFA
          </Button>
        </div>
      </div>
    </div>
  );
}
