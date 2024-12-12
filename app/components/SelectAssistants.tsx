'use client';

interface SelectAssistantsProps {
  selectedWorkflow: string;
  setSelectedWorkflow: (workflow: string) => void;
}

export function SelectAssistants({ selectedWorkflow, setSelectedWorkflow }: SelectAssistantsProps) {
  return (
    <section className="bg-[#1a1a1a] text-white p-8  rounded-b-2xl mb-8 w-full ">
      <h2 className="text-3xl font-semibold text-center pt-16 mb-8 max-w-[400px] mx-auto">Select and Configure Assistants</h2>
      <p className="text-center mt-2 mb-4">Organize assistants and agents for your workflows</p>
      
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setSelectedWorkflow('content')}
          className={`px-4 py-2 rounded transition-colors ${
            selectedWorkflow === 'content' 
              ? 'bg-white text-[#008080]' 
              : 'bg-[rgba(255,255,255,0.2)]'
          }`}
        >
          Content Creation
        </button>
        <button 
          onClick={() => setSelectedWorkflow('chat')}
          className={`px-4 py-2 rounded transition-colors ${
            selectedWorkflow === 'chat' 
              ? 'bg-white text-[#008080]' 
              : 'bg-[rgba(255,255,255,0.2)]'
          }`}
        >
          Chat Assistant
        </button>
        <button 
          onClick={() => setSelectedWorkflow('task')}
          className={`px-4 py-2 rounded transition-colors ${
            selectedWorkflow === 'task' 
              ? 'bg-white text-[#008080]' 
              : 'bg-[rgba(255,255,255,0.2)]'
          }`}
        >
          Task Specific
        </button>
      </div>
    </section>
  );
} 