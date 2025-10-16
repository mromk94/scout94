import React from 'react';
import { motion } from 'framer-motion';

const agentStyles = {
  scout94: { color: 'from-blue-600 to-blue-700', glow: 'agent-glow-scout', emoji: '🚀' },
  doctor: { color: 'from-green-600 to-green-700', glow: 'agent-glow-doctor', emoji: '🩺' },
  auditor: { color: 'from-orange-600 to-orange-700', glow: 'agent-glow-auditor', emoji: '📊' },
  screenshot: { color: 'from-purple-600 to-purple-700', glow: 'agent-glow-screenshot', emoji: '📸' },
  backend: { color: 'from-gray-600 to-gray-700', glow: 'agent-glow-backend', emoji: '⚙️' },
  frontend: { color: 'from-cyan-600 to-cyan-700', glow: 'agent-glow-frontend', emoji: '🎨' },
  nurse: { color: 'from-pink-600 to-pink-700', glow: 'agent-glow-nurse', emoji: '💉' },
  user: { color: 'from-slate-600 to-slate-700', glow: '', emoji: '👤' },
};

export default function ChatBubble({ message }) {
  const style = agentStyles[message.agent] || agentStyles.scout94;
  const isUser = message.agent === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Agent Avatar */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${style.color} flex items-center justify-center text-2xl flex-shrink-0 ${style.glow}`}
      >
        {style.emoji}
      </motion.div>

      {/* Message Bubble */}
      <div className={`flex-1 max-w-xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-300 capitalize">{message.agent}</span>
          <span className="text-[10px] text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`glassmorphism rounded-2xl px-4 py-3 ${
            message.type === 'success' ? 'border-green-500 border-2' :
            message.type === 'error' ? 'border-red-500 border-2' :
            'border-white/10'
          } ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
          
          {message.type === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-2 text-green-400 text-xs font-semibold"
            >
              ✨ Success
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
