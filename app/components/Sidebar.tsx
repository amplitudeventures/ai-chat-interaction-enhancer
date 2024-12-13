'use client';

import { signOut, useSession } from 'next-auth/react';
import { DraggableAssistant } from './DraggableAssistant';
import { LogOut, User } from 'lucide-react';
import { type AIEntity, assistants, agents } from '@/lib/data/ai-entities';
import { useEffect, useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

interface SidebarProps {
  setAssistants: (assistants: AIEntity[]) => void;
  activeAssistants: AIEntity[];
}

export default function Sidebar({ setAssistants, activeAssistants }: SidebarProps) {
  const { data: session } = useSession();
  const [combinedEntities, setCombinedEntities] = useState<AIEntity[]>([]);

  useEffect(() => {
    // Filter out active assistants from the combined entities
    const combined = [...assistants, ...agents].filter(
      entity => !activeAssistants.some(active => active.id === entity.id)
    );

    const sortedCombined = combined.sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });

    setCombinedEntities(sortedCombined);
  }, [activeAssistants]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut({ redirect: false });
      window.location.href = '/';
    }
  };

  return (
    <div className="w-64 bg-[#1a1a1a] h-screen p-4 flex flex-col fixed top-0 left-0 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold mb-4">AI Entities</h2>
      </div>
      
      <div className="flex-grow overflow-y-auto overflow-x-hidden pr-2 space-y-2 custom-scrollbar">
        <div className="w-full flex flex-col items-center">
          {combinedEntities.map((entity) => (
            <DraggableAssistant 
              key={entity.id}
              id={entity.id}
              icon={entity.icon}
              name={entity.name}
              description={entity.description}
              status={entity.status}
              statusMessage={entity.statusMessage}
              type={entity.type}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-700 pt-4 flex-shrink-0">
        <div className="flex items-center justify-between text-white p-2 rounded-lg hover:bg-gray-800">
          <div className="flex items-center gap-2">
            <User size={20} />
            <span className="truncate">{session?.user?.name || session?.user?.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
} 