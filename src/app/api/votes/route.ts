import { createClient } from "redis";
import { NextResponse } from 'next/server';

interface VoteData {
  [key: string]: {
    upvotes: number;
    downvotes: number;
  };
}

// Create Redis client
let redis: ReturnType<typeof createClient>;

// Initialize Redis client
try {
  redis = createClient({
    url: process.env.REDIS_URL
  });

  // Connect to Redis
  await redis.connect();
} catch (error) {
  console.error('Redis connection error:', error);
}

export async function GET() {
  if (!redis?.isOpen) {
    return NextResponse.json({ error: 'Redis client not connected' }, { status: 500 });
  }

  try {
    const votes = await redis.get('player-votes');
    return NextResponse.json({ votes: votes ? JSON.parse(votes) : {} });
  } catch (error) {
    console.error('Redis GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!redis?.isOpen) {
    return NextResponse.json({ error: 'Redis client not connected' }, { status: 500 });
  }

  try {
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
    
    // Save updated votes
    await redis.set('player-votes', JSON.stringify(votes));
    
    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Redis POST error:', error);
    return NextResponse.json({ error: 'Failed to update votes' }, { status: 500 });
  }
}