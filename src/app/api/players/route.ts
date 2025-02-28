import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

type Player = {
  id: number;
  name: string;
};

// GET handler - retrieves all players
export async function GET() {
  let client;
  try {
    client = await getRedisClient();
    
    const playersStr = await client.get('players');
    const players: Player[] = playersStr ? JSON.parse(playersStr) : [
      // Default players if none exist in Redis
      { id: 1, name: "Rahul" },
      { id: 2, name: "Varun" },
      { id: 3, name: "Avinash" },
      { id: 4, name: "Vaibhav" },
      { id: 5, name: "Rohit" },
      { id: 6, name: "Purvesh" },
      { id: 7, name: "Prashant" },
      { id: 8, name: "Pragatheesh" },
      { id: 9, name: "Shubham" },
      { id: 10, name: "Akshay" },
      { id: 11, name: "Henil" }
    ];
    
    if (!playersStr) {
      // Initialize players in Redis if they don't exist
      await client.set('players', JSON.stringify(players));
    }
    
    return NextResponse.json({ players }, { status: 200 });
  } catch (error) {
    console.error('Failed to retrieve players:', error);
    return NextResponse.json({ error: 'Failed to retrieve players' }, { status: 500 });
  } finally {
    if (client) await client.quit();
  }
}

// PUT handler - updates the players list
export async function PUT(request: Request) {
  let client;
  try {
    const { players } = await request.json();
    
    if (!Array.isArray(players) || !players.every(p => p.id && p.name)) {
      return NextResponse.json({ error: 'Invalid players data' }, { status: 400 });
    }

    client = await getRedisClient();
    await client.set('players', JSON.stringify(players));
    
    return NextResponse.json({ success: true, players }, { status: 200 });
  } catch (error) {
    console.error('Failed to update players:', error);
    return NextResponse.json({ error: 'Failed to update players' }, { status: 500 });
  } finally {
    if (client) await client.quit();
  }
}