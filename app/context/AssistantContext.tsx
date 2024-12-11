'use client';

import { createContext } from 'react';
import { AssistantItem } from '../types/assistants';

export const AssistantContext = createContext<{
  activeAssistants: AssistantItem[];
  setActiveAssistants: (assistants: AssistantItem[]) => void;
}>({
  activeAssistants: [],
  setActiveAssistants: () => {},
}); 