import { useState } from 'react';
import Header from '@/components/common/Header';
import Avatar from '@/components/common/Avatar';
import ReferralLink from './ReferralLink';
import { BADGES } from '@/config/constants';

interface Friend {
  id: number;
  firstName: string;
  username: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
}

interface FriendsScreenProps {
  onNavigate: (tab: string) => void;
}

export default function FriendsScreen({ onNavigate }: FriendsScreenProps) {
  const [friends] = useState<Friend[]>([]);
  const [pendingInvites] = useState(0);

  return (
    <div className="app-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title="DO'STLAR" onBack={() => onNavigate('home')} showBack />

      <div
        style={{
          flex: 1,
          padding: 'var(--space-lg)',
          paddingBottom: 'calc(var(--nav-height) + var(--space-xl))',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg)',
        }}
      >
        {/* Referral havolasi */}
        <ReferralLink />

        {/* Do'stlar soni */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-xl)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {friends.length}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Do'stlar
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--neon-pink)' }}>
              {pendingInvites}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Takliflar
            </div>
          </div>
        </div>

        {/* Do'stlar ro'yxati */}
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-md)',
            }}
          >
            DO'STLAR RO'YXATI
          </h3>

          {friends.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-xl)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>👋</div>
              Hali do'stlar yo'q. Yuqoridagi havolani ulashing!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: '10px var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <Avatar
                    src={friend.avatarUrl}
                    name={friend.firstName}
                    size="sm"
                    isOnline={friend.isOnline}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {friend.firstName}
                    </div>
                    {friend.username && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                        @{friend.username}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
