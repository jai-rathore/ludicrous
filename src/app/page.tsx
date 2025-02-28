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
      <div className="bg-white border-b">
        <div className="py-8 mb-8">
          <div className="max-w-4xl">
            <h2 className="text-sm font-medium text-blue-600 mb-3">Saturday Morning Game vs CSK at Sigman BB, Fremont</h2>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
              Batting Order Submissions
            </h1>
            <p className="text-gray-600 text-lg mb-6">Vote and discuss on the proposed batting strategies for the match</p>
          </div>
          
          {!userHasSubmittedOrder && user && (
            <Link 
              href="/create-order"
              className="mt-4 inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your Batting Order
            </Link>
          )}
        </div>
      </div>

      {!user && (
        <InfoBanner variant="loggedOut" />
      )}

      {userHasSubmittedOrder && user && (
        <InfoBanner />
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6">
          <div className="flex">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {loadingOrders ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : battingOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-xl text-gray-700 font-medium mb-2">No batting orders yet</p>
          <p className="text-gray-500 mb-4">Be the first to share your strategy!</p>
          {!userHasSubmittedOrder && user && (
            <Link 
              href="/create-order"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Create a batting order
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {battingOrders.map((order) => (
            <BattingOrderCard
              key={order.id}
              {...order}
              onVoteChange={fetchBattingOrders}
            />
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <button 
          onClick={fetchBattingOrders}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          disabled={loadingOrders}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loadingOrders ? 'Refreshing...' : 'Refresh batting orders'}
        </button>
      </div>
    </div>
  );
}
