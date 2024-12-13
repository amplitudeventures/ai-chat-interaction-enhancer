import React from 'react';
import { AIEntity, getStatusBadgeStyles } from '@/lib/data/ai-entities';

interface AIEntityCardProps {
  entity: AIEntity;
  className?: string;
  onClick?: () => void;
}

const AIEntityCard = ({ entity, className = '', onClick }: AIEntityCardProps) => {
  const statusStyles = getStatusBadgeStyles(entity.status);

  return (
    <div 
      className={`rounded-lg p-6 flex flex-col items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}`}
      onClick={onClick}
    >
      {/* Icon Container */}
      <div className="relative">
        <div className="w-12 h-12 flex items-center justify-center text-3xl mb-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
          {entity.icon}
        </div>
        
        {/* Status Indicator */}
        <span 
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusStyles.dot} ring-2 ring-white dark:ring-gray-900`}
          title={entity.statusMessage}
        />
      </div>

      {/* Content */}
      <h3 className="font-medium mb-1 text-center">{entity.name}</h3>
      <p className="text-sm text-center text-gray-600 dark:text-gray-300">
        {entity.description}
      </p>

      {/* Status Badge - Only shown if there's a status message */}
      {entity.statusMessage && (
        <div className="mt-3">
          <span 
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles.badge}`}
          >
            {entity.status}
          </span>
        </div>
      )}
    </div>
  );
};

export default AIEntityCard; 