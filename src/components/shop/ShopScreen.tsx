import { useState } from 'react';
import Header from '@/components/common/Header';
import CoinPacks from './CoinPacks';
import SlotUpgrade from './SlotUpgrade';
import ExclusiveCards from './ExclusiveCards';
import ExclusiveDecks from './ExclusiveDecks';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/common/Toast';
import { formatNumber } from '@/utils/formatters';
import { hapticSelection, hapticImpact, hapticError } from '@/config/telegram';
import { apiRequest } from '@/config/api';

type ShopTab = 'cards' | 'decks' | 'coins' | 'slots';

interface ShopScreenProps {
  onNavigate: (tab: string) => void;
}

export default function ShopScreen({ onNavigate }: ShopScreenProps) {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ShopTab>('cards');
  const [isLoading, setIsLoading] = useState(false);

  const tabs: { id: ShopTab; label: string; icon: string }[] = [
    { id: 'cards', label: 'Kartalar', icon: '🃏' },
    { id: 'decks', label: 'To\'plamlar', icon: '📚' },
    { id: 'coins', label: 'Tangalar', icon: '🪙' },
    { id: 'slots', label: 'Slotlar', icon: '📦' },
  ];

  const handleCardPurchase = async (cardId: string) => {
    setIsLoading(true);
    try {
      await apiRequest('/shop/buy-card', {
        method: 'POST',
        body: JSON.stringify({ cardId }),
      });
      hapticImpact('medium');
      toast('Karta sotib olindi!', 'success');
    } catch (err) {
      hapticError();
      const msg = err instanceof Error ? err.message : 'Xarid xatosi';
      toast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeckPurchase = (deckId: string) => {
    hapticImpact('medium');
    toast(`${deckId} to'plami sotib olindi!`, 'success');
  };

  const handleCoinPurchase = async (packageId: string) => {
    setIsLoading(true);
    try {
      await apiRequest('/shop/buy-coins', {
        method: 'POST',
        body: JSON.stringify({ packageId }),
      });
      hapticImpact('medium');
      toast('Xarid muvaffaqiyatli!', 'success');
    } catch (err) {
      hapticError();
      const msg = err instanceof Error ? err.message : 'Xarid xatosi';
      toast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotPurchase = async (count: number) => {
    setIsLoading(true);
    try {
      await apiRequest('/shop/buy-slots', {
        method: 'POST',
        body: JSON.stringify({ count }),
      });
      hapticImpact('medium');
      toast(`+${count} slot qo'shildi!`, 'success');
    } catch (err) {
      hapticError();
      const msg = err instanceof Error ? err.message : 'Xarid xatosi';
      toast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
      }}
    >
      <Header
        title="DO'KON"
        showBack
        onBack={() => onNavigate('home')}
      />

      {/* Balans panel */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '20px',
            background: 'rgba(255,215,0,0.06)',
            border: '1px solid rgba(255,215,0,0.12)',
          }}
        >
          <span style={{ fontSize: '14px' }}>🪙</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 700,
              color: '#ffd700',
            }}
          >
            {formatNumber(user?.coinBalance || 0)}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '20px',
            background: 'rgba(0,180,216,0.06)',
            border: '1px solid rgba(0,180,216,0.12)',
          }}
        >
          <span style={{ fontSize: '14px' }}>⭐</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 700,
              color: '#00b4d8',
            }}
          >
            {user?.starBalance || 0}
          </span>
        </div>
      </div>

      {/* Tab tugmalari */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '12px 16px 0',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                hapticSelection();
                setActiveTab(tab.id);
              }}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: '10px 10px 0 0',
                background: isActive
                  ? 'rgba(255, 0, 110, 0.1)'
                  : 'transparent',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid #ff006e'
                  : '2px solid transparent',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ff006e' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '13px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Kontent */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 16px)',
          overflowY: 'auto',
        }}
      >
        {activeTab === 'cards' && (
          <ExclusiveCards onPurchase={handleCardPurchase} isLoading={isLoading} />
        )}
        {activeTab === 'decks' && (
          <ExclusiveDecks onPurchase={handleDeckPurchase} />
        )}
        {activeTab === 'coins' && (
          <CoinPacks onPurchase={handleCoinPurchase} isLoading={isLoading} />
        )}
        {activeTab === 'slots' && (
          <SlotUpgrade onPurchase={handleSlotPurchase} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
