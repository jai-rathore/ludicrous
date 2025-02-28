'use server';
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

interface CommentUser {
  displayName: string | null;
  photoURL: string | null;
}

export async function POST(request: Request) {
  let client;
  try {
    const { battingOrderId, userId, text, user } = await request.json();

    if (!battingOrderId || !userId || !text?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    client = await getRedisClient();
    
    const battingOrdersStr = await client.get('battingOrders');
    let battingOrders = battingOrdersStr ? JSON.parse(battingOrdersStr) : [];
    
    const orderIndex = battingOrders.findIndex((order: any) => order.id === battingOrderId);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Batting order not found' }, { status: 404 });
    }

    // Add the new comment with user info
    const newComment = {
      id: crypto.randomUUID(),
      userId,
      text: text.trim(),
      createdAt: Date.now(),
      user: user as CommentUser
    };

    // Initialize comments array if it doesn't exist
    if (!battingOrders[orderIndex].comments) {
      battingOrders[orderIndex].comments = [];
    }

    battingOrders[orderIndex].comments.push(newComment);
    
    // Save updated batting orders
    await client.set('battingOrders', JSON.stringify(battingOrders));

    return NextResponse.json({ success: true, comment: newComment }, { status: 201 });
  } catch (error) {
    console.error('Failed to add comment:', error);
    return NextResponse.json({ 
      error: 'Failed to add comment',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    if (client) await client.quit();
  }
}