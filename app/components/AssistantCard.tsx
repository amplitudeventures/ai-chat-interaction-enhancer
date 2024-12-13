import { AIEntityStatus } from '@/lib/data/ai-entities';
import React from 'react'

interface AssistantCardProps {
  icon: string;
  name: string;
  description: string;
  className?: string;
  status?: AIEntityStatus;
  statusMessage?: string;
}

const AssistantCard = ({ icon, name, description, className }: AssistantCardProps) => {
  return (
    <div className={`rounded-lg p-6 flex flex-col items-center ${className}`}>
      <div className="w-12 h-12 flex items-center justify-center text-3xl mb-3 bg-white rounded-full shadow-sm">
        {icon}
      </div>
      <h3 className="font-medium  mb-1 text-center">{name}</h3>
      <p className="text-sm text-center">{description}</p>  
    </div>
  )
}

export default AssistantCard 