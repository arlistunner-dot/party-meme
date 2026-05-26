import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getUserCards, createCard, toggleFavorite } from '../services/card.service.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/v1/cards — Inventar kartalari
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const cards = await getUserCards(req.userId!);
    res.json(cards);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/v1/cards — Karta yaratish
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, text, imageUrl } = req.body;
    const card = await createCard(req.userId!, { type, text, imageUrl });
    res.json(card);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/v1/cards/:id/favorite — Sevimli
 */
router.post('/:id/favorite', async (req: AuthRequest, res: Response) => {
  try {
    const cardId = parseInt(req.params.id);
    const result = await toggleFavorite(req.userId!, cardId);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});

export default router;
