import Avatar from '@/components/common/Avatar';

interface PlayerSlotProps {
  username: string;
  avatarUrl: string | null;
  rank?: string;
  isReady: boolean;
  isHost: boolean;
  isEmpty?: boolean;
  seatNumber: number;
}

export default function PlayerSlot({
  username,
  avatarUrl,
  rank,
  isReady,
  isHost,
  isEmpty = false,
  seatNumber,
}: PlayerSlotProps) {
  // Bo'sh o'rin
  if (isEmpty) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
          minWidth: '80px',
          opacity: 0.4,
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '2px dashed rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: 'var(--text-muted)',
          }}
        >
          +
        </div>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          O'rin {seatNumber}
        </span>
      </div>
    );
  }

  // To'ldirilgan o'rin
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-lg)',
        background: isReady
          ? 'rgba(46, 213, 115, 0.08)'
          : 'rgba(255, 255, 255, 0.04)',
        border: `2px solid ${
          isReady ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 255, 255, 0.06)'
        }`,
        minWidth: '80px',
        transition: 'all var(--transition-normal)',
        animation: 'fadeUp 0.3s ease forwards',
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        <Avatar
          src={avatarUrl}
          name={username}
          size="md"
          rank={rank}
          isOnline
        />

        {/* Host belgisi */}
        {isHost && (
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--neon-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              border: '2px solid var(--bg-primary)',
            }}
          >
            👑
          </div>
        )}
      </div>

      {/* Ism */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          maxWidth: '70px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {username}
      </span>

      {/* Tayyor holat */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          fontWeight: 700,
          color: isReady ? 'var(--accent-success)' : 'var(--text-muted)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        {isReady ? 'TAYYOR' : 'KUTILMOQDA'}
      </div>
    </div>
  );
}
