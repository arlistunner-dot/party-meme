import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import HomeScreen from '@/components/home/HomeScreen';
import RoomScreen from '@/components/room/RoomScreen';
import GameScreen from '@/components/game/GameScreen';
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
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Telegram bilan login
  useEffect(() => {
    // Telegram WebApp tayyor
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

  const handlePlay = () => {
    setShowGame(true);
    setCurrentScreen('game');
  };

  const handleCreateRoom = () => {
    setShowRoom(true);
    setCurrentScreen('room');
  };

  const handleJoinRoom = () => {
    setShowRoom(true);
    setCurrentScreen('room');
  };

  const handleGameEnd = () => {
    setShowGame(false);
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
    if (showGame) {
      return <GameScreen onNavigate={handleNavigate} onGameEnd={handleGameEnd} />;
    }

    if (showRoom) {
      return <RoomScreen onNavigate={handleNavigate} />;
    }

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
