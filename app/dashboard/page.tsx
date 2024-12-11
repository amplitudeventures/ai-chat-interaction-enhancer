'use client';

import dynamic from 'next/dynamic';
import { useContext, useState } from 'react';
import { AssistantContext } from './layout';
import { ConfigureSettings } from '../components/ConfigureSettings';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { SelectAssistants } from '../components/SelectAssistants';
import { Footer } from '../components/Footer';

// Dynamically import the AvailableAssistants component with no SSR
const AvailableAssistants = dynamic(
  () => import('../components/AvailableAssistants').then(mod => mod.AvailableAssistants),
  { ssr: false }
);

export default function DashboardPage() {
  const { activeAssistants } = useContext(AssistantContext);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('content');

  return (
    <div className="max-w-7xl mx-auto">
      <SelectAssistants 
        selectedWorkflow={selectedWorkflow}
        setSelectedWorkflow={setSelectedWorkflow}
      />
      <AvailableAssistants activeAssistants={activeAssistants} />
      <ConfigureSettings />
      <PerformanceMetrics />
    </div>
  );
} 