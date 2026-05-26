/**
 * Raqamni formatlash (minglik ajratgich bilan)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Foizni formatlash
 */
export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return Math.round((value / total) * 100) + '%';
}

/**
 * Vaqtni formatlash (soniya → mm:ss)
 */
export function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Vaqt oralig'ini formatlash (soniya → "Xm Xs")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
}

/**
 * Sana formatlash
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Ball o'zgarishini formatlash (+100, -50)
 */
export function formatRatingChange(change: number): string {
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return '0';
}

/**
 * G'alaba foizini formatlash
 */
export function formatWinRate(wins: number, total: number): string {
  if (total === 0) return '0%';
  return Math.round((wins / total) * 100) + '%';
}

/**
 * Slot holatini formatlash (5/15)
 */
export function formatSlots(used: number, max: number): string {
  return `${used}/${max}`;
}
