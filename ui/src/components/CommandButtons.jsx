import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

const commands = [
  { id: 'all', label: '🚀 Run All Tests', color: 'bg-blue-600 hover:bg-blue-700', testType: 'all' },
  { id: 'visual', label: '📸 Visual Test', color: 'bg-purple-600 hover:bg-purple-700', testType: 'visual' },
  { id: 'routing', label: '🔍 Test Routes', color: 'bg-green-600 hover:bg-green-700', testType: 'routing' },
  { id: 'audit', label: '📊 Run Audit', color: 'bg-orange-600 hover:bg-orange-700', testType: 'audit' },
  { id: 'visitor', label: '👥 Visitor Journey', color: 'bg-emerald-600 hover:bg-emerald-700', testType: 'visitor' },
  { id: 'user', label: '🔐 User Journey', color: 'bg-cyan-600 hover:bg-cyan-700', testType: 'user' },
];

export default function CommandButtons({ onCommand, onTestResult }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [runningTest, setRunningTest] = useState(null);

  const handleRunTest = async (cmd) => {
    setRunningTest(cmd.id);
    
    try {
      console.log(`🚀 Running REAL test: ${cmd.testType}`);
      
      // REAL Tauri command - runs actual PHP tests
      const result = await invoke('run_scout94_test', {
        projectPath: '/Users/mac/CascadeProjects/Viz Venture Group',
        testType: cmd.testType
      });
      
      console.log('✅ Real test result:', result);
      
      // Send REAL result to chat
      if (onTestResult) {
        onTestResult({
          success: result.success,
          output: result.output,
          error: result.error,
          testType: cmd.testType
        });
      }
      
      // Notify via WebSocket - real backend will process
      onCommand(`📊 ${cmd.label} completed - ${result.success ? 'PASSED' : 'FAILED'}`);
      
    } catch (error) {
      console.error('❌ Real test error:', error);
      if (onTestResult) {
        onTestResult({
          success: false,
          output: '',
          error: error.toString(),
          testType: cmd.testType
        });
      }
    } finally {
      setRunningTest(null);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition"
      >
        <span className="font-semibold">QUICK COMMANDS</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            {commands.map((cmd) => (
              <motion.button
                key={cmd.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRunTest(cmd)}
                disabled={runningTest === cmd.id}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${cmd.color} transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative`}
              >
                {runningTest === cmd.id && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="animate-spin">⏳</span>
                  </span>
                )}
                <span className={runningTest === cmd.id ? 'opacity-0' : ''}>
                  {cmd.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
