import { useState, useEffect, useCallback } from 'react';
import { hapticImpact, hapticSuccess } from '@/config/telegram';

// ============= TYPES =============
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

// ============= DATA =============
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
  { id: 104, text: 'Kredit karta hisobim' },
  { id: 105, text: 'Ertaga boshlayman... 3 yil oldin' },
  { id: 106, text: 'Telefonim 1% da' },
  { id: 107, text: 'Do\'stim 5 daqiqaga deganiga 2 soat' },
  { id: 108, text: 'Yangi yil qarorlarim (1 hafta)' },
  { id: 109, text: 'Onamning "Yoshligingda" hikoyasi' },
  { id: 110, text: 'Instagram 2 soat "tezgina"' },
  { id: 111, text: 'Kuryer "Yetib keldim" uyda emas' },
  { id: 112, text: 'Tejayman deb narsa sotib olganman' },
  { id: 113, text: 'Pazandalik tajriba va oshxona yonishi' },
  { id: 114, text: 'GPS ishonmayman deb adashish' },
  { id: 115, text: 'Ertalab 6 da turgan va zalga bormagan' },
];

const INVENTORY_POOL: Card[] = [
  { id: 'inv1', text: 'WiFi yo\'qolgan paytda qo\'rquv', category: 'tech', power: 7 },
  { id: 'inv2', text: 'Do\'st bilan kechki ovqat', category: 'life', power: 6 },
  { id: 'inv3', text: 'Barchaga yolg\'on gapirib ketish', category: 'wild', power: 9 },
  { id: 'inv4', text: 'Buvining maslahati', category: 'national', power: 8 },
  { id: 'inv5', text: 'Telefon yo\'qolganida tinchlik', category: 'tech', power: 7 },
];

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

