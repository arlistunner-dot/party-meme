import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT } from '../config/constants.js';
import { queryOne } from '../config/database.js';

export interface AuthRequest extends Request {
  userId?: number;
  telegramId?: number;
}

/**
 * JWT token tekshirish
 */
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token topilmadi' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT.SECRET) as { userId: number; telegramId: number };

    // Foydalanuvchi mavjudligini tekshirish
    const user = await queryOne<{ id: number; is_banned: boolean }>(
      'SELECT id, is_banned FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'Akkaunt bloklangan' });
    }

    req.userId = decoded.userId;
    req.telegramId = decoded.telegramId;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token muddati tugagan' });
    }
    return res.status(401).json({ error: 'Noto\'g\'ri token' });
  }
}
