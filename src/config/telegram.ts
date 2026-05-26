/**
 * Telegram Mini APP integratsiya sozlamalari
 */

/**
 * Telegram WebApp instanceni xavfsiz oladi
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

/**
 * Telegram WebApp ni ishga tushiradi
 * Har bir sahifa komponentida chaqiriladi
 */
export function initTelegramApp(): TelegramWebApp | null {
  const tg = getTelegramWebApp();
  if (!tg) {
    console.warn('[Telegram] WebApp topilmadi. Brauzer rejimida ishlayapti.');
    return null;
  }

  tg.ready();
  tg.expand();

  return tg;
}

/**
 * Foydalanuvchi ma'lumotlarini oladi
 */
export function getTelegramUser() {
  const tg = getTelegramWebApp();
  if (!tg?.initDataUnsafe?.user) {
    return null;
  }

  const user = tg.initDataUnsafe.user;

  return {
    telegramId: user.id,
    firstName: user.first_name,
    lastName: user.last_name || null,
    username: user.username || null,
    languageCode: user.language_code || 'uz',
    isPremium: user.is_premium || false,
    photoUrl: user.photo_url || null,
  };
}

/**
 * Telegram initData ni oladi (serverga yuborish uchun)
 */
export function getTelegramInitData(): string {
  const tg = getTelegramWebApp();
  return tg?.initData || '';
}

/**
 * Rang sxemasini oladi
 */
export function getColorScheme(): 'light' | 'dark' {
  const tg = getTelegramWebApp();
  return tg?.colorScheme || 'dark';
}

/**
 * Haptic feedback – tebranish
 */
export function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  const tg = getTelegramWebApp();
  tg?.HapticFeedback.impactOccurred(style);
}

export function hapticSuccess() {
  const tg = getTelegramWebApp();
  tg?.HapticFeedback.notificationOccurred('success');
}

export function hapticError() {
  const tg = getTelegramWebApp();
  tg?.HapticFeedback.notificationOccurred('error');
}

export function hapticWarning() {
  const tg = getTelegramWebApp();
  tg?.HapticFeedback.notificationOccurred('warning');
}

export function hapticSelection() {
  const tg = getTelegramWebApp();
  tg?.HapticFeedback.selectionChanged();
}

/**
 * Back button boshqaruvi
 */
export function showBackButton(onClick: () => void) {
  const tg = getTelegramWebApp();
  if (!tg) return;

  tg.BackButton.show();
  tg.BackButton.onClick(onClick);
}

export function hideBackButton() {
  const tg = getTelegramWebApp();
  if (!tg) return;

  tg.BackButton.hide();
}

/**
 * Main button boshqaruvi
 */
export function showMainButton(text: string, onClick: () => void) {
  const tg = getTelegramWebApp();
  if (!tg) return;

  tg.MainButton.setText(text);
  tg.MainButton.show();
  tg.MainButton.onClick(onClick);
}

export function hideMainButton() {
  const tg = getTelegramWebApp();
  if (!tg) return;

  tg.MainButton.hide();
}

export function setMainButtonProgress(visible: boolean) {
  const tg = getTelegramWebApp();
  if (!tg) return;

  if (visible) {
    tg.MainButton.showProgress(true);
  } else {
    tg.MainButton.hideProgress();
  }
}
