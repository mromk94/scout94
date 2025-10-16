import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import CommandButtons from './CommandButtons';
import MemorySettings from './MemorySettings';

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
      agent: 'scout94',
      text: 'Welcome to Mission Control! I\'m Scout94. Type @ to mention me or any agent, or use @everybody to address all of us. You can also click the reply button on any message to respond directly.',
      timestamp: new Date(),
      type: 'message'
    }
  ]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMemorySettings, setShowMemorySettings] = useState(false);
  const [memoryDuration, setMemoryDuration] = useState(1440); // 24 hours default
  const messagesEndRef = useRef(null);
  
  // Combine WebSocket messages and local test result messages
  const allMessages = [...localMessages, ...(wsMessages || [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Auto-clear old messages based on memory duration
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const cutoff = new Date(now.getTime() - memoryDuration * 60 * 1000);
      
      setLocalMessages(prev => 
        prev.filter(msg => new Date(msg.timestamp) > cutoff)
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [memoryDuration]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const handleSendMessage = (messageData) => {
    const newMessage = {
      id: Date.now(),
      agent: 'user',
      text: messageData.text,
      mentions: messageData.mentions,
      replyTo: messageData.replyTo ? allMessages.find(m => m.id === messageData.replyTo) : null,
      timestamp: messageData.timestamp,
      status: 'sent',
      type: 'message'
    };

    setLocalMessages(prev => [...prev, newMessage]);

    // Simulate agent responses based on mentions
    setTimeout(() => {
      const responses = generateAgentResponses(messageData, newMessage);
      setLocalMessages(prev => [...prev, ...responses]);
    }, 1000);
  };

  const generateAgentResponses = (messageData, userMessage) => {
    const responses = [];
    const mentionedAgents = messageData.mentions.includes('everybody') 
      ? ['scout94', 'doctor', 'auditor', 'screenshot', 'backend', 'frontend']
      : messageData.mentions;

    mentionedAgents.forEach((agentId, index) => {
      const agentResponses = {
        'scout94': 'Got it! I\'ll coordinate the team for comprehensive testing.',
        'doctor': 'Running health diagnostics on the system now...',
        'auditor': 'I\'ll analyze the code quality and security aspects.',
        'screenshot': 'Standing by to capture visual evidence of all tests.',
        'backend': 'Ready to test all API endpoints and server responses.',
        'frontend': 'I\'ll validate UI components and user experience.',
      };

      responses.push({
        id: Date.now() + index + 1,
        agent: agentId,
        text: agentResponses[agentId] || `Understood. Working on your request.`,
        replyTo: userMessage,
        timestamp: new Date(Date.now() + (index + 1) * 500),
        type: 'message'
      });
    });

    return responses;
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const handleClearMemory = () => {
    setLocalMessages([
      {
        id: Date.now(),
        agent: 'scout94',
        text: 'Memory cleared. Starting fresh!',
        timestamp: new Date(),
        type: 'message'
      }
    ]);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900/50 to-blue-900/50">
      {/* Chat Header */}
      <div className="glassmorphism-dark border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageIcon className="w-6 h-6 text-blue-400" />
            Agent Communication
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Interactive group chat with AI testing team
          </p>
        </div>
        <button
          onClick={() => setShowMemorySettings(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition"
          title="Memory Settings"
        >
          <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {allMessages.map((message) => (
            <ChatBubble 
              key={message.id} 
              message={message} 
              onReply={handleReply}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      <div className="border-t border-white/10 px-6 py-3">
        <CommandButtons 
          onCommand={(cmd) => {
            setLocalMessages(prev => [...prev, {
              id: Date.now(),
              agent: 'user',
              text: cmd,
              mentions: ['scout94'],
              timestamp: new Date(),
              type: 'command'
            }]);
          }}
          onTestResult={(result) => {
            const agent = getAgentForTest(result.testType);
            const newMessages = [];
            
            newMessages.push({
              id: Date.now(),
              agent,
              text: `🚀 Executing ${result.testType} test...`,
              timestamp: new Date(),
              type: 'message'
            });
            
            if (result.output) {
              const lines = result.output.split('\n');
              lines.forEach((line, index) => {
                const trimmed = line.trim();
                if (trimmed.length > 0) {
                  let lineAgent = agent;
                  if (trimmed.includes('✅') || trimmed.includes('PASSED')) {
                    lineAgent = 'doctor';
                  } else if (trimmed.includes('❌') || trimmed.includes('FAILED')) {
                    lineAgent = 'auditor';
                  } else if (trimmed.includes('screenshot')) {
                    lineAgent = 'screenshot';
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
            
            setLocalMessages(prev => [...prev, ...newMessages]);
          }}
        />
      </div>

      {/* Chat Input */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {/* Memory Settings Modal */}
      <MemorySettings
        isOpen={showMemorySettings}
        onClose={() => setShowMemorySettings(false)}
        currentDuration={memoryDuration}
        onDurationChange={setMemoryDuration}
        onClearMemory={handleClearMemory}
      />
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
