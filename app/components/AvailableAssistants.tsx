'use client';

import { useDroppable } from '@dnd-kit/core';
import { AssistantItem, assistants } from '../types/assistants';
import { useEffect, useState } from 'react';
import AssistantCard from './AssistantCard';


interface AvailableAssistantsProps {
  activeAssistants: AssistantItem[];
}

export function AvailableAssistants({ activeAssistants }: AvailableAssistantsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: 'workspace',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

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
            {activeAssistants.map((assistant) => (
              <div
                key={assistant.id}
                className="bg-white shadow-sm rounded-lg p-6 border border-gray-100 flex flex-col items-center"
              >
                <div className="text-4xl mb-4">{assistant.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-2 text-center">{assistant.name}</h3>
                <p className="text-gray-600 text-sm text-center">{assistant.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-8 max-w-[900px]">
        <AssistantCard 
          icon={assistants[0].icon}
          name="Content Creation Agent"
          description="Configurable for LinkedIn, SEO, Podcasts"
          className="bg-[#FFF9E6]"
        />
        <AssistantCard 
          icon={assistants[1].icon}
          name="General Chat Assistant"
          description="For interactive conversations"
          className="bg-[#006666] text-white"
        />
        <AssistantCard 
          icon={assistants[2].icon}
          name="Task Specific Assistant"
          description="Customized for specific tasks"
          className="bg-[#F5A623] text-white"
        />
      </div>
    </section>
  );
}

export default AvailableAssistants; 
