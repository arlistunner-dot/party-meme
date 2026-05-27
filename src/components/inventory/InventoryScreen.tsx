import { useState, useEffect } from 'react';
import { useCards } from '@/hooks/useCards';
import { useAuthStore } from '@/store/authStore';
import { hapticImpact, hapticSuccess, hapticError, hapticSelection } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';
import { formatNumber } from '@/utils/formatters';

type InventoryTab = 'my_cards' | 'create' | 'packs';

interface InventoryScreenProps {
  onNavigate: (tab: string) => void;
}

const MAX_SLOTS = 5;

// Paketlar
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

  // Inventardagi kartalar (localStorage demo)
  const [inventoryCards, setInventoryCards] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('inventory_cards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Tanlangan 2 ta karta (o'ying olib kirish uchun)
  const [selectedForGame, setSelectedForGame] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('selected_game_cards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    loadMyCards();
  }, [loadMyCards]);

  // Saqlash
  const saveInventory = (cards: any[]) => {
    setInventoryCards(cards);
    localStorage.setItem('inventory_cards', JSON.stringify(cards));
  };

  const saveSelectedGame = (ids: string[]) => {
    setSelectedForGame(ids);
    localStorage.setItem('selected_game_cards', JSON.stringify(ids));
  };

  // Kartani o'yin uchun tanlash / bekor qilish
  const toggleCardForGame = (cardId: string) => {
    hapticImpact('light');

    if (selectedForGame.includes(cardId)) {
      // Bekor qilish
      saveSelectedGame(selectedForGame.filter((id) => id !== cardId));
    } else {
      if (selectedForGame.length >= 2) {
        hapticError();
        toast('Faqat 2 ta karta tanlash mumkin!', 'error');
        return;
      }
      saveSelectedGame([...selectedForGame, cardId]);
    }
  };

  // Kartani o'chirish
  const removeCard = (cardId: string) => {
    hapticImpact('medium');
    const updated = inventoryCards.filter((c) => c.id !== cardId);
    saveInventory(updated);
    // Tanlangan bo'lsa o'chirish
    if (selectedForGame.includes(cardId)) {
      saveSelectedGame(selectedForGame.filter((id) => id !== cardId));
    }
    toast('Karta o\'chirildi', 'success');
  };

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

    const newCoin = currentUser.coinBalance - pack.priceCoin;
    const newStar = currentUser.starBalance - pack.priceStar;

    if (user) {
      setUser({ ...user, coinBalance: newCoin, starBalance: newStar } as any);
    }

    const updated = [...purchasedPacks, pack.id];
    setPurchasedPacks(updated);
    localStorage.setItem('purchased_packs', JSON.stringify(updated));

    hapticSuccess();
    toast(`${pack.name} paketi sotib olindi!`, 'success');
  };

  const usedSlots = inventoryCards.length;

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
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 700,
            color: usedSlots >= MAX_SLOTS ? '#ff4757' : '#2ed573',
          }}
        >
          {usedSlots}/{MAX_SLOTS}
        </div>
      </div>

      {/* SLOT HOLATI */}
      <div
        style={{
          padding: '0 16px 10px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Karta joylari — 2 tasini o'yinga olib kirasiz
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#00b4d8',
            }}
          >
            Tanlangan: {selectedForGame.length}/2
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '5px',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(usedSlots / MAX_SLOTS) * 100}%`,
              height: '100%',
              borderRadius: '3px',
              background:
                usedSlots >= MAX_SLOTS
                  ? '#ff4757'
                  : 'linear-gradient(90deg, #ff006e, #9b5de5)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
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
          <MyCardsView
            cards={inventoryCards}
            selectedForGame={selectedForGame}
            onToggleSelect={toggleCardForGame}
            onRemove={removeCard}
            maxSlots={MAX_SLOTS}
            purchasedPacks={purchasedPacks}
            onSaveCards={saveInventory}
          />
        )}

        {/* === YARATISH === */}
        {activeTab === 'create' && (
          <CreateCardView
            onCreated={() => setActiveTab('my_cards')}
            inventoryCards={inventoryCards}
            maxSlots={MAX_SLOTS}
            onSaveCards={saveInventory}
          />
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
// KARTALARIM — 5 TA SLOT
// ============================================

function MyCardsView({
  cards,
  selectedForGame,
  onToggleSelect,
  onRemove,
  maxSlots,
  purchasedPacks,
  onSaveCards,
}: {
  cards: any[];
  selectedForGame: string[];
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  maxSlots: number;
  purchasedPacks: string[];
  onSaveCards: (cards: any[]) => void;
}) {
  const { toast } = useToast();

  // 5 ta slot uchun placeholder
  const slots = Array.from({ length: maxSlots }).map((_, i) => {
    return cards[i] || null;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Slotlar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
        }}
      >
        {slots.map((card, i) => {
          if (!card) {
            // Bo'sh slot
            return (
              <div
                key={`empty-${i}`}
                style={{
                  height: '160px',
                  borderRadius: '14px',
                  border: '2px dashed rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '28px', opacity: 0.3 }}>🃏</span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.2)',
                  }}
                >
                  Slot {i + 1}
                </span>
              </div>
            );
          }

          // Karta bor
          const isSelected = selectedForGame.includes(card.id);

          return (
            <div
              key={card.id || i}
              style={{
                position: 'relative',
                borderRadius: '14px',
                background: isSelected
                  ? 'rgba(0,180,216,0.08)'
                  : 'rgba(255,255,255,0.04)',
                border: isSelected
                  ? '2px solid rgba(0,180,216,0.5)'
                  : '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => onToggleSelect(card.id)}
            >
              {/* Tanlash belgisi */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#00b4d8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#fff',
                    fontWeight: 700,
                    zIndex: 3,
                  }}
                >
                  ✓
                </div>
              )}

              {/* O'chirish tugmasi */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(card.id);
                }}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(255,71,87,0.3)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  zIndex: 3,
                  padding: 0,
                }}
              >
                ✕
              </button>

              {/* Karta rasmi */}
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  background: card.imageUrl
                    ? `url(${card.imageUrl}) center/cover`
                    : 'linear-gradient(135deg, rgba(155,93,229,0.2), rgba(255,0,110,0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                }}
              >
                {!card.imageUrl && (card.icon || '🃏')}
              </div>

              {/* Karta ma'lumoti */}
              <div style={{ padding: '8px 10px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {card.title || 'Karta'}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '9px',
                      color: 'rgba(255,255,255,0.4)',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px',
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
          );
        })}
      </div>

      {/* Ma'lumot */}
      {cards.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.6,
            }}
          >
            Paketlar bo'limidan karta sotib oling
            yoki o'yinda random kartalar tushadi.
            5 ta slot — 2 tasini o'yinga olib kirasiz.
          </div>
        </div>
      )}

      {/* Tanlangan kartalar ma'lumoti */}
      {selectedForGame.length > 0 && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(0,180,216,0.08)',
            border: '1px solid rgba(0,180,216,0.2)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
            }}
          >
            🎮 O'yinga {selectedForGame.length}/2 ta karta tanlandi.
            O'yinda +5 ta random karta beriladi (jami 7 ta).
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// YARATISH BO'LIMI
// ============================================

function CreateCardView({
  onCreated,
  inventoryCards,
  maxSlots,
  onSaveCards,
}: {
  onCreated: () => void;
  inventoryCards: any[];
  maxSlots: number;
  onSaveCards: (cards: any[]) => void;
}) {
  const { toast } = useToast();

  if (inventoryCards.length >= maxSlots) {
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
        <span style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '8px',
          }}
        >
          Slotlar to'ldi
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            maxWidth: '240px',
          }}
        >
          {maxSlots} ta karta joyi to'ldi. Avval bitta kartani o'chiring.
        </div>
      </div>
    );
  }

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
        O'z kartangizni yarating. {maxSlots - inventoryCards.length} ta slot bo'sh.
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
      {/* Bepul */}
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
          🆓 BEPUL TOIFALAR
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {freePacks.map((pack) => (
            <div
              key={pack.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${pack.color}11, ${pack.color}08)`,
                border: `1px solid ${pack.color}33`,
              }}
            >
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
              <div style={{ flex: 1 }}>
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
                  }}
                >
                  {pack.description}
                </div>
              </div>
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
          ))}
        </div>
      </div>

      {/* Pullik */}
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
            const priceText =
              pack.priceCoin > 0
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
                  border: `1px solid ${
                    owned ? `${pack.color}33` : 'rgba(255,255,255,0.05)'
                  }`,
                }}
              >
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
                <div style={{ flex: 1 }}>
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
                    }}
                  >
                    {pack.cards} ta karta · {pack.description}
                  </div>
                </div>
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
