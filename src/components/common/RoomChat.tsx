import { useState, useRef, useEffect } from 'react';
import { hapticImpact, hapticSelection } from '@/config/telegram';

interface Message {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  text: string;
  time: string;
}

interface RoomChatProps {
  players: { id: string; name: string; avatar: string }[];
}

// Demo xabarlar simulyatsiya
const DEMO_MESSAGES: Message[] = [
  {
    id: 'm1',
    playerId: 'p1',
    playerName: 'Sardor',
    playerAvatar: '😎',
    text: 'Salom hammaga! 🎮',
    time: '14:23',
  },
  {
    id: 'm2',
    playerId: 'p2',
    playerName: 'Dilnoza',
    playerAvatar: '🤠',
    text: 'Yaxshi o\'ynaylik!',
    time: '14:23',
  },
  {
    id: 'm3',
    playerId: 'p3',
    playerName: 'Javohir',
    playerAvatar: '👻',
    text: 'Men tayyorman 💪',
    time: '14:24',
  },
];

export default function RoomChat({ players }: RoomChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Avtomatik scroll pastga
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Simulyatsiya — boshqalar yozadi
  useEffect(() => {
    if (!isOpen) return;

    const demoTexts = [
      'Tezroq boshlaylik! 🚀',
      'Kimga ovoz beramiz? 🤔',
      'Bu round qiyin ekan 😅',
      'Kulgili karta! 😂',
      'Yana bir o\'yin o\'ynaylikmi?',
      'Eng zo\'r javob! 🏆',
      'Kutib bo\'lmaydi! ⚡',
      'Haha juda yaxshi 😄',
    ];

    const timer = setTimeout(() => {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];

      const newMsg: Message = {
        id: `msg_${Date.now()}`,
        playerId: randomPlayer.id,
        playerName: randomPlayer.name,
        playerAvatar: randomPlayer.avatar,
        text: randomText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newMsg]);
    }, 3000 + Math.random() * 5000);

    return () => clearTimeout(timer);
  }, [messages.length, isOpen, players]);

  // Xabar yuborish
  const handleSend = () => {
    if (!inputText.trim()) return;

    hapticImpact('light');

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      playerId: 'me',
      playerName: 'Siz',
      playerAvatar: '🤖',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Focus qaytarish
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Enter bosish
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 💬 TUGMA — pastki o'ng burchak */}
      <button
        onClick={() => {
          hapticSelection();
          setIsOpen(!isOpen);
        }}
        style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          right: '16px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: isOpen
            ? 'rgba(255,0,110,0.9)'
            : 'linear-gradient(135deg, #ff006e, #9b5de5)',
          border: 'none',
          boxShadow: '0 4px 15px rgba(255,0,110,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'all 0.2s ease',
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Xabar soni belgisi */}
      {!isOpen && messages.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(120px + env(safe-area-inset-bottom, 0px))',
            right: '16px',
            padding: '2px 6px',
            borderRadius: '10px',
            background: '#ff4757',
            fontFamily: 'var(--font-display)',
            fontSize: '10px',
            fontWeight: 700,
            color: '#fff',
            zIndex: 101,
            minWidth: '18px',
            textAlign: 'center',
          }}
        >
          {messages.length}
        </div>
      )}

      {/* CHAT OYNASI */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            height: '55vh',
            background: 'rgba(10,10,15,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px 20px 0 0',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 99,
            animation: 'slideUp 0.25s ease forwards',
          }}
        >
          {/* Chat header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              💬 CHAT
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              {players.length} o'yinchi
            </div>
          </div>

          {/* Xabarlar */}
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* Ogohlantirish */}
            <div
              style={{
                textAlign: 'center',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255,165,0,0.08)',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: 'rgba(255,165,0,0.6)',
                }}
              >
                ⚠️ Xabarlar vaqtinchalik — o'yin tugasa o'chadi
              </div>
            </div>

            {messages.map((msg) => {
              const isMe = msg.playerId === 'me';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    animation: 'fadeUp 0.2s ease forwards',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      display: 'flex',
                      gap: '8px',
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                    }}
                  >
                    {/* Avatar */}
                    {!isMe && (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          flexShrink: 0,
                        }}
                      >
                        {msg.playerAvatar}
                      </div>
                    )}

                    {/* Xabar */}
                    <div>
                      {!isMe && (
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.3)',
                            marginBottom: '2px',
                            paddingLeft: '2px',
                          }}
                        >
                          {msg.playerName}
                        </div>
                      )}
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: isMe
                            ? '12px 12px 4px 12px'
                            : '12px 12px 12px 4px',
                          background: isMe
                            ? 'rgba(255,0,110,0.2)'
                            : 'rgba(255,255,255,0.06)',
                          border: isMe
                            ? '1px solid rgba(255,0,110,0.15)'
                            : '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: '#fff',
                            lineHeight: 1.4,
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '9px',
                          color: 'rgba(255,255,255,0.2)',
                          marginTop: '2px',
                          paddingLeft: '2px',
                          textAlign: isMe ? 'right' : 'left',
                        }}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Yozish qismi */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '10px 16px',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Xabar yozing..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: '#fff',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: 'none',
                background: inputText.trim()
                  ? 'linear-gradient(135deg, #ff006e, #ff4757)'
                  : 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Animatsiya */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
