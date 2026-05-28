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

  // Tanlangan 2 ta karta (o'yin olib kirish uchun)
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
          />
        )}

        {/* === YARATISH === */}
        {activeTab === 'create' && (
          <CreateCardView />
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
}: {
  cards: any[];
  selectedForGame: string[];
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  maxSlots: number;
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
// YARATISH BO'LIMI — Moderatsiya tizimi
// ============================================

function CreateCardView() {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardText, setCardText] = useState('');
  const [cardCategory, setCardCategory] = useState('sport');
  const [cardImage, setCardImage] = useState<string | null>(null);

  // Yaratilgan kartalar (demo localStorage)
  const [myCreatedCards, setMyCreatedCards] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('my_created_cards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const rating = user?.rating || 0;
  const canCreate = rating >= 1000;

  const categories = [
    { id: 'sport', name: 'Sport', icon: '⚽' },
    { id: 'lifestyle', name: 'Hayot', icon: '🏠' },
    { id: 'tech', name: 'Texnologiya', icon: '💻' },
    { id: 'national', name: 'Milliy', icon: '🇺🇿' },
    { id: 'adult', name: '18+', icon: '🔞' },
    { id: 'exclusive', name: 'Eksklyuziv', icon: '💎' },
  ];

  const saveCards = (cards: any[]) => {
    setMyCreatedCards(cards);
    localStorage.setItem('my_created_cards', JSON.stringify(cards));
  };

  const handleSubmit = () => {
    if (!cardTitle.trim()) {
      hapticError();
      toast('Karta nomini kiriting!', 'error');
      return;
    }
    if (!cardText.trim()) {
      hapticError();
      toast('Karta matnini kiriting!', 'error');
      return;
    }

    const newCard = {
      id: `created_${Date.now()}`,
      title: cardTitle.trim(),
      text: cardText.trim(),
      category: cardCategory,
      imageUrl: cardImage,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      usedCount: 0,
      winCount: 0,
      starsEarned: 0,
    };

    saveCards([...myCreatedCards, newCard]);

    hapticSuccess();
    toast('Karta moderatsiyaga yuborildi!', 'success');
    setShowForm(false);
    setCardTitle('');
    setCardText('');
    setCardCategory('sport');
    setCardImage(null);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCardImage(URL.createObjectURL(file));
    hapticSuccess();
  };

  const approvedCards = myCreatedCards.filter((c) => c.status === 'approved');
  const totalStarsEarned = approvedCards.reduce((sum, c) => sum + c.starsEarned, 0);
  const totalUses = approvedCards.reduce((sum, c) => sum + c.usedCount, 0);

  // Daraja yetarli emas
  if (!canCreate) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</span>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '8px',
          }}
        >
          Yaratish yopiq
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            maxWidth: '260px',
            lineHeight: 1.6,
            marginBottom: '16px',
          }}
        >
          Karta yaratish uchun reyting 1000 ga yetishi kerak.
          Hozirgi reyting:{' '}
          <strong style={{ color: '#ff006e' }}>{rating}</strong>
        </div>

        {/* Progress */}
        <div style={{ width: '100%', maxWidth: '240px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              {rating}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              1000
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
                width: `${Math.min(100, (rating / 1000) * 100)}%`,
                height: '100%',
                borderRadius: '3px',
                background: 'linear-gradient(90deg, #ff006e, #9b5de5)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* STATISTIKA */}
      {approvedCards.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
          }}
        >
          {[
            { icon: '🎴', value: String(approvedCards.length), label: 'Karta' },
            { icon: '🎮', value: String(totalUses), label: 'Ishlatilgan' },
            { icon: '⭐', value: String(totalStarsEarned), label: 'Stars' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: '10px 6px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '16px', marginBottom: '2px' }}>
                {item.icon}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#ffd700',
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YARATISH TUGMASI */}
      {!showForm && (
        <button
          onClick={() => {
            hapticImpact('medium');
            setShowForm(true);
          }}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '2px dashed rgba(255,0,110,0.3)',
            background: 'rgba(255,0,110,0.05)',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 700,
            color: '#ff006e',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '18px' }}>✏️</span>
          YANGI KARTA YARATISH
        </button>
      )}

      {/* YARATISH FORMASI */}
      {showForm && (
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            ✏️ Yangi karta
          </div>

          {/* Toifa tanlash */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '6px',
              }}
            >
              Toifa
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCardCategory(cat.id)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border:
                      cardCategory === cat.id
                        ? '1px solid rgba(255,0,110,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                    background:
                      cardCategory === cat.id
                        ? 'rgba(255,0,110,0.12)'
                        : 'rgba(255,255,255,0.04)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color:
                      cardCategory === cat.id
                        ? '#ff006e'
                        : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Karta nomi */}
          <input
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            placeholder="Karta nomi"
            maxLength={50}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* Karta matni */}
          <textarea
            value={cardText}
            onChange={(e) => setCardText(e.target.value)}
            placeholder="Karta matni — o'yinda ko'rinadigan yozuv"
            maxLength={200}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'none',
              minHeight: '60px',
            }}
          />

          {/* Rasm */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px dashed rgba(255,255,255,0.1)',
                background: cardImage
                  ? `url(${cardImage}) center/cover`
                  : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                minHeight: cardImage ? '80px' : '40px',
              }}
            >
              {!cardImage && (
                <>
                  <span>📷</span> Rasm qo'shish (ixtiyoriy)
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImagePick}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Tugmalar */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #ff006e, #ff4757)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              YUBORISH
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
            >
              BEKOR
            </button>
          </div>
        </div>
      )}

      {/* MENING KARTALARIM — moderatsiya holati */}
      {myCreatedCards.length > 0 && (
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
            📝 MENING KARTALARIM
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {myCreatedCards.map((card) => {
              const statusColors: Record<
                string,
                { bg: string; color: string; text: string }
              > = {
                pending: {
                  bg: 'rgba(255,165,0,0.1)',
                  color: '#ffa502',
                  text: '⏳ Kutilmoqda',
                },
                approved: {
                  bg: 'rgba(46,213,115,0.1)',
                  color: '#2ed573',
                  text: '✅ Tasdiqlangan',
                },
                rejected: {
                  bg: 'rgba(255,71,87,0.1)',
                  color: '#ff4757',
                  text: '❌ Rad etilgan',
                },
              };
              const status =
                statusColors[card.status] || statusColors.pending;
              const catInfo = categories.find(
                (c) => c.id === card.category
              );

              return (
                <div
                  key={card.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: card.imageUrl
                        ? `url(${card.imageUrl}) center/cover`
                        : 'linear-gradient(135deg, rgba(155,93,229,0.2), rgba(255,0,110,0.2))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                    }}
                  >
                    {!card.imageUrl && (catInfo?.icon || '🃏')}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#fff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {card.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '3px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '10px',
                          color: status.color,
                          background: status.bg,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {status.text}
                      </span>
                      {card.status === 'approved' && (
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.3)',
                          }}
                        >
                          🎮 {card.usedCount} · ⭐ {card.starsEarned}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          ✏️ Yaratgan kartangiz moderatsiyadan o'tgandan keyin umumiy bazaga
          qo'shiladi. Boshqa o'yinchilar kartangizni o'ynasa va yutsa, sizga ⭐
          stars keladi.
        </div>
      </div>
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
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
        >
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
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
        >
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
                    owned
                      ? `${pack.color}33`
                      : 'rgba(255,255,255,0.05)'
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
          📦 Sotib olgan paketlaringizdagi kartalar o'yin boshlanganda random
          tarzda tarqatiladi. Sotib olmagan toifa kartalari tushmaydi.
        </div>
      </div>
    </div>
  );
}
