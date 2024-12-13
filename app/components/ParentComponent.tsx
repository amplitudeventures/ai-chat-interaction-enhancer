'use client';

import React, { useState } from 'react';
import { SelectAssistants } from './SelectAssistants';
import AvailableAssistants from './AvailableAssistants';
import { ConfigureSettings } from './ConfigureSettings';
import { AIEntity } from '../../lib/data/ai-entities';
import { useRouter } from 'next/navigation';

export function ParentComponent() {
  const router = useRouter();
  const [selectedWorkflow, setSelectedWorkflow] = useState('content');
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>([]);
  const [droppedAssistants, setDroppedAssistants] = useState<AIEntity[]>([]);

  // Combined handler for all selection methods
  const handleAssistantSelection = (assistant: AIEntity, source: 'select' | 'drop' | 'configure') => {
    if (!selectedAssistants.includes(assistant.id)) {
      setSelectedAssistants([...selectedAssistants, assistant.id]);
    }
    if (source === 'drop') {
      setDroppedAssistants([...droppedAssistants, assistant]);
    }
  };

  const handleAssistantDeselection = (assistantId: string) => {
    setSelectedAssistants(selectedAssistants.filter(id => id !== assistantId));
    setDroppedAssistants(droppedAssistants.filter(assistant => assistant.id !== assistantId));
  };

  const handleSave = () => {
    localStorage.setItem('assistants', JSON.stringify(droppedAssistants));
    router.push('/chatcenter');
  };

  const handleDrop = (entity: AIEntity) => {
    handleAssistantSelection(entity, 'drop');
  };

  return (
    <div>
      <SelectAssistants 
        selectedWorkflow={selectedWorkflow}
        setSelectedWorkflow={setSelectedWorkflow}
        selectedAssistants={selectedAssistants}
        setSelectedAssistants={setSelectedAssistants}
      />
    
      <AvailableAssistants 
        activeAssistants={droppedAssistants} 
        onDrop={handleDrop}
        onDragStart={() => {}}
        onSave={handleSave}
      />
    </div>
  );
} 