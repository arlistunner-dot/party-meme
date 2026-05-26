import { useAuthStore } from '@/store/authStore';
import { hapticImpact } from '@/config/telegram';

interface SlotOption {
  slots: number;
  price: number;
  popular?: boolean;
}

const SLOT_OPTIONS: SlotOption[] = [
  { slots: 5, price: 300 },
  { slots: 10, price: 500, popular: true },
  { slots: 20, price: 1000 },
];

interface SlotUpgradeProps {
  onPurchase: (count: number) => void;
  isLoading?: boolean;
}

export default function SlotUpgrade({ onPurchase, isLoading }: SlotUpgradeProps) {
  const user = useAuthStore((s) => s.user);
  const currentSlots = user?.maxCardSlots || 5;

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
          📦 Karta joylari (Slotlar)
        </h3>
      </div>

      {/* Joriy holat */}
      <div
        style={{
          padding: '14px 16px',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.04)',
          marginBottom: '14px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '4px',
          }}
        >
          Joriy slotlar soni
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {currentSlots}
        </div>
      </div>

      {/* Slot variantlari */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {SLOT_OPTIONS.map((option, index) => (
          <div
            key={option.slots}
            style={{
              padding: '18px 10px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'center',
              position: 'relative',
              animation: 'fadeUp 0.3s ease forwards',
              animationDelay: `${index * 0.08}s`,
              opacity: 0,
            }}
          >
            {/* Popular */}
            {option.popular && (
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '2px 8px',
                  borderRadius: '0 0 6px 6px',
                  background: '#ff006e',
                  fontFamily: 'var(--font-body)',
                  fontSize: '8px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}
              >
                MASHHUR
              </div>
            )}

            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
                color: '#00b4d8',
              }}
            >
              +{option.slots}
            </div>

            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              ta slot
            </div>

            <button
              onClick={() => {
                hapticImpact('medium');
                onPurchase(option.slots);
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(0, 180, 216, 0.12)',
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#00b4d8',
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'transform 0.15s ease',
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
              {option.price} 🪙
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
