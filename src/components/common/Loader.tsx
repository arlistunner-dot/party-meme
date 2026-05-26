interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 56,
};

export default function Loader({ size = 'md', text, fullScreen = false }: LoaderProps) {
  const px = sizeMap[size];

  const spinnerStyle: React.CSSProperties = {
    width: px,
    height: px,
    border: `3px solid rgba(255, 255, 255, 0.1)`,
    borderTopColor: 'var(--neon-pink)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  };

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-md)',
      }}
    >
      <div style={spinnerStyle} />
      {text && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}
