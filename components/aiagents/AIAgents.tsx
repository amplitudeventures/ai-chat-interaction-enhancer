'use client';
import { useEffect, useState, useRef } from 'react';
import { AIEntity, assistants, agents } from '../../lib/data/ai-entities';
import { Plus, Settings, Bot, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AIAgentsProps {
  agents: AIEntity[];
  onSelectAgent: (id: string) => void;
  selectedAgentIds?: string[];
}

const AIAgents: React.FC<AIAgentsProps> = ({ onSelectAgent, selectedAgentIds = [] }) => {
  const [savedAgents, setSavedAgents] = useState<AIEntity[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [availableEntities, setAvailableEntities] = useState<AIEntity[]>([...agents, ...assistants]);
  const router = useRouter();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    
    const abortController = new AbortController();
    
    const fetchUserConfigurations = async () => {
      try {
        const response = await fetch('/api/configurations', {
          signal: abortController.signal,
          cache: 'no-store'
        });
        
        if (!response.ok) throw new Error('Failed to fetch configurations');
        const { configurations } = await response.json();
        
        // Combine agents and assistants
        const allStaticEntities = [...agents, ...assistants];
        
        // Filter both agents and assistants based on user configurations
        const userEntities = allStaticEntities.filter(entity => 
          configurations.some((config: { entityId: string }) => config.entityId === entity.id)
        );
        
        setSavedAgents(userEntities.sort((a, b) => (a.order || 0) - (b.order || 0)));
        initRef.current = true;
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Error loading configurations:', error);
      }
    };

    fetchUserConfigurations();

    return () => {
      abortController.abort();
    };
  }, [agents, assistants]);

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

  const handleDashboardClick = () => {
    router.push('/dashboard');
    setIsDropdownOpen(false);
  };

  const handleDropAgentClick = () => {
    setIsQuickAddOpen(true);
    setIsDropdownOpen(false);
  };

  const handleQuickAddSelect = (entity: AIEntity) => {
    try {
      // Save to localStorage only
      const savedData = localStorage.getItem('ai-entities');
      let entities: AIEntity[] = [];
      
      if (savedData) {
        entities = JSON.parse(savedData);
      }
      
      // Check if entity already exists
      const index = entities.findIndex(e => e.id === entity.id);
      if (index === -1) {
        entities.push(entity);
      } else {
        entities[index] = entity;
      }
      
      localStorage.setItem('ai-entities', JSON.stringify(entities));

      // Update the local state
      setSavedAgents(prev => [...prev, entity]);
      onSelectAgent(entity.id); // Select the newly added agent
      setIsQuickAddOpen(false);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const handleSaveAgent = (agent: AIEntity) => {
    try {
      const savedData = localStorage.getItem('ai-entities');
      let entities: AIEntity[] = [];
      
      if (savedData) {
        entities = JSON.parse(savedData);
      }
      
      // Add or update agent
      const index = entities.findIndex(e => e.id === agent.id);
      if (index === -1) {
        entities.push(agent);
      } else {
        entities[index] = agent;
      }
      
      localStorage.setItem('ai-entities', JSON.stringify(entities));
      setSavedAgents(entities.filter(e => e.type === 'agent'));
      onSelectAgent(agent.id);
    } catch (error) {
      console.error('Error saving agent:', error);
    }
  };

  return (
    <div className="max-w-[300px] h-full flex-grow-0 flex flex-col rounded-lg overflow-hidden font-sans text-base">
      <div className="px-4 pt-6 font-semibold text-center">
        <h2>AI Agents</h2>
      </div>

      <div className="px-4 py-3 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 
            bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
            transition-all duration-200 text-sm font-medium"
        >
          <Plus size={18} />
          {savedAgents.length === 0 
            ? 'Create First Agent'
            : 'Add New Agent'
          }
          <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute left-4 right-4 mt-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <button
              onClick={handleDashboardClick}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings size={16} />
              Configure in Dashboard
            </button>
            <button
              onClick={handleDropAgentClick}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bot size={16} />
              Quick Add Agent
            </button>
          </div>
        )}
      </div>
      
      <div className="p-2" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        {savedAgents.map((agent: AIEntity) => (
          <div
            key={agent.id}
            className={`p-3 m-2 cursor-grab active:cursor-grabbing border border-gray-400 rounded-md transition-all duration-200 relative flex justify-between items-center hover:-translate-y-0.5 hover:shadow-md
              ${selectedAgentIds.includes(agent.id) ? 'bg-sky-100 border-blue-500 hover:bg-sky-200 dark:bg-sky-900' : 'dark:bg-gray-800'}`}
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
            {selectedAgentIds.includes(agent.id) && (
              <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full font-medium">
                Active
              </span>
            )}
          </div>
        ))}
      </div>

      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Quick Add Agent</h3>
            <div className="max-h-[300px] overflow-y-auto">
              {availableEntities.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => handleQuickAddSelect(entity)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2"
                >
                  <span className="text-2xl">{entity.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{entity.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{entity.type}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsQuickAddOpen(false)}
              className="mt-4 w-full py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgents; 