import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

interface VoteData {
  [key: string]: {
    upvotes: number;
    downvotes: number;
  };
}

export async function GET() {
  try {
    const votes = (await kv.get<VoteData>('player-votes')) || {};
    return NextResponse.json({ votes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { playerId, voteType } = await request.json();
    const votes: VoteData = (await kv.get<VoteData>('player-votes')) || {};
    const playerIdString = playerId.toString();
    
    if (!votes[playerIdString]) {
      votes[playerIdString] = { upvotes: 0, downvotes: 0 };
    }
    
    if (voteType === 'up') {
      votes[playerIdString].upvotes += 1;
    } else if (voteType === 'down') {
      votes[playerIdString].downvotes += 1;
    }
    
    await kv.set('player-votes', votes);
    return NextResponse.json({ votes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update votes' }, { status: 500 });
  }
}