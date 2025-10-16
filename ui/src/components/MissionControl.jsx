import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Activity, MessageSquare, FileText, Play, Settings, Code, Camera, Square } from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
import CommandButtons from './CommandButtons';
import ChatPane from './ChatPane';
import IDEPane from './IDEPane';
import ProjectSelector from './ProjectSelector';
import AgentBar from './AgentBar';
import ImageViewer from './ImageViewer';
import { invoke } from '@tauri-apps/api/core';

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState('split'); // 'ide', 'chat', 'split'
  const [projectPath, setProjectPath] = useState(
    localStorage.getItem('scout94_project_path') || '/Users/mac/CascadeProjects/Viz Venture Group'
  );
  const { messages, isConnected, isRunning, sendCommand, clearMessages } = useWebSocket();
  const [screenshots, setScreenshots] = useState([]);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentReportPath, setCurrentReportPath] = useState(null);

  useEffect(() => {
    localStorage.setItem('scout94_project_path', projectPath);
  }, [projectPath]);

  const handleProjectChange = (newPath) => {
    setProjectPath(newPath);
    // Send project change to backend
    if (sendCommand && sendCommand.sendChat) {
      sendCommand.sendChat(`PROJECT_CHANGE:${newPath}`);
    }
  };

  // Load screenshots from project directory
  const loadScreenshots = async () => {
    try {
      const paths = await invoke('list_screenshots', { 
        projectPath: projectPath
      });
      setScreenshots(paths);
      if (paths.length > 0) {
        setShowImageViewer(true);
      }
    } catch (error) {
      console.error('Failed to load screenshots:', error);
    }
  };

  // Parse test output for report path
  const parseReportPath = (output) => {
    const match = output.match(/REPORT_PATH:(.+)/);
    if (match) {
      return match[1].trim();
    }
    return null;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Header */}
      <header className="glassmorphism-dark border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: isRunning ? 360 : 0 }}
            transition={{ duration: 2, repeat: isRunning ? Infinity : 0, ease: "linear" }}
            className="text-3xl"
          >
            🚀
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-glow">SCOUT94 Mission Control</h1>
            <p className="text-sm text-gray-400">Real-time Testing Interface</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex gap-1 bg-black/30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('ide')}
              className={`px-4 py-2 rounded-md transition ${
                activeTab === 'ide' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-4 py-2 rounded-md transition ${
                activeTab === 'split' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex gap-1">
                <Code className="w-4 h-4" />
                <MessageSquare className="w-4 h-4" />
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-md transition ${
                activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <ProjectSelector 
              currentProject={projectPath}
              onProjectChange={handleProjectChange}
            />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isConnected ? 'bg-green-600/20 border border-green-500/50' : 'bg-red-600/20 border border-red-500/50'}`}>
              <Activity className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-red-400'} ${isConnected ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-semibold">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          {/* Run Controls */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isRunning) {
                clearMessages();
              } else {
                sendCommand('🚀 Run All Tests');
              }
            }}
            disabled={!isConnected}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${
              !isConnected
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                Stop Test
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Run Scout94
              </>
            )}
          </motion.button>

          <button
            onClick={() => loadScreenshots()}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title="View Screenshots"
          >
            <Camera className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Agent Status Bar */}
      <AgentBar isRunning={isRunning} />

      {/* Main Content Area - Split or Single View */}
      <div className="flex-1 flex overflow-hidden">
        {(activeTab === 'ide' || activeTab === 'split') && (
          <div className={activeTab === 'split' ? 'w-1/2 bg-slate-950/90 overflow-hidden' : 'w-full bg-slate-950/90 overflow-hidden'}>
            <IDEPane isRunning={isRunning} messages={messages} />
          </div>
        )}
        
        {/* THICK Vertical Divider Bar */}
        {activeTab === 'split' && (
          <div className="w-1.5 flex-shrink-0 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50"></div>
        )}
        
        {(activeTab === 'chat' || activeTab === 'split') && (
          <div className={activeTab === 'split' ? 'w-1/2 bg-indigo-950/90 overflow-hidden' : 'w-full bg-indigo-950/90 overflow-hidden'}>
            <ChatPane 
              isRunning={isRunning} 
              messages={messages} 
              sendCommand={sendCommand} 
              clearMessages={clearMessages}
              onTestComplete={(output) => {
                const reportPath = parseReportPath(output);
                if (reportPath) {
                  setCurrentReportPath(reportPath);
                  // Auto-open in IDE
                  if (window.openFileInIDE) {
                    window.openFileInIDE(reportPath);
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Screenshot Viewer Modal */}
      {showImageViewer && (
        <ImageViewer 
          screenshots={screenshots}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
}
