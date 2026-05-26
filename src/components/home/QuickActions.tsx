import Button from '@/components/common/Button';
import { hapticImpact } from '@/config/telegram';

interface QuickActionsProps {
  onPlay: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export default function QuickActions({ onPlay, onCreateRoom, onJoinRoom }: QuickActionsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        padding: '0 var(--space-lg)',
      }}
    >
      {/* Asosiy tugma – PLAY NOW */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => {
          hapticImpact('heavy');
          onPlay();
        }}
        style={{
          fontSize: '20px',
          padding: '18px 32px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, var(--neon-pink), #ff006e)',
          boxShadow: '0 6px 30px rgba(255, 0, 110, 0.4)',
          letterSpacing: '2px',
        }}
      >
        🎮 O'YNASH
      </Button>

      {/* Qo'shimcha tugmalar */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => {
            hapticImpact('medium');
            onCreateRoom();
          }}
          style={{
            flex: 1,
            borderColor: 'var(--neon-blue)',
            color: 'var(--neon-blue)',
          }}
        >
          + XONA YARATISH
        </Button>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => {
            hapticImpact('medium');
            onJoinRoom();
          }}
          style={{
            flex: 1,
            borderColor: 'var(--neon-green)',
            color: 'var(--neon-green)',
          }}
        >
          🔗 XONAGA QO'SHILISH
        </Button>
      </div>
    </div>
  );
}
