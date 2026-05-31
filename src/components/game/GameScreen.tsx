import { useState, useEffect, useCallback } from 'react';
import { hapticImpact, hapticSuccess } from '@/config/telegram';

// ============= INTERFEYSLAR =============
interface GameScreenProps {
  onNavigate: (tab: string) => void;
  onGameEnd: () => void;
}

interface Card {
  id: number | string;
  text: string;
  category?: string;
  power?: number;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  cards: number;
}

// ============= KARTALAR =============
const RED_CARDS: Card[] = [
  { id: 1, text: 'Men uydan chiqishni yomon ko\'raman, chunki...' },
  { id: 2, text: 'Eng yomon sovg\'a bu...' },
  { id: 3, text: 'Qiz do\'stim meni tashlab ketdi, chunki men...' },
  { id: 4, text: 'Keksa buvim menga shunday dedi...' },
  { id: 5, text: 'Men o\'zimni eng yomon his qilgan payt...' },
  { id: 6, text: 'Ishda eng yomon narsa bu...' },
  { id: 7, text: 'Maktabda men har doim...' },
  { id: 8, text: 'Oilam menga ishonmaydi, chunki men...' },
];

const BLUE_CARDS_POOL: Card[] = [
  { id: 101, text: 'WiFi parolini unutganingizda' },
  { id: 102, text: 'Nonushtasiz uydan chiqqanman' },
  { id: 103, text: 'Sport zalga borganim (1 kun)' },
  { id: 104, text: 'Kredit karta hisobimni ko\'rganimda' },
  { id: 105, text: 'Men ertaga boshlayman dedim... 3 yil oldin' },
  { id: 106, text: 'Telefonim 1% da va zaryadka topilmaydi' },
  { id: 107, text: 'Do\'stim 5 daqiqaga chiqaman deganiga 2 soat' },
  { id: 108, text: 'Yangi yil qarorlarim (1 hafta yashagan)' },
  { id: 109, text: 'Onamning "Men sen yoshligingda" hikoyasi' },
  { id: 110, text: 'Instagram da 2 soat "tezgina" qarab chiqish' },
  { id: 111, text: 'Kuryer "Yetib keldim" deganda uyda emasligim' },
  { id: 112, text: 'Pullarimni tejayapman deb narsa sotib olganman' },
  { id: 113, text: 'Pazandalikda tajriba va oshxonani yoqish' },
  { id: 114, text: 'GPS ishonmayman deb adashib ketishim' },
  { id: 115, text: 'Ertalab 6 da turganim va zalga bormaganim' },
];

const INVENTORY_POOL: Card[] = [
  { id: 'inv1', text: 'WiFi yo\'qolgan paytda qo\'rquv', category: 'tech', power: 7 },
  { id: 'inv2', text: 'Do\'st bilan kechki ovqat va sirlar', category: 'life', power: 6 },
  { id: 'inv3', text: 'Barchaga yolg\'on gapirib chet elga ketish', category: 'wild', power: 9 },
  { id: 'inv4', text: 'Buvining maslahati bilan hayotni yaxshilash', category: 'national', power: 8 },
  { id: 'inv5', text: 'Telefon yo\'qolganida tinchlik topish', category: 'tech', power: 7 },
];

// ============= FOYDALANUVCHI YORDAMCHI =============
function shuffle<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

const PLAYERS_INIT: Player[] = [
  { id: 'p1', name: 'Sardor', avatar: '😎', score: 0, cards: 7 },
  { id: 'p2', name: 'Dilnoza', avatar: '🤠', score: 0, cards: 7 },
  { id: 'p3', name: 'Javohir', avatar: '👻', score: 0, cards: 7 },
  { id: 'p4', name: 'Malika', avatar: '🦊', score: 0, cards: 7 },
  { id: 'p5', name: 'Sarvar', avatar: '🐼', score: 0, cards: 7 },
  { id: 'p6', name: 'Nodira', avatar: '🦁', score: 0, cards: 7 },
  { id: 'me', name: 'Siz', avatar: '🤖', score: 0, cards: 7 },
];

const TOTAL_ROUNDS = 5;

