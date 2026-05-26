import { hapticSelection } from '@/config/telegram';

interface BottomNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Bosh', icon: '🏠', path: 'home' },
  { id: 'inventory', label: 'Kartalar', icon: '🎴', path: 'inventory' },
  { id: 'rating', label: 'Reyting', icon: '🏆', path: 'rating' },
  { id: 'shop', label: "Do'kon", icon: '🛒', path: 'shop' },
  { id: 'profile', label: 'Profil', icon: '👤', path: 'profile' },
];

export default function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '64px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === activeTab;

        return (
          <button
            key={item.id}
            onClick={() => {
              hapticSelection();
              onNavigate(item.path);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              minWidth: '48px',
              flex: 1,
              position: 'relative',
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  height: '2px',
                  borderRadius: '1px',
                  background: '#ff006e',
                  boxShadow: '0 0 8px rgba(255, 0, 110, 0.5)',
                }}
              />
            )}

            {/* Ikonka */}
            <span
              style={{
                fontSize: '18px',
                lineHeight: 1,
                filter: isActive ? 'none' : 'grayscale(0.6) brightness(0.7)',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              {item.icon}
            </span>

            {/* Label */}
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '9px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ff006e' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.2s ease',
                letterSpacing: '0.3px',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
