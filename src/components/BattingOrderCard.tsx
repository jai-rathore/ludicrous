'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';

interface Player {
  id: number;
  name: string;
  position: number;
}

interface CommentUser {
  displayName: string | null;
  photoURL: string | null;
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: number;
  user?: CommentUser;
}

interface BattingOrderProps {
  id: string;
  userId: string;
  userName?: string;
  userPhotoURL?: string | null;
  players: Player[];
  upvotes: string[];
  downvotes: string[];
  comments: Comment[];
  createdAt: number;
  onVoteChange: () => void;
}

export default function BattingOrderCard({
  id,
  userId,
  userName,
  userPhotoURL,
  players,
  upvotes,
  downvotes,
  comments = [],
  createdAt,
  onVoteChange
}: BattingOrderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const hasUpvoted = user ? upvotes.includes(user.uid) : false;
  const hasDownvoted = user ? downvotes.includes(user.uid) : false;
  const isUserOwner = user?.uid === userId;
  const netVotes = upvotes.length - downvotes.length;
  
  const sortedPlayers = [...players].sort((a, b) => a.position - b.position);

  const handleEdit = () => {
    router.push(`/create-order?edit=${id}`);
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      setError('You must be signed in to vote');
      return;
    }
    
    if (isUserOwner) {
      setError('You cannot vote on your own batting order');
      return;
    }
    
    try {
      setIsVoting(true);
      setError(null);
      
      const response = await fetch('/api/batting-orders/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          battingOrderId: id,
          voteType,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to vote');
      }
      
      onVoteChange();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to vote');
      console.error('Voting error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be signed in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    setIsSubmittingComment(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const response = await fetch('/api/batting-orders/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          battingOrderId: id,
          text: newComment,
          user: {
            displayName: auth.currentUser?.displayName,
            photoURL: auth.currentUser?.photoURL
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      setNewComment('');
      onVoteChange(); // Refresh the list to show new comment
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-2 bg-gray-50 flex items-center justify-between border-b">
        {isUserOwner ? (
          <div className="flex items-center gap-2">
            {userPhotoURL && (
              <img
                src={userPhotoURL}
                alt={userName || "Your"}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm font-medium text-black">{userName || 'Your List'}</span>
          </div>
        ) : (
          <span className="text-sm font-medium text-black">#{id.slice(0, 6)}</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black">{netVotes > 0 ? '+' : ''}{netVotes}</span>
          {!isUserOwner && user && (
            <div className="flex gap-1">
              <button
                onClick={() => handleVote('up')}
                disabled={isVoting}
                className={`p-1 rounded-full ${
                  hasUpvoted 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
                aria-label="Upvote"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <button
                onClick={() => handleVote('down')}
                disabled={isVoting}
                className={`p-1 rounded-full ${
                  hasDownvoted 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
                aria-label="Downvote"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="px-2 py-1 bg-red-50 text-red-700 text-xs border-b border-red-100">
          {error}
        </div>
      )}
      
      <div className="p-2 space-y-1">
        {sortedPlayers.map((player) => (
          <div key={player.id} className="flex items-center gap-2 text-sm">
            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs">
              {player.position}
            </span>
            <span className="text-black">{player.name}</span>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="p-2 space-y-2">
          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm border-l-2 border-blue-200 pl-2">
                  <p className="text-black">{comment.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {comment.user?.photoURL && (
                      <img 
                        src={comment.user.photoURL} 
                        alt={comment.user.displayName || 'User'} 
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <p className="text-xs text-black">
                      {comment.user?.displayName || 'Anonymous'} • {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {user && (
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-sm border rounded px-2 py-1 text-black placeholder:text-black/70"
                disabled={isSubmittingComment}
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmittingComment ? '...' : 'Post'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="px-2 py-1 bg-gray-50 border-t flex justify-end items-center">
        {isUserOwner && (
          <button
            onClick={handleEdit}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}