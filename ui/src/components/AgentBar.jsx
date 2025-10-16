import React from 'react';
import { motion } from 'framer-motion';

const agents = [
  { id: 'scout94', name: 'Scout94', emoji: '🚀', color: 'bg-scout-blue', role: 'Coordinator' },
  { id: 'doctor', name: 'Doctor', emoji: '🩺', color: 'bg-doctor-green', role: 'Diagnostics' },
  { id: 'auditor', name: 'Auditor', emoji: '📊', color: 'bg-auditor-orange', role: 'Quality' },
  { id: 'screenshot', name: 'Screenshotter', emoji: '📸', color: 'bg-screenshot-purple', role: 'Visual' },
  { id: 'backend', name: 'Backend', emoji: '⚙️', color: 'bg-backend-gray', role: 'API' },
  { id: 'frontend', name: 'Frontend', emoji: '🎨', color: 'bg-frontend-cyan', role: 'UI/UX' },
  { id: 'nurse', name: 'Nurse', emoji: '💉', color: 'bg-nurse-pink', role: 'Healing' },
];

export default function AgentBar({ isRunning }) {
  return (
    <div className="glassmorphism-dark border-b border-white/10 px-6 py-3">
      <div className="flex items-center gap-4 overflow-x-auto">
        <span className="text-sm text-gray-400 font-semibold whitespace-nowrap">AI TEAM:</span>
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glassmorphism hover:bg-white/10 transition cursor-pointer group"
          >
            <motion.span
              animate={isRunning ? {
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ duration: 2, repeat: isRunning ? Infinity : 0, delay: index * 0.3 }}
              className="text-xl"
            >
              {agent.emoji}
            </motion.span>
            <div className="hidden lg:block">
              <div className="text-xs font-semibold">{agent.name}</div>
              <div className="text-[10px] text-gray-400">{agent.role}</div>
            </div>
            {isRunning && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-2 h-2 rounded-full ${agent.color}`}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
