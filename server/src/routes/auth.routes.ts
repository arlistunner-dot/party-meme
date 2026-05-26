import { Router, Request, Response } from 'express';
import { authenticateTelegram } from '../services/auth.service.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

/**
 * POST /api/v1/auth/telegram
 * Telegram initData bilan autentifikatsiya
 */
router.post('/telegram', authLimiter, async (req: Request, res: Response) => {
  try {
    const { initdata } = req.body;

    if (!initdata) {
      return res.status(400).json({ error: 'initdata kiritilmagan' });
    }

    const result = await authenticateTelegram(initdata);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Autentifikatsiya xatosi';
    res.status(401).json({ error: message });
  }
});

export default router;
