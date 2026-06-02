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

// ================================================================
// TZ: stul pozitsiyalari — fon rasmdagi stullarga mos
// ================================================================
const SEAT_POSITIONS = [
  { top: '34%', left: '50%', transform: 'translate(-50%, -50%)' },
  { top: '39%', left: '70%', transform: 'translate(-50%, -50%)' },
  { top: '52%', left: '83%', transform: 'translate(-50%, -50%)' },
  { top: '73%', left: '71%', transform: 'translate(-50%, -50%)' },
  { top: '73%', left: '29%', transform: 'translate(-50%, -50%)' },
  { top: '52%', left: '17%', transform: 'translate(-50%, -50%)' },
];

// ================================================================
// KOMPONENT
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

  // ====== HELPERS ======
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
      background: '#050508',
    }}>

      {/* ====== ANIMATSIYALAR ====== */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes neonPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* ====== HEADER ====== */}
      <div style={{
        position: 'relative', zIndex: 20, flexShrink: 0,
        padding: '8px 12px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        minHeight: '48px',
        background: 'linear-gradient(180deg, rgba(10,10,20,0.95) 0%, rgba(10,10,20,0.85) 100%)',
        borderBottom: '1px solid rgba(166,77,255,0.3)',
        boxShadow: '0 2px 20px rgba(166,77,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => { hapticImpact('light'); onGameEnd(); }}
          style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: 'rgba(166,77,255,0.12)',
            border: '1px solid rgba(166,77,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#A64DFF', fontSize: '13px',
          }}
        >←</button>

        <div style={{
          textAlign: 'center', padding: '2px 16px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(77,163,255,0.2)',
          borderRadius: '4px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(77,163,255,0.03) 2px, rgba(77,163,255,0.03) 4px)',
            pointerEvents: 'none',
          }} />
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '13px',
            fontWeight: 700, color: '#4DA3FF', letterSpacing: '3px',
            textShadow: '0 0 10px rgba(77,163,255,0.5)',
          }}>
            ROUND {round}/{TOTAL_ROUNDS}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '7px',
            color: 'rgba(166,77,255,0.6)', marginTop: '1px', letterSpacing: '1px',
          }}>
            {phase === 'waiting' ? 'INITIALIZING...' :
             phase === 'showQuestion' ? 'DECRYPTING...' :
             phase === 'playing' ? 'SELECT CARD' :
             phase === 'voting' ? 'VOTING...' : 'RESULT'}
          </div>
        </div>

        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: phase === 'playing'
            ? `rgba(${roundTimer <= 10 ? '255,71,87' : roundTimer <= 20 ? '255,165,0' : '77,163,255'},0.1)`
            : 'rgba(255,255,255,0.03)',
          border: `2px solid ${phase === 'playing' ? timerColor : 'rgba(166,77,255,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700,
          color: phase === 'playing' ? timerColor : 'rgba(166,77,255,0.3)',
          boxShadow: phase === 'playing' ? `0 0 12px ${timerColor}40` : 'none',
          animation: isTimeWarning && phase === 'playing' ? 'pulse 0.5s infinite' : 'none',
        }}>
          {phase === 'playing' ? roundTimer : '⏱'}
        </div>
      </div>

      {/* ================================================================
          SCENE
          ================================================================ */}
      <div style={{
        position: 'relative', zIndex: 10, flex: 1,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', minHeight: 0,
      }}>

        {/* ======== COUNTDOWN — O'ZGARMAYDI ======== */}
        {phase === 'waiting' && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, rgba(166,77,255,0.08) 0%, transparent 60%)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeUp 0.3s ease' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'rgba(5,5,8,0.8)',
                border: '2px solid rgba(166,77,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '32px',
                fontWeight: 700, color: '#A64DFF',
                animation: 'pulse 0.8s infinite',
                boxShadow: '0 0 30px rgba(166,77,255,0.25), inset 0 0 20px rgba(166,77,255,0.1)',
              }}>
                {countdown > 0 ? countdown : '🎯'}
              </div>
              <div style={{
                marginTop: '10px', fontFamily: 'var(--font-display)',
                fontSize: '11px', color: 'rgba(166,77,255,0.5)', letterSpacing: '3px',
              }}>
                ROUND {round}
              </div>
            </div>
          </div>
        )}

        {/* ======== SHOW QUESTION — O'ZGARMAYDI ======== */}
        {phase === 'showQuestion' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeUp 0.4s ease' }}>
              <div style={{
                padding: '16px 20px', borderRadius: '12px',
                background: 'rgba(5,5,8,0.85)',
                border: '1px solid rgba(166,77,255,0.35)',
                maxWidth: '300px', textAlign: 'center',
                boxShadow: '0 0 40px rgba(166,77,255,0.15), 0 0 80px rgba(77,163,255,0.05)',
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
                marginTop: '10px', fontFamily: 'var(--font-display)',
                fontSize: '9px', color: 'rgba(77,163,255,0.4)', letterSpacing: '2px',
              }}>
                SELECT YOUR CARD
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            PLAYING — FAQAT SHU QISM O'ZGARADI (TZ ASOSIDA)
            ============================================================ */}
        {phase === 'playing' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            minHeight: 0, overflow: 'hidden',
          }}>

            {/* ====== ASOSIY SCENE — FON RASMI BILAN ====== */}
            <div style={{
              flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden',
              backgroundImage: 'url(/assets/game-room.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}>

              {/* ======================================================
                  QIZIL SAVOL KARTASI — stol ustida, TZ pozitsiyasi
                  ====================================================== */}
              <div style={{
                position: 'absolute',
                top: '58%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                width: '70px', height: '95px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ff006e, #cc0044)',
                border: '2px solid rgba(166,77,255,0.4)',
                boxShadow: '0 0 20px rgba(255,0,110,0.25), 0 4px 16px rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px 6px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '10px',
                  fontWeight: 700, color: '#fff', lineHeight: 1.3,
                  textAlign: 'center',
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}>
                  {currentRed.text}
                </div>
              </div>

              {/* ======================================================
                  O'YINCHILAR — stullarda, TZ pozitsiyalari
                  ====================================================== */}
              {others.map((player, i) => {
                const pos = SEAT_POSITIONS[i];
                if (!pos) return null;

                return (
                  <div key={player.id} style={{
                    position: 'absolute',
                    ...pos,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    zIndex: 15, gap: '2px',
                  }}>
                    {/* Avatar — 54px, emoji 24px */}
                    <div style={{
                      position: 'relative',
                      width: '54px', height: '54px', borderRadius: '50%',
                      background: 'rgba(10,10,20,0.85)',
                      border: player.score > 0
                        ? '2.5px solid #ffd700'
                        : '2px solid rgba(166,77,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '24px',
                      boxShadow: player.score > 0
                        ? '0 0 12px rgba(255,215,0,0.3), 0 0 24px rgba(255,215,0,0.1)'
                        : '0 0 15px rgba(166,77,255,0.12), 0 2px 10px rgba(0,0,0,0.5)',
                    }}>
                      {player.avatar}
                      {/* Online dot */}
                      <div style={{
                        position: 'absolute', bottom: '-1px', right: '-1px',
                        width: '9px', height: '9px', borderRadius: '50%',
                        background: '#2ed573',
                        border: '2px solid rgba(5,5,8,0.9)',
                      }} />
                      {/* Kichik kartalar — qo'lda */}
                      <div style={{
                        position: 'absolute', bottom: '-6px', left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', gap: '1.5px',
                      }}>
                        {Array.from({ length: Math.min(3, player.cards) }).map((_, j) => (
                          <div key={j} style={{
                            width: '5px', height: '8px', borderRadius: '1px',
                            background: 'linear-gradient(135deg, #3742fa, #4DA3FF)',
                            border: '0.5px solid rgba(77,163,255,0.3)',
                          }} />
                        ))}
                      </div>
                    </div>

                    {/* Ism */}
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '8px',
                      color: 'rgba(255,255,255,0.6)',
                      maxWidth: '55px', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
                      marginTop: '6px',
                      textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                    }}>
                      {player.name}
                    </div>

                    {/* Score */}
                    {player.score > 0 && (
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: '8px',
                        fontWeight: 700, color: '#ffd700',
                        textShadow: '0 0 6px rgba(255,215,0,0.3)',
                      }}>
                        {player.score}⭐
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ======================================================
                PASTKI QISM — 7 TA KARTA (O'ZGARMAYDI)
                ====================================================== */}
            <div style={{
              flexShrink: 0, width: '100%',
              padding: '6px 8px',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
              background: 'linear-gradient(0deg, rgba(5,5,8,0.98) 0%, rgba(5,5,8,0.9) 70%, rgba(5,5,8,0.6) 100%)',
              borderTop: '1px solid rgba(166,77,255,0.12)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '4px', padding: '0 2px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '8px',
                  fontWeight: 700, color: 'rgba(77,163,255,0.4)', letterSpacing: '2px',
                }}>
                  YOUR CARDS
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '8px',
                  fontWeight: 700, color: '#4DA3FF',
                  textShadow: '0 0 6px rgba(77,163,255,0.3)',
                }}>
                  {playerCards.length}
                </span>
              </div>

              <div style={{
                display: 'flex', gap: '4px',
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
                        flex: '1 1 0', minWidth: 0, maxWidth: '48px',
                        height: '64px', borderRadius: '8px', border: 'none',
                        padding: '4px 2px',
                        cursor: selectedBlue ? 'default' : 'pointer',
                        opacity: selectedBlue && !isSel ? 0.15 : 1,
                        transform: isSel ? 'translateY(-10px) scale(1.15)' : 'translateY(0)',
                        transition: 'all 0.3s ease',
                        background: isSel
                          ? 'linear-gradient(135deg, #A64DFF, #4DA3FF)'
                          : 'linear-gradient(135deg, #0a0a14, #12121f)',
                        border: isSel
                          ? '2px solid #A64DFF'
                          : '1px solid rgba(166,77,255,0.12)',
                        boxShadow: isSel
                          ? '0 0 20px rgba(166,77,255,0.4), 0 6px 20px rgba(0,0,0,0.4)'
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
                          background: 'linear-gradient(135deg, #A64DFF, #4DA3FF)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '5px', color: '#fff', fontWeight: 700,
                        }}>★</div>
                      )}
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '6.5px',
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
                          fontFamily: 'var(--font-display)', fontSize: '5px',
                          color: 'rgba(166,77,255,0.3)',
                        }}>⚡{card.power}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======== VOTING — O'ZGARMAYDI ======== */}
        {phase === 'voting' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '10px', overflow: 'auto',
            animation: 'fadeUp 0.3s ease',
            background: 'radial-gradient(ellipse at center, rgba(166,77,255,0.06) 0%, transparent 60%)',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '10px',
              color: 'rgba(166,77,255,0.5)', letterSpacing: '2px', marginBottom: '8px',
            }}>
              VOTING IN PROGRESS
            </div>

            <div style={{
              padding: '8px 12px', borderRadius: '8px',
              background: 'rgba(5,5,8,0.85)',
              border: '1px solid rgba(166,77,255,0.25)',
              textAlign: 'center', marginBottom: '10px', maxWidth: '300px', width: '100%',
              boxShadow: '0 0 20px rgba(166,77,255,0.08)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, color: '#A64DFF' }}>
                🔴 {currentRed.text}
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px', maxWidth: '300px', width: '100%',
            }}>
              {selectedBlue && (
                <div style={{
                  padding: '8px', borderRadius: '8px',
                  background: 'rgba(5,5,8,0.85)',
                  border: '1.5px solid rgba(166,77,255,0.4)',
                  textAlign: 'center',
                  boxShadow: '0 0 12px rgba(166,77,255,0.15)',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '7px', color: '#A64DFF', marginBottom: '3px', letterSpacing: '1px' }}>YOU</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '8px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                    {selectedCardText}
                  </div>
                </div>
              )}
              {opponentPlays.map((card, i) => {
                const opp = others[i];
                return (
                  <div key={card.id} style={{
                    padding: '8px', borderRadius: '8px',
                    background: 'rgba(5,5,8,0.75)',
                    border: '1px solid rgba(77,163,255,0.1)',
                    textAlign: 'center',
                    animation: `fadeUp 0.3s ease ${i * 0.08}s forwards`, opacity: 0,
                  }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '7px', color: 'rgba(77,163,255,0.5)', marginBottom: '3px' }}>
                      {opp?.avatar} {opp?.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', lineHeight: 1.2 }}>
                      {card.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======== RESULT — O'ZGARMAYDI ======== */}
        {phase === 'result' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            animation: 'fadeUp 0.4s ease',
            background: 'radial-gradient(ellipse at center, rgba(166,77,255,0.06) 0%, transparent 60%)',
          }}>
            {winner && (
              <div style={{
                padding: '14px 20px', borderRadius: '12px',
                background: 'rgba(5,5,8,0.85)',
                border: '1.5px solid rgba(255,215,0,0.3)',
                textAlign: 'center', marginBottom: '10px',
                boxShadow: '0 0 30px rgba(255,215,0,0.12), 0 0 60px rgba(166,77,255,0.05)',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏆</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.3)' }}>
                  {winner.avatar} {winner.name}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: 'rgba(166,77,255,0.5)', marginTop: '3px', letterSpacing: '1px' }}>
                  FUNNIEST ANSWER
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
              {sorted.slice(0, 3).map((p, i) => (
                <div key={p.id} style={{
                  padding: '5px 10px', borderRadius: '6px',
                  background: 'rgba(5,5,8,0.75)',
                  border: '1px solid rgba(166,77,255,0.12)',
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                  <span style={{ fontSize: '9px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '8px', color: 'rgba(255,255,255,0.55)' }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '9px', fontWeight: 700, color: '#ffd700' }}>{p.score}</span>
                </div>
              ))}
            </div>

            <button onClick={handleNextRound} style={{
              padding: '10px 28px', borderRadius: '8px', border: 'none',
              background: round >= TOTAL_ROUNDS
                ? 'linear-gradient(135deg, #2ed573, #4DA3FF)'
                : 'linear-gradient(135deg, #A64DFF, #4DA3FF)',
              fontFamily: 'var(--font-display)', fontSize: '12px',
              fontWeight: 700, color: '#fff', cursor: 'pointer',
              letterSpacing: '1px',
              boxShadow: '0 0 20px rgba(166,77,255,0.3), 0 4px 14px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.96)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(166,77,255,0.5), 0 2px 8px rgba(0,0,0,0.3)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(166,77,255,0.3), 0 4px 14px rgba(0,0,0,0.3)';
            }}>
              {round >= TOTAL_ROUNDS ? '🏁 FINAL RESULTS' : '▶ NEXT ROUND'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
