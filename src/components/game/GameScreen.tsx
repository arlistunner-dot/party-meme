import { useState, useEffect } from 'react';
import { hapticImpact, hapticSuccess } from '@/config/telegram';

interface GameScreenProps {
  onNavigate: (tab: string) => void;
  onGameEnd: () => void;
}

// QIZIL KARTALAR — savollar
const RED_CARDS = [
  { id: 1, text: 'Men uydan chiqishni yomon ko\'raman, chunki...' },
  { id: 2, text: 'Eng yomon sovg\'a bu...' },
  { id: 3, text: 'Qiz do\'stim meni tashlab ketdi, chunki men...' },
  { id: 4, text: 'Keksa buvim menga shunday dedi...' },
  { id: 5, text: 'Men o\'zimni eng yomon his qilgan payt...' },
  { id: 6, text: 'Ishda eng yomon narsa bu...' },
  { id: 7, text: 'Maktabda men har doim...' },
  { id: 8, text: 'Oilam menga ishonmaydi, chunki men...' },
];

// KO'K KARTALAR — javoblar
const BLUE_CARDS_POOL = [
  { id: 101, text: 'WiFi parolini unutganingizda' },
  { id: 102, text: 'Nonushtasiz uydan chiqqan va hayotim yaxshi ketayotgani' },
  { id: 103, text: 'Sport zalga borganim (1 kun)' },
  { id: 104, text: 'Kredit karta hisobimni ko\'rganimda' },
  { id: 105, text: 'Men ertaga boshlayman degan edim... 3 yil oldin' },
  { id: 106, text: 'Telefonim 1% da va zaryadkani topolmayapman' },
  { id: 107, text: 'Do\'stim 5 daqiqaga chiqaman deganiga 2 soat bo\'ldi' },
  { id: 108, text: 'Yangi yil qarorlarim (1 hafta yashagan)' },
  { id: 109, text: 'Onamning Men sen yoshligingda hikoyasi' },
  { id: 110, text: 'Instagram da 2 soat tezgina qarab chiqish' },
  { id: 111, text: 'Kuryer Yetib keldim deganda men uyda emasligim' },
  { id: 112, text: 'Pullarimni tejayapman deb keyin ko\'rgan narsamni sotib olganman' },
  { id: 113, text: 'Pazandalikda tajriba o\'tkazish va oshxonani yoqish' },
  { id: 114, text: 'GPS ishonmayman deb adashib ketishim' },
  { id: 115, text: 'Ertalab 6 da turganim va sport zalga bormaganim' },
];

// INVENTAR — 2 ta karta
const INVENTORY_CARDS = [
  { id: 'inv1', text: 'WiFi yo\'qolgan paytda qo\'rquv', category: 'tech', power: 7 },
  { id: 'inv2', text: 'Do\'st bilan kechki ovqat va sirlar', category: 'national', power: 6 },
];

// O'YINCHILAR (simulyatsiya)
const PLAYERS = [
  { id: 'p1', name: 'Sardor', avatar: '😎', score: 0, cards: 7 },
  { id: 'p2', name: 'Dilnoza', avatar: '🤠', score: 0, cards: 7 },
  { id: 'p3', name: 'Javohir', avatar: '👻', score: 0, cards: 7 },
  { id: 'p4', name: 'Malika', avatar: '🦊', score: 0, cards: 7 },
  { id: 'p5', name: 'Sarvar', avatar: '🐼', score: 0, cards: 7 },
  { id: 'p6', name: 'Nodira', avatar: '🦁', score: 0, cards: 7 },
  { id: 'me', name: 'Siz', avatar: '🤖', score: 0, cards: 7 },
];

// Shuffle
function shuffle<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

