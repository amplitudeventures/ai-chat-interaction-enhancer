import React from 'react';

interface AssistantCardProps {
  icon: string;
  title: string;
  description: string;
}

export const AssistantCard: React.FC<AssistantCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      <button className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors">
        Configure
      </button>
    </div>
  );
}; 