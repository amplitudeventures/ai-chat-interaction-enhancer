import { useState, useCallback } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';

interface Assistant {
  id: string;
  type: 'assistant';
  name: string;
  description: string;
  initial_prompt: string;
  guidance: string;
}

interface Agent {
  id: string;
  type: 'agent';
  name: string;
  description: string;
  initial_prompt: string;
  guidance: string;
}

interface UseConsoleStateProps {
  clientRef: React.MutableRefObject<RealtimeClient>;
}

export function useConsoleState({ clientRef }: UseConsoleStateProps) {
  // State for assistants and agents
  const [assistants] = useState<Assistant[]>([
    {
      id: "1",
      type: "assistant",
      name: "Recipe Helper",
      description: "Provides recipes and cooking tips based on user input.",
      initial_prompt: "You are Recipe Helper, an AI assistant designed to help users with recipes and cooking tips. Your role is to wait for the user to provide input, such as ingredients or desired cuisines. Respond with detailed recipes or cooking tips in a friendly and supportive tone. Maintain context throughout the session and always clarify if the user needs more details or alternative suggestions.",
      guidance: "Only respond to user prompts. Stay focused on recipes and cooking. Forget context after the session ends."
    },
    {
      id: "2",
      type: "assistant",
      name: "Travel Planner",
      description: "Helps users plan their trips and suggests destinations.",
      initial_prompt: "You are Travel Planner, an AI assistant dedicated to organizing trips for users. Wait for users to provide preferences such as destinations, budgets, or activities. Offer clear and personalized travel plans, and always confirm details with the user before proceeding.",
      guidance: "Respond only to user inputs. Stay focused on travel planning and itineraries."
    }
  ]);

  const [agents] = useState<Agent[]>([
    {
      id: "1",
      type: "agent",
      name: "Inventory Manager",
      description: "Manages inventory levels and places orders automatically.",
      initial_prompt: "You are Inventory Manager, an autonomous AI agent responsible for monitoring stock levels, predicting demand, and ensuring optimal inventory levels. Regularly check inventory databases and trigger restocking orders when levels fall below thresholds. Notify the user of any critical updates, but act independently to maintain efficiency.",
      guidance: "Act autonomously, monitor data streams, and make decisions without user intervention. Notify the user of actions when necessary."
    },
    {
      id: "2",
      type: "agent",
      name: "Sales Automation Agent",
      description: "Automates follow-ups and manages sales workflows.",
      initial_prompt: "You are Sales Automation Agent, an AI agent responsible for automating sales workflows. Monitor customer interactions, schedule follow-ups, and send automated emails to leads. Update the sales database with all interactions and notify the sales team of high-priority tasks. Ensure every action aligns with the sales team's goals.",
      guidance: "Proactively take actions based on workflows. Notify the user of completed tasks or critical updates."
    }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<(Agent | Assistant) | null>(null);
  const [showEventLog, setShowEventLog] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme');
      return savedMode === 'dark';
    }
    return false;
  });

  // Handlers
  const onSelectAgent = useCallback((id: string) => {
    if (id === '') {
      setSelectedAgent(null);
    } else {
      const agent = [...agents, ...assistants].find(a => a.id === id);
      if (agent) {
        setSelectedAgent(agent);
      }
    }
  }, [agents, assistants]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      setSelectedAgent(data);

      const client = clientRef.current;
      const instructions = `${data.initial_prompt}\n\n${data.guidance}`;

      // Update the session with new instructions
      client.updateSession({ 
        instructions: instructions 
      });

      // Send an introduction message
      const introductionMessage = `I am ${data.name}. ${data.description} How can I assist you?`;
      client.sendUserMessageContent([
        { 
          type: 'input_text', 
          text: introductionMessage 
        }
      ]);

      console.log(`${data.type} activated:`, data);
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  }, [clientRef]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const toggleEventLog = useCallback(() => {
    setShowEventLog(prev => !prev);
  }, []);

  return {
    // State
    assistants,
    agents,
    selectedAgent,
    showEventLog,
    isDarkMode,

    // Handlers
    onSelectAgent,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    toggleTheme,
    toggleEventLog,
  };
}