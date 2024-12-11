'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AssistantItem, assistants as initialAssistants } from '../types/assistants';
import { createContext } from 'react';
import Sidebar from '../components/Sidebar';
import { Footer } from '../components/Footer';
// Create context
export const AssistantContext = createContext<{
  activeAssistants: AssistantItem[];
  setActiveAssistants: (assistants: AssistantItem[]) => void;
}>({
  activeAssistants: [],
  setActiveAssistants: () => {},
});

// Dynamically import DndContext
const DndProvider = dynamic(
  () => import('../../app/components/DndProvider').then(mod => mod.DndProvider),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [assistants, setAssistants] = useState(initialAssistants);
  const [activeAssistants, setActiveAssistants] = useState<AssistantItem[]>([]);

  return (
    <DndProvider onAssistantDrop={(assistant) => {
      if (!activeAssistants.find(a => a.id === assistant.id)) {
        setActiveAssistants([...activeAssistants, assistant]);
      }
    }}>
      <AssistantContext.Provider value={{ activeAssistants, setActiveAssistants }}>
        <div className="flex h-screen overflow-hidden ">
          <Sidebar assistants={assistants} setAssistants={setAssistants} />
          <div className="flex-1 ml-64 overflow-y-auto">
            <nav className="fixed top-0 left-0 right-0 bg-[#1a1a1a] z-20 h-[nav-height] py-6 px-4 border-b border-black">
              <div className="flex items-center justify-between text-white px-4">
                <h1 className="text-xl font-semibold">AI and Assistants Dashboard</h1>
                <div className="flex items-center gap-6">
                  <div className="flex gap-4">
                    <a href="#" className="hover:opacity-80">Home</a>
                    <a href="#" className="hover:opacity-80">Workflows</a>
                    <a href="#" className="hover:opacity-80">Settings</a>
                  </div>
                  <input
                    type="search"
                    placeholder="Search here..."
                    className="bg-[rgba(255,255,255,0.1)] px-4 py-1 rounded text-sm"
                  />
                </div>
              </div>
            </nav>
            <div className="pt-16 border-black border-l-2">
              {children}
              <Footer />
            </div>
          </div>
        </div>
      </AssistantContext.Provider>
    </DndProvider>
  );
} 