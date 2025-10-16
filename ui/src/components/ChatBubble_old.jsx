import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const agentStyles = {
  scout94: { color: 'from-blue-600 to-blue-700', glow: 'agent-glow-scout', emoji: '🚀' },
  doctor: { color: 'from-green-600 to-green-700', glow: 'agent-glow-doctor', emoji: '🩺' },
  auditor: { color: 'from-orange-600 to-orange-700', glow: 'agent-glow-auditor', emoji: '📊' },
  screenshot: { color: 'from-purple-600 to-purple-700', glow: 'agent-glow-screenshot', emoji: '📸' },
  screenshotter: { color: 'from-purple-600 to-purple-700', glow: 'agent-glow-screenshot', emoji: '📸' }, // Alias
  backend: { color: 'from-gray-600 to-gray-700', glow: 'agent-glow-backend', emoji: '⚙️' },
  frontend: { color: 'from-cyan-600 to-cyan-700', glow: 'agent-glow-frontend', emoji: '🎨' },
  nurse: { color: 'from-pink-600 to-pink-700', glow: 'agent-glow-nurse', emoji: '💉' },
  user: { color: 'from-slate-600 to-slate-700', glow: '', emoji: '👤' },
};

export default function ChatBubble({ message }) {
  const style = agentStyles[message.agent];
  
  // Log warning if agent not recognized (don't fallback silently)
  if (!style) {
    console.warn(`Unknown agent: ${message.agent}. Available agents:`, Object.keys(agentStyles));
    return null; // Don't render unknown agents
  }
  
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
      <div className={`flex-1 min-w-0 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-300 capitalize">{message.agent}</span>
          <span className="text-[10px] text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`glassmorphism rounded-2xl px-4 py-3 max-w-full overflow-hidden ${
            message.type === 'success' ? 'border-green-500 border-2' :
            message.type === 'error' ? 'border-red-500 border-2' :
            'border-white/10'
          } ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
        >
          {/* Rich Markdown Content */}
          {message.contentType === 'markdown' || message.text?.includes('```') || message.text?.includes('##') ? (
            <div className="markdown-content prose prose-invert prose-sm max-w-none">
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
                        className="rounded-md my-2 text-xs overflow-x-auto"
                        customStyle={{
                          margin: '0.5rem 0',
                          padding: '1rem',
                          fontSize: '0.85rem',
                          maxWidth: '100%'
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-300 text-xs font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-2 text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1 text-gray-200">{children}</h3>,
                  p: ({ children }) => <p className="text-sm leading-relaxed mb-2 break-words">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 text-sm">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-sm">{children}</ol>,
                  li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="min-w-full text-xs border border-gray-600 rounded">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-gray-700">{children}</thead>,
                  tbody: ({ children }) => <tbody className="bg-gray-800/50">{children}</tbody>,
                  tr: ({ children }) => <tr className="border-b border-gray-600">{children}</tr>,
                  th: ({ children }) => <th className="px-3 py-2 text-left font-semibold">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-2">{children}</td>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-3 py-1 my-2 text-gray-300 italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  img: ({ src, alt }) => (
                    <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-2" />
                  ),
                  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
          )}
          
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