// ============= ASOSIY KOMPONENT =============
export default function GameScreen({ onNavigate, onGameEnd }: GameScreenProps) {
  // -- O'yin bosqichlari --
  // 'waiting'  → xona kutish / tayyorlanish
  // 'showQuestion' → qizil karta ochiladi (savol)
  // 'playing'  → o'yinchi ko'k karta tanlaydi
  // 'voting'   → barcha kartalar ko'rsatiladi, ovoz berish
  // 'result'   → raund natijasi
  type Phase = 'waiting' | 'showQuestion' | 'playing' | 'voting' | 'result';

  const [phase, setPhase] = useState<Phase>('waiting');
  const [round, setRound] = useState(1);
  const [selectedBlue, setSelectedBlue] = useState<number | string | null>(null);
  const [roundTimer, setRoundTimer] = useState(30);
  const [countdown, setCountdown] = useState(3);
  const [isTimeWarning, setIsTimeWarning] = useState(false);

  // -- O'yinchilar --
  const [players, setPlayers] = useState<Player[]>(() =>
    PLAYERS_INIT.map((p) => ({ ...p, score: 0 }))
  );

  // -- Joriy savol (qizil karta) --
  const [currentRed, setCurrentRed] = useState<Card>(() =>
    RED_CARDS[Math.floor(Math.random() * RED_CARDS.length)]
  );
  const [usedRedIds, setUsedRedIds] = useState<Set<number>>(new Set());

  // -- O'yinchining qo'lidagi kartalar --
  const [playerCards, setPlayerCards] = useState<Card[]>(() => {
    const inv = shuffle([...INVENTORY_POOL]).slice(0, 2);
    const blue = shuffle([...BLUE_CARDS_POOL]).slice(0, 5);
    return [...inv, ...blue];
  });

  // -- Boshqa o'yinchilarning tanlagan kartalari (simulyatsiya) --
  const [opponentPlays, setOpponentPlays] = useState<Card[]>([]);

  // -- G'olib --
  const [winner, setWinner] = useState<Player | null>(null);

  // ==========================================
  // RAUND BOSHLANISHI — countdown
  // ==========================================
  const startRound = useCallback(() => {
    // Yangi savol
    const available = RED_CARDS.filter((c) => !usedRedIds.has(c.id as number));
    const pool = available.length > 0 ? available : RED_CARDS;
    const newRed = pool[Math.floor(Math.random() * pool.length)];
    setCurrentRed(newRed);
    setUsedRedIds((prev) => new Set(prev).add(newRed.id as number));

    // Kartalarni to'ldirish (agar 7 tadan kam bo'lsa)
    setPlayerCards((prev) => {
      if (prev.length >= 7) return prev;
      const needed = 7 - prev.length;
      const existingIds = new Set(prev.map((c) => c.id));
      const available = BLUE_CARDS_POOL.filter((c) => !existingIds.has(c.id));
      const newCards = shuffle(available).slice(0, needed);
      return [...prev, ...newCards];
    });

    // Tayyorlash
    setSelectedBlue(null);
    setOpponentPlays([]);
    setWinner(null);
    setIsTimeWarning(false);
    setRoundTimer(30);
    setCountdown(3);
    setPhase('waiting');
  }, [usedRedIds]);

  // -- Birinchi raundni boshlash --
  useEffect(() => {
    startRound();
  }, []); // eslint-disable-line

  // ==========================================
  // COUNTDOWN (3-2-1)
  // ==========================================
  useEffect(() => {
    if (phase !== 'waiting') return;
    if (countdown <= 0) {
      setPhase('showQuestion');
      return;
    }
    const t = setTimeout(() => {
      hapticImpact('light');
      setCountdown((c) => c - 1);
    }, 800);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  // ==========================================
  // SAVOLNI KO'RSATISH (1.5 soniya)
  // ==========================================
  useEffect(() => {
    if (phase !== 'showQuestion') return;
    const t = setTimeout(() => {
      setPhase('playing');
    }, 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // ==========================================
  // TAYMER
  // ==========================================
  useEffect(() => {
    if (phase !== 'playing') return;

    if (roundTimer <= 0) {
      // Taymer tugadi — avtomatik tanlash EMAS, ogohlantirish
      setIsTimeWarning(true);
      if (playerCards.length > 0 && selectedBlue === null) {
        // Agar tanlamagan bo'lsa, birinchi kartani tanlaydi
        handleSelectBlue(playerCards[0].id);
      }
      return;
    }

    if (roundTimer <= 10) setIsTimeWarning(true);

    const t = setInterval(() => setRoundTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [roundTimer, phase]); // eslint-disable-line

  // ==========================================
  // KO'K KARTA TANLASH
  // ==========================================
  const handleSelectBlue = (id: number | string) => {
    if (phase !== 'playing') return;
    hapticImpact('medium');
    setSelectedBlue(id);

    // Karta qo'ldan olinadi
    setPlayerCards((prev) => prev.filter((c) => c.id !== id));

    // Simulyatsiya: raqiblar ham tanlaydi (1-2 soniyada)
    setTimeout(() => {
      const oppCards = shuffle([...BLUE_CARDS_POOL])
        .filter((c) => c.id !== id)
        .slice(0, Math.min(6, players.length - 1));
      setOpponentPlays(oppCards);
      setPhase('voting');
    }, 1200);
  };

  // ==========================================
  // OVOZ BERISH (simulyatsiya — 3 soniya)
  // ==========================================
  useEffect(() => {
    if (phase !== 'voting') return;
    const t = setTimeout(() => {
      // Tasodifiy g'olib
      const allPlayers = players.filter((p) => p.id !== 'me');
      const randomWinner = allPlayers[Math.floor(Math.random() * allPlayers.length)];

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === randomWinner.id ? { ...p, score: p.score + 1 } : p
        )
      );
      setWinner(randomWinner);
      hapticSuccess();
      setPhase('result');
    }, 3000);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line

  // ==========================================
  // KEYINGI RAUND / YAKUNLASH
  // ==========================================
  const handleNextRound = () => {
    hapticImpact('medium');
    if (round >= TOTAL_ROUNDS) {
      onGameEnd();
      return;
    }
    setRound((r) => r + 1);
    startRound();
  };

  // ==========================================
  // YORDAMCHI
  // ==========================================
  const timerColor = roundTimer <= 10 ? '#ff4757' : roundTimer <= 20 ? '#ffa502' : '#2ed573';
  const selectedCardText = [...playerCards, ...opponentPlays, ...BLUE_CARDS_POOL]
    .find((c) => c.id === selectedBlue)?.text || '';
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // ==========================================
  // RENDIRLASH
  // ==========================================
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', // Telegram Mini App uchun to'g'ri viewport
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ====== FON: gradient mesh (rasm o'rniga ishonchli) ====== */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse at 20% 80%, rgba(255,0,110,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(55,66,250,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.3) 0%, transparent 70%),
          #0a0a0f
        `,
      }} />

      {/* Noise texture overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        opacity: 0.03, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* ====== HEADER ====== */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <button
          onClick={() => { hapticImpact('light'); onGameEnd(); }}
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', fontSize: '14px',
          }}
        >
          ←
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '13px',
            fontWeight: 700, color: '#fff', letterSpacing: '2px',
          }}>
            ROUND {round}/{TOTAL_ROUNDS}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '9px',
            color: 'rgba(255,255,255,0.4)', marginTop: '2px',
          }}>
            {phase === 'waiting' ? 'Tayyorlanmoqda...' :
             phase === 'showQuestion' ? 'Savol ochilmoqda...' :
             phase === 'playing' ? 'Karta tanlang' :
             phase === 'voting' ? 'Ovoz berilmoqda...' : 'Natija'}
          </div>
        </div>

        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: `rgba(${roundTimer <= 10 ? '255,71,87' : roundTimer <= 20 ? '255,165,0' : '46,213,115'},0.15)`,
          border: `2px solid ${phase === 'playing' ? timerColor : 'rgba(255,255,255,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
          color: phase === 'playing' ? timerColor : 'rgba(255,255,255,0.3)',
          transition: 'all 0.3s ease',
          animation: isTimeWarning ? 'pulse 0.5s ease infinite' : 'none',
        }}>
          {phase === 'playing' ? roundTimer : '⏱'}
        </div>
      </div>

      {/* ====== ASOSIY OYIN MAYDONI ====== */}
      <div style={{
        position: 'relative', zIndex: 5, flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '10px',
        overflow: 'hidden',
      }}>

        {/* ---------- COUNTDOWN ---------- */}
        {phase === 'waiting' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'fadeUp 0.3s ease forwards',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(255,0,110,0.15)',
              border: '3px solid rgba(255,0,110,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '36px',
              fontWeight: 700, color: '#ff006e',
              animation: 'pulse 0.8s ease infinite',
            }}>
              {countdown > 0 ? countdown : '🎯'}
            </div>
            <div style={{
              marginTop: '12px',
              fontFamily: 'var(--font-display)', fontSize: '14px',
              color: 'rgba(255,255,255,0.5)', letterSpacing: '2px',
            }}>
              RAUND {round}
            </div>
          </div>
        )}

        {/* ---------- SAVOL OCHILISHI ---------- */}
        {phase === 'showQuestion' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'fadeUp 0.4s ease forwards',
          }}>
            <div style={{
              padding: '20px 24px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255,0,110,0.2), rgba(255,71,87,0.15))',
              border: '1.5px solid rgba(255,0,110,0.3)',
              maxWidth: '320px', textAlign: 'center',
              boxShadow: '0 8px 32px rgba(255,0,110,0.15)',
            }}>
              <div style={{
                fontSize: '28px', marginBottom: '10px',
              }}>🔴</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '16px',
                fontWeight: 700, color: '#fff', lineHeight: 1.5,
              }}>
                {currentRed.text}
              </div>
            </div>
            <div style={{
              marginTop: '12px',
              fontFamily: 'var(--font-body)', fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
            }}>
              Eng mos javob kartasini tanlang...
            </div>
          </div>
        )}

        {/* ---------- O'YIN: STOL + O'YINCHILAR ---------- */}
        {phase === 'playing' && (
          <>
            {/* Savol kichkina ko'rinishda */}
            <div style={{
              padding: '10px 16px', borderRadius: '12px',
              background: 'rgba(255,0,110,0.1)',
              border: '1px solid rgba(255,0,110,0.2)',
              maxWidth: '300px', textAlign: 'center',
              marginBottom: '12px',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '13px',
                fontWeight: 700, color: '#fff', lineHeight: 1.4,
              }}>
                🔴 {currentRed.text}
              </div>
            </div>

            {/* O'yinchilar — stol atrofida */}
            <div style={{
              position: 'relative', width: '100%', maxWidth: '340px',
              height: '160px', marginBottom: '8px',
            }}>
              {players.filter((p) => p.id !== 'me').map((player, i) => {
                const positions = [
                  { top: '0%', left: '50%', transform: 'translateX(-50%)' },
                  { top: '20%', left: '2%' },
                  { top: '20%', right: '2%' },
                  { top: '55%', left: '8%' },
                  { top: '55%', right: '8%' },
                  { top: '10%', left: '22%' },
                ];
                const pos = positions[i] || positions[0];

                return (
                  <div key={player.id} style={{
                    position: 'absolute', ...pos,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: player.score > 0
                        ? '2px solid #ffd700'
                        : '2px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', position: 'relative',
                    }}>
                      {player.avatar}
                      <div style={{
                        position: 'absolute', bottom: '-1px', right: '-1px',
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: '#2ed573',
                        border: '2px solid rgba(10,10,15,0.8)',
                      }} />
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '9px',
                      color: 'rgba(255,255,255,0.6)',
                      maxWidth: '55px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
                    }}>
                      {player.name}
                    </div>
                    {player.score > 0 && (
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: '10px',
                        fontWeight: 700, color: '#ffd700',
                      }}>
                        {player.score}⭐
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ---------- OVOZ BERISH ---------- */}
        {phase === 'voting' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'fadeUp 0.3s ease forwards', width: '100%', maxWidth: '340px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '12px',
              color: 'rgba(255,255,255,0.5)', letterSpacing: '1px',
              marginBottom: '10px',
            }}>
              🗳 OVOZ BERILMOQDA...
            </div>

            {/* Savol */}
            <div style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(255,0,110,0.1)',
              border: '1px solid rgba(255,0,110,0.2)',
              textAlign: 'center', marginBottom: '12px', width: '100%',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '12px',
                fontWeight: 700, color: '#ff4757',
              }}>
                🔴 {currentRed.text}
              </div>
            </div>

            {/* Barcha javoblar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px', width: '100%',
            }}>
              {/* O'yinchining tanlagan kartasi */}
              {selectedBlue && (
                <div style={{
                  padding: '10px', borderRadius: '10px',
                  background: 'rgba(55,66,250,0.15)',
                  border: '1.5px solid rgba(55,66,250,0.4)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '9px',
                    color: '#3742fa', marginBottom: '4px',
                  }}>
                    SIZ
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '11px',
                    fontWeight: 600, color: '#fff', lineHeight: 1.3,
                  }}>
                    {selectedCardText}
                  </div>
                </div>
              )}

              {/* Raqiblar kartalari */}
              {opponentPlays.map((card, i) => (
                <div key={card.id} style={{
                  padding: '10px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  textAlign: 'center',
                  animation: `fadeUp 0.3s ease ${i * 0.1}s forwards`,
                  opacity: 0,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '9px',
                    color: 'rgba(255,255,255,0.4)', marginBottom: '4px',
                  }}>
                    {players.filter((p) => p.id !== 'me')[i]?.avatar}{' '}
                    {players.filter((p) => p.id !== 'me')[i]?.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '11px',
                    fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3,
                  }}>
                    {card.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- NATIJA ---------- */}
        {phase === 'result' && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'fadeUp 0.4s ease forwards',
          }}>
            {/* G'olib */}
            {winner && (
              <div style={{
                padding: '16px 24px', borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,165,0,0.08))',
                border: '1.5px solid rgba(255,215,0,0.25)',
                textAlign: 'center', marginBottom: '12px',
                boxShadow: '0 8px 32px rgba(255,215,0,0.1)',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '6px' }}>🏆</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '18px',
                  fontWeight: 700, color: '#ffd700',
                }}>
                  {winner.avatar} {winner.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)', marginTop: '4px',
                }}>
                  Eng kulgili javob!
                </div>
              </div>
            )}

            {/* Scoreboard */}
            <div style={{
              display: 'flex', gap: '6px', flexWrap: 'wrap',
              justifyContent: 'center', marginBottom: '16px',
            }}>
              {sortedPlayers.slice(0, 3).map((p, i) => (
                <div key={p.id} style={{
                  padding: '6px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <span style={{ fontSize: '10px' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '10px',
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    {p.name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '11px',
                    fontWeight: 700, color: '#ffd700',
                  }}>
                    {p.score}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleNextRound}
              style={{
                padding: '12px 32px', borderRadius: '12px', border: 'none',
                background: round >= TOTAL_ROUNDS
                  ? 'linear-gradient(135deg, #2ed573, #1abc9c)'
                  : 'linear-gradient(135deg, #ff006e, #ff4757)',
                fontFamily: 'var(--font-display)', fontSize: '14px',
                fontWeight: 700, color: '#fff', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255,0,110,0.3)',
                transition: 'transform 0.2s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {round >= TOTAL_ROUNDS ? '🏁 NATIJALAR' : '▶ KEYINGI RAUND'}
            </button>
          </div>
        )}
      </div>

      {/* ====== PASTKI QISM — KARTALAR ====== */}
      {phase === 'playing' && (
        <div style={{
          position: 'relative', zIndex: 10,
          padding: '10px 12px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '8px', padding: '0 4px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '11px',
              fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px',
            }}>
              🔵 SIZNING KARTALARINGIZ
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '11px',
              fontWeight: 700, color: '#3742fa',
            }}>
              {playerCards.length} ta
            </div>
          </div>

          <div style={{
            display: 'flex', gap: '8px',
            overflowX: 'auto', paddingBottom: '4px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            {playerCards.map((card, i) => {
              const isInventory = typeof card.id === 'string';
              const isSelected = selectedBlue === card.id;

              return (
                <button
                  key={card.id}
                  onClick={() => handleSelectBlue(card.id)}
                  disabled={selectedBlue !== null}
                  style={{
                    minWidth: '85px', height: '115px',
                    borderRadius: '12px', border: 'none', padding: '10px 8px',
                    cursor: selectedBlue ? 'default' : 'pointer',
                    flexShrink: 0,
                    opacity: selectedBlue && !isSelected ? 0.3 : 1,
                    transform: isSelected ? 'translateY(-12px) scale(1.05)' : 'translateY(0)',
                    transition: 'all 0.3s ease',
                    background: isSelected
                      ? 'linear-gradient(135deg, #3742fa, #5352ed)'
                      : 'linear-gradient(135deg, #1a1a2e, #16213e)',
                    border: isSelected
                      ? '2px solid #5352ed'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isSelected
                      ? '0 8px 24px rgba(55,66,250,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    animation: `fadeUp 0.3s ease ${i * 0.05}s forwards`,
                  }}
                >
                  {isInventory && (
                    <div style={{
                      position: 'absolute', top: '5px', right: '5px',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00b4d8, #0096c7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '8px', color: '#fff', fontWeight: 700,
                    }}>
                      ★
                    </div>
                  )}
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '10px',
                    fontWeight: 600, color: '#fff', lineHeight: 1.3,
                    textAlign: 'center',
                  }}>
                    {card.text}
                  </div>
                  {card.power && (
                    <div style={{
                      position: 'absolute', bottom: '5px',
                      fontFamily: 'var(--font-display)', fontSize: '8px',
                      color: 'rgba(255,255,255,0.3)',
                    }}>
                      ⚡{card.power}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ====== GLOBAL ANIMATSIYALAR ====== */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
