import { useState, useEffect, useCallback } from 'react';
import { hapticImpact, hapticSuccess, hapticSelection } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';

interface GameLobbyProps {
  onStart: () => void;
  onCancel: () => void;
}

const TOPICS = [
  { id: 'sport', name: 'Sport', icon: '⚽', color: '#2ed573' },
  { id: 'lifestyle', name: 'Hayot', icon: '🏠', color: '#ffa502' },
  { id: 'tech', name: 'Texnologiya', icon: '💻', color: '#00b4d8' },
  { id: 'national', name: 'Milliy', icon: '🇺🇿', color: '#1e90ff' },
  { id: 'adult', name: '18+', icon: '🔞', color: '#ff4757' },
  { id: 'exclusive', name: 'Eksklyuziv', icon: '💎', color: '#9b5de5' },
];

// Demo inventar kartalari
const DEMO_INVENTORY = [
  { id: 'c1', title: 'WiFi yo\'qolgan', category: 'tech', icon: '💻', power: 7 },
  { id: 'c2', title: 'Nonushta qilmaslik', category: 'lifestyle', icon: '🏠', power: 5 },
  { id: 'c3', title: 'Futbol o\'ynash', category: 'sport', icon: '⚽', power: 8 },
  { id: 'c4', title: 'Do\'st bilan gaplashish', category: 'national', icon: '🇺🇿', power: 6 },
  { id: 'c5', title: 'Yangi o\'yin', category: 'tech', icon: '💻', power: 9 },
];

export default function GameLobby({ onStart, onCancel }: GameLobbyProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [votedTopic, setVotedTopic] = useState<string | null>(null);
  const [topicVotes, setTopicVotes] = useState<Record<string, number>>(() => {
    const votes: Record<string, number> = {};
    TOPICS.forEach((t) => {
      votes[t.id] = Math.floor(Math.random() * 3);
    });
    return votes;
  });

  // Tayyor belgilash
  const [isReady, setIsReady] = useState(false);

  // Tayyorlash — 2 ta karta + ovoz
  const canReady = selectedCards.length === 2 && votedTopic !== null;

  // 30 soniya taymer
  useEffect(() => {
    if (timeLeft <= 0) {
      hapticSuccess();
      onStart();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onStart]);

  // Simulyatsiya — boshqa o'yinchilar ovoz beradi
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      setTopicVotes((prev) => ({
        ...prev,
        [randomTopic.id]: prev[randomTopic.id] + 1,
      }));
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  // Karta tanlash
  const toggleCard = (cardId: string) => {
    hapticImpact('light');
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId));
    } else {
      if (selectedCards.length >= 2) {
        toast('Faqat 2 ta karta tanlash mumkin!', 'error');
        return;
      }
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  // Mavzuga ovoz berish
  const voteTopic = (topicId: string) => {
    hapticSelection();
    if (votedTopic === topicId) return;

    // Eski ovozni olib tashlash
    if (votedTopic) {
      setTopicVotes((prev) => ({
        ...prev,
        [votedTopic]: Math.max(0, prev[votedTopic] - 1),
      }));
    }

    setVotedTopic(topicId);
    setTopicVotes((prev) => ({
      ...prev,
      [topicId]: prev[topicId] + 1,
    }));
  };

  // Tayyor tugmasi
  const handleReady = () => {
    if (!canReady) return;
    hapticSuccess();
    setIsReady(true);
    toast('Tayyor! Boshqa o\'yinchilar kutilmoqda...', 'success');
  };

  // Rang
  const timerColor = timeLeft <= 10 ? '#ff4757' : timeLeft <= 20 ? '#ffa502' : '#2ed573';

  // Eng ko'p ovoz olgan mavzu
  const topTopic = TOPICS.reduce((max, t) =>
    (topicVotes[t.id] || 0) > (topicVotes[max.id] || 0) ? t : max
  );

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
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            hapticImpact('light');
            onCancel();
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

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '2px',
            }}
          >
            TAYYORLANISH
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            7/7 o'yinchi
          </div>
        </div>

        {/* Taymer */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: `rgba(${timeLeft <= 10 ? '255,71,87' : timeLeft <= 20 ? '255,165,0' : '46,213,115'},0.12)`,
            border: `2px solid ${timerColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            color: timerColor,
          }}
        >
          {timeLeft}
        </div>
      </div>

      {/* KONTENT */}
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* === KARTA TANLASH === */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              🎴 KARTA TANLA
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: 700,
                color: selectedCards.length === 2 ? '#2ed573' : 'rgba(255,255,255,0.4)',
              }}
            >
              {selectedCards.length}/2
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {DEMO_INVENTORY.map((card) => {
              const isSelected = selectedCards.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: isSelected
                      ? '2px solid #00b4d8'
                      : '1px solid rgba(255,255,255,0.06)',
                    background: isSelected
                      ? 'rgba(0,180,216,0.1)'
                      : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#00b4d8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </div>
                  )}
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {card.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: '2px',
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
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {card.category}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: '#ff006e',
                      }}
                    >
                      ⚡{card.power}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* === MAVZUGA OVOZ BERISH === */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              📋 MAVZU TANLA
            </div>
            {votedTopic && (
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: '#2ed573',
                }}
              >
                ✓ Ovoz berildi
              </div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {TOPICS.map((topic) => {
              const isSelected = votedTopic === topic.id;
              const votes = topicVotes[topic.id] || 0;
              const maxVotes = Math.max(...Object.values(topicVotes), 1);
              const votePercent = (votes / maxVotes) * 100;

              return (
                <button
                  key={topic.id}
                  onClick={() => voteTopic(topic.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: isSelected
                      ? `2px solid ${topic.color}`
                      : '1px solid rgba(255,255,255,0.06)',
                    background: isSelected
                      ? `${topic.color}15`
                      : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Ovoz progress fon */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: `${votePercent}%`,
                      height: '3px',
                      background: topic.color,
                      borderRadius: '0 2px 0 0',
                      transition: 'width 0.3s ease',
                    }}
                  />

                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                    {topic.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isSelected ? topic.color : '#fff',
                    }}
                  >
                    {topic.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: '2px',
                    }}
                  >
                    {votes} ovoz
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PASTKI QISM — TAYYOR TUGMASI */}
      <div
        style={{
          padding: '12px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}
      >
        {isReady ? (
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(46,213,115,0.1)',
              border: '1px solid rgba(46,213,115,0.2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#2ed573',
              }}
            >
              ✅ TAYYOR! Boshqa o'yinchilar kutilmoqda...
            </div>
          </div>
        ) : (
          <button
            onClick={handleReady}
            disabled={!canReady}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: canReady
                ? 'linear-gradient(135deg, #ff006e, #ff4757)'
                : 'rgba(255,255,255,0.06)',
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: canReady ? '#fff' : 'rgba(255,255,255,0.3)',
              cursor: canReady ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            {!selectedCards.length
              ? '🎴 2 TA KARTA TANLA'
              : selectedCards.length < 2
              ? '🎴 YANA 1 TA KARTA TANLA'
              : !votedTopic
              ? '📋 MAVZUGA OVOZ BER'
              : '✅ TAYYOR'}
          </button>
        )}
      </div>
    </div>
  );
}
