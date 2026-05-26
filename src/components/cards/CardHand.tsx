import { useState } from 'react';
import BlueCard from './BlueCard';
import type { HandCard } from '@/types/card';

interface CardHandProps {
  cards: HandCard[];
  selectedCardId: number | null;
  isDisabled?: boolean;
  onSelect: (cardId: number) => void;
}

export default function CardHand({
  cards,
  selectedCardId,
  isDisabled = false,
  onSelect,
}: CardHandProps) {
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);

  if (cards.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-xl)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
        }}
      >
        Kartalar tarqatilmoqda...
      </div>
    );
  }

  return (
    <div
      ref={setScrollRef}
      style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        overflowX: 'auto',
        padding: 'var(--space-md)',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {cards.map((card, index) => (
        <div
          key={card.cardId}
          className="card-dealt"
          style={{
            flexShrink: 0,
            width: '130px',
            scrollSnapAlign: 'center',
            animationDelay: `${index * 0.08}s`,
            opacity: isDisabled ? 0.5 : 1,
            pointerEvents: isDisabled ? 'none' : 'auto',
          }}
        >
          <BlueCard
            cardId={card.cardId}
            text={card.text}
            isAd={card.isAd}
            adBrand={card.adBrand}
            isSelected={selectedCardId === card.cardId}
            onSelect={onSelect}
          />
        </div>
      ))}

      {/* Skroll ko'rsatgichi */}
      {cards.length > 3 && (
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
          }}
        >
          {cards.map((_, i) => (
            <div
              key={i}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background:
                  selectedCardId === cards[i]?.cardId
                    ? 'var(--neon-pink)'
                    : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
