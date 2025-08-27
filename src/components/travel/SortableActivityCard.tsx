'use client';

import React from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Activity } from '@/types';
import { ActivityCard } from './ActivityCard';

interface SortableActivityCardProps {
  activity: Activity;
  isFirst: boolean;
  isLast: boolean;
}

export const SortableActivityCard: React.FC<SortableActivityCardProps> = ({
  activity,
  isFirst,
  isLast
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isSortableDragging ? 'z-50' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white rounded-lg shadow-md p-2 border"
        title="拖拽重新排序"
      >
        <svg 
          className="w-4 h-4 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 8h16M4 16h16" 
          />
        </svg>
      </div>

      {/* Activity Card */}
      <div className={`transition-all duration-200 ${isSortableDragging ? 'shadow-2xl scale-105' : ''}`}>
        <ActivityCard
          activity={activity}
          isFirst={isFirst}
          isLast={isLast}
        />
      </div>
    </div>
  );
};

export default SortableActivityCard;
