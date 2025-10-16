/**
 * SettingsModal - Main admin settings panel container
 * 
 * Purpose: Comprehensive configuration interface for Scout94
 * Based on: ADMIN_SETTINGS_PANEL_TODO.md (200+ settings)
 * 
 * Structure:
 * - Sidebar navigation (12 sections)
 * - Dynamic content area
 * - Save/Reset/Close controls
 * - Search functionality
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, RotateCcw, Search, Settings as SettingsIcon,
  Wrench, Bot, Beaker, Scan, Brain, FileText, Shield, 
  Palette, Database, Network, Sliders, SearchIcon
} from 'lucide-react';
import configManager from '../../utils/configManager';

// Import section components
import GeneralSettings from './sections/GeneralSettings';
import AgentSettings from './sections/AgentSettings';
import TestingSettings from './sections/TestingSettings';
import AnalysisSettings from './sections/AnalysisSettings';
import LLMSettings from './sections/LLMSettings';
import ReportingSettings from './sections/ReportingSettings';
import SecuritySettings from './sections/SecuritySettings';
import UISettings from './sections/UISettings';
import StorageSettings from './sections/StorageSettings';
import CommunicationSettings from './sections/CommunicationSettings';
import AdvancedSettings from './sections/AdvancedSettings';
import SearchSettings from './sections/SearchSettings';

const SECTIONS = [
  { id: 'general', label: 'General', icon: Wrench },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'testing', label: 'Testing', icon: Beaker },
  { id: 'analysis', label: 'Analysis', icon: Scan },
  { id: 'llm', label: 'LLMs', icon: Brain },
  { id: 'reporting', label: 'Reports', icon: FileText },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'ui', label: 'UI/UX', icon: Palette },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'communication', label: 'Communication', icon: Network },
  { id: 'advanced', label: 'Advanced', icon: Sliders },
  { id: 'search', label: 'Search', icon: SearchIcon }
];

export default function SettingsModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('general');
  const [config, setConfig] = useState(configManager.config);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

  // Subscribe to config changes
  useEffect(() => {
    const unsubscribe = configManager.subscribe((newConfig) => {
      setConfig(newConfig);
    });
    return unsubscribe;
  }, []);

  // Handle config updates
  const handleConfigChange = (path, value) => {
    configManager.set(path, value);
    setHasUnsavedChanges(true);
  };

  // Save configuration
  const handleSave = () => {
    setSaveStatus('saving');
    const result = configManager.saveConfig();
    
    if (result.success) {
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus(null), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Reset entire config
  const handleResetAll = () => {
    if (confirm('Reset ALL settings to defaults? This cannot be undone.')) {
      configManager.resetAll();
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  // Reset current section
  const handleResetSection = () => {
    if (confirm(`Reset ${activeSection} settings to defaults?`)) {
      configManager.resetSection(activeSection);
      setHasUnsavedChanges(false);
    }
  };

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Close anyway?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Render active section component
  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralSettings config={config} onChange={handleConfigChange} />;
      case 'agents':
        return <AgentSettings config={config} onChange={handleConfigChange} />;
      case 'testing':
        return <TestingSettings config={config} onChange={handleConfigChange} />;
      case 'analysis':
        return <AnalysisSettings config={config} onChange={handleConfigChange} />;
      case 'llm':
        return <LLMSettings config={config} onChange={handleConfigChange} />;
      case 'reporting':
        return <ReportingSettings config={config} onChange={handleConfigChange} />;
      case 'security':
        return <SecuritySettings config={config} onChange={handleConfigChange} />;
      case 'ui':
        return <UISettings config={config} onChange={handleConfigChange} />;
      case 'storage':
        return <StorageSettings config={config} onChange={handleConfigChange} />;
      case 'communication':
        return <CommunicationSettings config={config} onChange={handleConfigChange} />;
      case 'advanced':
        return <AdvancedSettings config={config} onChange={handleConfigChange} />;
      case 'search':
        return <SearchSettings config={config} onChange={handleConfigChange} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-lg font-semibold mb-2">Unknown Section</p>
              <p className="text-sm">{activeSection}</p>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-7xl h-[90vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-blue-400" />
              <div>
                <h2 id="settings-modal-title" className="text-xl font-bold text-white">Scout94 Settings</h2>
                <p className="text-xs text-gray-400">
                  {configManager.getSummary().totalSettings} configurable parameters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Save Status */}
              {saveStatus && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-sm font-medium ${
                    saveStatus === 'saved' ? 'text-green-400' :
                    saveStatus === 'saving' ? 'text-blue-400' :
                    'text-red-400'
                  }`}
                >
                  {saveStatus === 'saved' && '✅ Saved'}
                  {saveStatus === 'saving' && '⏳ Saving...'}
                  {saveStatus === 'error' && '❌ Error'}
                </motion.span>
              )}

              {/* Unsaved changes indicator */}
              {hasUnsavedChanges && !saveStatus && (
                <span className="text-xs text-orange-400">
                  • {Object.keys(config).length} changes
                </span>
              )}

              {/* Action Buttons */}
              <button
                onClick={handleResetSection}
                aria-label="Reset current section to defaults"
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition flex items-center gap-1"
                title="Reset current section"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset Section</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                aria-label="Save all changes"
                className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition font-semibold flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              <button
                onClick={handleClose}
                aria-label="Close settings panel"
                className="p-1.5 hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-56 border-r border-gray-700 bg-gray-900/50 overflow-y-auto">
              <div className="p-3 space-y-1">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="p-3 border-t border-gray-700 mt-4">
                <button
                  onClick={handleResetAll}
                  className="w-full px-3 py-2 text-xs text-red-400 hover:bg-red-900/20 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset All to Defaults
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-900 to-gray-950">
              {renderSection()}
            </div>
          </div>

          {/* Footer Status Bar */}
          <div className="px-6 py-2 border-t border-gray-700 bg-gray-900/50 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>Version: {config.version}</span>
              <span>Mode: {config.general.executionMode}</span>
              <span>LLM: {config.llm.primary}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Last saved: {localStorage.getItem('scout94_last_save') || 'Never'}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
