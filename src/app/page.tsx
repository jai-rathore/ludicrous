'use client';

import { useState, useEffect } from "react";

interface Player {
  id: number;
  name: string;
  upvotes: number;
  downvotes: number;
}

interface VoteData {
  [key: string]: {
    upvotes: number;
    downvotes: number;
  };
}

const PLAYERS: Player[] = [
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

export default function Home() {
  const [players, setPlayers] = useState<Player[]>(PLAYERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial votes
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch('/api/votes');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.votes) {
          updatePlayersWithVotes(data.votes);
        }
      } catch (error) {
        console.error('Failed to fetch votes:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch votes');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  const updatePlayersWithVotes = (votes: VoteData) => {
    setPlayers(players.map(player => ({
      ...player,
      upvotes: votes[player.id]?.upvotes || 0,
      downvotes: votes[player.id]?.downvotes || 0,
    })));
  };

  const handleVote = async (id: number, voteType: 'up' | 'down') => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: id, voteType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.votes) {
        updatePlayersWithVotes(data.votes);
      }
    } catch (error) {
      console.error('Failed to update vote:', error);
      setError(error instanceof Error ? error.message : 'Failed to update vote');
    }
  };

  // Sort players by net votes (upvotes - downvotes)
  const sortedPlayers = [...players].sort(
    (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Ludicrous Batting Order
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-100 text-gray-800">Current Batting Order</h2>
          <ul>
            {sortedPlayers.map((player, index) => (
              <li key={player.id} className="border-t border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-bold mr-3 text-gray-800 w-6">{index + 1}.</span>
                  <span className="text-gray-900 font-medium">{player.name}</span>
                  <span className="ml-4 text-gray-600 text-sm">
                    ({player.upvotes - player.downvotes} net votes)
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleVote(player.id, 'up')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    👍 {player.upvotes}
                  </button>
                  <button
                    onClick={() => handleVote(player.id, 'down')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    👎 {player.downvotes}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
