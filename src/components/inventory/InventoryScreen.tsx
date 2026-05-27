import { useState, useEffect } from 'react';
import { useCards } from '@/hooks/useCards';
import { useAuthStore } from '@/store/authStore';
import { hapticImpact, hapticSuccess, hapticSelection } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';
import { formatNumber } from '@/utils/formatters';

type InventoryTab = 'my_cards' | 'create' | 'packs';

interface InventoryScreenProps {
  onNavigate: (tab: string) => void;
}

// Paketlar ro'yxati — karta toifalari
const PACKS = [
  {
    id: 'standard',
    name: 'Standart',
    icon: '🎴',
    description: 'Asosiy kartalar — doimo mavjud',
    cards: 2000,
    priceCoin: 0,
    priceStar: 0,
    free: true,
    color: '#6366f1',
  },
  {
    id: 'sport',
    name: 'Sport',
    icon: '⚽',
    description: 'Futbol, basketbol va sport memlari',
    cards: 300,
    priceCoin: 200,
    priceStar: 0,
    free: false,
    color: '#2ed573',
  },
  {
    id: 'lifestyle',
    name: 'Hayot',
    icon: '🏠',
    description: 'Kundalik hayot, ovqat, sayohat',
    cards: 400,
    priceCoin: 200,
    priceStar: 0,
    free: false,
    color: '#ffa502',
  },
  {
    id: 'tech',
    name: 'Texnologiya',
    icon: '💻',
    description: 'IT, o\'yinlar, gadjetlar',
    cards: 300,
    priceCoin: 200,
    priceStar: 0,
    free: false,
    color: '#00b4d8',
  },
  {
    id: 'national',
    name: 'Milliy',
    icon: '🇺🇿',
    description: 'O\'zbek madaniyati va an\'analari',
    cards: 250,
    priceCoin: 0,
    priceStar: 0,
    free: true,
    color: '#1e90ff',
  },
  {
    id: 'adult',
    name: '18+',
    icon: '🔞',
    description: 'Kattalar uchun kontent',
    cards: 400,
    priceCoin: 0,
    priceStar: 50,
    free: false,
    color: '#ff4757',
  },
  {
    id: 'exclusive',
    name: 'Eksklyuziv',
    icon: '💎',
    description: 'Noyob va premium kartalar',
    cards: 100,
    priceCoin: 0,
    priceStar: 100,
    free: false,
    color: '#9b5de5',
  },
];

export default function InventoryScreen({ onNavigate }: InventoryScreenProps) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { myCards, loadMyCards } = useCards();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<InventoryTab>('my_cards');
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('purchased_packs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['standard', 'national'];
  });

  useEffect(() => {
    loadMyCards();
  }, [loadMyCards]);

  const tabs: { id: InventoryTab; label: string; icon: string }[] = [
    { id: 'my_cards', label: 'Kartalarim', icon: '🎴' },
    { id: 'create', label: 'Yaratish', icon: '✏️' },
    { id: 'packs', label: 'Paketlar', icon: '📦' },
  ];

  // Paket sotib olish
  const handleBuyPack = (pack: typeof PACKS[0]) => {
    const currentUser = user || { coinBalance: 2350, starBalance: 15 };

    if (pack.priceCoin > 0 && currentUser.coinBalance < pack.priceCoin) {
      hapticImpact('heavy');
      toast(`Tanga yetarli emas! ${pack.priceCoin} 🪙 kerak`, 'error');
      return;
    }

    if (pack.priceStar > 0 && currentUser.starBalance < pack.priceStar) {
      hapticImpact('heavy');
      toast(`Stars yetarli emas! ${pack.priceStar} ⭐ kerak`, 'error');
      return;
    }

    // Balandan yechish
    const newCoin = currentUser.coinBalance - pack.priceCoin;
    const newStar = currentUser.starBalance - pack.priceStar;

    if (user) {
      setUser({ ...user, coinBalance: newCoin, starBalance: newStar } as any);
    }

    // Paketni qo'shish
    const updated = [...purchasedPacks, pack.id];
    setPurchasedPacks(updated);
    localStorage.setItem('purchased_packs', JSON.stringify(updated));

    hapticSuccess();
    toast(`${pack.name} paketi sotib olindi!`, 'success');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            hapticImpact('light');
            onNavigate('home');
          }}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#fff',
          }}
        >
          ←
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#fff',
            margin: 0,
          }}
        >
          INVENTAR
        </h1>
        <div style={{ width: '34px' }} />
      </div>

      {/* TAB TUGMALARI */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          padding: '0 16px',
          flexShrink: 0,
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
                color: isActive ? '#ff006e' : 'rgba(255,255,255,0.4)',
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

      {/* KONTENT */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 8px)',
          overflowY: 'auto',
        }}
      >
        {/* === KARTALARIM === */}
        {activeTab === 'my_cards' && (
          <MyCardsView cards={myCards} />
        )}

        {/* === YARATISH === */}
        {activeTab === 'create' && (
          <CreateCardView onCreated={() => setActiveTab('my_cards')} />
        )}

        {/* === PAKETLAR === */}
        {activeTab === 'packs' && (
          <PacksView
            packs={PACKS}
            purchasedPacks={purchasedPacks}
            onBuy={handleBuyPack}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// KARTALARIM BO'LIMI
// ============================================

function MyCardsView({ cards }: { cards: any[] }) {
  if (cards.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '48px', marginBottom: '16px' }}>🎴</span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '8px',
          }}
        >
          Kartalar yo'q
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            maxWidth: '240px',
          }}
        >
          O'yinda random berilgan kartalar shu yerda ko'rinadi
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
      }}
    >
      {cards.map((card: any, i: number) => (
        <div
          key={card.id || i}
          style={{
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            animation: 'fadeUp 0.3s ease forwards',
            animationDelay: `${i * 0.05}s`,
            opacity: 0,
          }}
        >
          {/* Karta rasmi */}
          <div
            style={{
              width: '100%',
              height: '120px',
              background: card.imageUrl
                ? `url(${card.imageUrl}) center/cover`
                : 'linear-gradient(135deg, rgba(155,93,229,0.2), rgba(255,0,110,0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
            }}
          >
            {!card.imageUrl && (card.icon || '🃏')}
          </div>

          {/* Karta ma'lumoti */}
          <div style={{ padding: '10px' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {card.title || 'Karta'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                {card.category || 'Standart'}
              </span>
              {card.power && (
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#ff006e',
                  }}
                >
                  ⚡{card.power}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// YARATISH BO'LIMI
// ============================================

function CreateCardView({ onCreated }: { onCreated: () => void }) {
  const { toast } = useToast();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '48px', marginBottom: '16px' }}>✏️</span>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '8px',
        }}
      >
        Karta yaratish
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
          maxWidth: '260px',
          marginBottom: '20px',
        }}
      >
        O'z kartangizni yarating va o'yinda ishlating
      </div>
      <button
        onClick={() => {
          hapticImpact('medium');
          toast('Karta yaratish — tez orada', 'success');
        }}
        style={{
          padding: '12px 28px',
          borderRadius: '12px',
          border: 'none',
          background: 'linear-gradient(135deg, #ff006e, #ff4757)',
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
          fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(255,0,110,0.3)',
        }}
      >
        YARATISH
      </button>
    </div>
  );
}

