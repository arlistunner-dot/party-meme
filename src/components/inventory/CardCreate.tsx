import { useState, useCallback } from 'react';
import { Button } from '@/components/common';
import { useCards } from '@/hooks/useCards';
import { useToast } from '@/components/common/Toast';
import { useAuthStore } from '@/store/authStore';
import { RANKS } from '@/config/constants';
import { getRankByRating } from '@/utils/helpers';
import { validateImageFile } from '@/utils/validators';
import { hapticImpact, hapticSuccess, hapticError } from '@/config/telegram';

interface CardCreateProps {
  onCreated?: () => void;
}

const CATEGORIES = [
  { id: 'humor', label: 'Kulgi', icon: '😂', color: '#ffd700' },
  { id: 'life', label: 'Hayot', icon: '🌍', color: '#2ed573' },
  { id: 'work', label: 'Ish', icon: '💼', color: '#00b4d8' },
  { id: 'love', label: 'Sevgi', icon: '❤️', color: '#ff006e' },
  { id: 'tech', label: 'Texno', icon: '💻', color: '#9b5de5' },
  { id: 'sport', label: 'Sport', icon: '⚽', color: '#ffa502' },
  { id: 'food', label: 'Ovqat', icon: '🍕', color: '#ff6348' },
  { id: 'study', label: "Ta'lim", icon: '📚', color: '#1abc9c' },
];

export default function CardCreate({ onCreated }: CardCreateProps) {
  const user = useAuthStore((s) => s.user);
  const { createCard, isLoading } = useCards();
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Daraja tekshirish
  const rank = user ? getRankByRating(user.rating) : 'newbie';
  const rankInfo = RANKS.find((r) => r.id === rank);
  const canCreate = rank !== 'newbie';

  // Rasm tanlash
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast(validation.error!, 'error');
        hapticError();
        return;
      }

      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      hapticImpact('light');
    },
    [toast]
  );

  // Rasmni o'chirish
  const handleRemoveImage = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl(null);
  }, [imageUrl]);

  // Yuborish
    const handleSubmit = useCallback(async () => {
    if (!selectedCategory) {
      toast('Toifani tanlang!', 'error');
      hapticError();
      return;
    }

    try {
      const text = prompt('Karta matnini kiriting:');
      if (!text || !text.trim()) {
        toast('Karta matni kiritilmadi!', 'error');
        return;
      }

      await createCard({
        type: 'blue',
        text: text.trim(),
      });

      hapticSuccess();
      toast('Karta yuborildi! Moderatsiya kutilmoqda.', 'success');
      setSelectedCategory(null);
      onCreated?.();
    } catch {
      hapticError();
      toast('Karta yaratishda xato yuz berdi.', 'error');
    }
  }, [selectedCategory, createCard, toast, onCreated]);


  // Karta yaratish huquqi yo'q
  if (!canCreate) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}
        >
          🔒
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '17px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          Karta yaratish uchun 500+ reyting kerak
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          Hozirgi reyting: {user?.rating || 0}
          <br />
          Kulgich (500) darajasiga yeting va karta yarating!
        </div>
        <div
          style={{
            width: '200px',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, ((user?.rating || 0) / 500) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--neon-pink), var(--neon-purple))',
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Sarlavha */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 4px',
          }}
        >
          ✏️ Ko'k karta yaratish
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Rasm yuklang va toifani tanlang
        </p>
      </div>

      {/* Rasm yuklash — karta ko'rinishida */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {!imageUrl ? (
          /* Bo'sh karta — rasm yuklash uchun */
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '200px',
              height: '280px',
              borderRadius: '16px',
              border: '2px dashed rgba(55, 66, 250, 0.25)',
              background: 'rgba(55, 66, 250, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '40px', opacity: 0.5 }}>🖼️</span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '0 16px',
              }}
            >
              Rasm yuklash
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                opacity: 0.5,
              }}
            >
              JPG, PNG, GIF
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </label>
        ) : (
          /* Yuklangan rasm — karta ko'rinishida */
          <div
            style={{
              position: 'relative',
              width: '200px',
              height: '280px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2px solid rgba(55, 66, 250, 0.3)',
              boxShadow: '0 4px 20px rgba(55, 66, 250, 0.15)',
            }}
          >
            <img
              src={imageUrl}
              alt="Karta rasmi"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* O'chirish tugmasi */}
            <button
              onClick={handleRemoveImage}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(255, 71, 87, 0.9)',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* O'zgartirish tugmasi */}
            <label
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              📷
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Toifalar */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '10px',
          }}
        >
          Toifa tanlang
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  hapticImpact('light');
                  setSelectedCategory(cat.id);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '12px 6px',
                  borderRadius: '12px',
                  background: isSelected
                    ? `${cat.color}15`
                    : 'rgba(255,255,255,0.025)',
                  border: isSelected
                    ? `2px solid ${cat.color}55`
                    : '2px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? cat.color : 'var(--text-muted)',
                  }}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Yuborish */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={!imageFile || !selectedCategory}
        onClick={handleSubmit}
        style={{
          borderRadius: '14px',
          fontSize: '15px',
          letterSpacing: '1px',
        }}
      >
        YUBORISH → Moderatsiya
      </Button>

      {/* Ogohlantirish */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          lineHeight: 1.7,
          padding: '0 8px',
        }}
      >
        Karta moderatsiyadan o'tgandan keyin inventaringizga qo'shiladi.
        <br />
        So'kinish, spam va taqiqlangan content avtomatik rad etiladi.
      </div>
    </div>
  );
}
