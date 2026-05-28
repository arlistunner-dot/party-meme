import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import HomeScreen from '@/components/home/HomeScreen';
import RoomScreen from '@/components/room/RoomScreen';
import GameScreen from '@/components/game/GameScreen';
import GameMatchmaking from '@/components/game/GameMatchmaking';
import ProfileScreen from '@/components/profile/ProfileScreen';
import ShopScreen from '@/components/shop/ShopScreen';
import RatingScreen from '@/components/rank/RankScreen';
import InventoryScreen from '@/components/inventory/InventoryScreen';
import FriendsScreen from '@/components/friends/FriendsScreen';
import BottomNav from '@/components/common/BottomNav';
import { ToastProvider } from '@/components/common/Toast';
import type { GameScreen as GameScreenType } from '@/types/game';

function App() {
  const { user, isAuthenticated, login } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('home');
  const [showRoom, setShowRoom] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [roomMode, setRoomMode] = useState<'create' | 'join'>('create');
  const [gamePhase, setGamePhase] = useState<'matchmaking' | 'lobby' | 'play'>('matchmaking');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Telegram bilan login
  useEffect(() => {
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();

    async function init() {
      try {
        await login();
      } catch (err) {
        console.error('[App] Login xato:', err);
        setError('Ulanishda xato. Qayta urinib ko\'ring.');
      } finally {
        setReady(true);
      }
    }

    init();
  }, [login]);

  // Navigatsiya
  const handleNavigate = (screen: string) => {
    if (screen === 'home') {
      setShowRoom(false);
      setShowGame(false);
    }
    setCurrentScreen(screen as GameScreenType);
  };

  // O'YNASH tugmasi
  const handlePlay = () => {
    setGamePhase('matchmaking');
    setShowGame(true);
    setCurrentScreen('game');
  };

  // Matchmaking tugadi — lobbyga o'tish
  const handleMatchReady = () => {
    setGamePhase('play');
  };

  // Xona yaratish
  const handleCreateRoom = () => {
    setRoomMode('create');
    setShowRoom(true);
    setCurrentScreen('room');
  };

  // Xonaga qo'shilish
  const handleJoinRoom = () => {
    setRoomMode('join');
    setShowRoom(true);
    setCurrentScreen('room');
  };

  // O'yin tugadi
  const handleGameEnd = () => {
    setShowGame(false);
    setGamePhase('matchmaking');
    setCurrentScreen('home');
  };

  // Xato
  if (error && !user) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0a0a0f',
          gap: '16px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {error}
        </div>
        <button
          onClick={() => {
            setError(null);
            setReady(false);
            login().finally(() => setReady(true));
          }}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #ff006e, #ff4757)',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          QAYTA URINISH
        </button>
      </div>
    );
  }

  // Loading
  if (!ready || (!isAuthenticated && !error)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0a0a0f',
          gap: '16px',
        }}
      >
        <div style={{ fontSize: '48px' }}>🎉</div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '3px',
          }}
        >
          PARTY MEME
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          Yuklanmoqda...
        </div>
        <div
          style={{
            width: '120px',
            height: '3px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '40%',
              height: '100%',
              background: 'linear-gradient(90deg, #ff006e, #9b5de5)',
              borderRadius: '2px',
              animation: 'loadingBar 1.2s ease infinite',
            }}
          />
        </div>
      </div>
    );
  }

  // Asosiy ekranlar
  const renderScreen = () => {
    // O'YIN
    if (showGame) {
      // 1. Matchmaking — 7 o'yinchi qidirish
      if (gamePhase === 'matchmaking') {
        return (
          <GameMatchmaking
            onReady={handleMatchReady}
            onCancel={handleGameEnd}
          />
        );
      }
      // 2. O'yin (tayyorgarlik keyin qo'shiladi)
      return <GameScreen onNavigate={handleNavigate} onGameEnd={handleGameEnd} />;
    }

    // XONA
    if (showRoom) {
      return <RoomScreen onNavigate={handleNavigate} initialMode={roomMode} />;
    }

    // BO'LIMLAR
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onPlay={handlePlay}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onNavigate={handleNavigate}
          />
        );
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} />;
      case 'shop':
        return <ShopScreen onNavigate={handleNavigate} />;
      case 'rating':
        return <RatingScreen onNavigate={handleNavigate} />;
      case 'inventory':
        return <InventoryScreen onNavigate={handleNavigate} />;
      case 'friends':
        return <FriendsScreen onNavigate={handleNavigate} />;
      default:
        return (
          <HomeScreen
            onPlay={handlePlay}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <ToastProvider>
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
        }}
      >
        {renderScreen()}

        {!showGame && !showRoom && (
          <BottomNav
            activeTab={currentScreen}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
