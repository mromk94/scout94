import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileCode, Copy, Check } from 'lucide-react';

export default function FileDiffViewer({ file, onClose, onReference }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReference = () => {
    const reference = `[${file.name}:${file.path}]`;
    if (onReference) onReference(reference, file);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCode className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-bold">{file.name}</h3>
              <p className="text-xs text-gray-400">{file.path}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleReference}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition"
            >
              Reference in Chat
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e]">
          {file.diff ? (
            <DiffView diff={file.diff} />
          ) : (
            <CodeView content={file.content} language={file.language} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DiffView({ diff }) {
  return (
    <div className="font-mono text-sm">
      {diff.map((line, index) => {
        let bgColor = '';
        let textColor = 'text-gray-300';
        let icon = '';

        if (line.type === 'added') {
          bgColor = 'bg-green-900/30 border-l-4 border-green-500';
          textColor = 'text-green-200';
          icon = '+';
        } else if (line.type === 'removed') {
          bgColor = 'bg-red-900/30 border-l-4 border-red-500';
          textColor = 'text-red-200';
          icon = '-';
        } else if (line.type === 'context') {
          bgColor = 'bg-transparent';
          icon = ' ';
        }

        return (
          <div
            key={index}
            className={`px-4 py-1 ${bgColor} ${textColor} flex items-start gap-3 hover:bg-white/5`}
          >
            <span className="text-gray-500 select-none w-12 text-right">
              {line.lineNumber || ''}
            </span>
            <span className="text-gray-500 select-none w-4">{icon}</span>
            <span className="flex-1 whitespace-pre">{line.content}</span>
          </div>
        );
      })}
    </div>
  );
}

function CodeView({ content, language }) {
  const lines = content.split('\n');

  return (
    <div className="font-mono text-sm">
      {lines.map((line, index) => (
        <div
          key={index}
          className="px-4 py-1 hover:bg-white/5 flex items-start gap-3 text-gray-300"
        >
          <span className="text-gray-500 select-none w-12 text-right">
            {index + 1}
          </span>
          <span className="flex-1 whitespace-pre">{line}</span>
        </div>
      ))}
    </div>
  );
}
