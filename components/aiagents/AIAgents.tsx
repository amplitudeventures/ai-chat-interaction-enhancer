'use client';
import { useEffect, useState } from 'react';
import { AIEntity } from '../../lib/data/ai-entities';

  interface AIAgentsProps {
    agents: AIEntity[];
    onSelectAgent: (id: string) => void;
    selectedAgentId?: string | null;
  }

const AIAgents: React.FC<AIAgentsProps> = ({ onSelectAgent, selectedAgentId }) => {
  const [savedAgents, setSavedAgents] = useState<AIEntity[]>([]);

  useEffect(() => {
    try {
      // Get saved agents from localStorage when component mounts
      const savedData = localStorage.getItem('assistants');
      console.log('Saved data:', savedData); // Debug log
      
      if (savedData) {
        const parsedData = JSON.parse(savedData) as AIEntity[];
        console.log('Parsed data:', parsedData); // Debug log
        setSavedAgents(parsedData);
        
        // Automatically select the first agent if available
        if (parsedData.length > 0 && !selectedAgentId) {
          onSelectAgent(parsedData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading agents from localStorage:', error);
    }
  }, [onSelectAgent, selectedAgentId]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, agent: AIEntity) => {
    e.dataTransfer.setData('application/json', JSON.stringify(agent));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    onSelectAgent('');
  };

  return (
    <div className="max-w-[300px] h-full flex-grow-0 flex flex-col rounded-lg overflow-hidden font-sans text-base">
      <div className="px-4 pt-6 font-semibold text-center">
        <h2>AI Agents 1</h2>
      </div>
      
      <div className="p-2" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        {savedAgents.map((agent) => (
          <div
            key={agent.id}
            className={`p-3 m-2 cursor-grab active:cursor-grabbing border border-gray-400 rounded-md transition-all duration-200 relative flex justify-between items-center hover:-translate-y-0.5 hover:shadow-md
              ${selectedAgentId === agent.id ? 'bg-sky-100 border-blue-500 hover:bg-sky-200 dark:bg-sky-900' : 'dark:bg-gray-800'}`}
            draggable
            onDragStart={(e) => handleDragStart(e, agent)}
            onClick={() => onSelectAgent(agent.id)}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{agent.icon}</span>
              <div>
                <div className="font-semibold text-gray-800">{agent.name}</div>
                <div className="text-xs text-gray-600">{agent.type}</div>
              </div>
            </div>
            {selectedAgentId === agent.id && (
              <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full font-medium">
                Active
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAgents; 