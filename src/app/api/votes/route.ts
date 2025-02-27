import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export interface Player {
  id: number;
  name: string;
  upvotes: number;
  downvotes: number;
}

const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: "Rahul", upvotes: 0, downvotes: 0 },
  { id: 2, name: "Varun", upvotes: 0, downvotes: 0 },
  { id: 3, name: "Avinash", upvotes: 0, downvotes: 0 },
  { id: 4, name: "Vaibhav", upvotes: 0, downvotes: 0 },
  { id: 5, name: "Rohit", upvotes: 0, downvotes: 0 },
  { id: 6, name: "Purvesh", upvotes: 0, downvotes: 0 },
  { id: 7, name: "Prashant", upvotes: 0, downvotes: 0 },
  { id: 8, name: "Pragatheesh", upvotes: 0, downvotes: 0 },
  { id: 9, name: "Shubham", upvotes: 0, downvotes: 0 },
  { id: 10, name: "Akshay", upvotes: 0, downvotes: 0 },
  { id: 11, name: "Henil", upvotes: 0, downvotes: 0 },
];

// GET handler to retrieve players with votes
export async function GET() {
  try {
    // Try to get players from Vercel KV
    let players = await kv.get<Player[]>('players');
    
    // If there are no players in KV yet, use the default and set them
    if (!players) {
      await kv.set('players', DEFAULT_PLAYERS);
      players = DEFAULT_PLAYERS;
    }
    
    return NextResponse.json({ players }, { status: 200 });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

// POST handler for voting
export async function POST(request: Request) {
  try {
    const { playerId, voteType } = await request.json();
    
    // Get current players
    let players = await kv.get<Player[]>('players') || DEFAULT_PLAYERS;
    
    // Update the vote count based on vote type
    const updatedPlayers = players.map(player => {
      if (player.id === playerId) {
        if (voteType === 'upvote') {
          return { ...player, upvotes: player.upvotes + 1 };
        } else if (voteType === 'downvote') {
          return { ...player, downvotes: player.downvotes + 1 };
        }
      }
      return player;
    });
    
    // Save back to KV
    await kv.set('players', updatedPlayers);
    
    return NextResponse.json({ players: updatedPlayers }, { status: 200 });
  } catch (error) {
    console.error('Error updating votes:', error);
    return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
  }
}

// PUT handler to reset votes
export async function PUT() {
  try {
    // Reset to default players
    await kv.set('players', DEFAULT_PLAYERS);
    
    return NextResponse.json({ players: DEFAULT_PLAYERS }, { status: 200 });
  } catch (error) {
    console.error('Error resetting votes:', error);
    return NextResponse.json({ error: 'Failed to reset votes' }, { status: 500 });
  }
}