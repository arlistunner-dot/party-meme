import { DECKS } from '@/config/constants';

interface DeckSelectorProps {
  selectedDeckId: string;
  onSelect: (deckId: string) => void;
}

export default function DeckSelector({ selectedDeckId, onSelect }: DeckSelectorProps) {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-md)',
        }}
      >
        📚 TO'PLAM TANLASH
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {DECKS.map((deck) => {
          const isSelected = deck.id === selectedDeckId;
          const isPaid = deck.type !== 'free';

          return (
            <button
              key={deck.id}
              onClick={() => onSelect(deck.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: isSelected
                  ? 'rgba(255, 0, 110, 0.1)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: isSelected
                  ? '1px solid rgba(255, 0, 110, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isSelected ? 'var(--neon-pink)' : 'var(--text-primary)',
                  }}
                >
                  {deck.nameUz}
                  {isPaid && (
                    <span style={{ fontSize: '10px', marginLeft: '6px', color: 'var(--text-muted)' }}>
                      {deck.type === 'star' ? '⭐' : '🪙'} {deck.price}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {deck.description}
                </div>
              </div>

              {isSelected && (
                <span style={{ color: 'var(--accent-success)', fontSize: '18px' }}>✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
