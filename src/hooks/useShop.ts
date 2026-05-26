import { useCallback, useState } from 'react';
import * as shopService from '@/services/shopService';
import { useAuthStore } from '@/store/authStore';
import type { ShopItem, PurchaseResponse } from '@/types/shop';

export function useShop() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateBalance = useAuthStore((s) => s.updateBalance);

  // Do'kon elementlarini yuklash
  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const shopItems = await shopService.getShopItems();
      setItems(shopItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Do\'kon elementlarini yuklashda xato');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Xarid qilish
  const purchase = useCallback(
    async (type: 'coins' | 'slot', param: string | number) => {
      try {
        setIsLoading(true);
        setError(null);

        let result: PurchaseResponse;

        if (type === 'coins') {
          result = await shopService.purchaseCoins(param as string);
        } else {
          result = await shopService.purchaseSlot(param as number);
        }

        if (result.success) {
          updateBalance(result.newBalance, 0);
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Xarid qilishda xato';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateBalance]
  );

  // Reklama ko'rish mukofoti
  const claimAdReward = useCallback(async () => {
    try {
      const result = await shopService.claimAdReward();
      const user = useAuthStore.getState().user;
      if (user) {
        updateBalance(user.coinBalance + result.coins, user.starBalance);
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mukofot olishda xato');
      throw err;
    }
  }, [updateBalance]);

  return {
    items,
    isLoading,
    error,
    loadItems,
    purchase,
    claimAdReward,
  };
}
