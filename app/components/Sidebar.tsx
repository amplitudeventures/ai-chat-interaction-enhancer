'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AssistantItem } from '../types/assistants';
import { DraggableAssistant } from './DraggableAssistant';
import { LogOut, User } from 'lucide-react';

interface SidebarProps {
  assistants: AssistantItem[];
  setAssistants: (assistants: AssistantItem[]) => void;
}

export default function Sidebar({ assistants, setAssistants }: SidebarProps) {
  const { data: session } = useSession();

  return (
    <div className="w-64 bg-[#1a1a1a] min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold mb-4"></h2>
        <p className="text-gray-400 text-sm"></p>
      </div>
      
      <div className="flex-grow">
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

      <div className="mt-auto border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between text-white p-2 rounded-lg hover:bg-gray-800">
          <div className="flex items-center gap-2">
            <User size={20} />
            <span>{session?.user?.name || session?.user?.email}</span>
          </div>
          <button 
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = '/';
            }}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
} 