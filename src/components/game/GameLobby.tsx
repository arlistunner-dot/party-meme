import { useState, useEffect } from 'react';
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

const DEMO_INVENTORY = [
  { id: 'c1', title: 'WiFi yo\'qolgan', category: 'tech', icon: '💻', power: 7 },
  { id: 'c2', title: 'Nonushta qilmaslik', category: 'life', icon: '🏠', power: 5 },
  { id: 'c3', title: 'Futbol o\'ynash', category: 'sport', icon: '⚽', power: 8 },
  { id: 'c4', title: 'Do\'st bilan gaplashish', category: 'nat', icon: '🇺🇿', power: 6 },
  { id: 'c5', title: 'Yangi o\'yin', category: 'tech', icon: '💻', power: 9 },
];

export default function GameLobby({ onStart, onCancel }: GameLobbyProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [votedTopic, setVotedTopic] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'topics'>('cards');

  const [topicVotes, setTopicVotes] = useState<Record<string, number>>(() => {
    const votes: Record<string, number> = {};
    TOPICS.forEach((t) => { votes[t.id] = Math.floor(Math.random() * 3); });
    return votes;
  });

  const canReady = selectedCards.length === 2 && votedTopic !== null;

  // 30 soniya taymer
  useEffect(() => {
    if (timeLeft <= 0) { hapticSuccess(); onStart(); return; }
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onStart]);

  // Simulyatsiya — boshqalar ovoz beradi
  useEffect(() => {
    const interval = setInterval(() => {
      const rt = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      setTopicVotes((prev) => ({ ...prev, [rt.id]: prev[rt.id] + 1 }));
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleCard = (cardId: string) => {
    hapticImpact('light');
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId));
    } else {
      if (selectedCards.length >= 2) {
        toast('Faqat 2 ta karta!', 'error');
        return;
      }
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  const voteTopic = (topicId: string) => {
    hapticSelection();
    if (votedTopic === topicId) return;
    if (votedTopic) {
      setTopicVotes((prev) => ({
        ...prev,
        [votedTopic]: Math.max(0, prev[votedTopic] - 1),
      }));
    }
    setVotedTopic(topicId);
    setTopicVotes((prev) => ({ ...prev, [topicId]: prev[topicId] + 1 }));
  };

  const handleReady = () => {
    if (!canReady) return;
    hapticSuccess();
    setIsReady(true);
    toast('Tayyor! Boshqa o\'yinchilar kutilmoqda...', 'success');
  };

  const timerColor = timeLeft <= 10 ? '#ff4757' : timeLeft <= 20 ? '#ffa502' : '#2ed573';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', position: 'relative', overflow: 'hidden',
    }}>

      {/* ====== FON RASMI ====== */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/assets/game-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'rgba(0,0,0,0.2)',
        pointerEvents: 'none',
      }} />

      {/* ====== HEADER — KICHIK, YUQORIDA ====== */}
      <div style={{
        position: 'relative', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 6px)',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(166,77,255,0.15)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => { hapticImpact('light'); onCancel(); }}
          style={{
            width: '26px', height: '26px', borderRadius: '6px',
            background: 'rgba(166,77,255,0.12)',
            border: '1px solid rgba(166,77,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '12px', color: '#A64DFF',
          }}
        >←</button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '11px',
            fontWeight: 700, color: '#fff', letterSpacing: '1.5px',
            textShadow: '0 0 8px rgba(166,77,255,0.4)',
          }}>
            TAYYORLANISH
          </div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '8px',
            color: 'rgba(77,163,255,0.6)',
          }}>
            7/7 o'yinchi
          </div>
        </div>

        {/* Taymer — kichik */}
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: `rgba(${timeLeft <= 10 ? '255,71,87' : timeLeft <= 20 ? '255,165,0' : '77,163,255'},0.1)`,
          border: `1.5px solid ${timerColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '11px',
          fontWeight: 700, color: timerColor,
          boxShadow: `0 0 8px ${timerColor}30`,
        }}>
          {timeLeft}
        </div>
      </div>

      {/* ====== BO'SH — LOGO KO'RINADI ====== */}
      <div style={{ flex: 1 }} />

      {/* ====== TAB TUGMALARI ====== */}
      <div style={{
        position: 'relative', zIndex: 15,
        display: 'flex', gap: '4px', padding: '0 16px',
        marginBottom: '6px',
      }}>
        {[
          { key: 'cards' as const, label: '🎴 Kartalar', count: `${selectedCards.length}/2` },
          { key: 'topics' as const, label: '📋 Mavzu', count: votedTopic ? '✓' : '0/1' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { hapticSelection(); setActiveTab(tab.key); }}
            style={{
              flex: 1, padding: '6px 8px', borderRadius: '8px',
              border: activeTab === tab.key
                ? '1px solid rgba(166,77,255,0.4)'
                : '1px solid rgba(255,255,255,0.05)',
              background: activeTab === tab.key
                ? 'rgba(0,0,0,0.65)'
                : 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.key
                ? '0 0 10px rgba(166,77,255,0.15)'
                : 'none',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '10px',
              fontWeight: 700,
              color: activeTab === tab.key ? '#A64DFF' : 'rgba(255,255,255,0.4)',
              textShadow: activeTab === tab.key
                ? '0 0 6px rgba(166,77,255,0.3)'
                : 'none',
            }}>
              {tab.label}
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '8px',
              fontWeight: 700,
              color: activeTab === tab.key ? '#4DA3FF' : 'rgba(255,255,255,0.2)',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ====== TAB KONTENT ====== */}
      <div style={{
        position: 'relative', zIndex: 15,
        padding: '0 16px', marginBottom: '8px',
        minHeight: '120px',
      }}>

        {/* === KARTALAR TAB === */}
        {activeTab === 'cards' && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '5px',
            animation: 'fadeUp 0.2s ease',
          }}>
            {DEMO_INVENTORY.map((card) => {
              const isSelected = selectedCards.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  style={{
                    padding: '6px', borderRadius: '8px',
                    border: isSelected
                      ? '1.5px solid rgba(166,77,255,0.5)'
                      : '1px solid rgba(255,255,255,0.06)',
                    background: isSelected
                      ? 'rgba(166,77,255,0.12)'
                      : 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(8px)',
                    cursor: 'pointer', textAlign: 'left',
                    position: 'relative', transition: 'all 0.2s ease',
                    boxShadow: isSelected
                      ? '0 0 10px rgba(166,77,255,0.15)'
                      : 'none',
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '3px', right: '3px',
                      width: '14px', height: '14px', borderRadius: '50%',
                      background: '#A64DFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '7px', color: '#fff', fontWeight: 700,
                    }}>✓</div>
                  )}
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>{card.icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '8px',
                    fontWeight: 700, color: '#fff',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {card.title}
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', marginTop: '2px',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '7px',
                      color: 'rgba(255,255,255,0.3)',
                    }}>
                      {card.category}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: '7px',
                      fontWeight: 700, color: '#ff006e',
                    }}>
                      ⚡{card.power}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* === MAVZULAR TAB === */}
        {activeTab === 'topics' && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '5px',
            animation: 'fadeUp 0.2s ease',
          }}>
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
                    padding: '6px', borderRadius: '8px',
                    border: isSelected
                      ? `1.5px solid ${topic.color}80`
                      : '1px solid rgba(255,255,255,0.06)',
                    background: isSelected
                      ? `${topic.color}12`
                      : 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    cursor: 'pointer', textAlign: 'center',
                    position: 'relative', overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected
                      ? `0 0 10px ${topic.color}20`
                      : 'none',
                  }}
                >
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0,
                    width: `${votePercent}%`, height: '2px',
                    background: topic.color, borderRadius: '0 2px 0 0',
                    transition: 'width 0.3s ease',
                  }} />
                  <div style={{ fontSize: '18px', marginBottom: '2px' }}>{topic.icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '9px',
                    fontWeight: 700, color: isSelected ? topic.color : '#fff',
                    textShadow: isSelected ? `0 0 6px ${topic.color}40` : 'none',
                  }}>
                    {topic.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '7px',
                    fontWeight: 700, color: 'rgba(255,255,255,0.25)',
                  }}>
                    {votes}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ====== TAYYOR TUGMASI ====== */}
      <div style={{
        position: 'relative', zIndex: 20,
        padding: '8px 16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
        flexShrink: 0,
      }}>
        {isReady ? (
          <div style={{
            padding: '8px', borderRadius: '8px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(46,213,115,0.2)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '11px',
              fontWeight: 700, color: '#2ed573',
              textShadow: '0 0 8px rgba(46,213,115,0.3)',
            }}>
              ✅ TAYYOR! Kutilmoqda...
            </div>
          </div>
        ) : (
          <button
            onClick={handleReady}
            disabled={!canReady}
            style={{
              width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
              background: canReady
                ? 'linear-gradient(135deg, #A64DFF, #4DA3FF)'
                : 'rgba(0,0,0,0.5)',
              fontFamily: 'var(--font-display)', fontSize: '12px',
              fontWeight: 700, letterSpacing: '1.5px',
              color: canReady ? '#fff' : 'rgba(255,255,255,0.25)',
              cursor: canReady ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(6px)',
              boxShadow: canReady ? '0 0 20px rgba(166,77,255,0.3)' : 'none',
              textShadow: canReady ? '0 0 6px rgba(255,255,255,0.3)' : 'none',
            }}
          >
            {!selectedCards.length
              ? '🎴 2 TA KARTA TANLA'
              : selectedCards.length < 2
              ? '🎴 YANA 1 TA KARTA'
              : !votedTopic
              ? '📋 MAVZU TANLA'
              : '✅ TAYYOR'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
