'use client';

import { useDroppable } from '@dnd-kit/core';
import { AIEntity } from '@/lib/data/ai-entities';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AvailableAssistantsProps {
  activeAssistants: AIEntity[];
  onDrop: (entity: AIEntity) => void;
  onSave: () => void;
  onDragStart: (entity: AIEntity) => void;
}

export function AvailableAssistants({ activeAssistants, onDrop, onSave, onDragStart }: AvailableAssistantsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: 'workspace',
  });
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSaveAndNavigate = async () => {
    try {
      // Save to localStorage (keep this for immediate client-side access)
      localStorage.setItem('ai-entities', JSON.stringify(activeAssistants));
      localStorage.setItem('ai-configuration', JSON.stringify({
        timestamp: new Date().toISOString(),
        entities: activeAssistants
      }));

      // Save to database
      const response = await fetch('/api/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entities: activeAssistants
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      if (onSave) onSave();
      router.push('/chatcenter');
    } catch (error) {
      console.error('Error saving configuration:', error);
      setError('Failed to save configuration');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDrop = (entity: AIEntity) => {
    // Check if assistant already exists
    if (activeAssistants.some(assistant => assistant.id === entity.id)) {
      setError('This assistant is already in your workspace');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setError(null);
    onDrop(entity);
  };

  if (!isMounted) return null;

  return (
    <section className="bg-white rounded-lg p-8 mx-auto flex flex-col items-center justify-center">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8 max-w-[400px] mx-auto">
        Drop AI Entities Here
      </h2>
      
      <div
        ref={setNodeRef}
        className={`
          border-2 border-dashed border-gray-300 rounded-lg 
          min-h-[200px] p-4 w-full max-w-[600px]
          flex items-center justify-center
          ${isOver ? 'border-[#008080] bg-[#008080]/5' : ''}
          transition-colors duration-200
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
            <p className="text-gray-500">Drag assistants or agents here from the sidebar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {activeAssistants.map((entity) => (
              <div
                key={entity.id}
                className="bg-white shadow-sm rounded-lg p-4 border border-gray-100 flex flex-col items-center"
              >
                <div className="text-3xl mb-2">{entity.icon}</div>
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
    </section>
  );
}

export default AvailableAssistants; 
