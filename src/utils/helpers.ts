import { RANKS } from '@/config/constants';
import type { UserRank } from '@/types/user';

/**
 * Reytingdan darajani aniqlash
 */
export function getRankByRating(rating: number): UserRank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    const rank = RANKS[i];
    if (rank.id === 'ambassador') continue;
    if (rating >= rank.minRating) {
      return rank.id as UserRank;
    }
  }
  return 'newbie';
}

/**
 * Keyingi daraja uchun kerakli reyting
 */
export function getNextRankTarget(currentRating: number): number | null {
  for (const rank of RANKS) {
    if (rank.id === 'ambassador') continue;
    if (currentRating < rank.minRating) {
      return rank.minRating;
    }
  }
  return null;
}

/**
 * Daraja progress foizi (0-100)
 */
export function getRankProgress(rating: number): number {
  const currentRank = RANKS.find((r) => {
    if (r.id === 'ambassador') return false;
    return rating >= r.minRating && (r.maxRating === null || rating <= r.maxRating);
  });

  if (!currentRank || currentRank.maxRating === null) return 100;

  const range = currentRank.maxRating - currentRank.minRating;
  const progress = rating - currentRank.minRating;
  return Math.min(100, Math.round((progress / range) * 100));
}

/**
 * Xona kodi generatsiya qilish (6 belgi)
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Tasodifiy aralashtirish (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Kichik sanaga formatlash
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Hozir';
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  if (diffHour < 24) return `${diffHour} soat oldin`;
  if (diffDay < 7) return `${diffDay} kun oldin`;
  return date.toLocaleDateString('uz-UZ');
}

/**
 * Clipboardga nusxalash
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}
