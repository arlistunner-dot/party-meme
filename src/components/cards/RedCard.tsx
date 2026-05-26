import { useState } from 'react';
import { hapticImpact } from '@/config/telegram';

interface RedCardProps {
  text: string;
  isAd?: boolean;
  adBrand?: string;
  roundNumber?: number;
  totalRounds?: number;
  isLarge?: boolean;
  onClick?: () => void;
}

export default function RedCard({
  text,
  isAd = false,
  adBrand,
  roundNumber,
  totalRounds,
  isLarge = false,
  onClick,
}: RedCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const width = isLarge ? '100%' : 'var(--card-width)';
  const height = isLarge ? 'auto' : 'var(--card-height)';
  const fontSize = isLarge ? '20px' : '14px';
  const minHeight = isLarge ? '220px' : 'var(--card-height)';

  return (
    <div
      onClick={() => {
        if (onClick) {
          hapticImpact('medium');
          onClick();
        }
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        position: 'relative',
        width,
        height,
        minHeight,
        borderRadius: 'var(--card-radius)',
        padding: isLarge ? 'var(--space-xl)' : 'var(--space-md)',
        background: isAd
          ? 'linear-gradient(145deg, #ffd700, #b8860b)'
          : 'linear-gradient(145deg, var(--card-red), var(--card-red-dark))',
        border: `3px solid ${isAd ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
        color: isAd ? '#1a1a1a' : '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize,
        lineHeight: 1.4,
        cursor: onClick ? 'pointer' : 'default',
        transform: isPressed ? 'scale(0.97)' : 'scale(1)',
        boxShadow: isAd
          ? '0 0 30px rgba(255, 215, 0, 0.4)'
          : 'var(--shadow-glow-red)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-normal)',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Yuqori chap burchak – karta turi belgisi */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${isAd ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}`,
            borderRadius: '4px',
          }}
        />
        <span
          style={{
            fontSize: '8px',
            letterSpacing: '2px',
            opacity: 0.5,
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {isAd ? 'SPONSOR' : 'QIZIL'}
        </span>
      </div>

      {/* Round raqami */}
      {roundNumber && totalRounds && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '10px',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            opacity: 0.6,
          }}
        >
          {roundNumber}/{totalRounds}
        </div>
      )}

      {/* Reklama belgisi */}
      {isAd && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.25)',
            color: '#fff',
            fontSize: '8px',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            letterSpacing: '1px',
            padding: '2px 6px',
            borderRadius: '4px',
            textTransform: 'uppercase',
          }}
        >
          SPONSORED
        </div>
      )}

      {/* Brend nomi */}
      {isAd && adBrand && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            opacity: 0.7,
            whiteSpace: 'nowrap',
          }}
        >
          [Sponsored by {adBrand}]
        </div>
      )}

      {/* Karta matni */}
      <div
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto',
          maxWidth: '100%',
          padding: isLarge ? '0 var(--space-md)' : '0',
          marginTop: 'var(--space-sm)',
        }}
      >
        {text}
      </div>
    </div>
  );
}
