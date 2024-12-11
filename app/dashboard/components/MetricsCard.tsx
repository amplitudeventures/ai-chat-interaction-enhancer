import React from 'react';

interface MetricsCardProps {
  value: string;
  label: string;
  color: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ value, label, color }) => {
  return (
    <div className={`${color} p-6 rounded-lg`}>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className="text-sm text-gray-700">{label}</div>
    </div>
  );
}; 