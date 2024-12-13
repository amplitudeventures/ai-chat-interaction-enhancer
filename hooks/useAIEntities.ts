import { useState, useCallback } from 'react';
import { Assistant, Agent, AIEntity, assistants as defaultAssistants, agents as defaultAgents } from '@/lib/data/ai-entities';

interface UseAIEntitiesProps {
  onEntitySelect?: (entity: AIEntity) => void;
}

export function useAIEntities({ onEntitySelect }: UseAIEntitiesProps = {}) {
  const [assistants] = useState<Assistant[]>(defaultAssistants);
  const [agents] = useState<Agent[]>(defaultAgents);
  const [selectedEntity, setSelectedEntity] = useState<AIEntity | null>(null);

  const handleSelectEntity = useCallback((id: string) => {
    if (id === '') {
      setSelectedEntity(null);
    } else {
      const entity = [...agents, ...assistants].find(e => e.id === id);
      if (entity) {
        setSelectedEntity(entity);
        onEntitySelect?.(entity);
      }
    }
  }, [agents, assistants, onEntitySelect]);

  const getEntityById = useCallback((id: string): AIEntity | undefined => {
    return [...agents, ...assistants].find(e => e.id === id);
  }, [agents, assistants]);

  return {
    assistants,
    agents,
    selectedEntity,
    handleSelectEntity,
    getEntityById,
  };
} 