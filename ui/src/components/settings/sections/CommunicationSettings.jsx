/**
 * CommunicationSettings - Section 10 of admin settings
 * 
 * Covers: WebSocket server, CLI integration, Knowledge Base, Accountability Protocol
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 10
 */

import PropTypes from 'prop-types';
import SettingToggle from '../SettingToggle';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';

function CommunicationSettings({ config, onChange }) {
  const comm = config.communication;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Communication & Orchestration</h3>
        <p className="text-sm text-gray-400">
          WebSocket server, CLI manager, knowledge base messaging, and accountability enforcement
        </p>
      </div>

      {/* Knowledge Base & Message Board */}
      <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-5 border-2 border-purple-700/50">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400">
          Knowledge Base & Message Board
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per COMMUNICATION_FLOW.md
          </span>
        </h4>

        <div className="space-y-3">
          <SettingToggle
            label="Enable Persistent Learning"
            value={comm.knowledge.persistentLearning}
            onChange={(val) => onChange('communication.knowledge.persistentLearning', val)}
            helpText="Agents share knowledge across runs"
          />

          <SettingInput
            label="Knowledge File"
            value={comm.knowledge.knowledgeFile}
            onChange={(val) => onChange('communication.knowledge.knowledgeFile', val)}
            placeholder=".scout94_knowledge.json"
          />

          <SettingSlider
            label="Max Entries"
            value={comm.knowledge.maxEntries}
            onChange={(val) => onChange('communication.knowledge.maxEntries', val)}
            min={100}
            max={10000}
            step={100}
          />

          <SettingInput
            label="Auto-prune After"
            value={comm.knowledge.autoPrune}
            onChange={(val) => onChange('communication.knowledge.autoPrune', val)}
            type="number"
            unit="runs"
            min={10}
            max={1000}
            helpText="Prune old entries after X runs"
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Learning Features
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Record Patterns"
                value={comm.knowledge.features.recordPatterns}
                onChange={(val) => onChange('communication.knowledge.features.recordPatterns', val)}
              />
              <SettingToggle
                label="Track Issues"
                value={comm.knowledge.features.trackIssues}
                onChange={(val) => onChange('communication.knowledge.features.trackIssues', val)}
              />
              <SettingToggle
                label="Store Fix History"
                value={comm.knowledge.features.storeFixHistory}
                onChange={(val) => onChange('communication.knowledge.features.storeFixHistory', val)}
              />
              <SettingToggle
                label="Build Project Map"
                value={comm.knowledge.features.buildProjectMap}
                onChange={(val) => onChange('communication.knowledge.features.buildProjectMap', val)}
              />
              <SettingToggle
                label="Generate Insights"
                value={comm.knowledge.features.generateInsights}
                onChange={(val) => onChange('communication.knowledge.features.generateInsights', val)}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-white mb-2 block">
              Message Board
            </label>
            <SettingToggle
              label="Enable Inter-agent Messaging"
              value={comm.knowledge.messageBoard.enabled}
              onChange={(val) => onChange('communication.knowledge.messageBoard.enabled', val)}
              helpText="Agents communicate via centralized message board"
            />
            <SettingInput
              label="Max Messages"
              value={comm.knowledge.messageBoard.maxMessages}
              onChange={(val) => onChange('communication.knowledge.messageBoard.maxMessages', val)}
              type="number"
              min={100}
              max={10000}
              helpText="Prune old messages when exceeded"
            />
            <SettingToggle
              label="Priority Handling"
              value={comm.knowledge.messageBoard.priorityHandling}
              onChange={(val) => onChange('communication.knowledge.messageBoard.priorityHandling', val)}
              helpText="Critical messages processed first"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-white mb-2 block">
              Project Mapping
            </label>
            <SettingToggle
              label="Auto-map on First Run"
              value={comm.knowledge.projectMapping.autoMapFirstRun}
              onChange={(val) => onChange('communication.knowledge.projectMapping.autoMapFirstRun', val)}
            />
            <SettingInput
              label="Cache Structure"
              value={comm.knowledge.projectMapping.cacheHours}
              onChange={(val) => onChange('communication.knowledge.projectMapping.cacheHours', val)}
              type="number"
              unit="hours"
              min={1}
              max={168}
            />
            <SettingInput
              label="Discovery Depth"
              value={comm.knowledge.projectMapping.discoveryDepth}
              onChange={(val) => onChange('communication.knowledge.projectMapping.discoveryDepth', val)}
              type="number"
              unit="levels"
              min={1}
              max={20}
            />
          </div>
        </div>
      </div>

      {/* WebSocket Server */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          WebSocket Server
        </h4>

        <div className="space-y-3">
          <SettingInput
            label="Server Port"
            value={comm.websocket.port}
            onChange={(val) => onChange('communication.websocket.port', val)}
            type="number"
            min={1024}
            max={65535}
            helpText="Default: 8080"
          />

          <SettingToggle
            label="Auto-start with App"
            value={comm.websocket.autoStart}
            onChange={(val) => onChange('communication.websocket.autoStart', val)}
            helpText="Start WebSocket server on app launch"
          />

          <SettingInput
            label="Connection Timeout"
            value={comm.websocket.timeout}
            onChange={(val) => onChange('communication.websocket.timeout', val)}
            type="number"
            unit="sec"
            min={10}
            max={300}
          />

          <SettingInput
            label="Reconnect Attempts"
            value={comm.websocket.reconnectAttempts}
            onChange={(val) => onChange('communication.websocket.reconnectAttempts', val)}
            type="number"
            min={0}
            max={100}
            helpText="0 = infinite retries"
          />

          <SettingInput
            label="Ping Interval"
            value={comm.websocket.pingInterval}
            onChange={(val) => onChange('communication.websocket.pingInterval', val)}
            type="number"
            unit="sec"
            min={5}
            max={300}
            helpText="Keepalive heartbeat frequency"
          />

          <SettingInput
            label="Max Clients"
            value={comm.websocket.maxClients}
            onChange={(val) => onChange('communication.websocket.maxClients', val)}
            type="number"
            min={1}
            max={1000}
          />

          <SettingInput
            label="CORS Origins"
            value={comm.websocket.cors}
            onChange={(val) => onChange('communication.websocket.cors', val)}
            placeholder="* (allow all)"
            helpText="Comma-separated origins or * for all"
          />

          <SettingToggle
            label="SSL/TLS (Secure WebSocket)"
            value={comm.websocket.ssl}
            onChange={(val) => onChange('communication.websocket.ssl', val)}
            helpText="Use wss:// instead of ws://"
          />
        </div>
      </div>

      {/* CLI Integration */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-green-400">
          CLI Manager
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per CLI_GUIDE.md
          </span>
        </h4>

        <div className="space-y-3">
          <SettingToggle
            label="Enable CLI"
            value={comm.cli.enabled}
            onChange={(val) => onChange('communication.cli.enabled', val)}
            helpText="Command-line interface for Scout94"
          />

          <SettingInput
            label="CLI Binary Path"
            value={comm.cli.binaryPath}
            onChange={(val) => onChange('communication.cli.binaryPath', val)}
            placeholder="/usr/local/bin/scout94"
            helpText="Global CLI command location"
          />

          <SettingToggle
            label="Background Execution"
            value={comm.cli.backgroundExecution}
            onChange={(val) => onChange('communication.cli.backgroundExecution', val)}
            helpText="Allow daemon mode (terminal can close)"
          />

          <SettingInput
            label="PID File"
            value={comm.cli.pidFile}
            onChange={(val) => onChange('communication.cli.pidFile', val)}
            placeholder=".scout94.pid"
          />

          <SettingInput
            label="State File"
            value={comm.cli.stateFile}
            onChange={(val) => onChange('communication.cli.stateFile', val)}
            placeholder=".scout94.state"
          />

          <SettingDropdown
            label="Default CLI Mode"
            value={comm.cli.defaultMode}
            onChange={(val) => onChange('communication.cli.defaultMode', val)}
            options={[
              { value: 'basic', label: 'Basic' },
              { value: 'audit', label: 'Audit (Recommended)' },
              { value: 'clinic', label: 'Clinic' },
              { value: 'visual', label: 'Visual' },
              { value: 'comprehensive', label: 'Comprehensive' }
            ]}
          />

          <SettingToggle
            label="Auto-generate Logs"
            value={comm.cli.autoGenerateLogs}
            onChange={(val) => onChange('communication.cli.autoGenerateLogs', val)}
          />

          <SettingInput
            label="Log Location"
            value={comm.cli.logLocation}
            onChange={(val) => onChange('communication.cli.logLocation', val)}
            placeholder=".scout94.log"
          />

          <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-white mb-2 block">
              Process Management
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Allow Pause/Resume"
                value={comm.cli.processManagement.allowPauseResume}
                onChange={(val) => onChange('communication.cli.processManagement.allowPauseResume', val)}
              />
              <SettingToggle
                label="Allow Restart"
                value={comm.cli.processManagement.allowRestart}
                onChange={(val) => onChange('communication.cli.processManagement.allowRestart', val)}
              />
              <SettingToggle
                label="Status Monitoring"
                value={comm.cli.processManagement.statusMonitoring}
                onChange={(val) => onChange('communication.cli.processManagement.statusMonitoring', val)}
              />
              <SettingToggle
                label="Remote SSH"
                value={comm.cli.processManagement.remoteSSH}
                onChange={(val) => onChange('communication.cli.processManagement.remoteSSH', val)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accountability Protocol */}
      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-xl p-5 border-2 border-red-700/50">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-red-400">
          Accountability Protocol
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per decision-framework.js
          </span>
        </h4>

        <p className="text-xs text-gray-400 mb-4">
          Enforce proper problem-solving and prevent lazy shortcuts
        </p>

        <div className="space-y-3">
          <SettingToggle
            label="Enable Accountability Protocol"
            value={comm.accountability.enabled}
            onChange={(val) => onChange('communication.accountability.enabled', val)}
            helpText="CRITICAL: Validates all agent solutions"
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Validation Rules
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Prevent Deletion w/o Replacement"
                value={comm.accountability.validationRules.preventDeletionWithoutReplacement}
                onChange={(val) => onChange('communication.accountability.validationRules.preventDeletionWithoutReplacement', val)}
              />
              <SettingToggle
                label="Detect Symptom Fixes"
                value={comm.accountability.validationRules.detectSymptomFixes}
                onChange={(val) => onChange('communication.accountability.validationRules.detectSymptomFixes', val)}
              />
              <SettingToggle
                label="Block Lazy Shortcuts"
                value={comm.accountability.validationRules.blockLazyShortcuts}
                onChange={(val) => onChange('communication.accountability.validationRules.blockLazyShortcuts', val)}
              />
              <SettingToggle
                label="Validate User Requirements"
                value={comm.accountability.validationRules.validateUserRequirements}
                onChange={(val) => onChange('communication.accountability.validationRules.validateUserRequirements', val)}
              />
              <SettingToggle
                label="Ensure Library Respect"
                value={comm.accountability.validationRules.ensureLibraryRespect}
                onChange={(val) => onChange('communication.accountability.validationRules.ensureLibraryRespect', val)}
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-white mb-2 block">
              ProperSolutionFramework
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="UNDERSTAND Phase Required"
                value={comm.accountability.framework.understandPhase}
                onChange={(val) => onChange('communication.accountability.framework.understandPhase', val)}
              />
              <SettingToggle
                label="ROOT_CAUSE Phase Required"
                value={comm.accountability.framework.rootCausePhase}
                onChange={(val) => onChange('communication.accountability.framework.rootCausePhase', val)}
              />
              <SettingToggle
                label="USER_INTENT Validation"
                value={comm.accountability.framework.userIntentValidation}
                onChange={(val) => onChange('communication.accountability.framework.userIntentValidation', val)}
              />
              <SettingToggle
                label="IMPLEMENT with Verification"
                value={comm.accountability.framework.implementWithVerification}
                onChange={(val) => onChange('communication.accountability.framework.implementWithVerification', val)}
              />
            </div>
          </div>

          <SettingSlider
            label="Strictness"
            value={comm.accountability.strictness}
            onChange={(val) => onChange('communication.accountability.strictness', val)}
            min={0}
            max={1}
            step={0.1}
            leftLabel="Lenient"
            rightLabel="Strict"
            helpText="How strictly to enforce accountability"
          />

          <SettingToggle
            label="Log Validation Failures"
            value={comm.accountability.logFailures}
            onChange={(val) => onChange('communication.accountability.logFailures', val)}
          />

          <SettingToggle
            label="Block Invalid Solutions"
            value={comm.accountability.blockInvalid}
            onChange={(val) => onChange('communication.accountability.blockInvalid', val)}
            helpText="Prevent execution of non-compliant solutions"
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-4">
        <p className="text-sm text-purple-300">
          🛡️ <strong>Accountability Protocol:</strong> Ensures all agents follow proper problem-solving methodology. 
          This prevents lazy shortcuts and enforces root cause investigation per ACCOUNTABILITY_PROTOCOL.md.
        </p>
      </div>
    </div>
  );
}

CommunicationSettings.propTypes = {
  config: PropTypes.shape({
    communication: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default CommunicationSettings;
