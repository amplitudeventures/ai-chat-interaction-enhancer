'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { AssistantItem } from '../types/assistants';

interface DndProviderProps {
  children: React.ReactNode;
  onAssistantDrop: (assistant: AssistantItem) => void;
}

export function DndProvider({ children, onAssistantDrop }: DndProviderProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.active && event.over) {
      const assistant = event.active.data.current as AssistantItem;
      onAssistantDrop(assistant);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
} 