import { useEffect, useCallback } from 'react';
import type { BrandTheme } from '@/types/room';

interface BrandedThemeProps {
  theme: BrandTheme | null;
  children: React.ReactNode;
}

/**
 * Brend mavzusi – CSS o'zgaruvchilarni o'zgartiradi
 * Brend yo'q bo'lsa — standart mavzu
 */
export default function BrandedTheme({ theme, children }: BrandedThemeProps) {
  const applyTheme = useCallback(() => {
    const root = document.documentElement;

    if (theme) {
      root.style.setProperty('--brand-primary', theme.primaryColor);
      root.style.setProperty('--brand-secondary', theme.secondaryColor);
      root.style.setProperty('--brand-bg-image', theme.bgImageUrl ? `url(${theme.bgImageUrl})` : 'none');
      root.style.setProperty('--brand-logo-url', theme.brandLogoUrl ? `url(${theme.brandLogoUrl})` : 'none');
      root.style.setProperty('--brand-name', `"${theme.brandName}"`);
    } else {
      // Standart qiymatlarga qaytarish
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-secondary');
      root.style.removeProperty('--brand-bg-image');
      root.style.removeProperty('--brand-logo-url');
      root.style.removeProperty('--brand-name');
    }
  }, [theme]);

  useEffect(() => {
    applyTheme();

    return () => {
      // Komponent unmount bo'lganda standart mavzuga qaytish
      const root = document.documentElement;
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-secondary');
      root.style.removeProperty('--brand-bg-image');
      root.style.removeProperty('--brand-logo-url');
      root.style.removeProperty('--brand-name');
    };
  }, [applyTheme]);

  return (
    <div
      className={theme ? 'branded-room' : ''}
      style={{
        minHeight: '100%',
        backgroundImage: theme?.bgImageUrl ? `url(${theme.bgImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      {/* Qorong'u overlay (brend fonida) */}
      {theme?.bgImageUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
            zIndex: 0,
          }}
        />
      )}

      {/* Brend logo */}
      {theme?.brandLogoUrl && (
        <img
          src={theme.brandLogoUrl}
          alt={theme.brandName}
          style={{
            position: 'absolute',
            top: 'var(--space-md)',
            left: '50%',
            transform: 'translateX(-50%)',
            maxHeight: '36px',
            maxWidth: '120px',
            objectFit: 'contain',
            opacity: 0.85,
            zIndex: 2,
          }}
        />
      )}

      {/* Brend nomi pastda */}
      {theme?.brandName && (
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--space-sm)',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            whiteSpace: 'nowrap',
            zIndex: 2,
          }}
        >
          {theme.brandName}
        </div>
      )}

      {/* Kontent */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
