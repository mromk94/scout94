import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Reply, Clock, Check, CheckCheck } from 'lucide-react';

const agentColors = {
  scout94: 'from-blue-600 to-blue-700',
  doctor: 'from-green-600 to-emerald-700',
  auditor: 'from-orange-600 to-orange-700',
  screenshot: 'from-purple-600 to-purple-700',
  backend: 'from-gray-600 to-slate-700',
  frontend: 'from-pink-600 to-rose-700',
  nurse: 'from-cyan-600 to-teal-700',
  user: 'from-indigo-600 to-indigo-700',
};

const agentEmojis = {
  scout94: '🚀',
  doctor: '🩺',
  auditor: '📊',
  screenshot: '📸',
  backend: '⚙️',
  frontend: '🎨',
  nurse: '💉',
  user: '👤',
};

export default function ChatBubble({ message, onReply }) {
  const [showActions, setShowActions] = useState(false);
  const colorClass = agentColors[message.agent] || 'from-gray-600 to-gray-700';
  const emoji = agentEmojis[message.agent] || '🤖';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`flex items-start gap-3 group ${
        message.agent === 'user' ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Agent Avatar */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-xl shadow-lg ring-2 ring-white/20 flex-shrink-0`}
      >
        {emoji}
      </motion.div>

      {/* Message Content */}
      <div className={`flex-1 ${message.agent === 'user' ? 'text-right' : ''}`}>
        {/* Agent Name & Time */}
        <div className={`flex items-center gap-2 mb-1 ${message.agent === 'user' ? 'justify-end' : ''}`}>
          <span className="font-semibold text-sm capitalize">{message.agent}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.agent === 'user' && message.status && (
            <span className="text-xs text-gray-400">
              {message.status === 'sent' && <Check className="w-3 h-3" />}
              {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
              {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-400" />}
            </span>
          )}
        </div>

        {/* Reply Reference */}
        {message.replyTo && (
          <div className="mb-2 p-2 bg-white/5 border-l-2 border-blue-500 rounded text-xs text-gray-400">
            <div className="font-semibold">Replying to {message.replyTo.agent}</div>
            <div className="truncate">{message.replyTo.text}</div>
          </div>
        )}

        {/* Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`relative inline-block max-w-2xl px-4 py-3 rounded-2xl shadow-lg ${
            message.agent === 'user'
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white'
              : 'glassmorphism-light text-gray-100'
          } ${
            message.type === 'error' ? 'border-2 border-red-500/50' : ''
          } ${
            message.type === 'success' ? 'border-2 border-green-500/50' : ''
          }`}
        >
          {/* Message Text */}
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>

          {/* Mentions */}
          {message.mentions && message.mentions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.mentions.map((mention, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-blue-500/30 rounded-full"
                >
                  @{mention}
                </span>
              ))}
            </div>
          )}

          {/* Screenshot Preview */}
          {message.screenshot && (
            <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
              <img
                src={message.screenshot}
                alt="Test screenshot"
                className="w-full h-auto max-h-64 object-contain bg-black/30"
              />
            </div>
          )}

          {/* Reply Button (shown on hover) */}
          <AnimatePresence>
            {showActions && onReply && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onReply(message)}
                className={`absolute ${
                  message.agent === 'user' ? 'left-2' : 'right-2'
                } -bottom-3 p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition`}
                title="Reply to this message"
              >
                <Reply className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
