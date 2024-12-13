'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AIEntityStatus } from '@/lib/data/ai-entities';
import { Tooltip } from './Tooltip';
import { GripVertical } from 'lucide-react';

interface DraggableAssistantProps {
  id: string;
  icon: string;
  name: string;
  description: string;
  status?: AIEntityStatus;
  statusMessage?: string;
  type: 'assistant' | 'agent';
}

export function DraggableAssistant(props: DraggableAssistantProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: props.id,
    data: {
      type: props.type,
      icon: props.icon,
      name: props.name,
      description: props.description,
      status: props.status,
      statusMessage: props.statusMessage
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative
        flex items-center gap-2 p-3 rounded-lg
        border-2 border-dashed border-gray-700
        hover:border-gray-500 transition-all duration-200
        ${props.type === 'agent' ? 'bg-blue-500/5' : 'bg-green-500/5'}
        ${isDragging ? 'opacity-50 shadow-lg z-50' : 'opacity-100'}
        cursor-grab active:cursor-grabbing
        group w-full h-[80px] my-2 
      `}
    >
      <div className="text-gray-500 group-hover:text-gray-400 transition-colors ">
        <GripVertical size={20} />
      </div>
      {/* <span className="text-2xl">{props.icon}</span> */}
      <div className="flex-1">
        <div className="text-white font-medium">{props.name}</div>
        {/* <div className="text-xs text-gray-400">
          {props.type === 'agent' ? '🤖 Agent' : '👥 Assistant'}
        </div> */}
      </div>
      {props.status && (
        <div className="relative">
          <Tooltip content={props.status.toLowerCase()}>
            <div className={`
              w-2.5 h-2.5 rounded-full
              ${getStatusColor(props.status)}
              cursor-help
              transition-transform duration-200
              hover:scale-125
            `} />
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: AIEntityStatus) {
  switch (status) {
    case AIEntityStatus.ACTIVE:
      return 'bg-green-500';
    case AIEntityStatus.INACTIVE:
      return 'bg-gray-500';
    case AIEntityStatus.MAINTENANCE:
      return 'bg-yellow-500';
    case AIEntityStatus.BETA:
      return 'bg-blue-500';
    case AIEntityStatus.DEPRECATED:
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
} 