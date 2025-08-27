'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

import { Activity, DragDropResult } from '@/types';
import { SortableActivityCard } from './SortableActivityCard';
import { ActivityCard } from './ActivityCard';
import { useTravelDocumentStore } from '@/stores/travelDocumentStore';

interface SortableActivityListProps {
  activities: Activity[];
  dayNumber: number;
}

export const SortableActivityList: React.FC<SortableActivityListProps> = ({
  activities,
  dayNumber
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const { moveActivity } = useTravelDocumentStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = activities.findIndex(activity => activity.id === active.id);
    const newIndex = activities.findIndex(activity => activity.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Create drag drop result for the store
      const dragDropResult: DragDropResult = {
        draggedId: active.id as string,
        sourceDay: dayNumber - 1, // Convert to 0-based index
        sourceIndex: oldIndex,
        destinationDay: dayNumber - 1, // Same day for now
        destinationIndex: newIndex,
      };

      moveActivity(dragDropResult);
    }
  };

  const activeActivity = activeId ? activities.find(activity => activity.id === activeId) : null;

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          暂无活动安排
        </h3>
        <p className="text-gray-600 mb-4">
          这一天还没有安排任何活动，点击下方按钮添加活动。
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext 
        items={activities.map(activity => activity.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <SortableActivityCard
              key={activity.id}
              activity={activity}
              isFirst={index === 0}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeActivity ? (
          <div className="transform rotate-3 shadow-2xl">
            <ActivityCard
              activity={activeActivity}
              isFirst={false}
              isLast={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default SortableActivityList;
