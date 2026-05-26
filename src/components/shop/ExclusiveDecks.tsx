import { hapticImpact } from '@/config/telegram';

interface DeckItem {
  id: string;
  name: string;
  icon: string;
  cardCount: number;
  description: string;
  price: number;
  currency: 'coin' | 'star';
  color: string;
  popular?: boolean;
}

const DECKS: DeckItem[] = [
  {
    id: 'national',
    name: 'Milliy',
    icon: '🇺🇿',
    cardCount: 500,
    description: 'Milliy hazil-mutoyibalar',
    price: 0,
    currency: 'coin',
    color: '#2ed573',
  },
  {
    id: 'tech',
    name: 'Texnologiya',
    icon: '💻',
    cardCount: 300,
    description: 'IT, kripto, texno mavzular',
    price: 200,
    currency: 'coin',
    color: '#00b4d8',
    popular: true,
  },
  {
    id: 'sport',
    name: 'Sport',
    icon: '⚽',
    cardCount: 250,
    description: 'Futbol, boks, e-sport',
    price: 200,
    currency: 'coin',
    color: '#ffa502',
  },
  {
    id: 'adult',
    name: '18+',
    icon: '🔞',
    cardCount: 400,
    description: 'Kattalar uchun content',
    price: 50,
    currency: 'star',
    color: '#ff4757',
  },
  {
    id: 'exclusive',
    name: 'Eksklyuziv',
    icon: '💎',
    cardCount: 100,
    description: 'Cheklangan sonli kartalar',
    price: 300,
    currency: 'star',
    color: '#9b5de5',
  },
];

interface ExclusiveDecksProps {
  onPurchase: (deckId: string) => void;
}

export default function ExclusiveDecks({ onPurchase }: ExclusiveDecksProps) {
  return (
    <div>
      {/* Sarlavha */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          📚 Karta to'plamlari
        </h3>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          {DECKS.length} ta
        </span>
      </div>

      {/* To'plamlar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {DECKS.map((deck, index) => {
          const isFree = deck.price === 0;

          return (
            <div
              key={deck.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.04)',
                animation: 'fadeUp 0.3s ease forwards',
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
                position: 'relative',
              }}
            >
              {/* Popular badge */}
              {deck.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '12px',
                    padding: '2px 8px',
                    borderRadius: '0 0 6px 6px',
                    background: '#ff006e',
                    fontFamily: 'var(--font-body)',
                    fontSize: '8px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: '#fff',
                  }}
                >
                  MASHHUR
                </div>
              )}

              {/* Ikonka */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${deck.color}20, ${deck.color}10)`,
                  border: `1px solid ${deck.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                }}
              >
                {deck.icon}
              </div>

              {/* Ma'lumot */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '2px',
                  }}
                >
                  {deck.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {deck.description} · {deck.cardCount} ta
                </div>
              </div>

              {/* Narx tugmasi */}
              <button
                onClick={() => {
                  hapticImpact('medium');
                  onPurchase(deck.id);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isFree
                    ? 'rgba(46, 213, 115, 0.15)'
                    : deck.currency === 'star'
                    ? 'rgba(0, 180, 216, 0.15)'
                    : 'rgba(255, 215, 0, 0.12)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isFree
                    ? '#2ed573'
                    : deck.currency === 'star'
                    ? '#00b4d8'
                    : '#ffd700',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseDown={(e) =>
                  ((e.target as HTMLElement).style.transform = 'scale(0.95)')
                }
                onMouseUp={(e) =>
                  ((e.target as HTMLElement).style.transform = 'scale(1)')
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.transform = 'scale(1)')
                }
              >
                {isFree ? 'BEPUL' : `${deck.price} ${deck.currency === 'star' ? '⭐' : '🪙'}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
