/**
 * StorageSettings - Section 9 of admin settings
 * 
 * Covers: Knowledge base, cache, logs, backups
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 9
 */

import PropTypes from 'prop-types';
import { Trash2, FolderOpen, Download } from 'lucide-react';
import SettingToggle from '../SettingToggle';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';

function StorageSettings({ config, onChange }) {
  const storage = config.storage;

  const handleClearCache = () => {
    if (confirm('Clear all cached data? This cannot be undone.')) {
      alert('Cache cleared! (This would delete .scout94_cache/ directory)');
    }
  };

  const handleViewLogs = () => {
    alert('Opening logs... (This would open .scout94.log file)');
  };

  const handleBackupNow = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    alert(`Creating backup: scout94-config-${timestamp}.json`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Storage & Data</h3>
        <p className="text-sm text-gray-400">
          Knowledge base configuration, cache management, logging, and backups
        </p>
      </div>

      {/* Knowledge Base */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-5 border-2 border-purple-700/50">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400">
          Knowledge Base
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per COMMUNICATION_FLOW.md
          </span>
        </h4>

        <p className="text-xs text-gray-400 mb-4">
          Persistent learning system for Scout94 agents to remember patterns and issues
        </p>

        <div className="space-y-3">
          <SettingToggle
            label="Enable Learning System"
            value={storage.knowledge.enabled}
            onChange={(val) => onChange('storage.knowledge.enabled', val)}
            helpText="Agents learn from previous runs"
          />

          <SettingInput
            label="Knowledge File Location"
            value={storage.knowledge.location}
            onChange={(val) => onChange('storage.knowledge.location', val)}
            placeholder=".scout94_knowledge.json"
            helpText="Relative to project root"
          />

          <SettingSlider
            label="Max Entries"
            value={storage.knowledge.maxEntries}
            onChange={(val) => onChange('storage.knowledge.maxEntries', val)}
            min={100}
            max={10000}
            step={100}
            helpText="Maximum knowledge base entries"
          />

          <SettingToggle
            label="Auto-prune Old Data"
            value={storage.knowledge.autoPrune}
            onChange={(val) => onChange('storage.knowledge.autoPrune', val)}
            helpText="Remove outdated entries automatically"
          />

          <SettingSlider
            label="Learning Rate"
            value={storage.knowledge.learningRate}
            onChange={(val) => onChange('storage.knowledge.learningRate', val)}
            min={0}
            max={1}
            step={0.1}
            leftLabel="Conservative"
            rightLabel="Aggressive"
            helpText="How quickly to adapt to new patterns"
          />
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Cache Management
        </h4>

        <div className="space-y-3">
          <SettingInput
            label="Cache Location"
            value={storage.cache.location}
            onChange={(val) => onChange('storage.cache.location', val)}
            placeholder=".scout94_cache/"
            helpText="Directory for cached data"
          />

          <SettingInput
            label="Max Cache Size"
            value={storage.cache.maxSizeMB}
            onChange={(val) => onChange('storage.cache.maxSizeMB', val)}
            type="number"
            unit="MB"
            min={10}
            max={10000}
            helpText="Automatically prune when exceeded"
          />

          <SettingInput
            label="Cache Expiry"
            value={storage.cache.expiryHours}
            onChange={(val) => onChange('storage.cache.expiryHours', val)}
            type="number"
            unit="hours"
            min={1}
            max={720}
            helpText="Auto-delete cached files older than this"
          />

          <SettingToggle
            label="Auto-clear on Startup"
            value={storage.cache.autoClearOnStartup}
            onChange={(val) => onChange('storage.cache.autoClearOnStartup', val)}
            helpText="Fresh cache every launch"
          />

          <button
            onClick={handleClearCache}
            aria-label="Clear all cached data"
            className="w-full mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cache Now
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-green-400">
          Logs
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Log Level"
            value={storage.logs.level}
            onChange={(val) => onChange('storage.logs.level', val)}
            options={[
              { value: 'debug', label: 'Debug (Verbose)' },
              { value: 'info', label: 'Info (Recommended)' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error (Minimal)' }
            ]}
            helpText="Verbosity of log output"
          />

          <SettingInput
            label="Log File Location"
            value={storage.logs.location}
            onChange={(val) => onChange('storage.logs.location', val)}
            placeholder=".scout94.log"
            helpText="Main log file path"
          />

          <SettingInput
            label="Max Log File Size"
            value={storage.logs.maxSizeMB}
            onChange={(val) => onChange('storage.logs.maxSizeMB', val)}
            type="number"
            unit="MB"
            min={1}
            max={1000}
            helpText="Rotate when exceeded"
          />

          <SettingDropdown
            label="Rotation Policy"
            value={storage.logs.rotation}
            onChange={(val) => onChange('storage.logs.rotation', val)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'size', label: 'By Size' }
            ]}
            helpText="When to rotate log files"
          />

          <button
            onClick={handleViewLogs}
            aria-label="Open log files viewer"
            className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            View Logs
          </button>
        </div>
      </div>

      {/* Backups */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-yellow-400">
          Configuration Backups
        </h4>

        <div className="space-y-3">
          <SettingToggle
            label="Auto-backup Configurations"
            value={storage.backups.autoBackup}
            onChange={(val) => onChange('storage.backups.autoBackup', val)}
            helpText="Automatically backup settings on save"
          />

          <SettingInput
            label="Backup Location"
            value={storage.backups.location}
            onChange={(val) => onChange('storage.backups.location', val)}
            placeholder=".scout94_backups/"
            helpText="Directory for config backups"
          />

          <SettingInput
            label="Max Backup Count"
            value={storage.backups.maxCount}
            onChange={(val) => onChange('storage.backups.maxCount', val)}
            type="number"
            min={1}
            max={100}
            helpText="Keep only this many recent backups"
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleBackupNow}
              aria-label="Create backup of current configuration"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Backup Now
            </button>
            <button
              onClick={() => alert('Opening restore dialog...')}
              aria-label="Restore configuration from backup"
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Restore
            </button>
          </div>
        </div>
      </div>

      {/* Storage Summary */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <h5 className="text-sm font-semibold text-blue-300 mb-2">💾 Storage Summary</h5>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Knowledge Base:</span>
            <span className="text-blue-300 font-medium">
              {storage.knowledge.enabled ? `${storage.knowledge.maxEntries} entries` : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cache Limit:</span>
            <span className="text-blue-300 font-medium">{storage.cache.maxSizeMB} MB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Log Level:</span>
            <span className="text-blue-300 font-medium capitalize">{storage.logs.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Auto-backups:</span>
            <span className="text-blue-300 font-medium">
              {storage.backups.autoBackup ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

StorageSettings.propTypes = {
  config: PropTypes.shape({
    storage: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default StorageSettings;
