import React from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
}

interface AIAgentsProps {
  agents: Agent[];
  onSelectAgent: (id: string) => void;
  selectedAgentId?: string | null;
}

const AIAgents: React.FC<AIAgentsProps> = ({ agents, onSelectAgent, selectedAgentId }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, agent: Agent) => {
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
    <div 
      className="max-w-[300px] h-full flex-grow-0 flex flex-col  rounded-lg overflow-hidden font-sans text-base"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="px-4 pt-6 font-semibold   text-center">
        <h2>AI Agents</h2>
      </div>
      
      <div className="p-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`p-3 m-2 cursor-grab active:cursor-grabbing border border-gray-400 rounded-md transition-all duration-200 relative flex justify-between items-center hover:-translate-y-0.5 hover:shadow-md active:scale-98
              ${selectedAgentId === agent.id ? 'bg-sky-100 border-blue-500 hover:bg-sky-200 dark:bg-sky-900' : 'dark:bg-gray-800'}`}
            draggable
            onDragStart={(e) => handleDragStart(e, agent)}
            onClick={() => onSelectAgent(agent.id)}
          >
            <div className="flex items-center gap-2 text-center opacity-80">
              {agent.name}
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