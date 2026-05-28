import React, { useState, useEffect, useCallback } from 'react';
import { hapticImpact, hapticSuccess, hapticSelection } from '../config/telegram';
import { useAuthStore } from '../store/authStore';

// ============================================
// TYPES
// ============================================
type GamePhase = 'matchmaking' | 'preparation' | 'playing' | 'results';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  selectedCards: MemeCard[];
  votedTopic: string | null;
}

interface MemeCard {
  id: string;
  text: string;
  category: string;
  image?: string;
}

interface Topic {
  id: string;
  name: string;
  icon: string;
  votes: number;
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_NAMES = [
  'Azizbek', 'Dilnoza', 'Sardor', 'Nilufar', 'Javohir',
  'Madina', 'Otabek', 'Zilola', 'Sherzod', 'Gulnora',
  'Bekzod', 'Sabohat', 'Jasur', 'Malika', 'Suhrob'
];

const MOCK_TOPICS: Topic[] = [
  { id: 'sport', name: 'Sport', icon: '⚽', votes: 0 },
  { id: 'life', name: 'Hayot', icon: '🏠', votes: 0 },
  { id: 'tech', name: 'Texnologiya', icon: '💻', votes: 0 },
  { id: 'food', name: 'Ovqat', icon: '🍕', votes: 0 },
  { id: 'school', name: 'Maktab', icon: '📚', votes: 0 },
  { id: 'love', name: 'Sevgi', icon: '❤️', votes: 0 },
];

const MOCK_CARDS: MemeCard[] = [
  { id: 'c1', text: 'Darsga erta keldim, lekin uyda unutdim hamma narsani', category: 'Hayot' },
  { id: 'c2', text: 'WiFi yo\'q bo\'lgandagi men', category: 'Texnologiya' },
  { id: 'c3', text: 'Oylik oldim — 1 kun millioner', category: 'Hayot' },
  { id: 'c4', text: 'Sport zalga yozildim... faqat yozildim', category: 'Sport' },
  { id: 'c5', text: 'Telefon 1% bo\'lganda omonat qidirish', category: 'Texnologiya' },
  { id: 'c6', text: 'Pazandachilik: tuxum qovurish va uy yoqish', category: 'Ovqat' },
  { id: 'c7', text: 'Uyqu → dars → uyqu → repeat', category: 'Maktab' },
  { id: 'c8', text: 'Yolg\'izlik mening super kuchim', category: 'Sevgi' },
  { id: 'c9', text: 'Pullik o\'yin: 5 daqiqa o\'ynash, 5 soat to\'lash', category: 'Texnologiya' },
  { id: 'c10', text: 'Do\'stim: "Oson vazifa" — men: 💀', category: 'Maktab' },
  { id: 'c11', text: 'Dushanba ertalab men:', category: 'Hayot' },
  { id: 'c12', text: 'Yugurish boshlash: kun 1 → kun 1: yo\'q', category: 'Sport' },
  { id: 'c13', text: 'Instagram: "10 daqiqa" — 3 soat keyin:', category: 'Texnologiya' },
  { id: 'c14', text: 'Kredit olgan odamning yuzi: 😊→😰→😱', category: 'Hayot' },
  { id: 'c15', text: 'Kechki ovqat: non va umid', category: 'Ovqat' },
  { id: 'c16', text: 'Mening sevgi hayotim: 404 Not Found', category: 'Sevgi' },
  { id: 'c17', text: 'Imtihondan oldin: "Oson bo\'ladi" → 2 baho', category: 'Maktab' },
  { id: 'c18', text: 'Velosiped minib sportchi bo\'ldim', category: 'Sport' },
  { id: 'c19', text: 'Yangi yil qarorlari: 1 yanvar → 2 yanvar: tugadi', category: 'Hayot' },
  { id: 'c20', text: 'Pitsa buyurtma: "30 daqiqa" — 2 soat kutish', category: 'Ovqat' },
];

const INVENTORY_CARDS: MemeCard[] = [
  { id: 'inv1', text: 'Men dasturchi emasman, lekin Ctrl+C bilan yashayman', category: 'Texnologiya' },
  { id: 'inv2', text: 'Erta turish rejam: 🤡 har kuni', category: 'Hayot' },
  { id: 'inv3', text: 'Basketbol: to\'pni yo\'qotish — mening maxsusligim', category: 'Sport' },
  { id: 'inv4', text: 'Pishirish: uydan chiqish va oshxonaga borish', category: 'Ovqat' },
  { id: 'inv5', text: 'Do\'stim: "5 daqiqaga kelyapman" — 3 soat', category: 'Hayot' },
];

// ============================================
// COMPONENT
// ============================================
interface GameScreenProps {
  onGameEnd: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameEnd }) => {
  const { user } = useAuthStore();

  // --- State ---
  const [phase, setPhase] = useState<GamePhase>('matchmaking');
  const [players, setPlayers] = useState<Player[]>([]);
  const [countdown, setCountdown] = useState<number>(30);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [topics, setTopics] = useState<Topic[]>(MOCK_TOPICS);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [winningTopic, setWinningTopic] = useState<Topic | null>(null);
  const [gameCards, setGameCards] = useState<MemeCard[]>([]);
  const [selectedPlayCard, setSelectedPlayCard] = useState<string | null>(null);
  const [roundTimeLeft, setRoundTimeLeft] = useState<number>(45);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);

  // ============================================
  // PHASE 1: MATCHMAKING
  // ============================================
  useEffect(() => {
    if (phase !== 'matchmaking') return;

    const interval = setInterval(() => {
      setPlayerCount(prev => {
        if (prev >= 7) {
          clearInterval(interval);
          return 7;
        }
        hapticSelection();
        return prev + 1;
      });
    }, 1200 + Math.random() * 1800);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (playerCount >= 7 && phase === 'matchmaking') {
      const mockPlayers: Player[] = [];
      const shuffled = [...MOCK_NAMES].sort(() => Math.random() - 0.5);
      for (let i = 0; i < 6; i++) {
        mockPlayers.push({
          id: `bot_${i}`,
          name: shuffled[i],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${shuffled[i]}`,
          isReady: false,
          selectedCards: [],
          votedTopic: null,
        });
      }
      mockPlayers.push({
        id: 'me',
        name: user?.firstName || 'Siz',
        avatar: user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=me`,
        isReady: false,
        selectedCards: [],
        votedTopic: null,
      });
      setPlayers(mockPlayers);

      setTimeout(() => {
        hapticSuccess();
        setPhase('preparation');
      }, 1500);
    }
  }, [playerCount, phase, user]);

  // ============================================
  // PHASE 2: PREPARATION — TIMER
  // ============================================
  useEffect(() => {
    if (phase !== 'preparation') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishPreparation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate bots voting
    const botVoteTimeout = setTimeout(() => {
      setTopics(prev => {
        const updated = [...prev];
        const randomIndices = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, 6);
        randomIndices.forEach((idx, i) => {
          if (updated[idx]) {
            updated[idx] = { ...updated[idx], votes: updated[idx].votes + 1 };
          }
        });
        return updated;
      });
    }, 3000 + Math.random() * 7000);

    // Simulate bots selecting cards
    const botReadyTimeout = setTimeout(() => {
      setPlayers(prev =>
        prev.map(p => p.id !== 'me' ? { ...p, isReady: true } : p)
      );
    }, 8000 + Math.random() * 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(botVoteTimeout);
      clearTimeout(botReadyTimeout);
    };
  }, [phase]);

  // ============================================
  // FINISH PREPARATION → START GAME
  // ============================================
  const finishPreparation = useCallback(() => {
    hapticImpact('heavy');

    // Determine winning topic
    const sorted = [...topics].sort((a, b) => b.votes - a.votes);
    const winner = sorted[0];
    setWinningTopic(winner);

    // Generate 5 random game cards
    const shuffledCards = [...MOCK_CARDS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    setGameCards(shuffledCards);

    setPhase('playing');
    setRoundTimeLeft(45);
  }, [topics]);

  // ============================================
  // PHASE 3: PLAYING — TIMER
  // ============================================
  useEffect(() => {
    if (phase !== 'playing') return;

    const timer = setInterval(() => {
      setRoundTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  const handleTimeUp = () => {
    // Auto select if player didn't choose
    if (!selectedPlayCard && gameCards.length > 0) {
      setSelectedPlayCard(gameCards[0].id);
    }
    finishGame();
  };

  // ============================================
  // CARD SELECTION (Preparation phase)
  // ============================================
  const toggleCardSelection = (cardId: string) => {
    hapticSelection();
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      }
      if (prev.length >= 2) return prev;
      return [...prev, cardId];
    });
  };

  // ============================================
  // TOPIC VOTING
  // ============================================
  const voteTopic = (topicId: string) => {
    if (myVote) return; // Already voted
    hapticImpact('light');
    setMyVote(topicId);
    setTopics(prev =>
      prev.map(t =>
        t.id === topicId ? { ...t, votes: t.votes + 1 } : t
      )
    );
  };

  // ============================================
  // PLAY CARD
  // ============================================
  const playCard = (cardId: string) => {
    hapticImpact('medium');
    setSelectedPlayCard(cardId);
  };

  // ============================================
  // SUBMIT & FINISH
  // ============================================
  const submitCard = () => {
    if (!selectedPlayCard) return;
    hapticSuccess();
    finishGame();
  };

  const finishGame = () => {
    // Determine random winner
    const randomWinner = players[Math.floor(Math.random() * players.length)];
    setWinner(randomWinner);
    setShowResult(true);
    setPhase('results');
  };

  // ============================================
  // RENDER HELPERS
  // ============================================
  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={styles.container}>

      {/* ============ MATCHMAKING PHASE ============ */}
      {phase === 'matchmaking' && (
        <div style={styles.phaseContainer}>
          <div style={styles.matchmakingContent}>
            {/* Animated dots */}
            <div style={styles.searchingIcon}>
              <div style={styles.searchCircle}>
                <div style={styles.searchPulse}></div>
                <div style={styles.searchPulse2}></div>
                <span style={styles.searchEmoji}>🎮</span>
              </div>
            </div>

            <h2 style={styles.phaseTitle}>O'yinchilar qidirilmoqda...</h2>
            <p style={styles.phaseSubtitle}>Tez orada o'yin boshlanadi</p>

            {/* Player counter */}
            <div style={styles.playerCounter}>
              <span style={{
                ...styles.playerCountNum,
                color: playerCount >= 7 ? '#2ed573' : '#ff006e'
              }}>
                {playerCount}
              </span>
              <span style={styles.playerCountDivider}>/</span>
              <span style={styles.playerCountTotal}>7</span>
            </div>

            {/* Progress dots */}
            <div style={styles.progressDots}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <div
                  key={n}
                  style={{
                    ...styles.progressDot,
                    background: n <= playerCount ? '#ff006e' : 'rgba(255,255,255,0.1)',
                    boxShadow: n <= playerCount ? '0 0 10px #ff006e' : 'none',
                  }}
                />
              ))}
            </div>

            {/* Player avatars joining */}
            <div style={styles.joiningPlayers}>
              {players.slice(0, playerCount).map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    ...styles.joiningAvatar,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    style={styles.avatarImg}
                  />
                  <span style={styles.joiningName}>{p.name}</span>
                </div>
              ))}
            </div>

            {playerCount >= 7 && (
              <div style={styles.readyMessage}>
                <span style={styles.readyText}>Xona to'ldi! Tayyorlanmoqda...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ PREPARATION PHASE ============ */}
      {phase === 'preparation' && (
        <div style={styles.phaseContainer}>
          {/* Timer */}
          <div style={styles.timerBar}>
            <div
              style={{
                ...styles.timerFill,
                width: `${(countdown / 30) * 100}%`,
                background: countdown <= 10
                  ? 'linear-gradient(90deg, #ff4757, #ff6b81)'
                  : 'linear-gradient(90deg, #00b4d8, #2ed573)',
              }}
            />
            <span style={styles.timerText}>
              {countdown <= 10 ? '⏰ ' : '⏱ '}
              {countdown}s
            </span>
          </div>

          <h2 style={styles.phaseTitle}>Tayyorgarlik</h2>
          <p style={styles.phaseSubtitle}>Kartalarni tanlang va mavzu ovoz bering</p>

          {/* Card selection */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              🃏 Kartalaringizdan 2 tasini tanlang
              <span style={{
                ...styles.selectionBadge,
                background: selectedCards.length === 2 ? '#2ed573' : '#ff006e',
              }}>
                {selectedCards.length}/2
              </span>
            </h3>
            <div style={styles.cardGrid}>
              {INVENTORY_CARDS.map((card) => (
                <div
                  key={card.id}
                  onClick={() => toggleCardSelection(card.id)}
                  style={{
                    ...styles.selectableCard,
                    border: selectedCards.includes(card.id)
                      ? '2px solid #ff006e'
                      : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: selectedCards.includes(card.id)
                      ? '0 0 20px rgba(255,0,110,0.3)'
                      : 'none',
                    transform: selectedCards.includes(card.id) ? 'scale(0.95)' : 'scale(1)',
                  }}
                >
                  {selectedCards.includes(card.id) && (
                    <div style={styles.cardCheck}>✓</div>
                  )}
                  <span style={styles.cardCategory}>{card.category}</span>
                  <p style={styles.cardText}>{card.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Topic voting */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              🗳️ Mavzu tanlash
              {myVote && <span style={styles.votedBadge}>Ovoz berildi ✓</span>}
            </h3>
            <div style={styles.topicGrid}>
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => voteTopic(topic.id)}
                  disabled={!!myVote}
                  style={{
                    ...styles.topicButton,
                    border: myVote === topic.id
                      ? '2px solid #2ed573'
                      : '2px solid rgba(255,255,255,0.1)',
                    opacity: myVote && myVote !== topic.id ? 0.5 : 1,
                    background: myVote === topic.id
                      ? 'rgba(46,213,115,0.1)'
                      : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span style={styles.topicIcon}>{topic.icon}</span>
                  <span style={styles.topicName}>{topic.name}</span>
                  <span style={styles.topicVotes}>{topic.votes} ovoz</span>
                </button>
              ))}
            </div>
          </div>

          {/* Players ready status */}
          <div style={styles.readyPlayers}>
            {players.map((p) => (
              <div key={p.id} style={styles.readyPlayerItem}>
                <img src={p.avatar} alt="" style={styles.readyAvatar} />
                <span style={{
                  ...styles.readyDot,
                  background: p.isReady || (p.id === 'me' && selectedCards.length === 2)
                    ? '#2ed573'
                    : '#555',
                }} />
              </div>
            ))}
          </div>

          {/* Ready button */}
          <button
            onClick={() => {
              hapticSuccess();
              setPlayers(prev =>
                prev.map(p => p.id === 'me' ? { ...p, isReady: true } : p)
              );
            }}
            disabled={selectedCards.length < 2}
            style={{
              ...styles.readyButton,
              opacity: selectedCards.length < 2 ? 0.4 : 1,
              background: selectedCards.length >= 2
                ? 'linear-gradient(135deg, #ff006e, #9b5de5)'
                : '#333',
            }}
          >
            {selectedCards.length < 2
              ? `Karta tanlang (${selectedCards.length}/2)`
              : 'TAYYORMAN ✓'
            }
          </button>
        </div>
      )}

      {/* ============ PLAYING PHASE ============ */}
      {phase === 'playing' && (
        <div style={styles.phaseContainer}>
          {/* Timer */}
          <div style={styles.timerBar}>
            <div
              style={{
                ...styles.timerFill,
                width: `${(roundTimeLeft / 45) * 100}%`,
                background: roundTimeLeft <= 15
                  ? 'linear-gradient(90deg, #ff4757, #ff6b81)'
                  : 'linear-gradient(90deg, #9b5de5, #ff006e)',
              }}
            />
            <span style={styles.timerText}>
              ⏱ {roundTimeLeft}s
            </span>
          </div>

          {/* Winning topic display */}
          <div style={styles.topicBanner}>
            <span style={styles.topicBannerIcon}>{winningTopic?.icon}</span>
            <span style={styles.topicBannerText}>
              Mavzu: {winningTopic?.name}
            </span>
          </div>

          <h2 style={styles.phaseTitle}>Eng kulgili kartani tanlang!</h2>

          {/* Game cards */}
          <div style={styles.gameCardGrid}>
            {/* Player's selected cards */}
            {selectedCards.map((cardId, idx) => {
              const card = INVENTORY_CARDS.find(c => c.id === cardId);
              if (!card) return null;
              return (
                <div
                  key={`sel_${card.id}`}
                  onClick={() => playCard(`sel_${card.id}`)}
                  style={{
                    ...styles.gameCard,
                    border: selectedPlayCard === `sel_${card.id}`
                      ? '3px solid #2ed573'
                      : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: selectedPlayCard === `sel_${card.id}`
                      ? '0 0 25px rgba(46,213,115,0.4)'
                      : 'none',
                  }}
                >
                  <div style={styles.gameCardBadge}>Sizning karta</div>
                  <span style={styles.cardCategory}>{card.category}</span>
                  <p style={styles.gameCardText}>{card.text}</p>
                </div>
              );
            })}

            {/* Random game cards */}
            {gameCards.map((card, idx) => (
              <div
                key={card.id}
                onClick={() => playCard(card.id)}
                style={{
                  ...styles.gameCard,
                  animationDelay: `${idx * 0.1}s`,
                  border: selectedPlayCard === card.id
                    ? '3px solid #2ed573'
                    : '2px solid rgba(255,255,255,0.1)',
                  boxShadow: selectedPlayCard === card.id
                    ? '0 0 25px rgba(46,213,115,0.4)'
                    : 'none',
                }}
              >
                <span style={styles.cardCategory}>{card.category}</span>
                <p style={styles.gameCardText}>{card.text}</p>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <button
            onClick={submitCard}
            disabled={!selectedPlayCard}
            style={{
              ...styles.submitButton,
              opacity: selectedPlayCard ? 1 : 0.4,
            }}
          >
            {selectedPlayCard ? '🚀 YUBORISH' : 'Kartani tanlang'}
          </button>
        </div>
      )}

      {/* ============ RESULTS PHASE ============ */}
      {phase === 'results' && showResult && (
        <div style={styles.phaseContainer}>
          <div style={styles.resultContent}>
            <div style={styles.confetti}>🎉</div>
            <h2 style={styles.resultTitle}>O\'yin tugadi!</h2>

            {/* Winner card */}
            <div style={styles.winnerCard}>
              <div style={styles.winnerCrown}>👑</div>
              <img
                src={winner?.avatar}
                alt=""
                style={styles.winnerAvatar}
              />
              <h3 style={styles.winnerName}>{winner?.name}</h3>
              <p style={styles.winnerLabel}>G\'OLIB!</p>
              {winner?.id === 'me' && (
                <div style={styles.winnerReward}>
                  +50 💰 | +20 ⭐
                </div>
              )}
            </div>

            {/* Players list */}
            <div style={styles.resultPlayersList}>
              <h3 style={styles.resultSubTitle}>Ishtirokchilar</h3>
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    ...styles.resultPlayerRow,
                    background: p.id === winner?.id
                      ? 'rgba(255,0,110,0.1)'
                      : 'rgba(255,255,255,0.02)',
                    border: p.id === winner?.id
                      ? '1px solid rgba(255,0,110,0.3)'
                      : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={styles.resultRank}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <img src={p.avatar} alt="" style={styles.resultAvatar} />
                  <span style={styles.resultName}>
                    {p.name} {p.id === 'me' ? '(Siz)' : ''}
                  </span>
                  {p.id === winner?.id && (
                    <span style={styles.winnerBadge}>G\'olib</span>
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={styles.resultButtons}>
              <button
                onClick={() => {
                  hapticImpact('medium');
                  // Reset everything for new game
                  setPhase('matchmaking');
                  setPlayerCount(0);
                  setPlayers([]);
                  setSelectedCards([]);
                  setMyVote(null);
                  setTopics(MOCK_TOPICS.map(t => ({ ...t, votes: 0 })));
                  setWinningTopic(null);
                  setGameCards([]);
                  setSelectedPlayCard(null);
                  setShowResult(false);
                  setWinner(null);
                  setCountdown(30);
                }}
                style={styles.playAgainButton}
              >
                🔄 Qayta o'ynash
              </button>
              <button
                onClick={() => {
                  hapticImpact('light');
                  onGameEnd();
                }}
                style={styles.exitButton}
              >
                🏠 Bosh sahifa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// STYLES
// ============================================
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121f 50%, #0a0a0f 100%)',
    color: '#fff',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: 100,
  },

  // --- Phase containers ---
  phaseContainer: {
    padding: '20px 16px',
    maxWidth: 480,
    margin: '0 auto',
  },

  phaseTitle: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: 'center',
    margin: '16px 0 4px',
    background: 'linear-gradient(135deg, #ff006e, #9b5de5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  phaseSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },

  // --- MATCHMAKING ---
  matchmakingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 40,
  },

  searchingIcon: {
    marginBottom: 32,
  },

  searchCircle: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'rgba(255,0,110,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  searchPulse: {
    position: 'absolute',
    inset: -10,
    borderRadius: '50%',
    border: '2px solid rgba(255,0,110,0.3)',
    animation: 'pulse 2s ease-in-out infinite',
  } as React.CSSProperties,

  searchPulse2: {
    position: 'absolute',
    inset: -25,
    borderRadius: '50%',
    border: '2px solid rgba(255,0,110,0.15)',
    animation: 'pulse 2s ease-in-out infinite 0.5s',
  } as React.CSSProperties,

  searchEmoji: {
    fontSize: 48,
  },

  playerCounter: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 24,
  },

  playerCountNum: {
    fontSize: 56,
    fontWeight: 800,
    transition: 'color 0.3s ease',
  },

  playerCountDivider: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: 300,
  },

  playerCountTotal: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 600,
  },

  progressDots: {
    display: 'flex',
    gap: 10,
    marginBottom: 32,
  },

  progressDot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },

  joiningPlayers: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 20,
  },

  joiningAvatar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    animation: 'fadeInUp 0.4s ease forwards',
    opacity: 0,
  } as React.CSSProperties,

  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '2px solid rgba(255,0,110,0.5)',
  },

  joiningName: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    maxWidth: 60,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  readyMessage: {
    animation: 'fadeInUp 0.5s ease forwards',
  } as React.CSSProperties,

  readyText: {
    fontSize: 16,
    color: '#2ed573',
    fontWeight: 600,
  },

  // --- PREPARATION ---
  timerBar: {
    position: 'relative',
    height: 36,
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
  },

  timerFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 18,
    transition: 'width 1s linear, background 0.3s ease',
  },

  timerText: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
    zIndex: 1,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  selectionBadge: {
    fontSize: 12,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 12,
    marginLeft: 'auto',
  },

  votedBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 12,
    background: 'rgba(46,213,115,0.2)',
    color: '#2ed573',
    marginLeft: 'auto',
  },

  cardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  selectableCard: {
    padding: 14,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  },

  cardCheck: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#ff006e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
  },

  cardCategory: {
    fontSize: 11,
    color: '#00b4d8',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 6,
    display: 'block',
  },

  cardText: {
    fontSize: 14,
    lineHeight: 1.4,
    color: 'rgba(255,255,255,0.9)',
    margin: 0,
  },

  topicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
  },

  topicButton: {
    padding: '14px 12px',
    borderRadius: 14,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    color: '#fff',
  },

  topicIcon: {
    fontSize: 28,
  },

  topicName: {
    fontSize: 13,
    fontWeight: 600,
  },

  topicVotes: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },

  readyPlayers: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },

  readyPlayerItem: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  readyAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.1)',
  },

  readyDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    position: 'absolute',
    bottom: -2,
    right: -2,
    border: '2px solid #0a0a0f',
    transition: 'background 0.3s ease',
  },

  readyButton: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    border: 'none',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    letterSpacing: 1,
  },

  // --- PLAYING ---
  topicBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '12px 20px',
    borderRadius: 14,
    background: 'rgba(155,93,229,0.15)',
    border: '1px solid rgba(155,93,229,0.3)',
    marginBottom: 20,
  },

  topicBannerIcon: {
    fontSize: 24,
  },

  topicBannerText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#9b5de5',
  },

  gameCardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 24,
  },

  gameCard: {
    padding: 16,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    animation: 'fadeInUp 0.4s ease forwards',
    opacity: 0,
  } as React.CSSProperties,

  gameCardBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#ff006e',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  gameCardText: {
    fontSize: 15,
    lineHeight: 1.5,
    color: 'rgba(255,255,255,0.95)',
    margin: '6px 0 0',
    fontWeight: 500,
  },

  submitButton: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    border: 'none',
    background: 'linear-gradient(135deg, #ff006e, #9b5de5)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: 1,
    transition: 'all 0.2s ease',
  },

  // --- RESULTS ---
  resultContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 30,
  },

  confetti: {
    fontSize: 64,
    marginBottom: 8,
    animation: 'fadeInUp 0.6s ease forwards',
  } as React.CSSProperties,

  resultTitle: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 24,
    background: 'linear-gradient(135deg, #ff006e, #9b5de5, #00b4d8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  winnerCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px 24px',
    borderRadius: 20,
    background: 'linear-gradient(135deg, rgba(255,0,110,0.1), rgba(155,93,229,0.1))',
    border: '1px solid rgba(255,0,110,0.3)',
    marginBottom: 28,
    width: '100%',
    maxWidth: 280,
    animation: 'fadeInUp 0.5s ease forwards',
  } as React.CSSProperties,

  winnerCrown: {
    fontSize: 40,
    marginBottom: 8,
  },

  winnerAvatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    border: '3px solid #ff006e',
    boxShadow: '0 0 30px rgba(255,0,110,0.4)',
    marginBottom: 12,
  },

  winnerName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 4,
  },

  winnerLabel: {
    fontSize: 14,
    fontWeight: 800,
    color: '#ff006e',
    letterSpacing: 3,
  },

  winnerReward: {
    marginTop: 12,
    padding: '8px 20px',
    borderRadius: 20,
    background: 'rgba(46,213,115,0.15)',
    border: '1px solid rgba(46,213,115,0.3)',
    color: '#2ed573',
    fontWeight: 700,
    fontSize: 16,
  },

  resultPlayersList: {
    width: '100%',
    marginBottom: 24,
  },

  resultSubTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    textAlign: 'center',
  },

  resultPlayerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    borderRadius: 12,
    marginBottom: 6,
  },

  resultRank: {
    fontSize: 18,
    width: 32,
    textAlign: 'center',
  },

  resultAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
  },

  resultName: {
    fontSize: 14,
    fontWeight: 500,
    flex: 1,
  },

  winnerBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 10,
    background: 'rgba(255,0,110,0.2)',
    color: '#ff006e',
  },

  resultButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },

  playAgainButton: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    border: 'none',
    background: 'linear-gradient(135deg, #ff006e, #9b5de5)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  exitButton: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default GameScreen;
