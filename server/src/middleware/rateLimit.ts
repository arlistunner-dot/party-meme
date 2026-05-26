import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 daqiqa
  max: 100,
  message: { error: 'Juda ko\'p so\'rov. Biroz kuting.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Juda ko\'p urinish. Biroz kuting.' },
});

export const createCardLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 soat
  max: 10,
  message: { error: 'Soatiga 10 tadan ko\'p karta yarata olmaysiz.' },
});
