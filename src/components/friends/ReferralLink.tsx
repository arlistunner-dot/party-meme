import { useState, useCallback } from 'react';
import { Button } from '@/components/common';
import { useToast } from '@/components/common/Toast';
import { copyToClipboard } from '@/utils/helpers';
import { useAuthStore } from '@/store/authStore';
import { hapticSuccess } from '@/config/telegram';

export default function ReferralLink() {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralLink = `https://t.me/party_meme_bot?start=${user?.telegramId || ''}`;

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(referralLink);
    if (success) {
      setCopied(true);
      hapticSuccess();
      toast('Havola nusxalandi!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralLink, toast]);

  const handleShare = useCallback(() => {
    const text = 'Party Meme o\'yinini sinab ko\'r! 🎮🃏';
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [referralLink]);

  return (
    <div
      style={{
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(155, 93, 229, 0.1), rgba(0, 180, 216, 0.1))',
        border: '1px solid rgba(155, 93, 229, 0.2)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-sm)',
        }}
      >
        🤝 Do'stlarni taklif qilish
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-md)',
        }}
      >
        Har bir faol do'st uchun +100 tanga olasiz!
      </p>

      {/* Havola */}
      <div
        style={{
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.3)',
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-md)',
          wordBreak: 'break-all',
          textAlign: 'center',
        }}
      >
        {referralLink}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <Button variant="primary" size="sm" fullWidth onClick={handleShare}>
          ULASHISH
        </Button>
        <Button
          variant={copied ? 'success' : 'ghost'}
          size="sm"
          fullWidth
          onClick={handleCopy}
        >
          {copied ? 'NUSXALANDI' : 'NUSXALASH'}
        </Button>
      </div>
    </div>
  );
}
