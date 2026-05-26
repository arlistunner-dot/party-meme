import { useEffect, useState } from 'react';
import type { SpecialCardEvent } from '@/types/game';

interface SpecialCardsProps {
  event: SpecialCardEvent | null;
  onComplete?: () => void;
}

const eventConfig = {
  chaos: {
    icon: '🌪️',
    title: 'CHAOS METER',
    color: 'var(--neon-purple)',
    description: 'Xonada 92% Chaos!',
  },
  fusion: {
    icon: '🔥',
    title: 'MEME FUSION',
    color: 'var(--neon-pink)',
    description: 'Ikki karta birlashib yangi super javob!',
  },
  infection: {
    icon: '🦠',
    title: 'INFECTION CARD',
    color: 'var(--neon-green)',
    description: 'Barcha faqat 1 SO\'Z bilan javob beradi!',
  },
};

export default function SpecialCards({ event, onComplete }: SpecialCardsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [event, onComplete]);

  if (!event || !isVisible) return null;

  const config = eventConfig[event.type];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 600,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-lg)',
          animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Ikonka */}
        <div
          style={{
            fontSize: '72px',
            animation: 'bounce 0.6s ease-in-out infinite',
          }}
        >
          {config.icon}
        </div>

        {/* Sarlavha */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            color: config.color,
            textShadow: `0 0 20px ${config.color}`,
            letterSpacing: '3px',
            textAlign: 'center',
          }}
        >
          {config.title}
        </div>

        {/* Tavsif */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            maxWidth: '280px',
          }}
        >
          {event.description || config.description}
        </div>
      </div>
    </div>
  );
}
