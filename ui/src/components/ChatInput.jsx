import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AtSign, Clock } from 'lucide-react';

const agents = [
  { id: 'scout94', name: 'Scout94', emoji: '🚀', color: 'blue' },
  { id: 'doctor', name: 'Health Doctor', emoji: '🩺', color: 'green' },
  { id: 'auditor', name: 'Code Auditor', emoji: '📊', color: 'orange' },
  { id: 'screenshot', name: 'Screenshotter', emoji: '📸', color: 'purple' },
  { id: 'backend', name: 'Backend Tester', emoji: '⚙️', color: 'gray' },
  { id: 'frontend', name: 'Frontend Tester', emoji: '🎨', color: 'pink' },
  { id: 'nurse', name: 'Maintenance', emoji: '💉', color: 'cyan' },
];

export default function ChatInput({ onSendMessage, replyingTo, onCancelReply }) {
  const [message, setMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedMention, setSelectedMention] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Check for @ mentions
    const lastAtIndex = message.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === message.length - 1) {
      setShowMentions(true);
      setMentionSearch('');
    } else if (lastAtIndex !== -1) {
      const searchTerm = message.slice(lastAtIndex + 1);
      if (!searchTerm.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(searchTerm.toLowerCase());
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [message]);

  const handleMentionSelect = (agent) => {
    const lastAtIndex = message.lastIndexOf('@');
    const newMessage = message.slice(0, lastAtIndex) + `@${agent.id} `;
    setMessage(newMessage);
    setShowMentions(false);
    setSelectedMention(agent);
    inputRef.current?.focus();
  };

  const handleSend = () => {
    if (message.trim()) {
      // Extract mentions
      const mentions = [];
      const mentionRegex = /@(\w+)/g;
      let match;
      while ((match = mentionRegex.exec(message)) !== null) {
        mentions.push(match[1]);
      }

      onSendMessage({
        text: message,
        mentions: mentions.length > 0 ? mentions : ['everybody'],
        replyTo: replyingTo?.id || null,
        timestamp: new Date(),
      });

      setMessage('');
      setSelectedMention(null);
      if (onCancelReply) onCancelReply();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(mentionSearch) ||
    agent.id.toLowerCase().includes(mentionSearch)
  );

  return (
    <div className="relative">
      {/* Replying To Banner */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 bg-blue-600/20 border-t border-blue-500/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-400">Replying to</span>
              <span className="font-semibold">{replyingTo.agent}</span>
              <span className="text-gray-400 truncate max-w-xs">{replyingTo.text}</span>
            </div>
            <button
              onClick={onCancelReply}
              className="text-gray-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mention Suggestions */}
      <AnimatePresence>
        {showMentions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 bg-slate-800 border border-white/10 rounded-t-lg shadow-xl max-h-48 overflow-y-auto"
          >
            <div className="p-2 space-y-1">
              {/* Everybody option */}
              <button
                onClick={() => handleMentionSelect({ id: 'everybody', name: 'Everybody', emoji: '👥' })}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition text-left"
              >
                <span className="text-2xl">👥</span>
                <div>
                  <div className="font-semibold">@everybody</div>
                  <div className="text-xs text-gray-400">Message all agents</div>
                </div>
              </button>

              {/* Individual agents */}
              {filteredAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleMentionSelect(agent)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition text-left"
                >
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <div className="font-semibold">@{agent.id}</div>
                    <div className="text-xs text-gray-400">{agent.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex items-end gap-2 p-3 bg-slate-800/50">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type @ to mention an agent, or just chat with @everybody..."
            className="w-full bg-slate-700/50 border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
          <button
            onClick={() => {
              setMessage(message + '@');
              setShowMentions(true);
            }}
            className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
          >
            <AtSign className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Mention Indicator */}
      {selectedMention && (
        <div className="px-4 py-1 bg-blue-600/10 border-t border-blue-500/20 text-xs text-blue-400 flex items-center gap-2">
          <span>Messaging:</span>
          <span className="font-semibold">{selectedMention.emoji} {selectedMention.name}</span>
        </div>
      )}
    </div>
  );
}
