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
  try {
    const redis = await getRedisClient();
    if (!redis) {
      console.error('Failed to create Redis client');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const votes = await redis.get('player-votes');
    await redis.quit(); // Properly close the connection
    return NextResponse.json({ votes: votes ? JSON.parse(votes) : {} });
  } catch (error) {
    console.error('Redis GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      console.error('Failed to create Redis client');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { playerId, voteType } = await request.json();
    const playerIdString = playerId.toString();
    
    // Get current votes
    const currentVotesStr = await redis.get('player-votes');
    const votes: VoteData = currentVotesStr ? JSON.parse(currentVotesStr) : {};
    
    // Initialize player votes if not exists
    if (!votes[playerIdString]) {
      votes[playerIdString] = { upvotes: 0, downvotes: 0 };
    }
    
    // Update votes
    if (voteType === 'up') {
      votes[playerIdString].upvotes += 1;
    } else if (voteType === 'down') {
      votes[playerIdString].downvotes += 1;
    }
    
    // Save updated votes with a timeout
    await Promise.race([
      redis.set('player-votes', JSON.stringify(votes)),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis set operation timed out')), 5000)
      )
    ]);

    await redis.quit(); // Properly close the connection
    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Redis POST error:', error);
    return NextResponse.json({ error: 'Failed to update votes' }, { status: 500 });
  }
}