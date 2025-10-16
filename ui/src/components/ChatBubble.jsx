import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Clock, Check, CheckCheck, ChevronDown, ChevronUp, Code, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const [isExpanded, setIsExpanded] = useState(true);
  const colorClass = agentColors[message.agent] || 'from-gray-600 to-gray-700';
  const emoji = agentEmojis[message.agent] || '🤖';
  
  // Detect if message is long (for collapsible feature)
  const isLongMessage = message.text && message.text.length > 500;
  
  // Detect if message contains markdown indicators
  const hasMarkdown = message.text && (
    message.text.includes('```') || 
    message.text.includes('##') || 
    message.text.includes('|') ||
    message.text.includes('- ') ||
    message.contentType === 'markdown'
  );

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
          className={`relative inline-block max-w-3xl px-4 py-3 rounded-2xl shadow-lg ${
            message.agent === 'user'
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white'
              : 'glassmorphism-light text-gray-100'
          } ${
            message.type === 'error' ? 'border-2 border-red-500/50' : ''
          } ${
            message.type === 'success' ? 'border-2 border-green-500/50' : ''
          }`}
        >
          {/* Collapse/Expand Button for long messages */}
          {isLongMessage && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/20 rounded-lg transition"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          
          {/* Message Content */}
          <div className={`${
            isLongMessage && !isExpanded ? 'max-h-24 overflow-hidden relative' : ''
          }`}>
            {hasMarkdown ? (
              <div className="markdown-content text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg my-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-2">
                          <table className="min-w-full border border-white/20 rounded-lg">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border border-white/20 bg-white/10 px-3 py-2 text-left text-xs font-semibold">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border border-white/20 px-3 py-2 text-xs">
                          {children}
                        </td>
                      );
                    },
                    a({ children, href }) {
                      return (
                        <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-blue-500 pl-3 my-2 italic text-gray-300">
                          {children}
                        </blockquote>
                      );
                    },
                    h1({ children }) {
                      return <h1 className="text-xl font-bold mt-3 mb-2">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
                    },
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
            )}
            
            {/* Fade overlay for collapsed long messages */}
            {isLongMessage && !isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-800/90 to-transparent pointer-events-none" />
            )}
          </div>

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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 rounded-lg overflow-hidden border border-white/20 shadow-lg"
            >
              <img
                src={message.screenshot}
                alt="Test screenshot"
                className="w-full h-auto max-h-96 object-contain bg-black/50 cursor-pointer hover:scale-105 transition"
                onClick={() => window.open(message.screenshot, '_blank')}
              />
              <div className="bg-black/40 px-3 py-1.5 text-xs text-gray-400">
                🖼️ Click to view full size
              </div>
            </motion.div>
          )}
          
          {/* Code Block Preview (for inline code) */}
          {message.code && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3"
            >
              <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                <Code className="w-3 h-3" />
                <span>{message.codeLanguage || 'code'}</span>
              </div>
              <SyntaxHighlighter
                language={message.codeLanguage || 'javascript'}
                style={vscDarkPlus}
                className="rounded-lg text-xs"
              >
                {message.code}
              </SyntaxHighlighter>
            </motion.div>
          )}
          
          {/* File Attachments */}
          {message.files && message.files.length > 0 && (
            <div className="mt-3 space-y-1">
              {message.files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-white/5 px-3 py-2 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="flex-1">{file.name}</span>
                  <span className="text-gray-400">{file.size}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Status Badges */}
          {message.type === 'success' && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" />
              <span>Success</span>
            </div>
          )}
          {message.type === 'error' && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
              <span>⚠️ Error</span>
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
                } -bottom-3 p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition z-10`}
                title="Reply to this message"
              >
                <Reply className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Expand collapsed message button */}
          {isLongMessage && !isExpanded && (
            <div className="mt-2 text-center">
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Show full message
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
