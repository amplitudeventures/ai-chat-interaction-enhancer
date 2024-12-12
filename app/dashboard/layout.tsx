'use client';

import { useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { AssistantContext } from '../context/AssistantContext';
import { AssistantItem, assistants as initialAssistants } from '../types/assistants';
import Sidebar from '../components/Sidebar';
import { Footer } from '../components/Footer';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [activeAssistants, setActiveAssistants] = useState<AssistantItem[]>([]);

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
        <div className="min-h-screen flex overflow-hidden">
          <div className="fixed left-0 top-0 h-screen w-64">
            <Sidebar assistants={initialAssistants} setAssistants={setActiveAssistants} />
          </div>
          
          <div className="ml-64 flex-1 flex flex-col h-screen">
            <header className="h-[60px] bg-[#1a1a1a] text-white p-4">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">AI Agent Assistant</h1>
                <nav className="flex gap-4">
                  <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
                  <a href="/chatcenter" className="hover:text-gray-300">Chat Center</a>
                </nav>
              </div>
            </header>

            <main className="flex-1 overflow-auto ">
              {children}
            </main>
            <Footer />
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