// ============================================================
// STOL ATROFIDAGI O'YINCHILAR POZITSIYALARI
// (foiz — har qanday ekran o'lchamiga moslashadi)
// ============================================================
//  6 ta raqib: yuqori yarim doirada joylashadi
//  "Siz" — pastda markazda (stol ostida)
//
//         (1)
//    (2)       (3)
//
//       (STOL)
//
//    (4)       (5)
//         (6)
// ============================================================
const PLAYER_POSITIONS: Record<string, { top?: string; bottom?: string; left?: string; right?: string; transform?: string }> = {
  p1: { top: '0%', left: '50%', transform: 'translateX(-50%)' },
  p2: { top: '18%', left: '5%' },
  p3: { top: '18%', right: '5%' },
  p4: { bottom: '22%', left: '8%' },
  p5: { bottom: '22%', right: '8%' },
  p6: { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
};

// ============= COMPONENT =============
export default function GameScreen({ onNavigate, onGameEnd }: GameScreenProps) {
  type Phase = 'waiting' | 'showQuestion' | 'playing' | 'voting' | 'result';

  const [phase, setPhase] = useState<Phase>('waiting');
  const [round, setRound] = useState(1);
  const [selectedBlue, setSelectedBlue] = useState<number | string | null>(null);
  const [roundTimer, setRoundTimer] = useState(30);
  const [countdown, setCountdown] = useState(3);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  const [players, setPlayers] = useState<Player[]>(() =>
    PLAYERS_INIT.map((p) => ({ ...p, score: 0 }))
  );

  const [currentRed, setCurrentRed] = useState<Card>(() =>
    RED_CARDS[Math.floor(Math.random() * RED_CARDS.length)]
  );
  const [usedRedIds, setUsedRedIds] = useState<Set<number>>(new Set());

  const [playerCards, setPlayerCards] = useState<Card[]>(() => {
    const inv = shuffle([...INVENTORY_POOL]).slice(0, 2);
    const blue = shuffle([...BLUE_CARDS_POOL]).slice(0, 5);
    return [...inv, ...blue];
  });

  const [opponentPlays, setOpponentPlays] = useState<Card[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);

  // ====== BG CHECK ======
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.onerror = () => setBgLoaded(false);
    img.src = '/assets/game-bg.png';
  }, []);

  // ====== START ROUND ======
  const startRound = useCallback(() => {
    const available = RED_CARDS.filter((c) => !usedRedIds.has(c.id as number));
    const pool = available.length > 0 ? available : RED_CARDS;
    const newRed = pool[Math.floor(Math.random() * pool.length)];
    setCurrentRed(newRed);
    setUsedRedIds((prev) => new Set(prev).add(newRed.id as number));

    setPlayerCards((prev) => {
      if (prev.length >= 7) return prev;
      const needed = 7 - prev.length;
      const existingIds = new Set(prev.map((c) => c.id));
      const avail = BLUE_CARDS_POOL.filter((c) => !existingIds.has(c.id));
      return [...prev, ...shuffle(avail).slice(0, needed)];
    });

    setSelectedBlue(null);
    setOpponentPlays([]);
    setWinner(null);
    setIsTimeWarning(false);
    setRoundTimer(30);
    setCountdown(3);
    setPhase('waiting');
  }, [usedRedIds]);

  useEffect(() => { startRound(); }, []);

  // ====== COUNTDOWN ======
  useEffect(() => {
    if (phase !== 'waiting') return;
    if (countdown <= 0) { setPhase('showQuestion'); return; }
    const t = setTimeout(() => { hapticImpact('light'); setCountdown((c) => c - 1); }, 800);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  // ====== SHOW QUESTION ======
  useEffect(() => {
    if (phase !== 'showQuestion') return;
    const t = setTimeout(() => setPhase('playing'), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // ====== TIMER ======
  useEffect(() => {
    if (phase !== 'playing') return;
    if (roundTimer <= 0) {
      setIsTimeWarning(true);
      if (playerCards.length > 0 && selectedBlue === null) handleSelectBlue(playerCards[0].id);
      return;
    }
    if (roundTimer <= 10) setIsTimeWarning(true);
    const t = setInterval(() => setRoundTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [roundTimer, phase]);

  // ====== SELECT BLUE ======
  const handleSelectBlue = (id: number | string) => {
    if (phase !== 'playing') return;
    hapticImpact('medium');
    setSelectedBlue(id);
    setPlayerCards((prev) => prev.filter((c) => c.id !== id));

    setTimeout(() => {
      const oppCards = shuffle([...BLUE_CARDS_POOL])
        .filter((c) => c.id !== id)
        .slice(0, Math.min(6, players.length - 1));
      setOpponentPlays(oppCards);
      setPhase('voting');
    }, 1200);
  };

  // ====== VOTING ======
  useEffect(() => {
    if (phase !== 'voting') return;
    const t = setTimeout(() => {
      const allP = players.filter((p) => p.id !== 'me');
      const rw = allP[Math.floor(Math.random() * allP.length)];
      setPlayers((prev) => prev.map((p) => p.id === rw.id ? { ...p, score: p.score + 1 } : p));
      setWinner(rw);
      hapticSuccess();
      setPhase('result');
    }, 3000);
    return () => clearTimeout(t);
  }, [phase]);

  // ====== NEXT ======
  const handleNextRound = () => {
    hapticImpact('medium');
    if (round >= TOTAL_ROUNDS) { onGameEnd(); return; }
    setRound((r) => r + 1);
    startRound();
  };

  // ====== HELPERS ======
  const timerColor = roundTimer <= 10 ? '#ff4757' : roundTimer <= 20 ? '#ffa502' : '#2ed573';
  const selectedCardText = [...playerCards, ...opponentPlays, ...BLUE_CARDS_POOL]
    .find((c) => c.id === selectedBlue)?.text || '';
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const otherPlayers = players.filter((p) => p.id !== 'me');

  // ================================================
  // RENDER
  // ================================================
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', width: '100%',
      position: 'relative', overflow: 'hidden',
      background: '#0b0b14',
    }}>

      {/* ====== FON ====== */}
      {bgLoaded ? (
        <>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 0,
            backgroundImage: 'url(/assets/game-bg.png)',
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          }} />
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)',
            pointerEvents: 'none',
          }} />
        </>
      ) : (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse at 30% 70%, rgba(0,100,60,0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 30%, rgba(0,80,50,0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, #0a1a0a 0%, #0b0b14 100%)
          `,
        }} />
      )}

      {/* Noise */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2, opacity: 0.04, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* ====== HEADER ====== */}
      <div style={{
        position: 'relative', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '42px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => { hapticImpact('light'); onGameEnd(); }}
          style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', fontSize: '13px', fontWeight: 700,
          }}
        >←</button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '13px',
            fontWeight: 700, color: '#fff', letterSpacing: '2px',
          }}>
            ROUND {round}/{TOTAL_ROUNDS}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '8px',
            color: 'rgba(255,255,255,0.35)', marginTop: '1px',
          }}>
            {phase === 'waiting' ? 'Tayyorlanmoqda...' :
             phase === 'showQuestion' ? 'Savol...' :
             phase === 'playing' ? 'Karta tanlang' :
             phase === 'voting' ? 'Ovoz berish...' : 'Natija'}
          </div>
        </div>

        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: phase === 'playing'
            ? `rgba(${roundTimer <= 10 ? '255,71,87' : roundTimer <= 20 ? '255,165,0' : '46,213,115'},0.15)`
            : 'rgba(255,255,255,0.05)',
          border: `2px solid ${phase === 'playing' ? timerColor : 'rgba(255,255,255,0.1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700,
          color: phase === 'playing' ? timerColor : 'rgba(255,255,255,0.2)',
          transition: 'all 0.3s ease',
          animation: isTimeWarning && phase === 'playing' ? 'pulse 0.5s infinite' : 'none',
        }}>
          {phase === 'playing' ? roundTimer : '⏱'}
        </div>
      </div>

      {/* ================================================================
          ASOSIY MAYDON — STOL + O'YINCHILAR + KARTALAR
          ================================================================ */}
      <div style={{
        position: 'relative', zIndex: 10, flex: 1,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', minHeight: 0,
      }}>

        {/* ======== COUNTDOWN ======== */}
        {phase === 'waiting' && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'fadeUp 0.3s ease forwards',
            }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255,0,110,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '32px',
                fontWeight: 700, color: '#ff006e',
                animation: 'pulse 0.8s ease infinite',
                boxShadow: '0 0 30px rgba(255,0,110,0.2)',
              }}>
                {countdown > 0 ? countdown : '🎯'}
              </div>
              <div style={{
                marginTop: '10px', fontFamily: 'var(--font-display)',
                fontSize: '13px', color: 'rgba(255,255,255,0.5)',
                letterSpacing: '2px', textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}>
                RAUND {round}
              </div>
            </div>
          </div>
        )}

        {/* ======== SHOW QUESTION ======== */}
        {phase === 'showQuestion' && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'fadeUp 0.4s ease forwards',
            }}>
              <div style={{
                padding: '16px 20px', borderRadius: '14px',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,0,110,0.4)',
                maxWidth: '300px', textAlign: 'center',
                boxShadow: '0 8px 30px rgba(255,0,110,0.2)',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔴</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '14px',
                  fontWeight: 700, color: '#fff', lineHeight: 1.4,
                }}>
                  {currentRed.text}
                </div>
              </div>
              <div style={{
                marginTop: '10px', fontFamily: 'var(--font-body)',
                fontSize: '10px', color: 'rgba(255,255,255,0.4)',
              }}>
                Eng mos javobni tanlang...
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            PLAYING — STOL + O'YINCHILAR + KARTALAR
            ============================================================ */}
        {phase === 'playing' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            minHeight: 0, overflow: 'hidden',
          }}>

            {/* ====== STOL MAYDONI (o'yinchilar + stol) ====== */}
            <div style={{
              flex: 1, position: 'relative', minHeight: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>

              {/* --- STOL (yashil oval) --- */}
              <div style={{
                position: 'absolute',
                width: '78%', maxWidth: '300px',
                height: '55%', maxHeight: '220px',
                borderRadius: '50%',
                background: `
                  radial-gradient(ellipse at center, rgba(0,80,40,0.45) 0%, rgba(0,50,25,0.35) 70%, transparent 100%)
                `,
                border: '2px solid rgba(0,120,60,0.25)',
                boxShadow: `
                  inset 0 0 40px rgba(0,0,0,0.3),
                  0 0 60px rgba(0,80,40,0.15)
                `,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 3,
              }}>
                {/* Qizil kartalar — stol ustida, yopiq */}
                <div style={{
                  display: 'flex', gap: '4px', justifyContent: 'center',
                  marginBottom: '6px',
                }}>
                  {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
                    const isRevealed = i + 1 < round;
                    const isCurrent = i + 1 === round;
                    return (
                      <div key={i} style={{
                        width: '30px', height: '42px', borderRadius: '5px',
                        background: isRevealed
                          ? 'rgba(46,213,115,0.15)'
                          : isCurrent
                            ? 'linear-gradient(135deg, #ff006e, #cc0044)'
                            : 'linear-gradient(135deg, #cc0033, #880022)',
                        border: isCurrent
                          ? '2px solid #ffd700'
                          : isRevealed
                            ? '1px solid rgba(46,213,115,0.3)'
                            : '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isRevealed ? '11px' : '8px',
                        color: isRevealed ? '#2ed573' : 'rgba(255,255,255,0.5)',
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        boxShadow: isCurrent
                          ? '0 0 10px rgba(255,215,0,0.3), 0 2px 6px rgba(0,0,0,0.3)'
                          : '0 2px 4px rgba(0,0,0,0.3)',
                        transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                      }}>
                        {isRevealed ? '✓' : i + 1}
                      </div>
                    );
                  })}
                </div>

                {/* Savol matni — stol markazida */}
                <div style={{
                  padding: '4px 10px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.35)',
                  maxWidth: '200px', textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '9px',
                    fontWeight: 700, color: '#ff4757', lineHeight: 1.3,
                  }}>
                    🔴 {currentRed.text}
                  </div>
                </div>
              </div>

              {/* --- O'YINCHILAR — stol atrofida --- */}
              {otherPlayers.map((player) => {
                const pos = PLAYER_POSITIONS[player.id];
                if (!pos) return null;

                return (
                  <div key={player.id} style={{
                    position: 'absolute',
                    ...pos,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    zIndex: 5, gap: '2px',
                  }}>
                    {/* Avatar + kichik kartalar */}
                    <div style={{
                      position: 'relative',
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(6px)',
                      border: player.score > 0
                        ? '2px solid #ffd700'
                        : '2px solid rgba(255,255,255,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                    }}>
                      {player.avatar}
                      {/* Online dot */}
                      <div style={{
                        position: 'absolute', bottom: '-1px', right: '-1px',
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: '#2ed573',
                        border: '2px solid rgba(10,10,15,0.8)',
                      }} />
                    </div>

                    {/* Ism */}
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '8px',
                      color: 'rgba(255,255,255,0.6)',
                      maxWidth: '50px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
                      textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                    }}>
                      {player.name}
                    </div>

                    {/* Score */}
                    {player.score > 0 && (
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: '8px',
                        fontWeight: 700, color: '#ffd700',
                        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                      }}>
                        {player.score}⭐
                      </div>
                    )}

                    {/* Kichik kartalar (qo'lda nechta) */}
                    <div style={{ display: 'flex', gap: '1px', marginTop: '1px' }}>
                      {Array.from({ length: Math.min(3, player.cards) }).map((_, j) => (
                        <div key={j} style={{
                          width: '6px', height: '9px', borderRadius: '1.5px',
                          background: 'linear-gradient(135deg, #3742fa, #2d34a8)',
                          border: '0.5px solid rgba(255,255,255,0.12)',
                        }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ====== PASTKI QISM — 7 TA KARTA ====== */}
            <div style={{
              flexShrink: 0, width: '100%',
              padding: '6px 8px',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
              background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 80%, transparent 100%)',
            }}>
              {/* Sarlavha */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '5px', padding: '0 2px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '9px',
                  fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '1px',
                }}>
                  🔵 KARTALARINGIZ
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '9px',
                  fontWeight: 700, color: '#3742fa',
                }}>
                  {playerCards.length} ta
                </span>
              </div>

              {/* 7 ta karta — FLEX, SCROLL YO'Q */}
              <div style={{
                display: 'flex', gap: '5px',
                justifyContent: 'center', width: '100%',
                maxWidth: '360px', margin: '0 auto',
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
                        flex: '1 1 0', minWidth: 0, maxWidth: '50px',
                        height: '68px', borderRadius: '8px', border: 'none',
                        padding: '4px 2px',
                        cursor: selectedBlue ? 'default' : 'pointer',
                        opacity: selectedBlue && !isSelected ? 0.2 : 1,
                        transform: isSelected ? 'translateY(-10px) scale(1.12)' : 'translateY(0)',
                        transition: 'all 0.3s ease',
                        background: isSelected
                          ? 'linear-gradient(135deg, #3742fa, #5352ed)'
                          : 'linear-gradient(135deg, #16192e, #1a1e3a)',
                        border: isSelected
                          ? '2px solid #5352ed'
                          : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected
                          ? '0 6px 20px rgba(55,66,250,0.4)'
                          : '0 2px 6px rgba(0,0,0,0.3)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        animation: `fadeUp 0.25s ease ${i * 0.04}s forwards`,
                      }}
                    >
                      {isInventory && (
                        <div style={{
                          position: 'absolute', top: '2px', right: '2px',
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #00b4d8, #0096c7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '5px', color: '#fff', fontWeight: 700,
                        }}>★</div>
                      )}
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '7px',
                        fontWeight: 600, color: '#fff', lineHeight: 1.2,
                        textAlign: 'center', overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                      }}>
                        {card.text}
                      </div>
                      {card.power && (
                        <div style={{
                          position: 'absolute', bottom: '2px',
                          fontFamily: 'var(--font-display)', fontSize: '6px',
                          color: 'rgba(255,255,255,0.2)',
                        }}>⚡{card.power}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======== VOTING ======== */}
        {phase === 'voting' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '10px', overflow: 'auto',
            animation: 'fadeUp 0.3s ease forwards',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '11px',
              color: 'rgba(255,255,255,0.5)', letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              🗳 OVOZ BERILMOQDA...
            </div>

            <div style={{
              padding: '8px 12px', borderRadius: '10px',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,0,110,0.25)',
              textAlign: 'center', marginBottom: '10px', maxWidth: '320px', width: '100%',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '11px',
                fontWeight: 700, color: '#ff4757',
              }}>
                🔴 {currentRed.text}
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px', maxWidth: '320px', width: '100%',
            }}>
              {selectedBlue && (
                <div style={{
                  padding: '8px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(55,66,250,0.5)', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '8px', color: '#5352ed', marginBottom: '3px' }}>SIZ</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                    {selectedCardText}
                  </div>
                </div>
              )}
              {opponentPlays.map((card, i) => {
                const opp = otherPlayers[i];
                return (
                  <div key={card.id} style={{
                    padding: '8px', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
                    animation: `fadeUp 0.3s ease ${i * 0.08}s forwards`, opacity: 0,
                  }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>
                      {opp?.avatar} {opp?.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.2 }}>
                      {card.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======== RESULT ======== */}
        {phase === 'result' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            animation: 'fadeUp 0.4s ease forwards',
          }}>
            {winner && (
              <div style={{
                padding: '14px 20px', borderRadius: '14px',
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,215,0,0.3)',
                textAlign: 'center', marginBottom: '10px',
                boxShadow: '0 8px 28px rgba(255,215,0,0.12)',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏆</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: '#ffd700' }}>
                  {winner.avatar} {winner.name}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
                  Eng kulgili javob!
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
              {sortedPlayers.slice(0, 3).map((p, i) => (
                <div key={p.id} style={{
                  padding: '5px 10px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                  <span style={{ fontSize: '9px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, color: '#ffd700' }}>{p.score}</span>
                </div>
              ))}
            </div>

            <button onClick={handleNextRound} style={{
              padding: '10px 28px', borderRadius: '10px', border: 'none',
              background: round >= TOTAL_ROUNDS
                ? 'linear-gradient(135deg, #2ed573, #1abc9c)'
                : 'linear-gradient(135deg, #ff006e, #ff4757)',
              fontFamily: 'var(--font-display)', fontSize: '13px',
              fontWeight: 700, color: '#fff', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255,0,110,0.25)',
              transition: 'transform 0.2s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
              {round >= TOTAL_ROUNDS ? '🏁 NATIJALAR' : '▶ KEYINGI RAUND'}
            </button>
          </div>
        )}
      </div>

      {/* ANIMATSIYALAR */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
