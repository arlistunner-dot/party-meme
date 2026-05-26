import { ReactNode, ButtonHTMLAttributes } from 'react';
import { hapticImpact } from '@/config/telegram';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--neon-pink), var(--accent-primary))',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 20px rgba(255, 0, 110, 0.3)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '2px solid var(--text-muted)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    border: 'none',
    boxShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, var(--accent-danger), #c0392b)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 20px rgba(255, 71, 87, 0.3)',
  },
  success: {
    background: 'linear-gradient(135deg, var(--accent-success), #218838)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 20px rgba(46, 213, 115, 0.3)',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: '8px 16px',
    fontSize: '13px',
    borderRadius: 'var(--radius-sm)',
  },
  md: {
    padding: '12px 24px',
    fontSize: '15px',
    borderRadius: 'var(--radius-md)',
  },
  lg: {
    padding: '16px 32px',
    fontSize: '18px',
    borderRadius: 'var(--radius-lg)',
  },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  style,
  onClick,
  ...rest
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    hapticImpact('light');
    onClick?.(e);
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    letterSpacing: '0.5px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : loading ? 0.7 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button
      {...rest}
      style={baseStyle}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading && (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            flexShrink: 0,
          }}
        />
      )}
      {!loading && icon && iconPosition === 'left' && <span>{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  );
}
