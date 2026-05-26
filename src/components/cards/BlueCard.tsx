import { useState } from 'react';
import { hapticSelection } from '@/config/telegram';

interface BlueCardProps {
  cardId: number;
  text: string;
  isSelected?: boolean;
  isRevealed?: boolean;
  isWinner?: boolean;
  isAd?: boolean;
  adBrand?: string;
  isHidden?: boolean; // Yashirin holat (javob tashlaganda)
  authorName?: string; // Ochilganda muallif nomi
  onSelect?: (cardId: number) => void;
}

export default function BlueCard({
  cardId,
  text,
  isSelected = false,
  isRevealed = false,
  isWinner = false,
  isAd = false,
  adBrand,
  isHidden = false,
  authorName,
  onSelect,
}: BlueCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  let bgGradient = 'linear-gradient(145deg, var(--card-blue), var(--card-blue-dark))';
  let borderColor = 'rgba(255, 255, 255, 0.15)';
  let glow = 'var(--shadow-glow-blue)';

  if (isAd) {
    bgGradient = 'linear-gradient(145deg, var(--card-ad), var(--card-ad-dark))';
    glow = 'var(--shadow-glow-ad)';
  }

  if (isWinner) {
    borderColor = 'var(--neon-yellow)';
    glow = '0 0 40px rgba(255, 215, 0, 0.6)';
  }

  if (isSelected) {
    borderColor = 'var(--neon-blue)';
    glow = '0 0 30px var(--card-blue-glow)';
  }

  return (
    <div
      onClick={() => {
        if (onSelect && !isRevealed) {
          hapticSelection();
          onSelect(cardId);
        }
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '140px',
        borderRadius: 'var(--card-radius)',
        padding: 'var(--space-md) var(--space-md) var(--space-lg)',
        background: isHidden
          ? 'var(--bg-surface)'
          : bgGradient,
        border: `3px solid ${borderColor}`,
        color: isHidden ? 'transparent' : (isAd ? '#1a1a1a' : '#fff'),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '13px',
        lineHeight: 1.4,
        cursor: onSelect && !isRevealed ? 'pointer' : 'default',
        transform: isPressed
          ? 'scale(0.97)'
          : isSelected
          ? 'translateY(-8px) scale(1.03)'
          : 'scale(1)',
        boxShadow: glow,
        transition: 'all var(--transition-normal)',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        animation: isRevealed ? 'revealAnswer 0.5s ease forwards' : undefined,
      }}
    >
      {/* Reklama belgisi */}
      {isAd && !isHidden && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            background: 'rgba(0,0,0,0.2)',
            color: '#fff',
            fontSize: '7px',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            letterSpacing: '1px',
            padding: '2px 5px',
            borderRadius: '3px',
            textTransform: 'uppercase',
          }}
        >
          SPONSORED
        </div>
      )}

      {/* Bonus ko'rsatgich */}
      {isAd && !isHidden && (
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.25)',
            color: '#ffd166',
            fontSize: '9px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          2x tanga
        </div>
      )}

      {/* Yashirin holat – "?" belgisi */}
      {isHidden && (
        <span
          style={{
            fontSize: '36px',
            color: 'var(--text-muted)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          ?
        </span>
      )}

      {/* Karta matni */}
      {!isHidden && (
        <div
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            maxWidth: '100%',
          }}
        >
          {text}
        </div>
      )}

      {/* Muallif nomi (ochilganda) */}
      {isRevealed && authorName && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '10px',
            fontSize: '9px',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            opacity: 0.5,
          }}
        >
          — {authorName}
        </div>
      )}

      {/* G'olib animatsiyasi */}
      {isWinner && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontSize: '18px',
            animation: 'bounce 0.6s ease-in-out infinite',
          }}
        >
          👑
        </div>
      )}
    </div>
  );
}
