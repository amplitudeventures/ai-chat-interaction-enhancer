'use client'
import React from 'react';
import LeftChatHistory from '@/components/chathistory/ChatHistory';
import InternalHeader from '@/components/internalheader/InternalHeader';
import AIAgents from '@/components/aiagents/AIAgents';

export default function ChatCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left Sidebar - Chat History */}
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 relative">
          {children}
        </main>
      </div>

    </div>
  );
}
