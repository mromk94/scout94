/**
 * GeneralSettings - Section 1 of admin settings
 * 
 * Covers: Project config, execution modes, performance tuning
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 1
 */

import PropTypes from 'prop-types';
import { FolderOpen } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import SettingToggle from '../SettingToggle';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';

function GeneralSettings({ config, onChange }) {
  const general = config.general;

  // Handle project path selection via existing Tauri command
  const handleBrowseProject = async () => {
    try {
      // Use existing Tauri command (defined in commands.rs line 81)
      const selectedPath = await invoke('select_project_folder');
      if (selectedPath) {
        onChange('general.projectPath', selectedPath);
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
      alert('Folder picker not yet fully implemented. You can type the path manually for now.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">General Settings</h3>
        <p className="text-sm text-gray-400">
          Project configuration, execution modes, and performance tuning
        </p>
      </div>

      {/* Project Configuration */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Project Configuration
        </h4>

        <div className="space-y-3">
          {/* Project Path */}
          <div>
            <label className="text-sm font-medium text-white mb-1 flex items-center gap-2">
              Project Path
              <button
                onClick={handleBrowseProject}
                aria-label="Browse and select project folder"
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1 transition"
                title="Select folder (Tauri command: select_project_folder)"
              >
                <FolderOpen className="w-3 h-3" />
                Browse
              </button>
            </label>
            <input
              type="text"
              value={general.projectPath}
              onChange={(e) => onChange('general.projectPath', e.target.value)}
              placeholder="/Users/mac/CascadeProjects/MyProject"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Uses Tauri command <code className="bg-gray-800 px-1 rounded">select_project_folder()</code> - currently returns default path
            </p>
          </div>

          <SettingInput
            label="Project Name"
            value={general.projectName}
            onChange={(val) => onChange('general.projectName', val)}
            placeholder="Auto-detected from path"
            helpText="Override auto-detected project name"
          />

          <SettingDropdown
            label="Primary Language"
            value={general.primaryLanguage}
            onChange={(val) => onChange('general.primaryLanguage', val)}
            options={[
              { value: 'auto-detect', label: 'Auto-detect' },
              { value: 'javascript', label: 'JavaScript' },
              { value: 'typescript', label: 'TypeScript' },
              { value: 'python', label: 'Python' },
              { value: 'php', label: 'PHP' },
              { value: 'ruby', label: 'Ruby' },
              { value: 'java', label: 'Java' },
              { value: 'csharp', label: 'C#' }
            ]}
            helpText="Affects analysis focus and code parsing"
          />

          <SettingDropdown
            label="Framework"
            value={general.framework}
            onChange={(val) => onChange('general.framework', val)}
            options={[
              { value: 'auto-detect', label: 'Auto-detect' },
              { value: 'react', label: 'React' },
              { value: 'vue', label: 'Vue.js' },
              { value: 'angular', label: 'Angular' },
              { value: 'nextjs', label: 'Next.js' },
              { value: 'laravel', label: 'Laravel' },
              { value: 'django', label: 'Django' },
              { value: 'rails', label: 'Ruby on Rails' },
              { value: 'express', label: 'Express' }
            ]}
            helpText="Auto-detected if possible"
          />

          <SettingToggle
            label="Auto-detect Technology Stack"
            value={general.autoDetectTechStack}
            onChange={(val) => onChange('general.autoDetectTechStack', val)}
            helpText="Automatically identify frameworks, libraries, and tools"
          />

          <SettingToggle
            label="Cache Project Structure"
            value={general.cacheProjectStructure}
            onChange={(val) => onChange('general.cacheProjectStructure', val)}
            helpText="Faster subsequent runs, may miss new files"
          />
        </div>
      </div>

      {/* Execution Mode */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400">
          Execution Mode
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Default Mode"
            value={general.executionMode}
            onChange={(val) => onChange('general.executionMode', val)}
            options={[
              { value: 'basic', label: 'Basic (Fast, no auditor)' },
              { value: 'audit', label: 'Audit (Recommended)' },
              { value: 'clinic', label: 'Clinic (Self-healing)' },
              { value: 'visual', label: 'Visual (UI testing)' },
              { value: 'comprehensive', label: 'Comprehensive (All phases)' }
            ]}
            helpText="Per RETRY_FLOWS_COMPLETE.md - Audit mode includes LLM review and auto-retry"
          />

          <SettingToggle
            label="Always Run in Background"
            value={general.autoRunBackground}
            onChange={(val) => onChange('general.autoRunBackground', val)}
            helpText="Daemon mode - terminal can be closed"
          />

          <SettingToggle
            label="Show Desktop Notifications"
            value={general.showDesktopNotifications}
            onChange={(val) => onChange('general.showDesktopNotifications', val)}
            helpText="Notify on test completion"
          />

          <SettingToggle
            label="Auto-open Reports in IDE"
            value={general.autoOpenReports}
            onChange={(val) => onChange('general.autoOpenReports', val)}
            helpText="Automatically display report after generation"
          />
        </div>
      </div>

      {/* Performance & Timeouts */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-green-400">
          Performance Tuning
        </h4>

        <div className="space-y-4">
          <SettingSlider
            label="Max Execution Time"
            value={general.maxExecutionTime}
            onChange={(val) => onChange('general.maxExecutionTime', val)}
            min={1}
            max={240}
            step={1}
            unit=" min"
            helpText="Prevents infinite runs"
            leftLabel="1m"
            rightLabel="240m"
          />

          <SettingDropdown
            label="Parallel Processes"
            value={general.parallelProcesses}
            onChange={(val) => onChange('general.parallelProcesses', parseInt(val))}
            options={[
              { value: '1', label: '1 (Sequential)' },
              { value: '2', label: '2' },
              { value: '4', label: '4 (Recommended)' },
              { value: '8', label: '8' },
              { value: '16', label: '16 (Max)' }
            ]}
            helpText="CPU cores to use for parallel test execution"
          />

          <SettingInput
            label="Memory Limit per Process"
            value={general.memoryLimitMB}
            onChange={(val) => onChange('general.memoryLimitMB', val)}
            type="number"
            unit="MB"
            min={512}
            max={8192}
            helpText="Prevents memory overflow"
          />

          <SettingToggle
            label="Aggressive Caching"
            value={general.aggressiveCaching}
            onChange={(val) => onChange('general.aggressiveCaching', val)}
            helpText="Faster but may miss changes"
          />

          <SettingToggle
            label="Prioritize Speed over Thoroughness"
            value={general.prioritizeSpeed}
            onChange={(val) => onChange('general.prioritizeSpeed', val)}
            helpText="Quick checks only, less comprehensive"
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Audit mode (recommended) provides the best balance of speed and quality. 
          Use Clinic mode for persistent failures.
        </p>
      </div>
    </div>
  );
}

GeneralSettings.propTypes = {
  config: PropTypes.shape({
    general: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default GeneralSettings;
