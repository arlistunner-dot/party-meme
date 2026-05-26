import { Button } from '@/components/common';
import { COIN_PACKAGES } from '@/config/constants';
import { hapticImpact } from '@/config/telegram';

interface CoinPacksProps {
  onPurchase: (packageId: string) => void;
  isLoading?: boolean;
}

export default function CoinPacks({ onPurchase, isLoading }: CoinPacksProps) {
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
        🪙 TANGA TO'PLAMLARI
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {COIN_PACKAGES.map((pkg, index) => (
          <div
            key={pkg.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              animation: 'fadeUp 0.3s ease forwards',
              animationDelay: `${index * 0.05}s`,
              opacity: 0,
            }}
          >
            {/* Tanga ikonka */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}
            >
              🪙
            </div>

            {/* Ma'lumot */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {pkg.coins.toLocaleString()} tanga
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {pkg.starsPrice} ⭐
                </span>
                {pkg.bonus > 0 && (
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--accent-success)',
                      background: 'rgba(46, 213, 115, 0.15)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    +{pkg.bonus}%
                  </span>
                )}
                {pkg.badge && (
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--neon-yellow)',
                      background: 'rgba(255, 209, 102, 0.15)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    💎 {pkg.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Sotib olish tugmasi */}
            <Button
              variant="primary"
              size="sm"
              loading={isLoading}
              onClick={() => {
                hapticImpact('medium');
                onPurchase(pkg.id);
              }}
            >
              {pkg.starsPrice} ⭐
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
