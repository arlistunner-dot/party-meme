import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (err) => {
  console.error('[Redis] Xato:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Ulandi');
});

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

export async function getRedis(key: string): Promise<string | null> {
  return redis.get(key);
}

export async function setRedis(key: string, value: string, ttl?: number): Promise<void> {
  if (ttl) {
    await redis.setEx(key, ttl, value);
  } else {
    await redis.set(key, value);
  }
}

export async function delRedis(key: string): Promise<void> {
  await redis.del(key);
}

export async function incrRedis(key: string): Promise<number> {
  return redis.incr(key);
}

export async function expireRedis(key: string, seconds: number): Promise<void> {
  await redis.expire(key, seconds);
}

export default redis;
