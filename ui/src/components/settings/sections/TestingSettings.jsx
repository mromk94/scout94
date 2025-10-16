/**
 * TestingSettings - Section 3 of admin settings
 * 
 * Covers: Coverage, retry logic, health scoring, loop prevention
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 3
 * 
 * CRITICAL: Health weights MUST sum to 1.0 (validated in configManager)
 * Source: MATHEMATICAL_FRAMEWORK.md + RETRY_FLOWS_COMPLETE.md
 */

import PropTypes from 'prop-types';
import SettingToggle from '../SettingToggle';
import WeightValidator from '../shared/WeightValidator';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';

function TestingSettings({ config, onChange }) {
  const testing = config.testing;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Testing Configuration</h3>
        <p className="text-sm text-gray-400">
          Coverage requirements, retry logic, health scoring, and loop prevention
        </p>
      </div>

      {/* Coverage Requirements */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Coverage Requirements
        </h4>

        <div className="space-y-4">
          <SettingSlider
            label="Minimum Coverage Target"
            value={testing.coverage.minimumTarget}
            onChange={(val) => onChange('testing.coverage.minimumTarget', val)}
            min={0}
            max={100}
            step={5}
            unit="%"
            helpText="Fails audit if below this threshold"
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Critical Paths (Must Test)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Authentication"
                value={testing.coverage.criticalPaths.authentication}
                onChange={(val) => onChange('testing.coverage.criticalPaths.authentication', val)}
              />
              <SettingToggle
                label="Data Manipulation"
                value={testing.coverage.criticalPaths.dataManipulation}
                onChange={(val) => onChange('testing.coverage.criticalPaths.dataManipulation', val)}
              />
              <SettingToggle
                label="Payment Processing"
                value={testing.coverage.criticalPaths.paymentProcessing}
                onChange={(val) => onChange('testing.coverage.criticalPaths.paymentProcessing', val)}
              />
              <SettingToggle
                label="User Registration"
                value={testing.coverage.criticalPaths.userRegistration}
                onChange={(val) => onChange('testing.coverage.criticalPaths.userRegistration', val)}
              />
              <SettingToggle
                label="Admin Operations"
                value={testing.coverage.criticalPaths.adminOperations}
                onChange={(val) => onChange('testing.coverage.criticalPaths.adminOperations', val)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Test Suites to Run
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Database Injection"
                value={testing.coverage.testSuites.databaseInjection}
                onChange={(val) => onChange('testing.coverage.testSuites.databaseInjection', val)}
              />
              <SettingToggle
                label="Routing Validation"
                value={testing.coverage.testSuites.routingValidation}
                onChange={(val) => onChange('testing.coverage.testSuites.routingValidation', val)}
              />
              <SettingToggle
                label="Visitor Journey"
                value={testing.coverage.testSuites.visitorJourney}
                onChange={(val) => onChange('testing.coverage.testSuites.visitorJourney', val)}
              />
              <SettingToggle
                label="User Journey"
                value={testing.coverage.testSuites.userJourney}
                onChange={(val) => onChange('testing.coverage.testSuites.userJourney', val)}
              />
              <SettingToggle
                label="Admin Journey"
                value={testing.coverage.testSuites.adminJourney}
                onChange={(val) => onChange('testing.coverage.testSuites.adminJourney', val)}
              />
              <SettingToggle
                label="API Endpoints"
                value={testing.coverage.testSuites.apiEndpoints}
                onChange={(val) => onChange('testing.coverage.testSuites.apiEndpoints', val)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Retry Logic */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400">
          Retry Logic
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per RETRY_FLOWS_COMPLETE.md
          </span>
        </h4>

        <div className="space-y-3">
          <SettingSlider
            label="Max Retry Attempts"
            value={testing.retry.maxAttempts}
            onChange={(val) => onChange('testing.retry.maxAttempts', val)}
            min={0}
            max={5}
            step={1}
            helpText="Per RETRY_FLOWS_COMPLETE.md - default is 3 (4 total attempts)"
          />

          <SettingToggle
            label="Stuck Detection"
            value={testing.retry.stuckDetection}
            onChange={(val) => onChange('testing.retry.stuckDetection', val)}
            helpText="Exit early if score unchanged (|score[n] - score[n-1]| = 0)"
          />

          <SettingToggle
            label="Decline Detection"
            value={testing.retry.declineDetection}
            onChange={(val) => onChange('testing.retry.declineDetection', val)}
            helpText="Exit if score regressing (score[n] < score[n-1])"
          />

          <SettingToggle
            label="Auto-Escalate to Clinic"
            value={testing.retry.autoEscalateClinic}
            onChange={(val) => onChange('testing.retry.autoEscalateClinic', val)}
            helpText="If audit fails repeatedly, admit to clinic for healing"
          />

          <SettingDropdown
            label="Retry Strategy"
            value={testing.retry.strategy}
            onChange={(val) => onChange('testing.retry.strategy', val)}
            options={[
              { value: 'aggressive', label: 'Aggressive (Apply all recommendations)' },
              { value: 'balanced', label: 'Balanced (Prioritize critical)' },
              { value: 'conservative', label: 'Conservative (Minimal changes)' }
            ]}
            helpText="How aggressively to apply auditor recommendations"
          />

          <SettingToggle
            label="Early Exit on Stuck/Decline"
            value={testing.retry.earlyExit}
            onChange={(val) => onChange('testing.retry.earlyExit', val)}
            helpText="Save time by exiting when no improvement possible"
          />
        </div>
      </div>

      {/* Health Scoring - CRITICAL SECTION */}
      <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl p-5 border-2 border-green-700/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-green-400">
            Health Score Weights
            <span className="text-xs text-gray-400 ml-2 font-normal">
              Per MATHEMATICAL_FRAMEWORK.md
            </span>
          </h4>
        </div>

        <WeightValidator 
          weights={testing.health.weights}
          label="Health Weight Validation"
          helpText="Health metrics must sum to 1.0 for accurate scoring per MATHEMATICAL_FRAMEWORK.md"
        />

        <div className="space-y-4 mt-4">
          <p className="text-xs text-gray-400 mb-3">
            Formula: <code className="bg-gray-900 px-2 py-1 rounded">H = Σ(Metric_i × Weight_i)</code>
          </p>

          <div className="space-y-3">
            <SettingSlider
              label="Test Coverage Weight"
              value={testing.health.weights.testCoverage * 100}
              onChange={(val) => onChange('testing.health.weights.testCoverage', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="% of critical paths tested"
            />

            <SettingSlider
              label="Test Success Rate Weight"
              value={testing.health.weights.testSuccessRate * 100}
              onChange={(val) => onChange('testing.health.weights.testSuccessRate', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="Pass/fail ratio"
            />

            <SettingSlider
              label="Audit Score Weight"
              value={testing.health.weights.auditScore * 100}
              onChange={(val) => onChange('testing.health.weights.auditScore', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="LLM auditor quality score"
            />

            <SettingSlider
              label="Security Coverage Weight"
              value={testing.health.weights.securityCoverage * 100}
              onChange={(val) => onChange('testing.health.weights.securityCoverage', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="Security test comprehensiveness"
            />

            <SettingSlider
              label="Critical Errors Weight"
              value={testing.health.weights.criticalErrors * 100}
              onChange={(val) => onChange('testing.health.weights.criticalErrors', val / 100)}
              min={0}
              max={100}
              step={1}
              unit="%"
              helpText="Inverse of critical errors"
            />
          </div>

          {/* Health Thresholds */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <label className="text-sm font-medium text-white mb-3 block">Health Thresholds</label>
            <div className="grid grid-cols-2 gap-3">
              <SettingInput
                label="💚 Excellent"
                value={testing.health.thresholds.excellent}
                onChange={(val) => onChange('testing.health.thresholds.excellent', val)}
                type="number"
                min={0}
                max={100}
                helpText="95-100: Production ready"
              />
              <SettingInput
                label="🟢 Good"
                value={testing.health.thresholds.good}
                onChange={(val) => onChange('testing.health.thresholds.good', val)}
                type="number"
                min={0}
                max={100}
                helpText="85-94: Minor improvements"
              />
              <SettingInput
                label="🟡 Fair (Clinic)"
                value={testing.health.thresholds.fair}
                onChange={(val) => onChange('testing.health.thresholds.fair', val)}
                type="number"
                min={0}
                max={100}
                helpText="70-84: Clinic admission threshold"
              />
              <SettingInput
                label="🟠 Poor"
                value={testing.health.thresholds.poor}
                onChange={(val) => onChange('testing.health.thresholds.poor', val)}
                type="number"
                min={0}
                max={100}
                helpText="50-69: Needs attention"
              />
              <SettingInput
                label="🔴 Critical"
                value={testing.health.thresholds.critical}
                onChange={(val) => onChange('testing.health.thresholds.critical', val)}
                type="number"
                min={0}
                max={100}
                helpText="30-49: Immediate treatment"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loop Prevention */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-orange-400">
          Loop Prevention
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per CLINIC_COMPLETE.md
          </span>
        </h4>

        <div className="space-y-3">
          <SettingSlider
            label="Max Healing Cycles"
            value={testing.loopPrevention.maxHealingCycles}
            onChange={(val) => onChange('testing.loopPrevention.maxHealingCycles', val)}
            min={1}
            max={5}
            step={1}
            helpText="Maximum clinic visits before giving up (default: 2)"
          />

          <SettingDropdown
            label="Stuck Detection Sensitivity"
            value={testing.loopPrevention.stuckSensitivity}
            onChange={(val) => onChange('testing.loopPrevention.stuckSensitivity', val)}
            options={[
              { value: 'low', label: 'Low (Allow more attempts)' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High (Exit quickly)' }
            ]}
            helpText="How quickly to detect stuck situations"
          />

          <SettingInput
            label="Cooldown Between Retries"
            value={testing.loopPrevention.cooldownSeconds}
            onChange={(val) => onChange('testing.loopPrevention.cooldownSeconds', val)}
            type="number"
            unit="sec"
            min={0}
            max={60}
            helpText="Wait time between retry attempts"
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Health weights are validated on save. The system follows 
          RETRY_FLOWS_COMPLETE.md for all 11 retry scenarios and MATHEMATICAL_FRAMEWORK.md for calculations.
        </p>
      </div>
    </div>
  );
}

TestingSettings.propTypes = {
  config: PropTypes.shape({
    testing: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default TestingSettings;
