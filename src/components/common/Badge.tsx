interface BadgeProps {
  icon: string;
  name: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  unlocked?: boolean;
  onClick?: () => void;
}

export default function Badge({
  icon,
  name,
  description,
  size = 'md',
  unlocked = true,
  onClick,
}: BadgeProps) {
  const sizeMap = {
    sm: { iconSize: '20px', padding: '6px', nameSize: '10px' },
    md: { iconSize: '28px', padding: '10px', nameSize: '11px' },
    lg: { iconSize: '40px', padding: '14px', nameSize: '13px' },
  };

  const { iconSize, padding, nameSize } = sizeMap[size];

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding,
        borderRadius: 'var(--radius-md)',
        background: unlocked
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(255, 255, 255, 0.02)',
        border: '1px solid',
        borderColor: unlocked
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.04)',
        opacity: unlocked ? 1 : 0.4,
        filter: unlocked ? 'none' : 'grayscale(1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)',
        minWidth: '60px',
      }}
    >
      <span style={{ fontSize: iconSize, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: nameSize,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
    </div>
  );
}
