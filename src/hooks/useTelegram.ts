import { useState, useEffect, useCallback } from 'react';
import {
  getTelegramWebApp,
  getTelegramUser,
  getTelegramInitData,
  getColorScheme,
  hapticImpact,
  hapticSuccess,
  hapticError,
  hapticWarning,
  hapticSelection,
  showBackButton,
  hideBackButton,
} from '@/config/telegram';

interface TelegramUser {
  telegramId: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  languageCode: string;
  isPremium: boolean;
  photoUrl: string | null;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const telegramUser = getTelegramUser();
    if (telegramUser) {
      setUser(telegramUser);
    }

    setColorScheme(getColorScheme());
    setIsReady(true);
  }, []);

  const goBack = useCallback(() => {
    const tg = getTelegramWebApp();
    tg?.close();
  }, []);

  return {
    user,
    colorScheme,
    isReady,
    initData: getTelegramInitData(),
    haptic: {
      impact: hapticImpact,
      success: hapticSuccess,
      error: hapticError,
      warning: hapticWarning,
      selection: hapticSelection,
    },
    backButton: {
      show: showBackButton,
      hide: hideBackButton,
    },
    goBack,
  };
}
