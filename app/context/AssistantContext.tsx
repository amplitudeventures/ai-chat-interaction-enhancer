'use client';

import { createContext } from 'react';
import { type AIEntity } from '@/lib/data/ai-entities';

interface AssistantContextType {
  activeAssistants: AIEntity[];
  setActiveAssistants: React.Dispatch<React.SetStateAction<AIEntity[]>>;
}

export const AssistantContext = createContext<AssistantContextType>({
  activeAssistants: [],
  setActiveAssistants: () => {},
}); 