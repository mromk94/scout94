import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubble from './ChatBubble_old';
import CommandButtons from './CommandButtons';
import { Square } from 'lucide-react';

const agents = ['doctor', 'auditor', 'screenshot', 'backend', 'frontend', 'nurse', 'scout94', 'everybody'];

const ChatPane = forwardRef(({ isRunning, messages, sendCommand, clearMessages, onTestComplete }, ref) => {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [conversationMessages, setConversationMessages] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [conversationContext, setConversationContext] = useState([]);

  // Expose method to insert agent mention
  useImperativeHandle(ref, () => ({
    insertAgentMention: (mention) => {
      setInputValue(prev => prev + (prev ? ' ' : '') + mention + ' ');
      inputRef.current?.focus();
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, conversationMessages]);

  // Combine WebSocket messages with conversation messages
  const allMessages = [...(messages || []), ...conversationMessages].sort(
    (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
  );

  // Handle @mention detection
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    const lastWord = value.split(' ').pop();
    if (lastWord.startsWith('@')) {
      const filter = lastWord.slice(1).toLowerCase();
      setMentionFilter(filter);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const filteredAgents = agents.filter(agent => 
    agent.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const handleMentionSelect = (agent) => {
    const words = inputValue.split(' ');
    words[words.length - 1] = `@${agent}`;
    setInputValue(words.join(' ') + ' ');
    setShowMentions(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message to local display
    const userMsg = {
      id: Date.now(),
      agent: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setConversationMessages(prev => [...prev, userMsg]);
    
    // Add to conversation context for tracking
    const newContext = [...conversationContext, { role: 'user', content: inputValue }].slice(-10);
    setConversationContext(newContext);
    
    // Send as CHAT MESSAGE, not test command
    // WebSocket will handle conversation vs test logic
    if (sendCommand.sendChat) {
      sendCommand.sendChat(inputValue);
    }
    
    setInputValue('');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900/50 to-blue-900/50 overflow-hidden">
      {/* Chat Header */}
      <div className="glassmorphism-dark border-b border-white/10 px-6 py-4 flex-shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageIcon className="w-6 h-6 text-blue-400" />
          Agent Communication
        </h2>
        <p className="text-sm text-gray-400 mt-1">Real-time testing updates from your AI team</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {allMessages && allMessages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Command Input Area */}
      <div className="glassmorphism-dark border-t-2 border-purple-500/20">
        {/* Control Buttons when running */}
        {isRunning && (
          <div className="p-4 border-b border-white/10 flex justify-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                isPaused 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {isPaused ? (
                <>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Resume Tests
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                  Pause Tests
                </>
              )}
            </button>
            <button
              onClick={() => {
                // Actually stop the running tests
                if (sendCommand.stopTests) {
                  sendCommand.stopTests();
                }
                clearMessages();
                setConversationMessages([]);
                setIsPaused(false);
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Square className="w-4 h-4 fill-white" />
              Stop All Tests
            </button>
          </div>
        )}
        
        <CommandButtons 
          onCommand={sendCommand}
          onTestResult={(result) => {
            console.log('Test result:', result);
          }}
        />
        
        {/* Chat Input with @mention autocomplete */}
        <div className="p-4 border-t border-white/10 relative">
          {/* Mention Dropdown */}
          {showMentions && filteredAgents.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-blue-500/30 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
              {filteredAgents.map(agent => (
                <button
                  key={agent}
                  onClick={() => handleMentionSelect(agent)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-600/20 transition flex items-center gap-2"
                >
                  <span className="text-lg">
                    {agent === 'scout94' ? '🚀' : agent === 'doctor' ? '🩺' : 
                     agent === 'auditor' ? '📊' : agent === 'screenshot' ? '📸' :
                     agent === 'backend' ? '⚙️' : agent === 'frontend' ? '🎨' :
                     agent === 'nurse' ? '💉' : '👥'}
                  </span>
                  <span>@{agent}</span>
                </button>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message or @mention an agent..."
              className="flex-1 bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !showMentions) {
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💬 Type @ to mention agents | Status: {isRunning ? (isPaused ? '⏸️ Paused' : '🔄 Testing...') : '✅ Ready'} | Context: {conversationContext.length} messages
          </p>
        </div>
      </div>
    </div>
  );
});

export default ChatPane;

function MessageIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
