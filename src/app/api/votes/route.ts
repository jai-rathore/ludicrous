import { createClient } from "redis";
import { NextResponse } from 'next/server';

interface VoteData {
  [key: string]: {
    upvotes: number;
    downvotes: number;
  };
}

// Create Redis client function with connection handling
async function getRedisClient() {
  try {
    if (!process.env.REDIS_URL) {
      console.error('REDIS_URL not found in environment variables');
      return null;
    }

    const client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 10000, // 10 seconds
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error(`Redis connection failed after ${retries} retries`);
            return false;
          }
          return Math.min(retries * 100, 3000); // Incremental backoff
        }
      }
    });

    client.on('error', (err) => console.error('Redis Client Error:', err));
    client.on('connect', () => console.log('Redis Client Connected'));

    if (!client.isOpen) {
      await client.connect();
    }

    return client;
  } catch (error) {
    console.error('Redis connection error:', error);
    return null;
  }
}

export async function GET() {
  return NextResponse.json({
    deprecated: true,
    message: "This API endpoint has been replaced by the new batting-orders endpoint",
    votes: {}
  }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({
    deprecated: true,
    message: "This API endpoint has been replaced by the new batting-orders endpoint",
    votes: {}
  }, { status: 200 });
}