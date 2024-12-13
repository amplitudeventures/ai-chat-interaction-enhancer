'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AIEntityStatus } from '@/lib/data/ai-entities';

interface AssistantItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  status: AIEntityStatus;
  statusMessage?: string;
}

export function DraggableAssistant(props: AssistantItem) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
    data: props
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-3 mb-2 rounded hover:bg-[#2a3a3a] bg-[#1e2a2a] transition-colors"
    >
      <span className="text-xl">{props.icon}</span>
      <span className="text-sm text-white">{props.name}</span>
    </div>
  );
} 