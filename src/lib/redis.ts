import { createClient } from 'redis';

// Create Redis client function with connection handling
export async function getRedisClient() {
  try {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL not found in environment variables');
    }

    const client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    client.on('error', (err) => console.error('Redis Client Error:', err));

    if (!client.isOpen) {
      await client.connect();
    }

    return client;
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
}