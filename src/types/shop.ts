/**
 * Do'kon tiplari
 */

export type Currency = 'coin' | 'star';

export type ShopCategory =
  | 'coin_pack'
  | 'slot'
  | 'deck'
  | 'exclusive'
  | 'theme'
  | 'badge'
  | 'ad_free';

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  nameUz: string;
  description: string;
  price: number;
  currency: Currency;
  icon: string;
  isPopular: boolean;
  badge?: string;       // Sovg'a nishon
  frame?: string;       // Sovg'a ramka
  bonus?: number;       // Foizda bonus
  limited?: boolean;    // Cheklangan
}

export interface PurchaseRequest {
  itemId: string;
  currency: Currency;
}

export interface PurchaseResponse {
  success: boolean;
  transactionId: number;
  newBalance: number;
  item: ShopItem;
}

/**
 * Tranzaksiya
 */
export type TransactionType = 'earn' | 'spend' | 'purchase' | 'reward' | 'refund';

export interface Transaction {
  id: number;
  userId: number;
  type: TransactionType;
  currency: Currency;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId: number | null;
  createdAt: string;
}
