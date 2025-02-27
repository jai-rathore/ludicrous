'use client';

import { useState, useEffect } from "react";

interface Player {
  id: number;
  name: string;
  upvotes: number;
  downvotes: number;
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch players data from API
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/votes');
      const data = await response.json();
      setPlayers(data.players);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load players on component mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleUpvote = async (id: number) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: id, voteType: 'upvote' }),
      });
      
      const data = await response.json();
      setPlayers(data.players);
    } catch (error) {
      console.error('Error upvoting:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownvote = async (id: number) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: id, voteType: 'downvote' }),
      });
      
      const data = await response.json();
      setPlayers(data.players);
    } catch (error) {
      console.error('Error downvoting:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all votes?')) {
      try {
        setUpdating(true);
        const response = await fetch('/api/votes', {
          method: 'PUT',
        });
        
        const data = await response.json();
        setPlayers(data.players);
      } catch (error) {
        console.error('Error resetting votes:', error);
      } finally {
        setUpdating(false);
      }
    }
  };

  // Sort players by net votes (upvotes - downvotes)
  const sortedPlayers = [...players].sort(
    (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Ludicrous Batting Order
        </h1>

        <div className="mb-4 flex justify-end">
          <button
            onClick={handleReset}
            disabled={updating || loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            Reset All Votes
          </button>
        </div>

        {/* Display batting order */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-100 text-gray-800">
            Current Batting Order
          </h2>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading players...</div>
          ) : (
            <ul>
              {sortedPlayers.map((player, index) => (
                <li key={player.id} className="border-t border-gray-200 p-4 flex items-center justify-between"></li>
                  <div className="flex items-center">
                    <span className="font-bold mr-3 text-gray-800 w-6">{index + 1}.</span>
                    <span className="text-gray-900 font-medium">{player.name}</span>
                    <span className="ml-4 text-gray-600 text-sm">
                      ({player.upvotes - player.downvotes} net votes)
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpvote(player.id)}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
                    ></button>
                      👍 {player.upvotes}
                    </button>
                    <button
                      onClick={() => handleDownvote(player.id)}
                      disabled={updating}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      👎 {player.downvotes}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
