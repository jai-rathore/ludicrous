'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortablePlayerItem from './SortablePlayerItem';

interface Player {
  id: number;
  name: string;
  position: number;
}

export default function CreateBattingOrder({ editId }: { editId?: string }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();

  // Configure sensors for better touch handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay for touch devices
        tolerance: 5, // 5px tolerance for movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // First fetch players
        const playersResponse = await fetch('/api/players');
        if (!playersResponse.ok) {
          throw new Error('Failed to load players');
        }
        const playersData = await playersResponse.json();

        if (editId && user) {
          // If in edit mode, fetch existing order
          const orderResponse = await fetch('/api/batting-orders');
          if (!orderResponse.ok) {
            throw new Error('Failed to load batting order');
          }
          const data = await orderResponse.json();
          const existingOrder = data.battingOrders.find(
            (order: any) => order.id === editId && order.userId === user.uid
          );

          if (!existingOrder) {
            throw new Error('Batting order not found or unauthorized');
          }

          // Map existing players maintaining order but using current player names
          const orderedPlayers = existingOrder.players
            .sort((a: Player, b: Player) => a.position - b.position)
            .map((p: Player) => {
              const currentPlayer = playersData.players.find((cp: Player) => cp.id === p.id);
              return currentPlayer || p;
            });

          setPlayers(orderedPlayers);
        } else {
          // If not editing, just use the fetched players
          setPlayers(playersData.players);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
        if (editId) {
          router.push('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [editId, user, router]);

  function handleDragStart(event: DragStartEvent) {
    setIsDragging(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    setIsDragging(false);
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setPlayers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to submit a batting order");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/batting-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          userPhotoURL: user.photoURL,
          players: players.map((player, index) => ({
            id: player.id,
            name: player.name,
            position: index + 1,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      router.push('/');
    } catch (error) {
      console.error('Failed to submit batting order:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit batting order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mt-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        {editId ? 'Edit Your Batting Order' : 'Create Your Batting Order'}
      </h2>

      <p className="mb-4 text-black text-center">
        Drag and reorder the players to {editId ? 'update' : 'create'} your ideal batting order.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={players.map(player => player.id)} strategy={verticalListSortingStrategy}>
            <div className={`space-y-2 ${isDragging ? 'cursor-grabbing' : ''}`}>
              {players.map((player, index) => (
                <SortablePlayerItem
                  key={player.id}
                  id={player.id}
                  name={player.name}
                  position={index + 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : editId ? 'Update Order' : 'Submit Order'}
        </button>
      </div>
    </div>
  );
}