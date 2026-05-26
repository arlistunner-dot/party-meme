import { useState } from 'react';
import { BlueCard } from '@/components/cards';
import type { UserCard } from '@/types/card';

interface MyCardsProps {
  cards: UserCard[];
  maxSlots: number;
  onDelete: (cardId: number) => void;
}

export default function MyCards({ cards, maxSlots, onDelete }: MyCardsProps) {
  const [filter, setFilter] = useState<'all' | 'blue' | 'featured'>('all');

  const filtered =
    filter === 'all'
      ? cards
      : filter === 'featured'
      ? cards.filter((c) => c.card.status === 'featured')
      : cards.filter((c) => c.card.type === 'blue');

  // Slotlar: to'ldirilgan + bo'sh
  const totalSlots = Math.max(maxSlots, cards.length);
  const emptySlots = totalSlots - cards.length;

  return (
    <div>
      {/* Filter tugmalari */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '16px',
        }}
      >
        {([
          { id: 'all', label: 'Hammasi' },
          { id: 'blue', label: 'Ko\'k' },
          { id: 'featured', label: '⭐ Tanlangan' },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background:
                filter === f.id
                  ? 'rgba(255, 0, 110, 0.15)'
                  : 'rgba(255, 255, 255, 0.04)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              color:
                filter === f.id ? '#ff006e' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Kartalar grid — slotlar bilan */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
        }}
      >
        {/* To'ldirilgan kartalar */}
        {filtered.map((userCard, index) => (
          <div
            key={userCard.id}
            style={{
              position: 'relative',
              animation: 'fadeUp 0.3s ease forwards',
              animationDelay: `${index * 0.04}s`,
              opacity: 0,
            }}
          >
            <BlueCard
              cardId={userCard.card.id}
              text={userCard.card.text}
              isRevealed
            />

            {/* Like soni */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                marginTop: '6px',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              ❤️ {userCard.card.likesCount}
              {userCard.card.status === 'featured' && (
                <span style={{ color: '#ffd700', marginLeft: '4px' }}>⭐</span>
              )}
            </div>

            {/* O'chirish tugmasi */}
            <button
              onClick={() => onDelete(userCard.cardId)}
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'rgba(255, 71, 87, 0.85)',
                border: 'none',
                color: '#fff',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.2s ease',
              }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Bo'sh slotlar */}
        {filter === 'all' &&
          Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                aspectRatio: '3/4',
                borderRadius: '12px',
                border: '2px dashed rgba(255, 255, 255, 0.07)',
                background: 'rgba(255, 255, 255, 0.015)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                minHeight: '140px',
              }}
            >
              <span
                style={{
                  fontSize: '24px',
                  opacity: 0.25,
                }}
              >
                🃏
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  opacity: 0.5,
                }}
              >
                Bo'sh slot
              </span>
            </div>
          ))}
      </div>

      {/* Kartalar yo'q */}
      {cards.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 16px',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>🎴</div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Kartalar yo'q
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}
          >
            "Yaratish" bo'limidan yangi karta yarating
          </div>
        </div>
      )}
    </div>
  );
}
