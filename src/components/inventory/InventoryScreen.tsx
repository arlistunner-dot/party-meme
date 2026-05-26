import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import MyCards from './MyCards';
import CardCreate from './CardCreate';
import { useCards } from '@/hooks/useCards';
import { useAuthStore } from '@/store/authStore';
import { hapticSelection } from '@/config/telegram';
import { formatSlots } from '@/utils/formatters';
import { getRankByRating } from '@/utils/helpers';
import { RANKS } from '@/config/constants';

type InventoryTab = 'my_cards' | 'create' | 'decks';

interface InventoryScreenProps {
  onNavigate: (tab: string) => void;
}

export default function InventoryScreen({ onNavigate }: InventoryScreenProps) {
  const user = useAuthStore((s) => s.user);
  const { myCards, loadMyCards, deleteCard } = useCards();
  const [activeTab, setActiveTab] = useState<InventoryTab>('my_cards');

  useEffect(() => {
    loadMyCards();
  }, [loadMyCards]);

  const rank = user ? getRankByRating(user.rating) : 'newbie';
  const rankInfo = RANKS.find((r) => r.id === rank);
  const canCreate = rank !== 'newbie';
  const maxSlots = user?.maxCardSlots || 5;
  const usedSlots = myCards.length;

  const tabs: { id: InventoryTab; label: string; icon: string }[] = [
    { id: 'my_cards', label: 'Kartalarim', icon: '🎴' },
    { id: 'create', label: 'Yaratish', icon: '✏️' },
    { id: 'decks', label: 'To\'plamlar', icon: '📚' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}
    >
      <Header
        title="INVENTAR"
        showBack
        onBack={() => onNavigate('home')}
      />

      {/* Slot holati — har doim ko'rinadi */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Slot progress bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            Karta joylari
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 700,
              color:
                usedSlots >= maxSlots
                  ? 'var(--accent-danger)'
                  : 'var(--text-primary)',
            }}
          >
            {formatSlots(usedSlots, maxSlots)}
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, (usedSlots / maxSlots) * 100)}%`,
              height: '100%',
              borderRadius: '3px',
              background:
                usedSlots >= maxSlots
                  ? 'var(--accent-danger)'
                  : 'linear-gradient(90deg, var(--neon-pink), var(--neon-purple))',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Daraja ma'lumoti */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            Daraja: {rankInfo?.nameUz || 'Yangi'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: canCreate ? 'var(--neon-blue)' : 'var(--text-muted)',
            }}
          >
            Yaratish: {rankInfo?.cardCreation || 'Yo\'q'}
          </span>
        </div>
      </div>

      {/* Tab tugmalari */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '12px 16px 0',
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
                padding: '10px 8px',
                borderRadius: '10px 10px 0 0',
                background: isActive
                  ? 'rgba(255, 0, 110, 0.1)'
                  : 'transparent',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid #ff006e'
                  : '2px solid transparent',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ff006e' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{tab.icon}</span>
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
        {activeTab === 'my_cards' && (
          <MyCards cards={myCards} maxSlots={maxSlots} onDelete={deleteCard} />
        )}

        {activeTab === 'create' && (
          <CardCreate onCreated={() => setActiveTab('my_cards')} />
        )}

        {activeTab === 'decks' && (
          <DecksView />
        )}
      </div>
    </div>
  );
}

// ---- To'plamlar bo'limi ----

function DecksView() {
  const decks = [
    { id: 'standard', name: 'Standart', icon: '🎴', cards: 2000, free: true, color: '#3742fa' },
    { id: 'national', name: 'Milliy', icon: '🇺🇿', cards: 500, free: true, color: '#2ed573' },
    { id: 'tech', name: 'Texnologiya', icon: '💻', cards: 300, free: false, price: '200 🪙', color: '#00b4d8' },
    { id: 'sport', name: 'Sport', icon: '⚽', cards: 250, free: false, price: '200 🪙', color: '#ffa502' },
    { id: 'adult', name: '18+', icon: '🔞', cards: 400, free: false, price: '⭐', color: '#ff4757' },
    { id: 'exclusive', name: 'Eksklyuziv', icon: '💎', cards: 100, free: false, price: '300 ⭐', color: '#9b5de5' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {decks.map((deck, i) => (
        <div
          key={deck.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            animation: 'fadeUp 0.3s ease forwards',
            animationDelay: `${i * 0.05}s`,
            opacity: 0,
          }}
        >
          {/* Ikonka */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${deck.color}22, ${deck.color}11)`,
              border: `1px solid ${deck.color}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
            }}
          >
            {deck.icon}
          </div>

          {/* Ma'lumot */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {deck.name}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              {deck.cards.toLocaleString()} ta karta
            </div>
          </div>

          {/* Narx */}
          <div
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              background: deck.free
                ? 'rgba(46, 213, 115, 0.12)'
                : 'rgba(255, 215, 0, 0.1)',
              border: `1px solid ${deck.free ? 'rgba(46,213,115,0.2)' : 'rgba(255,215,0,0.15)'}`,
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              fontWeight: 700,
              color: deck.free ? '#2ed573' : '#ffd700',
            }}
          >
            {deck.free ? 'BEPUL' : deck.price}
          </div>
        </div>
      ))}
    </div>
  );
}
