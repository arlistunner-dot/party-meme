import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redis: ReturnType<typeof createClient> | null = null;
let redisAvailable = false;

function createRedisClient() {
  const url = process.env.REDIS_URL;
  if (!url || !url.startsWith('redis://')) {
    console.log('[Redis] REDIS_URL topilmadi — Redis o\'tkazib yuborildi');
    return null;
  }

  const client = createClient({ url });

  client.on('error', (err) => {
    console.error('[Redis] Xato:', err.message);
    redisAvailable = false;
  });

  client.on('connect', () => {
    console.log('[Redis] Ulandi');
    redisAvailable = true;
  });

  return client;
}

export async function connectRedis() {
  redis = createRedisClient();
  if (!redis) return null;

  try {
    await redis.connect();
    return redis;
  } catch (err) {
    console.error('[Redis] Ulanib bo\'lmadi — Redis o\'tkazib yuborildi');
    redis = null;
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return redisAvailable && redis !== null;
}

export async function getRedis(key: string): Promise<string | null> {
  if (!redis || !redisAvailable) return null;
  try { return await redis.get(key); } catch { return null; }
}

export async function setRedis(key: string, value: string, ttl?: number): Promise<void> {
  if (!redis || !redisAvailable) return;
  try {
    if (ttl) { await redis.setEx(key, ttl, value); }
    else { await redis.set(key, value); }
  } catch {}
}

export async function delRedis(key: string): Promise<void> {
  if (!redis || !redisAvailable) return;
  try { await redis.del(key); } catch {}
}

export async function incrRedis(key: string): Promise<number> {
  if (!redis || !redisAvailable) return 0;
  try { return await redis.incr(key); } catch { return 0; }
}

export async function expireRedis(key: string, seconds: number): Promise<void> {
  if (!redis || !redisAvailable) return;
  try { await redis.expire(key, seconds); } catch {}
}

export default redis;
