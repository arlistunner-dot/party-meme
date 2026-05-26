import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { purchaseCard, purchaseSlots, purchaseCoins, getShopCards } from '../services/shop.service.js';

const router = Router();

// Barcha route lar autentifikatsiya talab qiladi
router.use(authMiddleware);

/**
 * GET /api/v1/shop/cards — Do'kon kartalari
 */
router.get('/cards', async (req: AuthRequest, res: Response) => {
  try {
    const cards = await getShopCards();
    res.json(cards);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/v1/shop/buy-card — Karta sotib olish
 */
router.post('/buy-card', async (req: AuthRequest, res: Response) => {
  try {
    const { cardId } = req.body;
    const result = await purchaseCard(req.userId!, cardId);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/v1/shop/buy-slots — Slot sotib olish
 */
router.post('/buy-slots', async (req: AuthRequest, res: Response) => {
  try {
    const { count } = req.body;
    const result = await purchaseSlots(req.userId!, count);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/v1/shop/buy-coins — Coin paket sotib olish
 */
router.post('/buy-coins', async (req: AuthRequest, res: Response) => {
  try {
    const { packageId } = req.body;
    const result = await purchaseCoins(req.userId!, packageId);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});

export default router;
