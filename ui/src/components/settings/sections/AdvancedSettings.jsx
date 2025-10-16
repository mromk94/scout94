/**
 * AdvancedSettings - Section 11 of admin settings
 * 
 * Covers: Experimental features, CI/CD, duplicate detection, presets, dev tools
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 11
 */

import PropTypes from 'prop-types';
import { Download, Upload, RotateCcw } from 'lucide-react';
import SettingToggle from '../SettingToggle';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';
import configManager from '../../../utils/configManager';

function AdvancedSettings({ config, onChange }) {
  const advanced = config.advanced;

  const handleExportSettings = () => {
    const jsonString = configManager.exportConfig();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scout94-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (file) {
          const text = await file.text();
          const result = configManager.importConfig(text);
          if (result.success) {
            alert('✅ Settings imported successfully!');
            window.location.reload(); // Reload to apply
          } else {
            alert(`❌ Import failed: ${result.error}`);
          }
        }
      } catch (error) {
        console.error('File import error:', error);
        alert(`❌ Failed to read file: ${error.message}`);
      }
    };
    input.click();
  };

  const handleResetDefaults = () => {
    if (confirm('⚠️ Reset ALL settings to defaults? This cannot be undone.')) {
      configManager.resetAll();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Advanced Settings</h3>
        <p className="text-sm text-gray-400">
          Experimental features, CI/CD integration, presets, import/export, and developer tools
        </p>
      </div>

      {/* Experimental Features */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-yellow-400">
          Experimental Features
        </h4>

        <div className="space-y-3">
          <SettingToggle
            label="Enable Beta Features"
            value={advanced.experimental.betaFeatures}
            onChange={(val) => onChange('advanced.experimental.betaFeatures', val)}
            helpText="⚠️ Unstable features, may have bugs"
          />

          <SettingDropdown
            label="Auto-update Channel"
            value={advanced.experimental.autoUpdateChannel}
            onChange={(val) => onChange('advanced.experimental.autoUpdateChannel', val)}
            options={[
              { value: 'stable', label: 'Stable (Recommended)' },
              { value: 'beta', label: 'Beta (Early access)' },
              { value: 'nightly', label: 'Nightly (Bleeding edge)' }
            ]}
          />

          <SettingToggle
            label="Debug Mode"
            value={advanced.experimental.debugMode}
            onChange={(val) => onChange('advanced.experimental.debugMode', val)}
            helpText="Verbose logging and debug tools"
          />

          <SettingToggle
            label="Telemetry"
            value={advanced.experimental.telemetry}
            onChange={(val) => onChange('advanced.experimental.telemetry', val)}
            helpText="Anonymous usage statistics"
          />
        </div>
      </div>

      {/* CI/CD Integration */}
      <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl p-5 border-2 border-green-700/50">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-green-400">
          CI/CD Integration
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per CLI_GUIDE.md - GitHub Actions
          </span>
        </h4>

        <div className="space-y-3">
          <SettingToggle
            label="Enable CI/CD Mode"
            value={advanced.cicd.enabled}
            onChange={(val) => onChange('advanced.cicd.enabled', val)}
            helpText="Continuous integration workflows"
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              GitHub Actions
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Auto-run on Push"
                value={advanced.cicd.githubActions.autoRunOnPush}
                onChange={(val) => onChange('advanced.cicd.githubActions.autoRunOnPush', val)}
              />
              <SettingToggle
                label="Auto-run on PR"
                value={advanced.cicd.githubActions.autoRunOnPR}
                onChange={(val) => onChange('advanced.cicd.githubActions.autoRunOnPR', val)}
              />
              <SettingToggle
                label="Block Merge on Failure"
                value={advanced.cicd.githubActions.blockMergeOnFailure}
                onChange={(val) => onChange('advanced.cicd.githubActions.blockMergeOnFailure', val)}
              />
              <SettingToggle
                label="Upload Artifacts"
                value={advanced.cicd.githubActions.uploadArtifacts}
                onChange={(val) => onChange('advanced.cicd.githubActions.uploadArtifacts', val)}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-white mb-2 block">
              Notification Channels
            </label>
            <div className="grid grid-cols-3 gap-2">
              <SettingToggle
                label="Slack"
                value={advanced.cicd.notifications.slack}
                onChange={(val) => onChange('advanced.cicd.notifications.slack', val)}
              />
              <SettingToggle
                label="Email"
                value={advanced.cicd.notifications.email}
                onChange={(val) => onChange('advanced.cicd.notifications.email', val)}
              />
              <SettingToggle
                label="Discord"
                value={advanced.cicd.notifications.discord}
                onChange={(val) => onChange('advanced.cicd.notifications.discord', val)}
              />
            </div>
          </div>

          <SettingDropdown
            label="Report Strategy"
            value={advanced.cicd.reportStrategy}
            onChange={(val) => onChange('advanced.cicd.reportStrategy', val)}
            options={[
              { value: 'failure', label: 'Only on Failure' },
              { value: 'always', label: 'Always Generate' },
              { value: 'schedule', label: 'On Schedule' }
            ]}
          />

          <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-white mb-2 block">
              Deployment Gates
            </label>
            <div className="grid grid-cols-3 gap-3">
              <SettingInput
                label="Minimum Score"
                value={advanced.cicd.deploymentGates.minimumScore}
                onChange={(val) => onChange('advanced.cicd.deploymentGates.minimumScore', val)}
                type="number"
                min={5}
                max={10}
                helpText="5-10 scale"
              />
              <SettingInput
                label="Required Health"
                value={advanced.cicd.deploymentGates.requiredHealth}
                onChange={(val) => onChange('advanced.cicd.deploymentGates.requiredHealth', val)}
                type="number"
                unit="%"
                min={0}
                max={100}
              />
              <SettingInput
                label="Max Critical Issues"
                value={advanced.cicd.deploymentGates.maxCriticalIssues}
                onChange={(val) => onChange('advanced.cicd.deploymentGates.maxCriticalIssues', val)}
                type="number"
                min={0}
                max={10}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Detection */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400">
          Duplicate Code Detection
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per duplicate-analyzer.js
          </span>
        </h4>

        <div className="space-y-3">
          <SettingToggle
            label="Enable Duplicate Detection"
            value={advanced.duplicateDetection.enabled}
            onChange={(val) => onChange('advanced.duplicateDetection.enabled', val)}
          />

          <SettingSlider
            label="Similarity Threshold"
            value={advanced.duplicateDetection.similarityThreshold}
            onChange={(val) => onChange('advanced.duplicateDetection.similarityThreshold', val)}
            min={60}
            max={100}
            step={5}
            unit="%"
            helpText="How similar code must be to flag as duplicate"
          />

          <SettingDropdown
            label="Analysis Scope"
            value={advanced.duplicateDetection.analysisScope}
            onChange={(val) => onChange('advanced.duplicateDetection.analysisScope', val)}
            options={[
              { value: 'wholeProject', label: 'Whole Project' },
              { value: 'changedFiles', label: 'Changed Files Only' }
            ]}
          />

          <SettingDropdown
            label="Auto-merge Strategy"
            value={advanced.duplicateDetection.autoMergeStrategy}
            onChange={(val) => onChange('advanced.duplicateDetection.autoMergeStrategy', val)}
            options={[
              { value: 'never', label: 'Never (Manual only)' },
              { value: 'ask', label: 'Ask User' },
              { value: 'smart', label: 'Smart (Analyze features)' }
            ]}
            helpText="Per duplicate analysis protocol"
          />

          <SettingToggle
            label="Preserve Both on Conflict"
            value={advanced.duplicateDetection.preserveBoth}
            onChange={(val) => onChange('advanced.duplicateDetection.preserveBoth', val)}
            helpText="Safety first - never destroy work"
          />

          <SettingToggle
            label="Report Duplicates in Analysis"
            value={advanced.duplicateDetection.reportDuplicates}
            onChange={(val) => onChange('advanced.duplicateDetection.reportDuplicates', val)}
          />
        </div>
      </div>

      {/* Presets */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Configuration Presets
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Current Preset"
            value={advanced.presets.current}
            onChange={(val) => {
              onChange('advanced.presets.current', val);
              // Load preset logic would go here
              alert(`Loading preset: ${val}`);
            }}
            options={[
              { value: 'fast', label: '⚡ Fast & Minimal' },
              { value: 'balanced', label: '⚖️ Balanced (Default)' },
              { value: 'thorough', label: '🔍 Thorough' },
              { value: 'costConscious', label: '💰 Cost-Conscious' },
              { value: 'securityFirst', label: '🔒 Security-First' },
              { value: 'performance', label: '🚀 Performance' }
            ]}
          />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => alert('Load preset functionality')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Load Preset
            </button>
            <button
              onClick={() => alert('Save current as preset')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              Save as Preset
            </button>
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-cyan-400">
          Import / Export
        </h4>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleExportSettings}
            aria-label="Export all settings to JSON file"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export All Settings
          </button>

          <button
            onClick={handleImportSettings}
            aria-label="Import settings from JSON file"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Settings
          </button>

          <button
            onClick={handleResetDefaults}
            aria-label="Reset all settings to factory defaults"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Developer Tools */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-orange-400">
          Developer Tools
        </h4>

        <div className="space-y-3">
          <SettingInput
            label="API Endpoint Override"
            value={advanced.developer.apiEndpointOverride}
            onChange={(val) => onChange('advanced.developer.apiEndpointOverride', val)}
            placeholder="http://localhost:8080"
            helpText="Custom API endpoint for development"
          />

          <SettingInput
            label="WebSocket Port"
            value={advanced.developer.websocketPort}
            onChange={(val) => onChange('advanced.developer.websocketPort', val)}
            type="number"
            min={1024}
            max={65535}
          />

          <SettingInput
            label="PHP Binary Path"
            value={advanced.developer.phpBinaryPath}
            onChange={(val) => onChange('advanced.developer.phpBinaryPath', val)}
            placeholder="/usr/bin/php"
          />

          <SettingInput
            label="Node.js Path"
            value={advanced.developer.nodejsPath}
            onChange={(val) => onChange('advanced.developer.nodejsPath', val)}
            placeholder="/usr/local/bin/node"
          />

          <SettingToggle
            label="Enable Debug Console"
            value={advanced.developer.debugConsole}
            onChange={(val) => onChange('advanced.developer.debugConsole', val)}
            helpText="Show browser developer console"
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
        <p className="text-sm text-yellow-300">
          ⚠️ <strong>Caution:</strong> These are advanced settings. Incorrect configuration may cause Scout94 to malfunction. 
          Use presets for safe, tested configurations.
        </p>
      </div>
    </div>
  );
}

AdvancedSettings.propTypes = {
  config: PropTypes.shape({
    advanced: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default AdvancedSettings;