export default function GameScreen({ onNavigate, onGameEnd }: GameScreenProps) {
  const [phase, setPhase] = useState<'play' | 'reveal' | 'result'>('play');
  const [round, setRound] = useState(1);
  const [selectedBlue, setSelectedBlue] = useState<number | string | null>(null);
  const [flippedRed, setFlippedRed] = useState(false);
  const [flippedBlue, setFlippedBlue] = useState<number | string | null>(null);
  const [roundTimer, setRoundTimer] = useState(30);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    PLAYERS.forEach((p) => (s[p.id] = 0));
    return s;
  });

  // Qizil karta — har raundda random
  const [currentRed, setCurrentRed] = useState(() =>
    RED_CARDS[Math.floor(Math.random() * RED_CARDS.length)]
  );

  // 7 ta karta: 2 inventar + 5 random
  const [playerCards, setPlayerCards] = useState(() => {
    const random = shuffle(BLUE_CARDS_POOL).slice(0, 5);
    return [...INVENTORY_CARDS, ...random];
  });

  // 5 ta yopiq qizil karta (stol ustida)
  const redCardsOnTable = Array.from({ length: 5 }).map((_, i) => ({
    roundNum: i + 1,
    isOpen: i + 1 < round,
    isCurrent: i + 1 === round,
  }));

  // Taymer
  useEffect(() => {
    if (phase !== 'play') return;
    if (roundTimer <= 0) {
      if (playerCards.length > 0) handleSelectBlue(playerCards[0].id);
      return;
    }
    const t = setInterval(() => setRoundTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [roundTimer, phase]);

  // Ko'k karta tanlash
  const handleSelectBlue = (id: number | string) => {
    hapticImpact('medium');
    setSelectedBlue(id);
    setFlippedBlue(id);
    setTimeout(() => setPhase('reveal'), 800);
  };

  // Qizil karta ochish (animatsiya)
  useEffect(() => {
    if (phase === 'reveal' && !flippedRed) {
      setTimeout(() => setFlippedRed(true), 500);
    }
  }, [phase, flippedRed]);

  // Natija
  useEffect(() => {
    if (phase === 'reveal' && flippedRed) {
      const timer = setTimeout(() => {
        hapticSuccess();
        // Simulyatsiya — tasodifiy g'olib
        const randomWinner = PLAYERS[Math.floor(Math.random() * (PLAYERS.length - 1))];
        setScores((prev) => ({ ...prev, [randomWinner.id]: prev[randomWinner.id] + 1 }));
        setPhase('result');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, flippedRed]);

  // Keyingi raund
  const handleNextRound = () => {
    hapticImpact('medium');
    if (round >= 5) {
      onGameEnd();
      return;
    }
    setRound((r) => r + 1);
    setSelectedBlue(null);
    setFlippedBlue(null);
    setFlippedRed(false);
    setPhase('play');
    setRoundTimer(30);

    const unused = RED_CARDS.filter((c) => c.id !== currentRed.id);
    setCurrentRed(unused[Math.floor(Math.random() * unused.length)]);

    const random = shuffle(BLUE_CARDS_POOL).slice(0, 5);
    setPlayerCards([...INVENTORY_CARDS, ...random]);
  };

  const timerColor = roundTimer <= 10 ? '#ff4757' : roundTimer <= 20 ? '#ffa502' : '#2ed573';
  const selectedCardText = playerCards.find((c) => c.id === selectedBlue)?.text || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0a0a0f',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ====== FON RASMI ====== */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(/assets/game-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ====== HEADER ====== */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <button
          onClick={() => { hapticImpact('light'); onGameEnd(); }}
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', fontSize: '14px',
          }}
        >
          ←
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '2px' }}>
            ROUND {round}/5
          </div>
        </div>
        <div
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: `rgba(${roundTimer <= 10 ? '255,71,87' : roundTimer <= 20 ? '255,165,0' : '46,213,115'},0.2)`,
            border: `2px solid ${timerColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: timerColor,
          }}
        >
          {roundTimer}
        </div>
      </div>

      {/* ====== STOL + O'YINCHILAR ====== */}
      <div
        style={{
          position: 'relative', zIndex: 5, flex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '10px',
        }}
      >
        {/* O'YINCHILAR — stol atrofida */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '360px',
            height: '200px',
            marginBottom: '10px',
          }}
        >
          {PLAYERS.filter((p) => p.id !== 'me').map((player, i) => {
            // 6 o'yinchini aylana bo'ylab joylashtirish
            const positions = [
              { top: '0%', left: '50%', transform: 'translateX(-50%)' },
              { top: '25%', left: '0%' },
              { top: '25%', right: '0%' },
              { top: '65%', left: '5%' },
              { top: '65%', right: '5%' },
              { top: '0%', left: '20%' },
            ];
            const pos = positions[i] || positions[0];
            const playerScore = scores[player.id] || 0;

            return (
              <div
                key={player.id}
                style={{
                  position: 'absolute',
                  ...pos,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: playerScore > 0 ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', position: 'relative',
                  }}
                >
                  {player.avatar}
                  {/* Online */}
                  <div
                    style={{
                      position: 'absolute', bottom: '-1px', right: '-1px',
                      width: '9px', height: '9px', borderRadius: '50%',
                      background: '#2ed573', border: '2px solid rgba(0,0,0,0.5)',
                    }}
                  />
                </div>
                {/* Ism + ball */}
                <div
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '9px',
                    color: 'rgba(255,255,255,0.7)', textAlign: 'center',
                    maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {player.name}
                </div>
                {playerScore > 0 && (
                  <div
                    style={{
                      fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700,
                      color: '#ffd700',
                    }}
                  >
                    {playerScore}
                  </div>
                )}
                {/* Karta soni */}
                <div
                  style={{
                    display: 'flex', gap: '1px',
                  }}
                >
                  {Array.from({ length: Math.min(3, player.cards) }).map((_, j) => (
                    <div
                      key={j}
                      style={{
                        width: '8px', height: '12px', borderRadius: '2px',
                        background: 'linear-gradient(135deg, #3742fa, #2d34a8)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ====== STOL MARKAZI — QIZIL KARTALAR ====== */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            justifyContent: 'center',
            marginBottom: '10px',
          }}
        >
          {redCardsOnTable.map((card) => {
            const isRevealed = card.roundNum < round;
            const isCurrent = card.roundNum === round;
            const isFuture = card.roundNum > round;

            return (
              <div
                key={card.roundNum}
                style={{
                  width: '52px',
                  height: '74px',
                  borderRadius: '8px',
                  perspective: '600px',
                  position: 'relative',
                }}
              >
                {/* Yopiq karta */}
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '8px',
                    backfaceVisibility: 'hidden',
                    transition: 'transform 0.6s ease',
                    transform: isRevealed || (isCurrent && flippedRed) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    background: isFuture
                      ? 'linear-gradient(135deg, #cc0033, #990022)'
                      : 'linear-gradient(135deg, #ff006e, #cc0044)',
                    border: isCurrent
                      ? '2px solid #ffd700'
                      : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: isCurrent
                      ? '0 0 15px rgba(255,215,0,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>🎴</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)', fontSize: '12px',
                      fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {card.roundNum}
                  </div>
                </div>

                {/* Ochilgan karta */}
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '8px',
                    backfaceVisibility: 'hidden',
                    transition: 'transform 0.6s ease',
                    transform: isRevealed || (isCurrent && flippedRed) ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                    background: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px',
                  }}
                >
                  ✓
                </div>
              </div>
            );
          })}
        </div>

        {/* JORIY SAVOL — ochilgan qizil karta */}
        {(phase === 'reveal' || phase === 'result') && flippedRed && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(255,71,87,0.15)',
              border: '1px solid rgba(255,71,87,0.3)',
              maxWidth: '320px',
              textAlign: 'center',
              animation: 'fadeUp 0.3s ease forwards',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)', fontSize: '10px',
                color: '#ff4757', marginBottom: '4px', letterSpacing: '1px',
              }}
            >
              SAVOL
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)', fontSize: '14px',
                fontWeight: 700, color: '#fff', lineHeight: 1.4,
              }}
            >
              {currentRed.text}
            </div>
          </div>
        )}

        {/* Natija */}
        {phase === 'result' && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.2)',
              textAlign: 'center',
              maxWidth: '320px',
              animation: 'fadeUp 0.3s ease forwards',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#ffd700' }}>
              🏆 {selectedCardText}
            </div>
            <button
              onClick={handleNextRound}
              style={{
                marginTop: '8px',
                padding: '8px 20px', borderRadius: '8px', border: 'none',
                background: round >= 5
                  ? 'linear-gradient(135deg, #2ed573, #1abc9c)'
                  : 'linear-gradient(135deg, #ff006e, #ff4757)',
                fontFamily: 'var(--font-display)', fontSize: '12px',
                fontWeight: 700, color: '#fff', cursor: 'pointer',
              }}
            >
              {round >= 5 ? '🏁 NATIJALAR' : '▶ KEYINGI'}
            </button>
          </div>
        )}
      </div>

      {/* ====== PASTKI QISM — O'YINCHINING KARTALARI ====== */}
      {phase === 'play' && (
        <div
          style={{
            position: 'relative', zIndex: 10,
            padding: '10px 12px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
          }}
        >
          {/* Sarlavha */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '8px', padding: '0 4px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
              🔵 SIZNING KARTALARINGIZ
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: '#3742fa' }}>
              {playerCards.length} ta
            </div>
          </div>

          {/* Kartalar — gorizontal scroll */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '6px',
              scrollbarWidth: 'none',
            }}
          >
            {playerCards.map((card, i) => {
              const isInventory = typeof card.id === 'string';
              const isFlipped = flippedBlue === card.id;

              return (
                <button
                  key={card.id}
                  onClick={() => handleSelectBlue(card.id)}
                  style={{
                    minWidth: '80px',
                    height: '110px',
                    borderRadius: '10px',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    perspective: '600px',
                    flexShrink: 0,
                    animation: 'fadeUp 0.3s ease forwards',
                    animationDelay: `${i * 0.05}s`,
                    opacity: 0,
                    position: 'relative',
                  }}
                >
                  {/* YOPIQ KO'K KARTA */}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '10px',
                      backfaceVisibility: 'hidden',
                      transition: 'transform 0.5s ease',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      background: 'linear-gradient(135deg, #3742fa, #2d34a8)',
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Naqsh */}
                    <div
                      style={{
                        width: '40px', height: '55px', borderRadius: '6px',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ fontSize: '16px' }}>🎴</div>
                    </div>
                    {isInventory && (
                      <div
                        style={{
                          position: 'absolute', top: '4px', right: '4px',
                          width: '14px', height: '14px', borderRadius: '50%',
                          background: '#00b4d8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '7px', color: '#fff', fontWeight: 700,
                        }}
                      >
                        ★
                      </div>
                    )}
                  </div>

                  {/* OCHILGAN KARTA (orti) */}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '10px',
                      backfaceVisibility: 'hidden',
                      transition: 'transform 0.5s ease',
                      transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                      background: '#fff',
                      border: '1.5px solid rgba(55,66,250,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '8px',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-body)', fontSize: '10px',
                        fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3,
                        textAlign: 'center',
                      }}
                    >
                      {card.text}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
