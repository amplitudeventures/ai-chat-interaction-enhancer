'use client';

import { useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { AssistantContext } from '../context/AssistantContext';
import { assistants as initialAssistants } from '@/lib/data/ai-entities';
import { type AIEntity } from '@/lib/data/ai-entities';
import Sidebar from '../components/Sidebar';
import { Footer } from '../components/Footer';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [activeAssistants, setActiveAssistants] = useState<AIEntity[]>([]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'workspace') {
      const draggedAssistant = initialAssistants.find(a => a.id === active.id);
      if (draggedAssistant && !activeAssistants.some(a => a.id === draggedAssistant.id)) {
        setActiveAssistants([...activeAssistants, draggedAssistant]);
      }
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    window.location.href = '/login';
    return null;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <AssistantContext.Provider value={{ activeAssistants, setActiveAssistants }}>
        <div className="min-h-screen flex">
          <div className="fixed left-0 top-0 h-screen w-64">
            <Sidebar assistants={initialAssistants} setAssistants={setActiveAssistants} />
          </div>
          
          <div className="ml-64 flex-1 flex flex-col">
            <header className="fixed top-0 right-0 left-64 bg-[#1a1a1a] text-white p-4 z-10">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">AI and Assistants Dashboard</h1>
                <nav className="flex gap-4 items-center">
                  <a href="#" className="hover:text-gray-300">Home</a>
                  <a href="#" className="hover:text-gray-300">Workflows</a>
                  <a href="#" className="hover:text-gray-300">Settings</a>
                  <div className="relative">
                    <input 
                      type="search" 
                      placeholder="Search in site" 
                      className="bg-transparent border border-gray-600 rounded px-3 py-1 text-sm"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </nav>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto pt-[60px]">
              <main>
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </AssistantContext.Provider>
    </DndContext>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </SessionProvider>
  );
} 