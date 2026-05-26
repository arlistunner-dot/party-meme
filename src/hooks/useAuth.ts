import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authenticateWithTelegram, getMe } from '@/services/authService';
import { useTelegram } from './useTelegram';
import { getTelegramInitData } from '@/config/telegram';

export function useAuth() {
  const { user: tgUser } = useTelegram();
  const store = useAuthStore();

  const login = useCallback(async () => {
    try {
      store.setLoading(true);
      store.setError(null);

      const initData = getTelegramInitData();
      if (!initData) {
        // Brauzer rejimida test uchun
        console.warn('[Auth] initData topilmadi, brauzer rejimi');
        return;
      }

      const { user, token } = await authenticateWithTelegram(initData);
      store.login(user, token);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Autentifikatsiya xatosi';
      store.setError(message);
      console.error('[Auth] Xato:', message);
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const refreshUser = useCallback(async () => {
    try {
      const user = await getMe();
      store.setUser(user);
    } catch {
      console.error('[Auth] Foydalanuvchi ma\'lumotlarini yangilash xatosi');
    }
  }, [store]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    telegramUser: tgUser,
    login,
    refreshUser,
    logout: store.logout,
  };
}
