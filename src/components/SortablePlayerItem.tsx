'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortablePlayerItemProps {
  id: number;
  name: string;
  position: number;
}

export function SortablePlayerItem({ id, name, position }: SortablePlayerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-white border border-gray-200 rounded-md shadow-sm flex items-center justify-between cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center">
        <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full mr-3">
          {position}
        </span>
        <span className="font-medium text-black">{name}</span>
      </div>
      <div className="text-black">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </div>
    </div>
  );
}