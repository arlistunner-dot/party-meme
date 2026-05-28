import { useState, useEffect } from 'react';
import { hapticImpact, hapticSuccess } from '@/config/telegram';

interface GameScreenProps {
  onNavigate: (tab: string) => void;
  onGameEnd: () => void;
}

// QIZIL KARTALAR — savollar (har raundda random tanlanadi)
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

// KO'K KARTALAR — o'yinchiga beriladigan 5 ta random karta
const BLUE_CARDS_POOL = [
  { id: 101, text: 'WiFi parolini unutganingizda' },
  { id: 102, text: 'Nonushtasiz uydan chiqqan va hayotim yaxshi ketayotgani' },
  { id: 103, text: 'Sport zalga borganim (1 kun)' },
  { id: 104, text: 'Kredit karta hisobimni ko\'rganimda 🫠' },
  { id: 105, text: 'Men ertaga boshlayman deb aytgan edim... 3 yil oldin' },
  { id: 106, text: 'Telefonim 1% da va zaryadkani topolmayapman' },
  { id: 107, text: 'Do\'stim "5 daqiqaga chiqaman" deganiga 2 soat bo\'ldi' },
  { id: 108, text: 'Yangi yil qarorlarim (1 hafta yashagan)' },
  { id: 109, text: 'Onamning "Men sen yoshligingda..." hikoyasi' },
  { id: 110, text: 'Instagram da 2 soat "tezgina" qarab chiqish' },
  { id: 111, text: 'Kuryer "Yetib keldim" deganda men uyda emasligim' },
  { id: 112, text: 'Pullarimni tejayapman deb o\'ylab, keyin ko\'rgan narsamni sotib olganmam' },
  { id: 113, text: 'Pazandalikda "tajriba" o\'tkazish va oshxonani yoqish' },
  { id: 114, text: 'GPS ishonmayman deb adashib ketishim' },
  { id: 115, text: 'Ertalab soat 6 da turganim va sport zalga bormaganim' },
];

// O'YINCHINING INVENTARIDAN KELGAN 2 TA KARTA
const INVENTORY_CARDS = [
  { id: 'inv1', text: 'WiFi yo\'qolgan paytda qo\'rquv', category: 'tech', power: 7 },
  { id: 'inv2', text: 'Do\'st bilan kechki ovqat va sirlar', category: 'national', power: 6 },
];

