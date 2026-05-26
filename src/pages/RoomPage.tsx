import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RoomLobby from '@/components/room/RoomLobby';
import { Button } from '@/components/common';
import { useRoom } from '@/hooks/useRoom';
import { useAuth } from '@/hooks/useAuth';
import { validateRoomCode } from '@/utils/validators';
import { useToast } from '@/components/common/Toast';
import { hapticImpact, hapticError } from '@/config/telegram';

export default function RoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { room, createRoom, joinRoom, leaveRoom } = useRoom();
  const { user } = useAuth();
  const { toast } = useToast();

  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');

  // URL parametrlariga qarab rejim
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setMode('create');
    } else if (searchParams.get('join') === 'true') {
      setMode('join');
    }
  }, [searchParams]);

  // Xona yaratish
  const handleCreate = useCallback(async () => {
    try {
      hapticImpact('heavy');
      await createRoom({
        maxPlayers: 6,
        roundsCount: 5,
        isPrivate: false,
        gameMode: 'classic',
      });
    } catch {
      hapticError();
      toast('Xona yaratishda xato', 'error');
    }
  }, [createRoom, toast]);

  // Xonaga qo'shilish
  const handleJoin = useCallback(async () => {
    const validation = validateRoomCode(joinCode);
    if (!validation.valid) {
      toast(validation.error!, 'error');
      hapticError();
      return;
    }

    try {
      await joinRoom(joinCode.toUpperCase());
    } catch {
      hapticError();
      toast('Xonaga qo\'shilib bo\'lmadi', 'error');
    }
  }, [joinCode, joinRoom, toast]);

  // Xonadan chiqish
  const handleLeave = useCallback(async () => {
    await leaveRoom();
    navigate('/');
  }, [leaveRoom, navigate]);

  // O'yinni boshlash
  const handleStartGame = useCallback(() => {
    navigate('/game');
  }, [navigate]);

  // Agar xonada bo'lsa – lobby
  if (room) {
    return <RoomLobby onStartGame={handleStartGame} onLeave={handleLeave} />;
  }

  // Xona yaratish/qo'shilish ekran
  return (
    <div
      className="app-bg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--space-lg)',
        gap: 'var(--space-xl)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-yellow))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        PARTY MEME
      </div>

      {mode === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%', maxWidth: '300px' }}>
          <Button variant="primary" size="lg" fullWidth onClick={() => { setMode('create'); handleCreate(); }}>
            XONA YARATISH
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={() => setMode('join')}>
            XONAGA QO'SHILISH
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={() => navigate('/')}>
            ORQAGA
          </Button>
        </div>
      )}

      {mode === 'join' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%', maxWidth: '300px' }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}
          >
            Xona kodini kiriting
          </div>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--neon-pink)',
              letterSpacing: '6px',
              textTransform: 'uppercase',
            }}
          />
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={joinCode.length !== 6}
            onClick={handleJoin}
          >
            QO'SHILISH
          </Button>
          <Button variant="ghost" size="sm" fullWidth onClick={() => setMode('idle')}>
            ORQAGA
          </Button>
        </div>
      )}
    </div>
  );
}
