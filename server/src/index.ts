import path from 'path';
import { fileURLToPath } from 'url';
import { startBot } from './bot.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import dotenv from 'dotenv';
import { SERVER } from './config/constants.js';
import { connectRedis } from './config/redis.js';
import { initSocket } from './socket/index.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import roomRoutes from './routes/room.routes.js';
import shopRoutes from './routes/shop.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import cardRoutes from './routes/card.routes.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const httpServer = http.createServer(app);

// ============ MIDDLEWARE ============
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(generalLimiter);

// ============ ROUTES ============
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/shop', shopRoutes);
app.use('/api/v1/rating', ratingRoutes);
app.use('/api/v1/cards', cardRoutes);

// ============ FRONTEND ============
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../../dist')));


// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Xatolarni ushlash
app.use(errorHandler);

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// ============ START ============
async function start() {
  try {
    // Redis
    await connectRedis();
    console.log('[Redis] Tayyor');

    // Socket.io
    initSocket(httpServer);
    console.log('[Socket] Tayyor');

    // Server
    startBot();
    httpServer.listen(SERVER.PORT, () => {
      console.log(`\n🎉 Party Meme Server`);
      console.log(`   Port: ${SERVER.PORT}`);
      console.log(`   URL: http://localhost:${SERVER.PORT}`);
      console.log(`   Health: http://localhost:${SERVER.PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('[Server] Ishga tushishda xato:', err);
    process.exit(1);
  }
}

start();
