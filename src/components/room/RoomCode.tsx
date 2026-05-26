import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/utils/helpers';
import { useToast } from '@/components/common/Toast';
import { hapticSuccess } from '@/config/telegram';

interface RoomCodeProps {
  code: string;
}

export default function RoomCode({ code }: RoomCodeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setIsCopied(true);
      hapticSuccess();
      toast('Xona kodi nusxalandi!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [code, toast]);

  return (
    <div
      onClick={handleCopy}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}
      >
        Xona kodi
      </span>

      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '12px 20px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '2px dashed rgba(255, 255, 255, 0.15)',
          animation: isCopied ? 'room-code-copied 0.6s ease' : undefined,
        }}
      >
        {code.split('').map((char, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 700,
              color: isCopied ? 'var(--accent-success)' : 'var(--neon-pink)',
              textShadow: isCopied
                ? '0 0 10px var(--accent-success)'
                : '0 0 10px var(--neon-pink)',
              width: '28px',
              textAlign: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: isCopied ? 'var(--accent-success)' : 'var(--text-muted)',
          transition: 'color var(--transition-fast)',
        }}
      >
        {isCopied ? 'Nusxalandi!' : 'Bosib nusxalash'}
      </span>
    </div>
  );
}
