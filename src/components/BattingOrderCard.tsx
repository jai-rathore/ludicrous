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
      <div className="p-4 bg-gray-50 flex items-center justify-between border-b">
        {isUserOwner ? (
          <div className="flex items-center gap-2">
            {userPhotoURL && (
              <img
                src={userPhotoURL}
                alt={userName || "Your"}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-base font-medium text-black">{userName || 'Your List'}</span>
          </div>
        ) : (
          <span className="text-base font-medium text-black">#{id.slice(0, 6)}</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-black">{netVotes > 0 ? '+' : ''}{netVotes}</span>
          {!isUserOwner && user && (
            <div className="flex gap-1">
              <button
                onClick={() => handleVote('up')}
                disabled={isVoting}
                className={`p-2 rounded-full ${
                  hasUpvoted 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
                aria-label="Upvote"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <button
                onClick={() => handleVote('down')}
                disabled={isVoting}
                className={`p-2 rounded-full ${
                  hasDownvoted 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
                aria-label="Downvote"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm border-b border-red-100">
          {error}
        </div>
      )}
      
      <div className="p-4 space-y-2">
        {sortedPlayers.map((player) => (
          <div key={player.id} className="flex items-center gap-3 text-base">
            <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-medium">
              {player.position}
            </span>
            <span className="text-black">{player.name}</span>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="p-4 space-y-3">
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="text-base border-l-2 border-blue-200 pl-3">
                  <p className="text-black">{comment.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {comment.user?.photoURL && (
                      <img 
                        src={comment.user.photoURL} 
                        alt={comment.user.displayName || 'User'} 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <p className="text-sm text-gray-600">
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
                className="flex-1 text-base border rounded-lg px-3 py-2 text-black placeholder:text-gray-500"
                disabled={isSubmittingComment}
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-base rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-medium"
              >
                {isSubmittingComment ? '...' : 'Post'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t flex justify-end items-center">
        {isUserOwner && (
          <button
            onClick={handleEdit}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}