import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubble from './ChatBubble_old'; // Use the old simpler one
import CommandButtons from './CommandButtons';

export default function ChatPane({ isRunning, messages, sendCommand }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900/50 to-blue-900/50">
      {/* Chat Header */}
      <div className="glassmorphism-dark border-b border-white/10 px-6 py-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageIcon className="w-6 h-6 text-blue-400" />
          Agent Communication
        </h2>
        <p className="text-sm text-gray-400 mt-1">Real-time testing updates from your AI team</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages && messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Command Input Area */}
      <div className="glassmorphism-dark border-t border-white/10 p-4">
        <CommandButtons 
          onCommand={sendCommand}
          onTestResult={(result) => {
            // Handle test results
            console.log('Test result:', result);
          }}
        />
      </div>
    </div>
  );
}

function MessageIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
