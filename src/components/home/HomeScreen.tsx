import { useAuthStore } from '@/store/authStore';
import { formatNumber } from '@/utils/formatters';
import { hapticImpact, hapticSuccess, hapticError } from '@/config/telegram';
import { useToast } from '@/components/common/Toast';

interface HomeScreenProps {
  onPlay: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onNavigate: (tab: string) => void;
}

export default function HomeScreen({ onPlay, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const user = useAuthStore((s) => s.user);
  const claimDailyBonus = useAuthStore((s) => s.claimDailyBonus);
  const { toast } = useToast();

  const handleDailyBonus = async () => {
    hapticImpact('medium');
    const result = await claimDailyBonus();
    if (result) {
      hapticSuccess();
      toast(`+${result.earned} coin olindi!`, 'success');
    } else {
      hapticError();
      toast('Bugun allaqachon oldingiz!', 'error');
    }
  };

  const alreadyClaimed = user?.dailyClaimedAt
    ? new Date(user.dailyClaimedAt).toDateString() === new Date().toDateString()
    : false;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ======== FON RASMI ======== */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          backgroundImage: 'url(/assets/home-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#0a0a0f',
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
          zIndex: 1,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ======== KONTENT ======== */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '0 20px',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
        }}
      >
        {/* ---- TEPADA: Balans + Kunlik bonus ---- */}
        <div
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 15px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Balans */}
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '3px 8px',
                    borderRadius: '16px',
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                  }}
                >
                  <span style={{ fontSize: '10px' }}>🪙</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#ffd700',
                    }}
                  >
                    {formatNumber(user.coinBalance)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '3px 8px',
                    borderRadius: '16px',
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0, 180, 216, 0.2)',
                  }}
                >
                  <span style={{ fontSize: '10px' }}>⭐</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#00b4d8',
                    }}
                  >
                    {user.starBalance}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Kunlik bonus */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>🎁</span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.65)',
                }}
              >
                Kunlik bonus
              </span>
            </div>
            <button
              onClick={handleDailyBonus}
              disabled={alreadyClaimed}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: alreadyClaimed
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(255, 0, 110, 0.2)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: alreadyClaimed ? 'rgba(255,255,255,0.25)' : '#ff006e',
                cursor: alreadyClaimed ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {alreadyClaimed ? 'OLINGAN' : 'OLISH'}
            </button>
          </div>
        </div>

        {/* ---- MARKAZIY BO'SH JOY ---- */}
        <div style={{ flex: 1 }} />

        {/* ---- TUGMALAR — PIRAMIDA ---- */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          {/* O'YNASH */}
          <button
            onClick={() => {
              hapticImpact('heavy');
              onPlay();
            }}
            style={{
              width: '100%',
              maxWidth: '340px',
              padding: '15px 24px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff006e 0%, #ff4757 100%)',
              boxShadow: '0 4px 20px rgba(255, 0, 110, 0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
              fontFamily: 'var(--font-display)',
              fontSize: '17px',
              fontWeight: 700,
              letterSpacing: '3px',
              color: '#fff',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => ((e.target as HTMLElement).style.transform = 'scale(0.96)')}
            onMouseUp={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
          >
            ▶ O'YNASH
          </button>

          {/* XONA YARATISH */}
          <button
            onClick={() => {
              hapticImpact('medium');
              onCreateRoom();
            }}
            style={{
              width: '100%',
              maxWidth: '270px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1.5px solid rgba(0, 180, 216, 0.35)',
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '2px',
              color: '#00b4d8',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => ((e.target as HTMLElement).style.transform = 'scale(0.96)')}
            onMouseUp={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
          >
            + XONA YARATISH
          </button>

          {/* XONAGA QO'SHILISH */}
          <button
            onClick={() => {
              hapticImpact('medium');
              onJoinRoom();
            }}
            style={{
              width: '100%',
              maxWidth: '210px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1.5px solid rgba(46, 213, 115, 0.25)',
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '2px',
              color: '#2ed573',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => ((e.target as HTMLElement).style.transform = 'scale(0.96)')}
            onMouseUp={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
          >
            🔗 QO'SHILISH
          </button>
        </div>
      </div>
    </div>
  );
}
