import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, X } from 'lucide-react';

const memoryDurations = [
  { value: 60, label: '1 Hour' },
  { value: 360, label: '6 Hours' },
  { value: 720, label: '12 Hours' },
  { value: 1440, label: '24 Hours' },
  { value: 10080, label: '7 Days' },
];

export default function MemorySettings({ isOpen, onClose, currentDuration, onDurationChange, onClearMemory }) {
  const [selectedDuration, setSelectedDuration] = useState(currentDuration);

  const handleSave = () => {
    onDurationChange(selectedDuration);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-purple-600/20">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Chat Memory Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Memory Retention Duration
              </label>
              <div className="space-y-2">
                {memoryDurations.map((duration) => (
                  <motion.button
                    key={duration.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDuration(duration.value)}
                    className={`w-full px-4 py-3 rounded-lg border transition flex items-center justify-between ${
                      selectedDuration === duration.value
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-700/50 border-white/10 hover:bg-slate-700'
                    }`}
                  >
                    <span className="font-medium">{duration.label}</span>
                    {selectedDuration === duration.value && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Clear Memory */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  if (confirm('Clear all chat history and memory? This cannot be undone.')) {
                    onClearMemory();
                    onClose();
                  }
                }}
                className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg flex items-center justify-center gap-2 transition font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Memory
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                This will delete all conversation history and reset agent memories
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-slate-900/50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
