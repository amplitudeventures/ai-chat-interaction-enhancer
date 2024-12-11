'use client';

import { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AssistantItem } from '../types/assistants';
import { DraggableAssistant } from './DraggableAssistant';

interface SidebarProps {
  assistants: AssistantItem[];
  setAssistants: (assistants: AssistantItem[]) => void;
}

export default function Sidebar({ assistants, setAssistants }: SidebarProps) {
  return (
    <div className="w-64 bg-[#1a1a1a] min-h-screen p-4 max-h-screen fixed left-0 top-0 pt-16">
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold mb-4"></h2>
        <p className="text-gray-400 text-sm"></p>
      </div>
      
      <SortableContext items={assistants.map(a => a.id)} strategy={verticalListSortingStrategy}>
        {assistants.map((assistant) => (
          <DraggableAssistant 
            key={assistant.id}
            id={assistant.id}
            icon={assistant.icon}
            name={assistant.name}
            description={assistant.description}
          />
        ))}
      </SortableContext>
    </div>
  );
} 