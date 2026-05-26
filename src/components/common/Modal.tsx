import { ReactNode, useEffect } from 'react';
import { hapticImpact } from '@/config/telegram';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const sizeMap = {
  sm: '320px',
  md: '400px',
  lg: '90%',
  full: '100%',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnOverlay = true,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
    padding: 'var(--space-md)',
  };

  const contentStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    width: size === 'full' ? '100%' : sizeMap[size],
    maxWidth: size === 'full' ? '100%' : sizeMap[size],
    maxHeight: size === 'full' ? '100vh' : '85vh',
    overflowY: 'auto',
    animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: 'var(--shadow-lg)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-lg) var(--space-lg) var(--space-md)',
    borderBottom: title ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
  };

  const closeBtnStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  };

  return (
    <div
      style={overlayStyle}
      onClick={() => {
        if (closeOnOverlay) {
          hapticImpact('light');
          onClose();
        }
      }}
    >
      <div
        style={contentStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div style={headerStyle}>
            {title && (
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                }}
              >
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                style={closeBtnStyle}
                onClick={() => {
                  hapticImpact('light');
                  onClose();
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div style={{ padding: 'var(--space-lg)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
