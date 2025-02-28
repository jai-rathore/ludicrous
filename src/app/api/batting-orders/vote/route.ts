import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

// Type definitions
type Player = {
  id: number;
  name: string;
  position: number;
};

type BattingOrder = {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  players: Player[];
  upvotes: string[];
  downvotes: string[];
  createdAt: number;
};

export async function POST(request: Request) {
  let client;
  try {
    const data = await request.json();
    const { userId, battingOrderId, voteType } = data;

    if (!userId || !battingOrderId || !voteType || (voteType !== 'up' && voteType !== 'down')) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    client = await getRedisClient();

    // Get all batting orders
    const battingOrdersStr = await client.get('battingOrders');
    if (!battingOrdersStr) {
      return NextResponse.json({ error: 'No batting orders found' }, { status: 404 });
    }

    let battingOrders: BattingOrder[] = JSON.parse(battingOrdersStr);
    
    // Find the target batting order
    const orderIndex = battingOrders.findIndex(order => order.id === battingOrderId);
    
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Batting order not found' }, { status: 404 });
    }

    // Check if user is voting on their own order
    if (battingOrders[orderIndex].userId === userId) {
      return NextResponse.json({ error: 'You cannot vote on your own batting order' }, { status: 403 });
    }

    const targetOrder = battingOrders[orderIndex];
    
    // Handle voting logic with the 1 upvote and 1 downvote per user limitation
    if (voteType === 'up') {
      // Check if user has already upvoted any other order
      const hasUpvotedOther = battingOrders.some(
        (order) => order.id !== battingOrderId && order.upvotes.includes(userId)
      );
      
      if (hasUpvotedOther) {
        // Remove the existing upvote from other order
        battingOrders = battingOrders.map(order => {
          if (order.id !== battingOrderId && order.upvotes.includes(userId)) {
            return {
              ...order,
              upvotes: order.upvotes.filter(id => id !== userId)
            };
          }
          return order;
        });
      }

      // Toggle upvote on target order
      const alreadyUpvoted = targetOrder.upvotes.includes(userId);
      
      if (alreadyUpvoted) {
        // Remove upvote if it exists
        targetOrder.upvotes = targetOrder.upvotes.filter(id => id !== userId);
      } else {
        // Add upvote and remove downvote if it exists
        targetOrder.upvotes.push(userId);
        targetOrder.downvotes = targetOrder.downvotes.filter(id => id !== userId);
      }
    } else if (voteType === 'down') {
      // Check if user has already downvoted any other order
      const hasDownvotedOther = battingOrders.some(
        (order) => order.id !== battingOrderId && order.downvotes.includes(userId)
      );
      
      if (hasDownvotedOther) {
        // Remove the existing downvote from other order
        battingOrders = battingOrders.map(order => {
          if (order.id !== battingOrderId && order.downvotes.includes(userId)) {
            return {
              ...order,
              downvotes: order.downvotes.filter(id => id !== userId)
            };
          }
          return order;
        });
      }

      // Toggle downvote on target order
      const alreadyDownvoted = targetOrder.downvotes.includes(userId);
      
      if (alreadyDownvoted) {
        // Remove downvote if it exists
        targetOrder.downvotes = targetOrder.downvotes.filter(id => id !== userId);
      } else {
        // Add downvote and remove upvote if it exists
        targetOrder.downvotes.push(userId);
        targetOrder.upvotes = targetOrder.upvotes.filter(id => id !== userId);
      }
    }

    // Update the order in the array
    battingOrders[orderIndex] = targetOrder;
    
    // Save updated orders to Redis
    await client.set('battingOrders', JSON.stringify(battingOrders));

    return NextResponse.json({ 
      success: true, 
      battingOrder: targetOrder 
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to process vote:', error);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  } finally {
    if (client) await client.quit();
  }
}