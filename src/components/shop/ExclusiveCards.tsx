import { useState, useEffect } from 'react';
import { hapticImpact } from '@/config/telegram';
import { api } from '@/services/api';

interface ShopCard {
  id: number;
  type: string;
  text: string;
  image_url: string | null;
  rarity: string;
  price_coins: number;
  price_stars: number;
  likes_count: number;
  author_id: number | null;
  is_limited: boolean;
  max_copies: number | null;
}

const rarityConfig: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  common: {
    label: 'COMMON',
    color: '#7a7570',
    bg: 'rgba(122,117,112,0.12)',
    border: 'rgba(122,117,112,0.25)',
  },
  rare: {
    label: 'RARE',
    color: '#3742fa',
    bg: 'rgba(55, 66, 250, 0.12)',
    border: 'rgba(55, 66, 250, 0.25)',
  },
  epic: {
    label: 'EPIC',
    color: '#9b5de5',
    bg: 'rgba(155, 93, 229, 0.12)',
    border: 'rgba(155, 93, 229, 0.25)',
  },
  legendary: {
    label: 'LEGENDARY',
    color: '#ffd700',
    bg: 'rgba(255, 215, 0, 0.12)',
    border: 'rgba(255, 215, 0, 0.25)',
  },
};

const borderColors: Record<string, string> = {
  common: '#7a7570',
  rare: '#3742fa',
  epic: '#9b5de5',
  legendary: '#ffd700',
};

interface ExclusiveCardsProps {
  onPurchase: (cardId: string) => void;
  isLoading?: boolean;
}

export default function ExclusiveCards({
  onPurchase,
  isLoading,
}: ExclusiveCardsProps) {
  const [cards, setCards] = useState<ShopCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'rare' | 'epic' | 'legendary'>('all');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    try {
      setLoading(true);
      const data = await api.get<ShopCard[]>('/shop/cards');
      setCards(data);
    } catch (err) {
      console.error('[Shop] Kartalarni yuklashda xato:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered =
    filter === 'all'
      ? cards
      : cards.filter((c) => c.rarity === filter);

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
        }}
      >
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div>
      {/* Sarlavha */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          🃏 Eksklyuziv kartalar
        </h3>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          {cards.length} ta
        </span>
      </div>

      {/* Filter */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '14px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {([
          { id: 'all', label: 'Hammasi', color: '#fff' },
          { id: 'rare', label: 'Rare', color: '#3742fa' },
          { id: 'epic', label: 'Epic', color: '#9b5de5' },
          { id: 'legendary', label: 'Legendary', color: '#ffd700' },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => {
              hapticImpact('light');
              setFilter(f.id);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background:
                filter === f.id ? `${f.color}22` : 'rgba(255,255,255,0.04)',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              color: filter === f.id ? f.color : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Kartalar grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
          }}
        >
          Karta topilmadi
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}
        >
          {filtered.map((card, index) => {
            const rarity = rarityConfig[card.rarity] || rarityConfig.common;
            const borderColor = borderColors[card.rarity] || borderColors.common;
            const isSelected = selectedCard === card.id;
            const price = card.price_coins > 0
              ? { amount: card.price_coins, currency: 'coin' as const }
              : { amount: card.price_stars, currency: 'star' as const };

            return (
              <div
                key={card.id}
                onClick={() => {
                  hapticImpact('light');
                  setSelectedCard(isSelected ? null : card.id);
                }}
                style={{
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.025)',
                  border: isSelected
                    ? `2px solid ${borderColor}66`
                    : '1px solid rgba(255,255,255,0.04)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  animation: 'fadeUp 0.3s ease forwards',
                  animationDelay: `${index * 0.06}s`,
                  opacity: 0,
                }}
              >
                {/* RASM QISMI */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3/4',
                    background: `linear-gradient(135deg, ${borderColor}15, ${borderColor}08)`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '36px', opacity: 0.6 }}>🃏</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: borderColor,
                      opacity: 0.7,
                      textAlign: 'center',
                      padding: '0 8px',
                    }}
                  >
                    {card.text}
                  </span>

                  {/* Rarity badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      background: rarity.bg,
                      backdropFilter: 'blur(6px)',
                      border: `1px solid ${rarity.border}`,
                      fontFamily: 'var(--font-body)',
                      fontSize: '8px',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      color: rarity.color,
                      textTransform: 'uppercase',
                    }}
                  >
                    {rarity.label}
                  </div>

                  {/* Type badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      padding: '2px 6px',
                      borderRadius: '5px',
                      background: card.type === 'red'
                        ? 'rgba(255, 0, 110, 0.7)'
                        : 'rgba(0, 180, 216, 0.7)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '8px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {card.type === 'red' ? 'QIZIL' : "KO'K"}
                  </div>

                  {/* Like */}
                  {card.likes_count > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        padding: '2px 6px',
                        borderRadius: '5px',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(6px)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      ❤️ {card.likes_count}
                    </div>
                  )}
                </div>

                {/* MATN QISMI */}
                <div style={{ padding: '10px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {card.text}
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      marginBottom: '10px',
                    }}
                  >
                    ✍️ {card.author_id || 'Tizim'}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPurchase(String(card.id));
                    }}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: `linear-gradient(135deg, ${borderColor}, ${borderColor}cc)`,
                      fontFamily: 'var(--font-display)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: card.rarity === 'legendary' ? '#1a1a1a' : '#fff',
                      cursor: isLoading ? 'wait' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                      transition: 'transform 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    {price.currency === 'coin' ? '🪙' : '⭐'} {price.amount}
                  </button>
                </div>

                {/* TANLANGANDA */}
                {isSelected && (
                  <div
                    style={{
                      padding: '10px',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      background: 'rgba(255,255,255,0.02)',
                      animation: 'fadeUp 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      ✨ Inventaringizga qo'shiladi va o'yinlarda tasodifiy tarqatiladi.
                      {card.rarity === 'legendary' && (
                        <span style={{ color: '#ffd700' }}>
                          {' '}Legendary — 2x tanga bonus!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
