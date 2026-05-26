import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getRating, getUserRank, getWeeklyTop } from '../services/rating.service.js';
import { getRating, getUserRank, getWeeklyTop, getCreatorTop } from '../services/rating.service.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/v1/rating — Reyting jadvali
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const leaders = await getRating(limit, offset);
    res.json(leaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/v1/rating/me — Foydalanuvchi o'rni
 */
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const rank = await getUserRank(req.userId!);
    res.json(rank);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/v1/rating/weekly — Haftalik top
 */
router.get('/weekly', async (req: AuthRequest, res: Response) => {
  try {
    const leaders = await getWeeklyTop();
    res.json(leaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/v1/rating/creators — Yaratuvchilar reytingi
 */
router.get('/creators', async (req: AuthRequest, res: Response) => {
  try {
    const leaders = await getCreatorTop();
    res.json(leaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(500).json({ error: message });
  }
});


export default router;
