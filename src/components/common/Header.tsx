import { ReactNode } from 'react';
import Avatar from './Avatar';
import { hapticImpact } from '@/config/telegram';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  showAvatar?: boolean;
  avatarSrc?: string | null;
  avatarName?: string;
  transparent?: boolean;
}

export default function Header({
  title,
  showBack = false,
  onBack,
  rightAction,
  showAvatar = false,
  avatarSrc,
  avatarName = '',
  transparent = false,
}: HeaderProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '52px',
        padding: '0 16px',
        background: transparent
          ? 'transparent'
          : 'rgba(10, 10, 15, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: transparent
          ? 'none'
          : '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Chap tomon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '72px',
        }}
      >
        {showBack && (
          <button
            onClick={() => {
              hapticImpact('light');
              onBack?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Markaz */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        {title && (
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* O'ng tomon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '72px',
          justifyContent: 'flex-end',
        }}
      >
        {rightAction}
        {showAvatar && (
          <Avatar src={avatarSrc} name={avatarName} size="sm" />
        )}
      </div>
    </header>
  );
}