// Tasodifiy tanlash helper
function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GameScreen({ onNavigate, onGameEnd }: GameScreenProps) {
  const [phase, setPhase] = useState<'play' | 'judge' | 'result'>('play');
  const [round, setRound] = useState(1);
  const [selectedBlue, setSelectedBlue] = useState<number | null>(null);
  const [scores] = useState<Record<number, number>>({ 1: 2, 2: 1, 3: 0 });
  const [roundTimer, setRoundTimer] = useState(30);

  // Har raundda random qizil karta
  const [currentRedCard, setCurrentRedCard] = useState(() =>
    RED_CARDS[Math.floor(Math.random() * RED_CARDS.length)]
  );

  // 7 ta karta: 2 ta inventar + 5 ta random
  const [playerCards, setPlayerCards] = useState(() => {
    const randomCards = shuffle(BLUE_CARDS_POOL).slice(0, 5);
    return [...INVENTORY_CARDS, ...randomCards];
  });

  // 30 soniya taymer
  useEffect(() => {
    if (phase !== 'play') return;
    if (roundTimer <= 0) {
      // Vaqt tugadi — avtomatik birinchi kartani tanlash
      if (playerCards.length > 0) {
        handleSelectBlue(playerCards[0].id);
      }
      return;
    }

    const timer = setInterval(() => {
      setRoundTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [roundTimer, phase]);

  // Ko'k karta tanlash
  const handleSelectBlue = (id: number | string) => {
    hapticImpact('medium');
    setSelectedBlue(id as number);
    setTimeout(() => setPhase('judge'), 600);
  };

  // Hakam tanlashi
  const handleJudge = () => {
    hapticSuccess();
    setPhase('result');
  };

  // Keyingi round
  const handleNextRound = () => {
    hapticImpact('medium');
    if (round >= 5) {
      onGameEnd();
      return;
    }

    setRound(round + 1);
    setSelectedBlue(null);
    setPhase('play');
    setRoundTimer(30);

    // Yangi random qizil karta
    const unusedRed = RED_CARDS.filter((c) => c.id !== currentRedCard.id);
    setCurrentRedCard(unusedRed[Math.floor(Math.random() * unusedRed.length)]);

    // Yangi random 5 ta karta
    const randomCards = shuffle(BLUE_CARDS_POOL).slice(0, 5);
    setPlayerCards([...INVENTORY_CARDS, ...randomCards]);
  };

  const timerColor =
    roundTimer <= 10 ? '#ff4757' : roundTimer <= 20 ? '#ffa502' : '#2ed573';

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
      {/* FON RASMI */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/assets/game-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      {/* Qorong'u overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.85) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* HEADER */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          background: 'rgba(10,10,15,0.7)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            hapticImpact('light');
            onGameEnd();
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
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '2px',
            }}
          >
            ROUND {round}/5
          </div>
        </div>

        {/* Taymer */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `rgba(${
              roundTimer <= 10
                ? '255,71,87'
                : roundTimer <= 20
                ? '255,165,0'
                : '46,213,115'
            },0.12)`,
            border: `2px solid ${timerColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 700,
            color: timerColor,
          }}
        >
          {roundTimer}
        </div>
      </div>

      {/* KONTENT */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
        }}
      >
        {/* ======== PLAY — QIZIL KARTA + KO'K KARTALAR ======== */}
        {phase === 'play' && (
          <>
            {/* QIZIL KARTA — markazda */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                background:
                  'linear-gradient(135deg, rgba(255,71,87,0.15), rgba(255,0,110,0.08))',
                border: '2px solid rgba(255,71,87,0.3)',
                boxShadow: '0 8px 30px rgba(255,71,87,0.15)',
                textAlign: 'center',
                animation: 'fadeUp 0.4s ease forwards',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: '#ff4757',
                  marginBottom: '8px',
                  letterSpacing: '2px',
                }}
              >
                🔴 SAVOL
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.5,
                }}
              >
                {currentRedCard.text}
              </div>
            </div>

            {/* Sarlavha */}
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#3742fa',
                }}
              >
                🔵 JAVOBINGIZNI TANLANG
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.4)',
                  marginTop: '2px',
                }}
              >
                Eng kulgili javobni tashlang
              </div>
            </div>

            {/* KO'K KARTALAR — 7 ta (scroll qilinadigan) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingBottom: '8px',
              }}
            >
              {playerCards.map((card, index) => {
                const isInventory = typeof card.id === 'string';
                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectBlue(card.id)}
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      borderRadius: '14px',
                      border:
                        selectedBlue === card.id
                          ? '2px solid #3742fa'
                          : '2px solid rgba(55,66,250,0.12)',
                      background:
                        selectedBlue === card.id
                          ? 'rgba(55,66,250,0.15)'
                          : isInventory
                          ? 'rgba(0,180,216,0.06)'
                          : 'rgba(55,66,250,0.04)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      lineHeight: 1.4,
                      animation: 'fadeUp 0.3s ease forwards',
                      animationDelay: `${index * 0.06}s`,
                      opacity: 0,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Inventar belgisi */}
                    {isInventory && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '10px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '9px',
                          color: '#00b4d8',
                          background: 'rgba(0,180,216,0.12)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        🎴 SIZNIKI
                      </div>
                    )}
                    {card.text}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ======== JUDGE — HAKAM TANLOVI ======== */}
        {phase === 'judge' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#ffd700',
                  marginBottom: '4px',
                }}
              >
                👑 HAKAM TANLASHI
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                Eng yaxshi javobni tanlang
              </div>
            </div>

            {/* Savol */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(255,71,87,0.1)',
                border: '1px solid rgba(255,71,87,0.2)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: '#ff4757',
                  marginBottom: '4px',
                  letterSpacing: '1px',
                }}
              >
                SAVOL:
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {currentRedCard.text}
              </div>
            </div>

            {/* Javob */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                background:
                  'linear-gradient(135deg, rgba(55,66,250,0.15), rgba(155,93,229,0.1))',
                border: '2px solid rgba(155,93,229,0.25)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: '#9b5de5',
                  marginBottom: '6px',
                  letterSpacing: '1px',
                }}
              >
                SIZNING JAVOBINGIZ:
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.4,
                }}
              >
                {playerCards.find((c) => c.id === selectedBlue)?.text}
              </div>
            </div>

            <button
              onClick={handleJudge}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #ffd700, #e6ac00)',
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '3px',
                color: '#1a1a1a',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(0.96)';
              }}
              onMouseUp={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              👑 G'OLIBNI TANLASH
            </button>
          </div>
        )}

        {/* ======== NATIJA ======== */}
        {phase === 'result' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              paddingTop: '20px',
            }}
          >
            <div style={{ fontSize: '64px' }}>🎉</div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 700,
                color: '#ffd700',
                margin: 0,
                letterSpacing: '3px',
              }}
            >
              ROUND {round} TUGADI
            </h2>

            {/* Ballar */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {Object.entries(scores).map(([id, score]) => (
                <div key={id} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, rgba(155,93,229,0.3), rgba(255,0,110,0.3))',
                      border: '2px solid rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#fff',
                      margin: '0 auto 6px',
                    }}
                  >
                    {id === '1' ? 'A' : id === '2' ? 'B' : 'C'}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#ffd700',
                    }}
                  >
                    {score}
                  </div>
                </div>
              ))}
            </div>

            {/* G'olib kartasi */}
            <div
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '16px',
                background:
                  'linear-gradient(135deg, rgba(55,66,250,0.12), rgba(155,93,229,0.08))',
                border: '2px solid rgba(155,93,229,0.2)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: '#ffd700',
                  marginBottom: '8px',
                  letterSpacing: '1px',
                }}
              >
                🏆 G'OLIB KARTA
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.4,
                }}
              >
                {playerCards.find((c) => c.id === selectedBlue)?.text}
              </div>
            </div>

            <button
              onClick={handleNextRound}
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background:
                  round >= 5
                    ? 'linear-gradient(135deg, #2ed573, #1abc9c)'
                    : 'linear-gradient(135deg, #ff006e, #ff4757)',
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(0.96)';
              }}
              onMouseUp={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {round >= 5 ? '🏁 NATIJALAR' : '▶ KEYINGI ROUND'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
