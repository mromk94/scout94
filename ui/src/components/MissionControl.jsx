import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Activity, MessageSquare, FileText, Play, Settings, Code, Camera, Square, FolderOpen } from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
import CommandButtons from './CommandButtons';
import ChatPane from './ChatPane';
import IDEPane from './IDEPane';
import ProjectSelector from './ProjectSelector';
import AgentBar from './AgentBar';
import ImageViewer from './ImageViewer';
import SettingsModal from './settings/SettingsModal';
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
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const chatInputRef = React.useRef(null);
  
  // Resizable panels state
  const [idePaneWidth, setIdePaneWidth] = useState(50); // percentage
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);

  useEffect(() => {
    localStorage.setItem('scout94_project_path', projectPath);
  }, [projectPath]);

  // Handle panel resize
  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingDivider(true);
  };

  const handleMouseMove = (e) => {
    if (isDraggingDivider && activeTab === 'split') {
      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      
      // Constrain between 30% and 70%
      if (newWidth >= 30 && newWidth <= 70) {
        setIdePaneWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDraggingDivider(false);
  };

  useEffect(() => {
    if (isDraggingDivider) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingDivider]);

  const handleProjectChange = (newPath) => {
    setProjectPath(newPath);
    setShowProjectSelector(false);
    // Send project change to backend
    if (sendCommand && sendCommand.sendChat) {
      sendCommand.sendChat(`PROJECT_CHANGE:${newPath}`);
    }
  };
  
  const handleAgentClick = (agentId) => {
    // Trigger @ mention in chat
    if (chatInputRef.current) {
      chatInputRef.current.insertAgentMention(`@${agentId}`);
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

          {/* Project Selector Button */}
          <button
            onClick={() => setShowProjectSelector(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-semibold text-sm transition shadow-lg"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden md:inline">Change Project</span>
          </button>

          {/* Screenshot Button */}
          <button
            onClick={() => loadScreenshots()}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title="View Screenshots"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Connection Status */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            isConnected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>

          {/* Settings */}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Agent Status Bar - Hide when modal is open */}
      {!showProjectSelector && <AgentBar isRunning={isRunning} onAgentClick={handleAgentClick} />}

      {/* Main Content Area - Split or Single View */}
      <div 
        className="flex-1 flex overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDraggingDivider ? 'col-resize' : 'default' }}
      >
        {(activeTab === 'ide' || activeTab === 'split') && (
          <div 
            className={activeTab === 'split' ? 'bg-slate-950/90 overflow-hidden' : 'w-full bg-slate-950/90 overflow-hidden'}
            style={activeTab === 'split' ? { width: `${idePaneWidth}%`, minWidth: '300px' } : {}}
          >
            <IDEPane isRunning={isRunning} messages={messages} projectPath={projectPath} />
          </div>
        )}
        
        {/* Resizable Divider Bar */}
        {activeTab === 'split' && (
          <div 
            className="w-1.5 flex-shrink-0 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50 hover:w-2 transition-all cursor-col-resize"
            onMouseDown={handleDividerMouseDown}
          />
        )}
        
        {(activeTab === 'chat' || activeTab === 'split') && (
          <div 
            className={activeTab === 'split' ? 'bg-indigo-950/90 overflow-hidden' : 'w-full bg-indigo-950/90 overflow-hidden'}
            style={activeTab === 'split' ? { width: `${100 - idePaneWidth}%`, minWidth: '300px' } : {}}
          >
            <ChatPane 
              ref={chatInputRef}
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

      {/* Project Selector Modal */}
      {showProjectSelector && (
        <ProjectSelector 
          currentProject={projectPath}
          onProjectChange={handleProjectChange}
          onClose={() => setShowProjectSelector(false)}
        />
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewer 
          screenshots={screenshots}
          onClose={() => setShowImageViewer(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
