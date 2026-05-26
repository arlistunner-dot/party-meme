import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/config/api';
import { useAuthStore } from '@/store/authStore';

let socket: Socket | null = null;

export function useSocket() {
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || token === 'demo_token') return;

    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Ulandi:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Uzildi');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Xato:', err.message);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token]);

  const emit = useCallback((event: string, data?: unknown) => {
    socket?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: unknown) => void) => {
    socket?.on(event, callback);
    return () => {
      socket?.off(event, callback);
    };
  }, []);

  return { socket, emit, on };
}
