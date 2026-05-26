import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { createRoom, getRoom, joinRoom, leaveRoom, setPlayerReady } from '../services/room.service.js';

const router = Router();
router.use(authMiddleware);

/**
 * POST /api/v1/rooms — Xona yaratish
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const room = await createRoom(req.userId!, req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: 'Xona yaratishda xato' });
  }
});

/**
 * GET /api/v1/rooms/:code — Xona ma'lumotlari
 */
router.get('/:code', async (req: AuthRequest, res: Response) => {
  try {
    const room = await getRoom(req.params.code);
    if (!room) return res.status(404).json({ error: 'Xona topilmadi' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * POST /api/v1/rooms/:code/join — Qo'shilish
 */
router.post('/:code/join', async (req: AuthRequest, res: Response) => {
  try {
    const room = await joinRoom(req.params.code, req.userId!);
    res.json(room);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Xato';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/v1/rooms/:code/leave — Chiqish
 */
router.post('/:code/leave', async (req: AuthRequest, res: Response) => {
  try {
    await leaveRoom(req.params.code, req.userId!);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

/**
 * POST /api/v1/rooms/:code/ready — Tayyor
 */
router.post('/:code/ready', async (req: AuthRequest, res: Response) => {
  try {
    const room = await setPlayerReady(req.params.code, req.userId!, req.body.ready);
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
