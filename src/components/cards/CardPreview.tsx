import { useState, useMemo } from 'react';
import RedCard from './RedCard';
import BlueCard from './BlueCard';

interface CardPreviewProps {
  type: 'red' | 'blue';
  text: string;
  imageUrl?: string | null;
}

export default function CardPreview({ type, text, imageUrl }: CardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Matn bo'sh bo'lsa placeholder
  const displayText = useMemo(() => {
    if (!text.trim()) {
      return type === 'red'
        ? 'Savol matnini yozing...'
        : 'Javob matnini yozing...';
    }
    return text;
  }, [text, type]);

  const isEmpty = !text.trim();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-md)',
      }}
    >
      {/* Preview sarlavhasi */}
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        {isFlipped ? 'Orqa tomon' : 'Old tomon'} PREVIEW
      </span>

      {/* Karta */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          cursor: 'pointer',
          perspective: '600px',
        }}
      >
        <div
          style={{
            opacity: isEmpty ? 0.4 : 1,
            transition: 'opacity var(--transition-normal)',
            filter: isEmpty ? 'blur(1px)' : 'none',
            animation: isFlipped ? 'flipIn 0.4s ease' : undefined,
          }}
        >
          {type === 'red' ? (
            <RedCard text={displayText} isLarge />
          ) : (
            <div style={{ width: '260px' }}>
              <BlueCard cardId={0} text={displayText} isRevealed />
            </div>
          )}
        </div>
      </div>

      {/* Rasm preview */}
      {imageUrl && (
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        >
          <img
            src={imageUrl}
            alt="Karta rasmi"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Matn uzunligi ko'rsatgichi */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          fontSize: '11px',
          fontFamily: 'var(--font-body)',
          color: text.length > 180 ? 'var(--accent-danger)' : 'var(--text-muted)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '3px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, (text.length / 200) * 100)}%`,
              height: '100%',
              background:
                text.length > 180
                  ? 'var(--accent-danger)'
                  : text.length > 150
                  ? 'var(--accent-warning)'
                  : 'var(--accent-success)',
              borderRadius: '2px',
              transition: 'width var(--transition-fast)',
            }}
          />
        </div>
        {text.length}/200
      </div>
    </div>
  );
}
