'use client';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  id: number;
  name: string;
  position: number;
}

export default function SortablePlayerItem({ id, name, position }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none', // Prevents touch scrolling while dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group p-3 bg-white border border-gray-200 rounded-md shadow-sm flex items-center justify-between relative ${
        isDragging ? 'shadow-lg border-blue-300 z-50' : ''
      }`}
    >
      <div className="flex items-center flex-1 min-w-0">
        <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full mr-3 shrink-0">
          {position}
        </span>
        <span className="font-medium text-black truncate">{name}</span>
      </div>
      
      {/* Touch-friendly drag handle */}
      <div
        {...listeners}
        className="ml-2 p-2 -m-2 rounded-md cursor-grab active:cursor-grabbing touch-none hover:bg-gray-100 transition-colors"
        aria-label="Drag handle"
        role="button"
        tabIndex={0}
      >
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
        </svg>
        <span className="sr-only">Drag to reorder</span>
      </div>
    </div>
  );
}