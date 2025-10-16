/**
 * SecuritySettings - Section 7 of admin settings
 * 
 * Covers: Security scanning, data privacy, risk assessment
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 7 + MATHEMATICAL_FRAMEWORK.md (risk weights)
 */

import PropTypes from 'prop-types';
import SettingToggle from '../SettingToggle';
import WeightValidator from '../shared/WeightValidator';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';

function SecuritySettings({ config, onChange }) {
  const security = config.security;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Security & Privacy</h3>
        <p className="text-sm text-gray-400">
          Vulnerability scanning, data privacy controls, and risk assessment configuration
        </p>
      </div>

      {/* Security Scanning */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-red-400">
          Security Scanning
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Scan Depth"
            value={security.scanning.depth}
            onChange={(val) => onChange('security.scanning.depth', val)}
            options={[
              { value: 'quick', label: 'Quick (Basic checks)' },
              { value: 'standard', label: 'Standard' },
              { value: 'comprehensive', label: 'Comprehensive (Recommended)' }
            ]}
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Vulnerability Checks
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="SQL Injection"
                value={security.scanning.vulnerabilityChecks.sql}
                onChange={(val) => onChange('security.scanning.vulnerabilityChecks.sql', val)}
                helpText="Detect SQL injection vectors"
              />
              <SettingToggle
                label="XSS (Cross-Site Scripting)"
                value={security.scanning.vulnerabilityChecks.xss}
                onChange={(val) => onChange('security.scanning.vulnerabilityChecks.xss', val)}
              />
              <SettingToggle
                label="CSRF Protection"
                value={security.scanning.vulnerabilityChecks.csrf}
                onChange={(val) => onChange('security.scanning.vulnerabilityChecks.csrf', val)}
              />
              <SettingToggle
                label="Authentication Flaws"
                value={security.scanning.vulnerabilityChecks.auth}
                onChange={(val) => onChange('security.scanning.vulnerabilityChecks.auth', val)}
              />
              <SettingToggle
                label="Hardcoded Credentials"
                value={security.scanning.vulnerabilityChecks.hardcodedCreds}
                onChange={(val) => onChange('security.scanning.vulnerabilityChecks.hardcodedCreds', val)}
              />
              <SettingToggle
                label="Insecure File Uploads"
                value={security.scanning.vulnerabilityChecks.uploads}
                onChange={(val) => onChange('security.scanning.vulnerabilityChecks.uploads', val)}
              />
              <SettingToggle
                label="Exposed Sensitive Data"
                value={security.scanning.vulnerabilityChecks.exposedData}
                onChange={(val) => onChange('security.scanning.vulnerabilityChecks.exposedData', val)}
              />
            </div>
          </div>

          <SettingInput
            label="Failure Threshold"
            value={security.scanning.failureThreshold}
            onChange={(val) => onChange('security.scanning.failureThreshold', val)}
            type="number"
            min={0}
            max={50}
            helpText="Max high-risk issues before failing audit"
          />
        </div>
      </div>

      {/* Data Privacy */}
      <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-5 border-2 border-blue-700/50">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Data Privacy
        </h4>

        <p className="text-xs text-gray-400 mb-4">
          Control what data is sent to LLM providers and how long data is retained
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Data Sent to LLMs
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Metadata"
                value={security.privacy.dataToLLM.metadata}
                onChange={(val) => onChange('security.privacy.dataToLLM.metadata', val)}
                helpText="File names, sizes, structure"
              />
              <SettingToggle
                label="Error Messages"
                value={security.privacy.dataToLLM.errors}
                onChange={(val) => onChange('security.privacy.dataToLLM.errors', val)}
                helpText="Stack traces, exceptions"
              />
              <SettingToggle
                label="Code Snippets"
                value={security.privacy.dataToLLM.codeSnippets}
                onChange={(val) => onChange('security.privacy.dataToLLM.codeSnippets', val)}
                helpText="Small code excerpts (< 500 chars)"
              />
              <SettingToggle
                label="Full Files"
                value={security.privacy.dataToLLM.fullFiles}
                onChange={(val) => onChange('security.privacy.dataToLLM.fullFiles', val)}
                helpText="⚠️ Entire file contents"
              />
              <div className="col-span-2 border-t border-red-700 pt-2 mt-2">
                <p className="text-xs text-red-300 mb-2 font-semibold">🔒 NEVER Send:</p>
              </div>
              <SettingToggle
                label="Credentials"
                value={security.privacy.dataToLLM.credentials}
                onChange={(val) => onChange('security.privacy.dataToLLM.credentials', val)}
                helpText="❌ Passwords, tokens"
              />
              <SettingToggle
                label="API Keys"
                value={security.privacy.dataToLLM.apiKeys}
                onChange={(val) => onChange('security.privacy.dataToLLM.apiKeys', val)}
                helpText="❌ Service keys"
              />
              <SettingToggle
                label="User Data"
                value={security.privacy.dataToLLM.userData}
                onChange={(val) => onChange('security.privacy.dataToLLM.userData', val)}
                helpText="❌ PII, emails, etc."
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-white mb-2 block">
              Data Retention
            </label>
            <div className="grid grid-cols-3 gap-3">
              <SettingInput
                label="Reports"
                value={security.privacy.retention.reportsDays}
                onChange={(val) => onChange('security.privacy.retention.reportsDays', val)}
                type="number"
                unit="days"
                min={1}
                max={365}
              />
              <SettingInput
                label="Logs"
                value={security.privacy.retention.logsDays}
                onChange={(val) => onChange('security.privacy.retention.logsDays', val)}
                type="number"
                unit="days"
                min={1}
                max={90}
              />
              <SettingInput
                label="Cache"
                value={security.privacy.retention.cacheHours}
                onChange={(val) => onChange('security.privacy.retention.cacheHours', val)}
                type="number"
                unit="hours"
                min={1}
                max={168}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-xl p-5 border-2 border-orange-700/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-orange-400">
            Risk Assessment
            <span className="text-xs text-gray-400 ml-2 font-normal">
              Per MATHEMATICAL_FRAMEWORK.md
            </span>
          </h4>
        </div>

        <WeightValidator 
          weights={security.risk.weights}
          label="Risk Weight Validation"
          helpText="Risk factors must sum to 1.0 for accurate threat assessment per MATHEMATICAL_FRAMEWORK.md"
        />

        <div className="space-y-4 mt-4">
          <p className="text-xs text-gray-400 mb-3">
            Formula: <code className="bg-gray-900 px-2 py-1 rounded">R = Σ(Factor_i × Weight_i)</code>
          </p>

          <div className="space-y-3">
            <SettingSlider
              label="System Commands Weight"
              value={security.risk.weights.systemCommands * 100}
              onChange={(val) => onChange('security.risk.weights.systemCommands', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="exec(), shell commands, file system ops"
            />

            <SettingSlider
              label="File Operations Weight"
              value={security.risk.weights.fileOperations * 100}
              onChange={(val) => onChange('security.risk.weights.fileOperations', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="Read/write/delete files"
            />

            <SettingSlider
              label="Database Access Weight"
              value={security.risk.weights.databaseAccess * 100}
              onChange={(val) => onChange('security.risk.weights.databaseAccess', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="SQL operations, schema changes"
            />

            <SettingSlider
              label="External Calls Weight"
              value={security.risk.weights.externalCalls * 100}
              onChange={(val) => onChange('security.risk.weights.externalCalls', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="API calls, network requests"
            />

            <SettingSlider
              label="Code Complexity Weight"
              value={security.risk.weights.codeComplexity * 100}
              onChange={(val) => onChange('security.risk.weights.codeComplexity', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="Cyclomatic complexity, nesting"
            />
          </div>

          {/* Risk Thresholds */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-white mb-3 block">Risk Thresholds</label>
            <div className="grid grid-cols-2 gap-3">
              <SettingInput
                label="🟢 LOW (Auto-approve)"
                value={security.risk.thresholds.low}
                onChange={(val) => onChange('security.risk.thresholds.low', val)}
                type="number"
                min={0}
                max={100}
                helpText="0-30: Safe to apply automatically"
              />
              <SettingInput
                label="🟡 MEDIUM (Review)"
                value={security.risk.thresholds.medium}
                onChange={(val) => onChange('security.risk.thresholds.medium', val)}
                type="number"
                min={0}
                max={100}
                helpText="30-50: Requires review"
              />
              <SettingInput
                label="🟠 HIGH (Caution)"
                value={security.risk.thresholds.high}
                onChange={(val) => onChange('security.risk.thresholds.high', val)}
                type="number"
                min={0}
                max={100}
                helpText="50-75: High risk, careful review"
              />
              <SettingInput
                label="🔴 CRITICAL (Reject)"
                value={security.risk.thresholds.critical}
                onChange={(val) => onChange('security.risk.thresholds.critical', val)}
                type="number"
                min={0}
                max={100}
                helpText="75-100: Auto-reject"
              />
            </div>
          </div>

          <SettingToggle
            label="Sandbox Testing"
            value={security.risk.sandbox}
            onChange={(val) => onChange('security.risk.sandbox', val)}
            helpText="Test treatments in sandbox before applying (Per MATHEMATICAL_FRAMEWORK.md)"
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
        <p className="text-sm text-red-300">
          🔒 <strong>Security First:</strong> Risk weights are validated on save. The system follows 
          MATHEMATICAL_FRAMEWORK.md for risk calculation. Sandbox testing is strongly recommended.
        </p>
      </div>
    </div>
  );
}

SecuritySettings.propTypes = {
  config: PropTypes.shape({
    security: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default SecuritySettings;
