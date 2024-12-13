'use client';

import dynamic from 'next/dynamic';
import { useContext, useState } from 'react';
import { DragOverlay } from '@dnd-kit/core';
import { AssistantContext } from '../context/AssistantContext';
import { ConfigureSettings } from '../components/ConfigureSettings';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { SelectAssistants } from '../components/SelectAssistants';
import { Footer } from '../components/Footer';
import { AIEntity } from '@/lib/data/ai-entities';

// Dynamically import the AvailableAssistants component with no SSR
const AvailableAssistants = dynamic(
  () => import('../components/AvailableAssistants').then(mod => mod.AvailableAssistants),
  { ssr: false }
);

export default function DashboardPage() {
  const { activeAssistants } = useContext(AssistantContext);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('content');
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>([]);
  const [draggedEntity, setDraggedEntity] = useState<AIEntity | null>(null);

  const handleDrop = (entity: AIEntity) => {
    // Handle single assistant drop
    console.log('Dropped item:', entity);
    setDraggedEntity(null);
  };

  const handleDragStart = (entity: AIEntity) => {
    setDraggedEntity(entity);
  };

  const handleSave = () => {
    // Handle saving the assistant configuration
    console.log('Saving assistants');
  };

  return (
    <div className="max-w-7xl mx-auto ">
      <SelectAssistants 
        selectedWorkflow={selectedWorkflow}
        setSelectedWorkflow={setSelectedWorkflow}
        selectedAssistants={selectedAssistants}
        setSelectedAssistants={setSelectedAssistants}
      />
      <AvailableAssistants 
        activeAssistants={activeAssistants}
        onDrop={handleDrop}
        onSave={handleSave}
        onDragStart={handleDragStart}
      />
      <ConfigureSettings />
      <PerformanceMetrics />
      
      <DragOverlay>
        {draggedEntity && (
          <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{draggedEntity.icon}</span>
              <div>
                <h3 className="font-medium">{draggedEntity.name}</h3>
                <p className="text-sm text-gray-500">{draggedEntity.type}</p>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </div>
  );
} 