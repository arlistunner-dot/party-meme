import { IMAGE_UPLOAD } from '@/config/constants';

/**
 * Karta matnini tekshirish
 */
export function validateCardText(text: string): { valid: boolean; error?: string } {
  const trimmed = text.trim();

  if (!trimmed) {
    return { valid: false, error: 'Karta matni bo\'sh bo\'lmasligi kerak' };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Karta matni juda qisqa (kamida 3 belgi)' };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'Karta matni juda uzun (maksimum 200 belgi)' };
  }

  // So'kinish filtri (asosiy)
  const bannedWords = [
    'so\'kish', 'haqorat',
    // Server tomonida kengaytiriladi
  ];

  const lowerText = trimmed.toLowerCase();
  for (const word of bannedWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return { valid: false, error: 'Noto\'g\'ri so\'zlar aniqlandi' };
    }
  }

  return { valid: true };
}

/**
 * Rasm faylini tekshirish
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Format
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !IMAGE_UPLOAD.FORMATS.includes(ext)) {
    return {
      valid: false,
      error: `Noto'g'ri format. Ruxsat etilgan: ${IMAGE_UPLOAD.FORMATS.join(', ')}`,
    };
  }

  // Hajm
  if (file.size > IMAGE_UPLOAD.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Fayl hajmi juda katta. Maksimum: ${IMAGE_UPLOAD.MAX_SIZE_MB} MB`,
    };
  }

  return { valid: true };
}

/**
 * Xona kodini tekshirish
 */
export function validateRoomCode(code: string): { valid: boolean; error?: string } {
  const trimmed = code.trim().toUpperCase();

  if (!trimmed) {
    return { valid: false, error: 'Xona kodini kiriting' };
  }

  if (trimmed.length !== 6) {
    return { valid: false, error: 'Xona kodi 6 belgidan iborat bo\'lishi kerak' };
  }

  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Xona kodi faqat harflar va raqamlardan iborat' };
  }

  return { valid: true };
}

/**
 * Spam belgilarini tekshirish
 */
export function hasSpamIndicators(text: string): boolean {
  // Takroriy belgilar (5+ ketma-ket)
  if (/(.)\1{4,}/.test(text)) return true;

  // Juda ko'p caps lock
  const caps = (text.match(/[A-Z]/g) || []).length;
  if (caps > text.length * 0.7 && text.length > 10) return true;

  // Link spam
  if (/https?:\/\//i.test(text)) return true;

  return false;
}
