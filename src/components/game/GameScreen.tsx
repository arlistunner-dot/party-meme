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

// 7 ta o'yinchi (Siz + 6 raqib)
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

// ================================================================
// STOL ATROFIDAGI O'YINCHILAR POZITSIYALARI
// Rasmdagi oval stolga mos — 6 ta raqib yuqori yarim doirada
// ================================================================
//
// Oval stol (yuqoridan ko'rinish):
//
//         p1 (yuqori markaz)
//    p2              p3
//       ╭──────────╮
//       │  STOL    │
//       │  qizil   │
//       │ kartalar │
//       ╰──────────╯
//    p4              p5
//         p6 (past markaz)
//
//    [SIZ — stol pastida, kartalari bilan]
// ================================================================

export default function GameScreen({ onNavigate, onGameEnd }: GameScreenProps) {
  type Phase = 'waiting' | 'showQuestion' | 'playing' | 'voting' | 'result';

  const [phase, setPhase] = useState<Phase>('waiting');
  const [round, setRound] = useState(1);
  const [selectedBlue, setSelectedBlue] = useState<number | string | null>(null);
  const [roundTimer, setRoundTimer] = useState(30);
  const [countdown, setCountdown] = useState(3);
  const [isTimeWarning, setIsTimeWarning] = useState(false);

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

  // ====== START ======
  const startRound = useCallback(() => {
    const available = RED_CARDS.filter((c) => !usedRedIds.has(c.id as number));
    const pool = available.length > 0 ? available : RED_CARDS;
    const newRed = pool[Math.floor(Math.random() * pool.length)];
    setCurrentRed(newRed);
    setUsedRedIds((prev) => new Set(prev).add(newRed.id as number));

    setPlayerCards((prev) => {
      if (prev.length >= 7) return prev;
      const needed = 7 - prev.length;
      const ids = new Set(prev.map((c) => c.id));
      const avail = BLUE_CARDS_POOL.filter((c) => !ids.has(c.id));
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

  // ====== SELECT ======
  const handleSelectBlue = (id: number | string) => {
    if (phase !== 'playing') return;
    hapticImpact('medium');
    setSelectedBlue(id);
    setPlayerCards((prev) => prev.filter((c) => c.id !== id));

    setTimeout(() => {
      const opp = shuffle([...BLUE_CARDS_POOL]).filter((c) => c.id !== id).slice(0, 6);
      setOpponentPlays(opp);
      setPhase('voting');
    }, 1200);
  };

  // ====== VOTING ======
  useEffect(() => {
    if (phase !== 'voting') return;
    const t = setTimeout(() => {
      const all = players.filter((p) => p.id !== 'me');
      const w = all[Math.floor(Math.random() * all.length)];
      setPlayers((prev) => prev.map((p) => p.id === w.id ? { ...p, score: p.score + 1 } : p));
      setWinner(w);
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

  const timerColor = roundTimer <= 10 ? '#ff4757' : roundTimer <= 20 ? '#ffa502' : '#2ed573';
  const selectedCardText = [...playerCards, ...opponentPlays, ...BLUE_CARDS_POOL]
    .find((c) => c.id === selectedBlue)?.text || '';
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const others = players.filter((p) => p.id !== 'me');

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', width: '100%',
      position: 'relative', overflow: 'hidden',
      background: '#0b0b14',
    }}>

      {/* ====== FON RASMI — party table ====== */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/assets/game-bg.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0b0b14',
      }} />
      {/* Qoraytirish qatlami */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'rgba(0,0,0,0.45)',
        pointerEvents: 'none',
      }} />

      {/* ====== HEADER ====== */}
      <div style={{
        position: 'relative', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        minHeight: '42px', flexShrink: 0,
      }}>
        <button
          onClick={() => { hapticImpact('light'); onGameEnd(); }}
          style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', fontSize: '13px',
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
          animation: isTimeWarning && phase === 'playing' ? 'pulse 0.5s infinite' : 'none',
        }}>
          {phase === 'playing' ? roundTimer : '⏱'}
        </div>
      </div>

      {/* ================================================================
          OYIN MAYDONI — STOL ATROFIDA HAMMASI
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeUp 0.3s ease' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255,0,110,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '32px',
                fontWeight: 700, color: '#ff006e',
                animation: 'pulse 0.8s infinite',
                boxShadow: '0 0 30px rgba(255,0,110,0.2)',
              }}>
                {countdown > 0 ? countdown : '🎯'}
              </div>
              <div style={{
                marginTop: '10px', fontFamily: 'var(--font-display)',
                fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px',
              }}>
                RAUND {round}
              </div>
            </div>
          </div>
        )}

        {/* ======== SHOW QUESTION ======== */}
        {phase === 'showQuestion' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeUp 0.4s ease' }}>
              <div style={{
                padding: '16px 20px', borderRadius: '14px',
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
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
            PLAYING — STOL + O'YINCHILAR STULLARDA + KARTALAR
            ============================================================ */}
        {phase === 'playing' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            minHeight: 0, overflow: 'hidden',
          }}>

            {/* ====== STOL MAYDONI — o'yinchilar atrofda ====== */}
            <div style={{
              flex: 1, position: 'relative', minHeight: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>

              {/* ---- O'YINCHI 1 — yuqori markaz ---- */}
              <div style={{
                position: 'absolute', top: '2%', left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5,
              }}>
                <Seat player={others[0]} />
              </div>

              {/* ---- O'YINCHI 2 — chap yuqori ---- */}
              <div style={{
                position: 'absolute', top: '18%', left: '6%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5,
              }}>
                <Seat player={others[1]} />
              </div>

              {/* ---- O'YINCHI 3 — o'ng yuqori ---- */}
              <div style={{
                position: 'absolute', top: '18%', right: '6%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5,
              }}>
                <Seat player={others[2]} />
              </div>

              {/* ---- O'YINCHI 4 — chap past ---- */}
              <div style={{
                position: 'absolute', top: '52%', left: '6%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5,
              }}>
                <Seat player={others[3]} />
              </div>

              {/* ---- O'YINCHI 5 — o'ng past ---- */}
              <div style={{
                position: 'absolute', top: '52%', right: '6%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5,
              }}>
                <Seat player={others[4]} />
              </div>

              {/* ---- O'YINCHI 6 — past markaz (stol ostida emas, yonida) ---- */}
              <div style={{
                position: 'absolute', top: '72%', left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5,
              }}>
                <Seat player={others[5]} />
              </div>

              {/* ---- STOL MARKAZI — qizil kartalar ---- */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                zIndex: 4, gap: '6px',
              }}>
                {/* Qizil kartalar — stol ustida, yopiq holatda */}
                <div style={{
                  display: 'flex', gap: '4px', justifyContent: 'center',
                }}>
                  {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
                    const isRevealed = i + 1 < round;
                    const isCurrent = i + 1 === round;
                    return (
                      <div key={i} style={{
                        width: '32px', height: '44px', borderRadius: '5px',
                        background: isRevealed
                          ? 'rgba(46,213,115,0.2)'
                          : isCurrent
                            ? 'linear-gradient(135deg, #ff006e, #cc0044)'
                            : 'linear-gradient(135deg, #cc0033, #880022)',
                        border: isCurrent
                          ? '2px solid #ffd700'
                          : isRevealed
                            ? '1px solid rgba(46,213,115,0.3)'
                            : '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isRevealed ? '12px' : '9px',
                        color: isRevealed ? '#2ed573' : 'rgba(255,255,255,0.5)',
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        boxShadow: isCurrent
                          ? '0 0 12px rgba(255,215,0,0.3), 0 2px 6px rgba(0,0,0,0.4)'
                          : '0 2px 6px rgba(0,0,0,0.3)',
                        transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                      }}>
                        {isRevealed ? '✓' : i + 1}
                      </div>
                    );
                  })}
                </div>

                {/* Savol matni — stol markazida */}
                <div style={{
                  padding: '6px 12px', borderRadius: '8px',
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,0,110,0.2)',
                  maxWidth: '220px', textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '10px',
                    fontWeight: 700, color: '#ff4757', lineHeight: 1.3,
                  }}>
                    🔴 {currentRed.text}
                  </div>
                </div>
              </div>
            </div>

            {/* ====== PASTKI QISM — 7 TA KARTA ====== */}
            <div style={{
              flexShrink: 0, width: '100%',
              padding: '6px 8px',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
              background: 'linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 80%, transparent 100%)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '4px', padding: '0 2px',
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

              <div style={{
                display: 'flex', gap: '5px',
                justifyContent: 'center', width: '100%',
                maxWidth: '360px', margin: '0 auto',
              }}>
                {playerCards.map((card, i) => {
                  const isInv = typeof card.id === 'string';
                  const isSel = selectedBlue === card.id;
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
                        opacity: selectedBlue && !isSel ? 0.2 : 1,
                        transform: isSel ? 'translateY(-10px) scale(1.12)' : 'translateY(0)',
                        transition: 'all 0.3s ease',
                        background: isSel
                          ? 'linear-gradient(135deg, #3742fa, #5352ed)'
                          : 'linear-gradient(135deg, #16192e, #1a1e3a)',
                        border: isSel ? '2px solid #5352ed' : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isSel
                          ? '0 6px 20px rgba(55,66,250,0.4)'
                          : '0 2px 6px rgba(0,0,0,0.3)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        animation: `fadeUp 0.25s ease ${i * 0.04}s forwards`,
                      }}
                    >
                      {isInv && (
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
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '11px',
              color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginBottom: '8px',
            }}>
              🗳 OVOZ BERILMOQDA...
            </div>

            <div style={{
              padding: '8px 12px', borderRadius: '10px',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
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
                const opp = others[i];
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
            animation: 'fadeUp 0.4s ease',
          }}>
            {winner && (
              <div style={{
                padding: '14px 20px', borderRadius: '14px',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
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
              {sorted.slice(0, 3).map((p, i) => (
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

// ================================================================
// STUL KOMPONENTI — o'yinchi stulda o'tirgan ko'rinishda
// ================================================================
function Seat({ player }: { player?: Player }) {
  if (!player) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
    }}>
      {/* Stul + Avatar */}
      <div style={{
        position: 'relative',
        width: '40px', height: '40px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        border: player.score > 0
          ? '2.5px solid #ffd700'
          : '2px solid rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px',
        boxShadow: player.score > 0
          ? '0 0 12px rgba(255,215,0,0.3), 0 2px 8px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.4)',
      }}>
        {player.avatar}

        {/* Online dot */}
        <div style={{
          position: 'absolute', bottom: '-1px', right: '-1px',
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#2ed573',
          border: '2px solid rgba(10,10,15,0.8)',
        }} />

        {/* Kichik kartalar (qo'lda) */}
        <div style={{
          position: 'absolute', bottom: '-6px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: '1px',
        }}>
          {Array.from({ length: Math.min(3, player.cards) }).map((_, j) => (
            <div key={j} style={{
              width: '5px', height: '8px', borderRadius: '1px',
              background: 'linear-gradient(135deg, #3742fa, #2d34a8)',
              border: '0.5px solid rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>
      </div>

      {/* Ism */}
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '8px',
        color: 'rgba(255,255,255,0.65)',
        maxWidth: '50px', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        marginTop: '4px',
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
    </div>
  );
}
