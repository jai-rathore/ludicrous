import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST() {
  let client;
  try {
    client = await getRedisClient();
    
    // Clear old data structure
    await client.del('votes');
    
    // Initialize empty batting orders array
    await client.set('battingOrders', JSON.stringify([]));

    return NextResponse.json({ 
      success: true, 
      message: 'Database reset successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to reset database:', error);
    return NextResponse.json({ 
      error: 'Failed to reset database',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    if (client) await client.quit();
  }
}