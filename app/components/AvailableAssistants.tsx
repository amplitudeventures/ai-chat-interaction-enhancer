'use client';

import { useDroppable } from '@dnd-kit/core';
import { AIEntity, Assistant, Agent, assistants, agents } from '../../lib/data/ai-entities';
import { useEffect, useState } from 'react';
import AssistantCard from './AssistantCard';
import { useRouter } from 'next/navigation';

interface AvailableAssistantsProps {
  activeAssistants: AIEntity[];
  onDrop: (entity: AIEntity) => void;
  onSave: () => void;
}

export function AvailableAssistants({ activeAssistants, onDrop, onSave }: AvailableAssistantsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: 'workspace',
  });
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSaveAndNavigate = () => {
    // Save activeAssistants to localStorage
    localStorage.setItem('assistants', JSON.stringify(activeAssistants));
    if (onSave) onSave();
    router.push('/chatcenter');
  };

  if (!isMounted) return null;

  return (
    <section className="bg-white rounded-lg p-8 mx-auto flex flex-col items-center justify-center">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8 max-w-[400px] mx-auto">
        Available Assistants and Agents
      </h2>
      
      <div
        ref={setNodeRef}
        className={`
          border-2 border-dashed border-gray-300 rounded-lg 
          min-h-[100px] p-4 w-full max-w-[600px]
          flex items-center justify-center
          ${isOver ? 'border-[#008080] bg-[#008080]/5' : ''}
        `}
      >
        {activeAssistants.length === 0 ? (
          <div className="flex items-center gap-4">
            <svg 
              className="w-6 h-6 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            <p className="text-gray-500">drag and drop assistants and agents</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {activeAssistants.map((entity) => (
              <div
                key={entity.id}
                className="bg-white shadow-sm rounded-lg p-6 border border-gray-100 flex flex-col items-center"
              >
                <div className="text-4xl mb-4">{entity.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2 text-center">{entity.name}</h3>
                <p className="text-gray-600 text-sm text-center">{entity.description}</p>
                <span className="text-xs mt-2 px-2 py-1 rounded-full bg-gray-100">
                  {entity.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeAssistants.length > 0 && (
        <button
          onClick={handleSaveAndNavigate}
          className="mt-4 px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors"
        >
          Save Configuration
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8 max-w-[900px]">
        {[...assistants, ...agents].slice(0, 3).map(entity => (
          <AssistantCard 
            key={entity.id}
            icon={entity.icon}
            name={entity.name}
            description={entity.description}
            className={
              entity.type === 'assistant' 
                ? "bg-[#FFF9E6]" 
                : entity.type === 'agent' 
                  ? "bg-[#006666] text-white"
                  : "bg-[#F5A623] text-white"
            }
          />
        ))}
      </div>
    </section>
  );
}

export default AvailableAssistants; 
