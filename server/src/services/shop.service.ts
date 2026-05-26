import { queryOne, query } from '../config/database.js';
import { spendCoins, addCoins } from './economy.service.js';

/**
 * Do'kon kartalarini olish
 */
export async function getShopCards() {
  const cards = await query(
    `SELECT * FROM cards
     WHERE status = 'approved' AND price_coins > 0
     ORDER BY created_at DESC`
  );
  return cards;
}

/**
 * Karta sotib olish
 */
export async function purchaseCard(userId: number, cardId: string) {
  // Karta mavjudligini tekshirish
  const card = await queryOne(
    `SELECT * FROM cards WHERE id = $1 AND status = 'approved'`,
    [cardId]
  );

  if (!card) {
    throw new Error('Karta topilmadi');
  }

  // Allaqachon sotib olinganmi?
  const owned = await queryOne(
    'SELECT id FROM user_cards WHERE user_id = $1 AND card_id = $2',
    [userId, cardId]
  );

  if (owned) {
    throw new Error('Bu karta allaqachon sotib olingan');
  }

  // Slot tekshirish
  const user = await queryOne<{ coin_balance: number; max_card_slots: number }>(
    'SELECT coin_balance, max_card_slots FROM users WHERE id = $1',
    [userId]
  );

  if (!user) throw new Error('Foydalanuvchi topilmadi');

  const cardCount = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM user_cards WHERE user_id = $1',
    [userId]
  );

  if (cardCount && parseInt(cardCount.count) >= user.max_card_slots) {
    throw new Error('Slotlar to\'ldi! Avval slot sotib oling.');
  }

  // Narx tekshirish
  const price = (card as { price_coins: number }).price_coins || 0;

  if (price > 0) {
    await spendCoins(userId, price, `Karta sotib olish: ${(card as { text: string }).text}`);
  }

  // Kartani berish
  await query(
    'INSERT INTO user_cards (user_id, card_id) VALUES ($1, $2)',
    [userId, cardId]
  );

  return { success: true, card };
}

/**
 * Slot sotib olish
 */
export async function purchaseSlots(userId: number, count: number) {
  const prices: Record<number, number> = {
    1: 500,
    3: 1200,
    5: 1800,
  };

  const price = prices[count];
  if (!price) {
    throw new Error('Noto\'g\'ri slot soni');
  }

  const user = await queryOne<{ coin_balance: number; max_card_slots: number }>(
    'SELECT coin_balance, max_card_slots FROM users WHERE id = $1',
    [userId]
  );

  if (!user) throw new Error('Foydalanuvchi topilmadi');
  if (user.coin_balance < price) throw new Error('Tangalar yetarli emas');

  await spendCoins(userId, price, `${count} ta slot sotib olish`);

  await query(
    'UPDATE users SET max_card_slots = max_card_slots + $1 WHERE id = $2',
    [count, userId]
  );

  const updatedUser = await queryOne(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  return { success: true, slots: (updatedUser as { max_card_slots: number })?.max_card_slots };
}

/**
 * Coin paket sotib olish
 */
export async function purchaseCoins(userId: number, packageId: string) {
  const packages: Record<string, { coins: number; stars: number }> = {
    'coins_100': { coins: 100, stars: 1 },
    'coins_500': { coins: 500, stars: 4 },
    'coins_1000': { coins: 1000, stars: 7 },
    'coins_5000': { coins: 5000, stars: 30 },
  };

  const pkg = packages[packageId];
  if (!pkg) throw new Error('Noto\'g\'ri paket');

  await addCoins(userId, pkg.coins, `Coin paket: ${packageId}`);
  return { success: true, coins: pkg.coins };
}
