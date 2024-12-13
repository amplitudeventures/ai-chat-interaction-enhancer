'use client';

import { signOut, useSession } from 'next-auth/react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableAssistant } from './DraggableAssistant';
import { LogOut, User } from 'lucide-react';
import { type AIEntity } from '@/lib/data/ai-entities';

interface SidebarProps {
  assistants: AIEntity[];
  setAssistants: (assistants: AIEntity[]) => void;
}

export default function Sidebar({ assistants, setAssistants }: SidebarProps) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut({ redirect: false });
      window.location.href = '/';
    }
  };

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
              status={assistant.status}
              statusMessage={assistant.statusMessage}
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