import { ASSETS } from '@/config/constants';

interface AvatarProps {
  src: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  rank?: string;
  borderColor?: string;
}

const sizeMap = {
  xs: { size: 28, fontSize: '11px', initial: '12px' },
  sm: { size: 36, fontSize: '13px', initial: '14px' },
  md: { size: 48, fontSize: '16px', initial: '18px' },
  lg: { size: 64, fontSize: '20px', initial: '22px' },
  xl: { size: 96, fontSize: '28px', initial: '32px' },
};

const rankColors: Record<string, string> = {
  newbie: 'var(--text-muted)',
  funny: 'var(--neon-green)',
  memelord: 'var(--neon-blue)',
  factory: 'var(--neon-purple)',
  legend: 'var(--neon-yellow)',
  ambassador: 'var(--neon-pink)',
};

export default function Avatar({
  src,
  name,
  size = 'md',
  isOnline,
  rank,
  borderColor,
}: AvatarProps) {
  const { size: px, fontSize, initial } = sizeMap[size];
  const border = borderColor || (rank ? rankColors[rank] : 'var(--text-muted)');
  const firstLetter = name.charAt(0).toUpperCase();

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: px,
    height: px,
    flexShrink: 0,
  };

  const avatarStyle: React.CSSProperties = {
    width: px,
    height: px,
    borderRadius: '50%',
    border: `2px solid ${border}`,
    objectFit: 'cover',
    background: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const placeholderStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: initial,
    color: border,
    background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
  };

  const onlineStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: Math.max(px * 0.25, 8),
    height: Math.max(px * 0.25, 8),
    borderRadius: '50%',
    background: 'var(--accent-success)',
    border: '2px solid var(--bg-primary)',
  };

  return (
    <div style={containerStyle}>
      <div style={avatarStyle}>
        {src ? (
          <img
            src={src}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div style={placeholderStyle}>{firstLetter}</div>
        )}
      </div>
      {isOnline && <div style={onlineStyle} />}
    </div>
  );
}
