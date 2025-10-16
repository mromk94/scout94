import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubble from './ChatBubble';
import CommandButtons from './CommandButtons';

// Helper to determine which agent should display the message
function getAgentForTest(testType) {
  const agentMap = {
    'all': 'scout94',
    'visual': 'screenshot',
    'routing': 'backend',
    'audit': 'auditor',
    'visitor': 'frontend',
    'user': 'frontend',
    'admin': 'auditor',
    'database': 'backend',
  };
  return agentMap[testType] || 'scout94';
}

export default function ChatPane({ isRunning, messages: wsMessages, sendCommand }) {
  const [localMessages, setLocalMessages] = useState([
    {
      id: 1,
      agent: getAgentForTest('all'),
      text: 'Welcome to Mission Control! Click a button below to run real Scout94 tests.',
      timestamp: new Date(),
      type: 'message'
    }
  ]);
  const messagesEndRef = useRef(null);
  
  // Combine WebSocket messages and local test result messages
  const allMessages = [...localMessages, ...(wsMessages || [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

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
          {allMessages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Command Input Area */}
      <div className="glassmorphism-dark border-t border-white/10 p-4">
        <CommandButtons 
          onCommand={(cmd) => {
            // Add user command to chat
            setLocalMessages(prev => [...prev, {
              id: Date.now(),
              agent: 'user',
              text: cmd,
              timestamp: new Date(),
              type: 'command'
            }]);
          }}
          onTestResult={(result) => {
            const agent = getAgentForTest(result.testType);
            const newMessages = [];
            
            // Add start message
            newMessages.push({
              id: Date.now(),
              agent,
              text: `🚀 Executing ${result.testType} test...`,
              timestamp: new Date(),
              type: 'message'
            });
            
            // Parse and add real PHP output line by line
            if (result.output) {
              const lines = result.output.split('\n');
              lines.forEach((line, index) => {
                const trimmed = line.trim();
                if (trimmed.length > 0) {
                  // Determine agent based on content
                  let lineAgent = agent;
                  if (trimmed.includes('✅') || trimmed.includes('PASSED')) {
                    lineAgent = 'doctor';
                  } else if (trimmed.includes('❌') || trimmed.includes('FAILED')) {
                    lineAgent = 'auditor';
                  } else if (trimmed.includes('screenshot')) {
                    lineAgent = 'screenshot';
                  } else if (trimmed.includes('Testing') || trimmed.includes('Step')) {
                    lineAgent = agent;
                  }
                  
                  newMessages.push({
                    id: Date.now() + index + 1,
                    agent: lineAgent,
                    text: trimmed,
                    timestamp: new Date(Date.now() + index * 10),
                    type: 'message'
                  });
                }
              });
            }
            
            // Add completion message
            if (result.success) {
              newMessages.push({
                id: Date.now() + 10000,
                agent: 'scout94',
                text: `✨ ${result.testType} test completed successfully!`,
                timestamp: new Date(Date.now() + 10001),
                type: 'success'
              });
            } else {
              newMessages.push({
                id: Date.now() + 10000,
                agent: 'auditor',
                text: `❌ ${result.testType} test failed: ${result.error || 'Unknown error'}`,
                timestamp: new Date(Date.now() + 10001),
                type: 'error'
              });
            }
            
            // Add all messages to chat
            setLocalMessages(prev => [...prev, ...newMessages]);
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
