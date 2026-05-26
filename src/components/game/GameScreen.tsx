import { useState } from 'react';
import Header from '@/components/common/Header';
import { hapticImpact, hapticSuccess } from '@/config/telegram';

interface GameScreenProps {
  onNavigate: (tab: string) => void;
  onGameEnd: () => void;
}

// Demo ma'lumotlar
const DEMO_RED_CARDS = [
  { id: 1, text: 'Men uydan chiqishni yomon ko\'raman, chunki...' },
  { id: 2, text: 'Eng yomon sovg\'a bu...' },
  { id: 3, text: 'Qiz do\'stim meni tashlab ketdi, chunki men...' },
];

const DEMO_BLUE_CARDS = [
  { id: 101, text: 'WiFi parolini unutganingizda' },
  { id: 102, text: 'Nonushtasiz uydan chiqqan va hayotim yaxshi ketayotgani' },
  { id: 103, text: 'Sport zalga borganim (1 kun)' },
  { id: 104, text: 'Kredit karta hisobimni ko\'rganimda 🫠' },
  { id: 105, text: 'Men ertaga boshlayman deb aytgan edim... 3 yil oldin' },
];

export default function GameScreen({ onNavigate, onGameEnd }: GameScreenProps) {
  const [phase, setPhase] = useState<'select_red' | 'select_blue' | 'judge' | 'result'>('select_red');
  const [selectedRed, setSelectedRed] = useState<number | null>(null);
  const [selectedBlue, setSelectedBlue] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [scores] = useState<Record<number, number>>({ 1: 2, 2: 1, 3: 0 });

  const handleSelectRed = (id: number) => {
    hapticImpact('medium');
    setSelectedRed(id);
    setTimeout(() => setPhase('select_blue'), 500);
  };

  const handleSelectBlue = (id: number) => {
    hapticImpact('medium');
    setSelectedBlue(id);
    setTimeout(() => setPhase('judge'), 500);
  };

  const handleJudge = () => {
    hapticSuccess();
    setPhase('result');
  };

  const handleNextRound = () => {
    hapticImpact('medium');
    if (round >= 5) {
      onGameEnd();
      return;
    }
    setRound(round + 1);
    setSelectedRed(null);
    setSelectedBlue(null);
    setPhase('select_red');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(10,10,15,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
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

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '2px',
          }}
        >
          ROUND {round}/5
        </div>

        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          ⏱️ 30s
        </div>
      </div>

      {/* Kontent */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          paddingBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
        }}
      >
        {/* ======== QIZIL KARTA TANLASH ======== */}
        {phase === 'select_red' && (
          <div>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#ff4757',
                  marginBottom: '4px',
                }}
              >
                🔴 QIZIL KARTA
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                Savol yoki vaziyatni tanlang
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {DEMO_RED_CARDS.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectRed(card.id)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    borderRadius: '14px',
                    border:
                      selectedRed === card.id
                        ? '2px solid #ff4757'
                        : '2px solid rgba(255,71,87,0.15)',
                    background:
                      selectedRed === card.id
                        ? 'rgba(255,71,87,0.12)'
                        : 'rgba(255,71,87,0.04)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    lineHeight: 1.4,
                    animation: 'fadeUp 0.3s ease forwards',
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {card.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======== KO'K KARTA TANLASH ======== */}
        {phase === 'select_blue' && (
          <div>
            {/* Tanlangan qizil karta */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(255,71,87,0.1)',
                border: '1px solid rgba(255,71,87,0.2)',
                marginBottom: '16px',
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
                {DEMO_RED_CARDS.find((c) => c.id === selectedRed)?.text}
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#3742fa',
                  marginBottom: '4px',
                }}
              >
                🔵 KO'K KARTALAR
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                Eng kulgili javobni tanlang
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {DEMO_BLUE_CARDS.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectBlue(card.id)}
                  style={{
                    width: '100%',
                    padding: '16px 18px',
                    borderRadius: '12px',
                    border:
                      selectedBlue === card.id
                        ? '2px solid #3742fa'
                        : '2px solid rgba(55,66,250,0.12)',
                    background:
                      selectedBlue === card.id
                        ? 'rgba(55,66,250,0.12)'
                        : 'rgba(55,66,250,0.03)',
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
                  }}
                >
                  {card.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======== HAKAM TANLOVI ======== */}
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
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {DEMO_RED_CARDS.find((c) => c.id === selectedRed)?.text}
              </div>
            </div>

            {/* Javob */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(55,66,250,0.15), rgba(155,93,229,0.1))',
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
                JAVOB:
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
                {DEMO_BLUE_CARDS.find((c) => c.id === selectedBlue)?.text}
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
                <div
                  key={id}
                  style={{
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(155,93,229,0.3), rgba(255,0,110,0.3))',
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
                background: 'linear-gradient(135deg, rgba(55,66,250,0.12), rgba(155,93,229,0.08))',
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
                {DEMO_BLUE_CARDS.find((c) => c.id === selectedBlue)?.text}
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
