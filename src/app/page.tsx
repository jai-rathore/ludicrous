'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import BattingOrderCard from '../components/BattingOrderCard';
import Link from 'next/link';
import InfoBanner from '../components/InfoBanner';

interface Player {
  id: number;
  name: string;
  position: number;
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: number;
}

interface BattingOrder {
  id: string;
  userId: string;
  userName?: string;
  userPhotoURL?: string | null;
  players: Player[];
  upvotes: string[];
  downvotes: string[];
  comments: Comment[];
  createdAt: number;
}

export default function Home() {
  const { user, loading } = useAuth();
  const [battingOrders, setBattingOrders] = useState<BattingOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [userHasSubmittedOrder, setUserHasSubmittedOrder] = useState(false);

  // Fetch all batting orders
  const fetchBattingOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await fetch(`/api/batting-orders?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${user?.uid || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load batting orders');
      }
      
      const data = await response.json();
      // Sort batting orders by net votes (upvotes - downvotes)
      const sortedOrders = (data.battingOrders || []).sort((a: BattingOrder, b: BattingOrder) => 
        (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length)
      );
      setBattingOrders(sortedOrders);
      
      // Check if current user has submitted an order
      if (user) {
        setUserHasSubmittedOrder(sortedOrders.some((order: BattingOrder) => order.userId === user.uid));
      }
    } catch (error) {
      console.error('Error fetching batting orders:', error);
      setError('Failed to load batting orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchBattingOrders();
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchBattingOrders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div>
      {userHasSubmittedOrder && user && (
        <InfoBanner />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Batting Orders</h1>
        
        {!userHasSubmittedOrder && user && (
          <Link 
            href="/create-order"
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Batting Order
          </Link>
        )}
        
        {!user && (
          <div className="text-sm text-black bg-blue-50 p-2 rounded">
            Sign in to create and vote on batting orders
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
          {error}
        </div>
      )}

      {loadingOrders ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : battingOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-lg text-black">No batting orders submitted yet.</p>
          {!userHasSubmittedOrder && user && (
            <p className="mt-2 text-blue-600">
              Be the first to create a batting order!
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {battingOrders.map((order) => (
            <BattingOrderCard
              key={order.id}
              {...order}
              onVoteChange={fetchBattingOrders}
            />
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center">
        <button 
          onClick={fetchBattingOrders}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={loadingOrders}
        >
          {loadingOrders ? 'Refreshing...' : 'Refresh batting orders'}
        </button>
      </div>
    </div>
  );
}
