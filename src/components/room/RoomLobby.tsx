import { useEffect, useState } from 'react';
import RoomCode from './RoomCode';
import PlayerSlot from './PlayerSlot';
import BrandedTheme from './BrandedTheme';
import { Button } from '@/components/common';
import { useRoom } from '@/hooks/useRoom';
import { useAuth } from '@/hooks/useAuth';
import { GAME } from '@/config/constants';
import { hapticImpact, hapticSuccess } from '@/config/telegram';

interface RoomLobbyProps {
  onStartGame: () => void;
  onLeave: () => void;
}

export default function RoomLobby({ onStartGame, onLeave }: RoomLobbyProps) {
  const { room, isLoading, setReady, listenRoomEvents, stopListening } = useRoom();
  const { user } = useAuth();
  const [amReady, setAmReady] = useState(false);

  // Socket hodisalarini tinglash
  useEffect(() => {
    listenRoomEvents();
    return () => stopListening();
  }, [listenRoomEvents, stopListening]);

  if (!room || !user) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
        }}
      >
        Xona yuklanmoqda...
      </div>
    );
  }

  const isHost = room.hostId === user.telegramId;
  const allReady = room.players.length >= GAME.MIN_PLAYERS
    && room.players.every((p) => p.isReady || p.userId === room.hostId);
  const canStart = isHost && allReady;

  // Bo'sh o'rinlar
  const emptySlots = Array.from(
    { length: room.maxPlayers - room.players.length },
    (_, i) => i + room.players.length + 1
  );

  const handleReadyToggle = () => {
    hapticImpact('medium');
    const newReady = !amReady;
    setAmReady(newReady);
    setReady(newReady);
  };

  const handleStart = () => {
    if (canStart) {
      hapticSuccess();
      onStartGame();
    }
  };

  return (
    <BrandedTheme theme={room.brandTheme}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          padding: 'var(--space-md)',
          paddingTop: 'var(--space-xl)',
          gap: 'var(--space-lg)',
        }}
      >
        {/* Xona kodi */}
        <div style={{ textAlign: 'center' }}>
          <RoomCode code={room.roomCode} />
        </div>

        {/* O'yinchilar soni */}
        <div
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}
        >
          O'yinchilar:{' '}
          <span
            style={{
              fontWeight: 700,
              color:
                room.players.length >= GAME.MIN_PLAYERS
                  ? 'var(--accent-success)'
                  : 'var(--accent-warning)',
            }}
          >
            {room.players.length}/{room.maxPlayers}
          </span>
          {room.players.length < GAME.MIN_PLAYERS && (
            <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
              (kamida {GAME.MIN_PLAYERS} kishi kerak)
            </span>
          )}
        </div>

        {/* O'yinchilar grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: 'var(--space-sm)',
            flex: 1,
            alignContent: 'start',
          }}
        >
          {room.players.map((player) => (
            <PlayerSlot
              key={player.userId}
              username={player.firstName || player.username || 'Anonim'}
              avatarUrl={player.avatarUrl}
              rank="newbie"
              isReady={player.isReady}
              isHost={player.isHost}
              seatNumber={player.seatNumber}
            />
          ))}

          {emptySlots.map((seat) => (
            <PlayerSlot
              key={`empty-${seat}`}
              username=""
              avatarUrl={null}
              isReady={false}
              isHost={false}
              isEmpty
              seatNumber={seat}
            />
          ))}
        </div>

        {/* Pastki tugmalar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
            paddingBottom: 'var(--space-lg)',
          }}
        >
          {/* Start – faqat host uchun */}
          {isHost && (
            <Button
              variant="success"
              size="lg"
              fullWidth
              disabled={!canStart}
              loading={isLoading}
              onClick={handleStart}
            >
              {canStart ? 'BOSHLASH' : `${GAME.MIN_PLAYERS - room.players.length} ta o'yinchi kutilmoqda`}
            </Button>
          )}

          {/* Tayyor tugma – host bo'lmaganlar uchun */}
          {!isHost && (
            <Button
              variant={amReady ? 'ghost' : 'primary'}
              size="lg"
              fullWidth
              onClick={handleReadyToggle}
            >
              {amReady ? 'BEKOR QILISH' : 'TAYYORMAN'}
            </Button>
          )}

          {/* Chiqish */}
          <Button variant="ghost" size="sm" fullWidth onClick={onLeave}>
            Xonadan chiqish
          </Button>
        </div>
      </div>
    </BrandedTheme>
  );
}
