'use client';

import { useState } from 'react';
import Image from "next/image";
import { motion } from "framer-motion";
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { AIEntity } from '@/lib/data/ai-entities';

export default function Home() {
  const [isHovered, setIsHovered] = useState('');
  const [activeEntity, setActiveEntity] = useState<AIEntity | null>(null);

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <DndContext
      onDragStart={(event) => {
        const entity = event.active.data.current as AIEntity;
        setActiveEntity(entity);
      }}
      onDragEnd={() => {
        setActiveEntity(null);
      }}
    >
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            AI Agent Assistant
          </h1>
          <p className="text-xl text-gray-400">
            Your intelligent workspace companion
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.a
            href="/dashboard"
            className="px-8 py-3 bg-teal-600 rounded-full font-medium text-lg hover:bg-teal-700 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            onHoverStart={() => setIsHovered('dashboard')}
            onHoverEnd={() => setIsHovered('')}
          >
            {isHovered === 'dashboard' ? 'Launch Dashboard →' : 'Go to Dashboard'}
          </motion.a>

          <motion.a
            href="/chatcenter"
            className="px-8 py-3 bg-transparent border-2 border-white rounded-full font-medium text-lg hover:bg-white/10 transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            onHoverStart={() => setIsHovered('chat')}
            onHoverEnd={() => setIsHovered('')}
          >
            {isHovered === 'chat' ? 'Start Chatting →' : 'Chat Center'}
          </motion.a>
        </motion.div>

        <motion.div 
          className="flex gap-6 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.a
            href="/login"
            className="text-teal-400 hover:text-teal-300 font-medium"
            whileHover={{ scale: 1.05 }}
          >
            Login
          </motion.a>
          <span className="text-gray-500">|</span>
          <motion.a
            href="/register"
            className="text-teal-400 hover:text-teal-300 font-medium"
            whileHover={{ scale: 1.05 }}
          >
            Register
          </motion.a>
        </motion.div>
      </div>

      <DragOverlay>
        {activeEntity && (
          <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
            <div className="text-2xl mb-2">{activeEntity.icon}</div>
            <h3 className="font-medium">{activeEntity.name}</h3>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
