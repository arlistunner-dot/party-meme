import { api } from './api';
import { API_ENDPOINTS } from '@/config/api';
import type { PurchaseRequest, PurchaseResponse, ShopItem } from '@/types/shop';

/**
 * Do'kon elementlari
 */
export async function getShopItems(): Promise<ShopItem[]> {
  return api.get<ShopItem[]>(API_ENDPOINTS.SHOP);
}

/**
 * Tanga xarid qilish (Stars bilan)
 */
export async function purchaseCoins(packageId: string): Promise<PurchaseResponse> {
  return api.post<PurchaseResponse>(API_ENDPOINTS.PURCHASE_COINS, { packageId });
}

/**
 * Slot xarid qilish
 */
export async function purchaseSlot(count: number): Promise<PurchaseResponse> {
  return api.post<PurchaseResponse>(API_ENDPOINTS.PURCHASE_SLOT, { count });
}

/**
 * Reklama ko'rish mukofoti
 */
export async function claimAdReward(): Promise<{ coins: number }> {
  return api.post<{ coins: number }>(API_ENDPOINTS.ADS_REWARD);
}
