import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getUser, getUserStats, claimDailyBonus, updateUser } from '../services/user.service.js';
import { claimAdReward } from '../services/economy.service.js';

const router = Router();

// Barcha route lar uchun auth kerak
router.use(authMiddleware);

/**
 * GET /api/v1/me
 */
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUser(req.userId!);
    if (!user) return res.status(404).json({ error: 'Topilmadi' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * GET /api/v1/me/stats
 */
router.get('/me/stats', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getUserStats(req.userId!);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * POST /api/v1/me/daily-bonus
 */
router.post('/me/daily-bonus', async (req: AuthRequest, res: Response) => {
  try {
    const result = await claimDailyBonus(req.userId!);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/v1/ads/reward
 */
router.post('/ads/reward', async (req: AuthRequest, res: Response) => {
  try {
    const result = await claimAdReward(req.userId!);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});

export default router;

router.post('/me/daily-bonus', async (req: AuthRequest, res: Response) => {
  try {
    const result = await claimDailyBonus(req.userId!);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});


/**
 * PATCH /api/v1/me — Profilni yangilash
 */
router.patch('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await updateUser(req.userId!, req.body);
    res.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});