// ============================================
// PAKETLAR BO'LIMI
// ============================================

function PacksView({
  packs,
  purchasedPacks,
  onBuy,
}: {
  packs: typeof PACKS;
  purchasedPacks: string[];
  onBuy: (pack: typeof PACKS[0]) => void;
}) {
  const freePacks = packs.filter((p) => p.free);
  const paidPacks = packs.filter((p) => !p.free);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Bepul paketlar */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            margin: '0 0 10px',
            letterSpacing: '1px',
          }}
        >
          🆓 BEPUL PAKETLAR
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {freePacks.map((pack) => {
            const owned = purchasedPacks.includes(pack.id);
            return (
              <div
                key={pack.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: owned
                    ? `linear-gradient(135deg, ${pack.color}11, ${pack.color}08)`
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${owned ? `${pack.color}33` : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                {/* Ikonka */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${pack.color}22, ${pack.color}11)`,
                    border: `1px solid ${pack.color}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                  }}
                >
                  {pack.icon}
                </div>

                {/* Ma'lumot */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {pack.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.4)',
                      marginTop: '2px',
                    }}
                  >
                    {pack.description}
                  </div>
                </div>

                {/* Holat */}
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(46,213,115,0.12)',
                    border: '1px solid rgba(46,213,115,0.2)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#2ed573',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ✓ MAVJUD
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pullik paketlar */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            margin: '0 0 10px',
            letterSpacing: '1px',
          }}
        >
          🛒 SOTIB OLISH
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {paidPacks.map((pack) => {
            const owned = purchasedPacks.includes(pack.id);
            const priceText = pack.priceCoin > 0
              ? `${pack.priceCoin} 🪙`
              : `${pack.priceStar} ⭐`;

            return (
              <div
                key={pack.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: owned
                    ? `linear-gradient(135deg, ${pack.color}11, ${pack.color}08)`
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${owned ? `${pack.color}33` : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                {/* Ikonka */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${pack.color}22, ${pack.color}11)`,
                    border: `1px solid ${pack.color}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                  }}
                >
                  {pack.icon}
                </div>

                {/* Ma'lumot */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {pack.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.4)',
                      marginTop: '2px',
                    }}
                  >
                    {pack.cards} ta karta
                  </div>
                </div>

                {/* Tugma — sotib olingan yoki sotib olish */}
                {owned ? (
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(46,213,115,0.12)',
                      border: '1px solid rgba(46,213,115,0.2)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#2ed573',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ✓ OLINGAN
                  </div>
                ) : (
                  <button
                    onClick={() => onBuy(pack)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: `linear-gradient(135deg, ${pack.color}, ${pack.color}cc)`,
                      fontFamily: 'var(--font-display)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fff',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    {priceText}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tushuntirish */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.6,
          }}
        >
          📦 Sotib olgan paketlaringizdagi kartalar o'yin boshlanganda random tarzda tarqatiladi.
          Sotib olmagan toifa kartalari tushmaydi.
        </div>
      </div>
    </div>
  );
}
