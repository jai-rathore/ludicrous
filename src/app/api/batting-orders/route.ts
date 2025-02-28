import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

// Type definitions
type Player = {
  id: number;
  name: string;
  position: number;
};

type Comment = {
  id: string;
  userId: string;
  text: string;
  createdAt: number;
};

type BattingOrder = {
  id: string;
  userId: string;
  userName?: string;
  userPhotoURL?: string | null;
  players: Player[];
  upvotes: string[];
  downvotes: string[];
  comments: Comment[];
  createdAt: number;
};

// GET handler - retrieves all batting orders
export async function GET(request: Request) {
  let client;
  try {
    const authToken = request.headers.get('authorization');
    const currentUserId = authToken?.split(' ')[1]; // Simple auth header parsing
    
    client = await getRedisClient();
    
    const battingOrdersStr = await client.get('battingOrders');
    let battingOrders: BattingOrder[] = battingOrdersStr ? JSON.parse(battingOrdersStr) : [];
    
    // Keep user info only for the owner's list, remove for others
    const sanitizedOrders = battingOrders.map(order => {
      if (order.userId === currentUserId) {
        return order;
      }
      const { userName, userPhotoURL, ...sanitizedOrder } = order;
      return sanitizedOrder;
    });
    
    sanitizedOrders.sort((a, b) => 
      (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length)
    );
    
    return NextResponse.json({ battingOrders: sanitizedOrders }, { status: 200 });
  } catch (error) {
    console.error('Failed to retrieve batting orders:', error);
    return NextResponse.json({ error: 'Failed to retrieve batting orders' }, { status: 500 });
  } finally {
    if (client) await client.quit();
  }
}

// POST handler - creates a new batting order
export async function POST(request: Request) {
  let client;
  try {
    const data = await request.json();
    const { userId, players } = data;

    if (!userId || !players || !players.length) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    client = await getRedisClient();

    // Get existing batting orders or initialize empty array
    const battingOrdersStr = await client.get('battingOrders');
    let battingOrders: BattingOrder[] = battingOrdersStr ? JSON.parse(battingOrdersStr) : [];

    // Check if the user already has a submitted batting order
    const userOrderIndex = battingOrders.findIndex(order => order.userId === userId);
    
    const newBattingOrder: BattingOrder = {
      id: userOrderIndex > -1 ? battingOrders[userOrderIndex].id : crypto.randomUUID(),
      userId,
      players,
      upvotes: userOrderIndex > -1 ? battingOrders[userOrderIndex].upvotes : [],
      downvotes: userOrderIndex > -1 ? battingOrders[userOrderIndex].downvotes : [],
      comments: userOrderIndex > -1 ? battingOrders[userOrderIndex].comments : [],
      createdAt: userOrderIndex > -1 ? battingOrders[userOrderIndex].createdAt : Date.now()
    };

    // If user already has an order, update it; otherwise add a new one
    if (userOrderIndex > -1) {
      battingOrders[userOrderIndex] = newBattingOrder;
    } else {
      battingOrders.push(newBattingOrder);
    }

    // Save to Redis
    await client.set('battingOrders', JSON.stringify(battingOrders));

    // Remove user information from the response
    const { userName, userPhotoURL, ...sanitizedOrder } = newBattingOrder;
    return NextResponse.json({ success: true, battingOrder: sanitizedOrder }, { status: 201 });
  } catch (error) {
    console.error('Failed to create batting order:', error);
    return NextResponse.json({ error: 'Failed to create batting order' }, { status: 500 });
  } finally {
    if (client) await client.quit();
  }
}