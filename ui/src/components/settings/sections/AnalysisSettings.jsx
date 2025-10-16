/**
 * AnalysisSettings - Section 4 of admin settings
 * 
 * Covers: Comprehensive scan, root cause, mock detection, security
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 4
 */

import PropTypes from 'prop-types';
import SettingToggle from '../SettingToggle';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';

function AnalysisSettings({ config, onChange }) {
  const analysis = config.analysis;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Analysis Settings</h3>
        <p className="text-sm text-gray-400">
          Comprehensive scanning, root cause detection, mock data verification, and security analysis
        </p>
      </div>

      {/* Comprehensive Scan */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Comprehensive Scan
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Analysis Depth"
            value={analysis.scan.depth}
            onChange={(val) => onChange('analysis.scan.depth', val)}
            options={[
              { value: 'quick', label: 'Quick (Surface level)' },
              { value: 'standard', label: 'Standard' },
              { value: 'deep', label: 'Deep (Recommended)' }
            ]}
            helpText="How thoroughly to analyze code structure"
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Analysis Components
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Holistic Analysis"
                value={analysis.scan.components.holistic}
                onChange={(val) => onChange('analysis.scan.components.holistic', val)}
                helpText="Architecture pattern detection"
              />
              <SettingToggle
                label="Root Cause Tracing"
                value={analysis.scan.components.rootCause}
                onChange={(val) => onChange('analysis.scan.components.rootCause', val)}
                helpText="Trace symptoms to root problems"
              />
              <SettingToggle
                label="Security Scanning"
                value={analysis.scan.components.security}
                onChange={(val) => onChange('analysis.scan.components.security', val)}
                helpText="Vulnerability detection"
              />
              <SettingToggle
                label="Performance Analysis"
                value={analysis.scan.components.performance}
                onChange={(val) => onChange('analysis.scan.components.performance', val)}
                helpText="Bottleneck detection"
              />
              <SettingToggle
                label="Code Quality"
                value={analysis.scan.components.quality}
                onChange={(val) => onChange('analysis.scan.components.quality', val)}
                helpText="Standards and best practices"
              />
              <SettingToggle
                label="Duplicate Detection"
                value={analysis.scan.components.duplicates}
                onChange={(val) => onChange('analysis.scan.components.duplicates', val)}
                helpText="Find duplicate code blocks"
              />
            </div>
          </div>

          <SettingInput
            label="Max Files to Scan"
            value={analysis.scan.maxFiles}
            onChange={(val) => onChange('analysis.scan.maxFiles', val)}
            type="number"
            min={100}
            max={100000}
            helpText="Prevents excessive memory usage"
          />

          <SettingToggle
            label="Cache Previous Scans"
            value={analysis.scan.cachePreviousScans}
            onChange={(val) => onChange('analysis.scan.cachePreviousScans', val)}
            helpText="Faster subsequent runs, may miss changes"
          />
        </div>
      </div>

      {/* Root Cause Detection */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400">
          Root Cause Detection
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per root-cause-tracer.js
          </span>
        </h4>

        <div className="space-y-3">
          <SettingSlider
            label="Trace Depth Levels"
            value={analysis.rootCause.traceDepth}
            onChange={(val) => onChange('analysis.rootCause.traceDepth', val)}
            min={1}
            max={10}
            step={1}
            helpText="How deep to trace dependencies and cascading failures"
          />

          <SettingToggle
            label="Issue Grouping"
            value={analysis.rootCause.issueGrouping}
            onChange={(val) => onChange('analysis.rootCause.issueGrouping', val)}
            helpText="Group related symptoms together"
          />

          <SettingToggle
            label="Cascading Failure Detection"
            value={analysis.rootCause.cascadingFailureDetection}
            onChange={(val) => onChange('analysis.rootCause.cascadingFailureDetection', val)}
            helpText="Identify domino effects across system"
          />

          <SettingDropdown
            label="Impact Analysis Depth"
            value={analysis.rootCause.impactAnalysisDepth}
            onChange={(val) => onChange('analysis.rootCause.impactAnalysisDepth', val)}
            options={[
              { value: 'low', label: 'Low (Direct impacts only)' },
              { value: 'medium', label: 'Medium (Recommended)' },
              { value: 'high', label: 'High (Comprehensive)' }
            ]}
            helpText="How thoroughly to analyze impact chains"
          />
        </div>
      </div>

      {/* Mock Detection Protocol */}
      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-xl p-5 border-2 border-orange-700/50">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-orange-400">
          Mock Detection Protocol
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per MOCK_DETECTION_PROTOCOL.md
          </span>
        </h4>

        <div className="space-y-4">
          <SettingToggle
            label="Enable Authenticity Verification"
            value={analysis.mockDetection.enabled}
            onChange={(val) => onChange('analysis.mockDetection.enabled', val)}
            helpText="Distinguish real scan data from mock/placeholder data"
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Confidence Thresholds
            </label>
            <div className="grid grid-cols-2 gap-3">
              <SettingInput
                label="✅ REAL Data"
                value={analysis.mockDetection.thresholds.real}
                onChange={(val) => onChange('analysis.mockDetection.thresholds.real', val)}
                type="number"
                unit="%"
                min={0}
                max={100}
                helpText="80-100%: Authentic data"
              />
              <SettingInput
                label="⚠️ PARTIAL Data"
                value={analysis.mockDetection.thresholds.partial}
                onChange={(val) => onChange('analysis.mockDetection.thresholds.partial', val)}
                type="number"
                unit="%"
                min={0}
                max={100}
                helpText="50-79%: Mix of real/mock"
              />
              <SettingInput
                label="❌ MOSTLY_MOCK"
                value={analysis.mockDetection.thresholds.mostlyMock}
                onChange={(val) => onChange('analysis.mockDetection.thresholds.mostlyMock', val)}
                type="number"
                unit="%"
                min={0}
                max={100}
                helpText="20-49%: Primarily fake"
              />
              <SettingInput
                label="🚫 COMPLETE_MOCK"
                value={analysis.mockDetection.thresholds.completeMock}
                onChange={(val) => onChange('analysis.mockDetection.thresholds.completeMock', val)}
                type="number"
                unit="%"
                min={0}
                max={100}
                helpText="0-19%: No real scans"
              />
            </div>
          </div>

          <SettingSlider
            label="Detection Sensitivity"
            value={analysis.mockDetection.sensitivity}
            onChange={(val) => onChange('analysis.mockDetection.sensitivity', val)}
            min={0}
            max={1}
            step={0.1}
            leftLabel="Lenient"
            rightLabel="Strict"
            helpText="How aggressively to flag suspicious patterns"
          />

          <SettingToggle
            label="Fail Audit on Mock Detection"
            value={analysis.mockDetection.failOnMock}
            onChange={(val) => onChange('analysis.mockDetection.failOnMock', val)}
            helpText="Block deployment if mock data detected"
          />

          <SettingToggle
            label="Show Authenticity Badges"
            value={analysis.mockDetection.showBadges}
            onChange={(val) => onChange('analysis.mockDetection.showBadges', val)}
            helpText="Display confidence badges in reports"
          />
        </div>
      </div>

      {/* Security Scanning */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-red-400">
          Security Scanning
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Scan Depth"
            value={analysis.security.depth}
            onChange={(val) => onChange('analysis.security.depth', val)}
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
                value={analysis.security.checks.sqlInjection}
                onChange={(val) => onChange('analysis.security.checks.sqlInjection', val)}
              />
              <SettingToggle
                label="XSS"
                value={analysis.security.checks.xss}
                onChange={(val) => onChange('analysis.security.checks.xss', val)}
              />
              <SettingToggle
                label="CSRF"
                value={analysis.security.checks.csrf}
                onChange={(val) => onChange('analysis.security.checks.csrf', val)}
              />
              <SettingToggle
                label="Auth Flaws"
                value={analysis.security.checks.authFlaws}
                onChange={(val) => onChange('analysis.security.checks.authFlaws', val)}
              />
              <SettingToggle
                label="Hardcoded Credentials"
                value={analysis.security.checks.hardcodedCredentials}
                onChange={(val) => onChange('analysis.security.checks.hardcodedCredentials', val)}
              />
              <SettingToggle
                label="Insecure Uploads"
                value={analysis.security.checks.insecureUploads}
                onChange={(val) => onChange('analysis.security.checks.insecureUploads', val)}
              />
            </div>
          </div>

          <SettingInput
            label="Failure Threshold"
            value={analysis.security.failureThreshold}
            onChange={(val) => onChange('analysis.security.failureThreshold', val)}
            type="number"
            min={0}
            max={50}
            helpText="Max high-risk issues before failing audit"
          />
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-yellow-400">
          Performance Analysis
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <SettingToggle
            label="N+1 Query Detection"
            value={analysis.performance.nPlusOneQueries}
            onChange={(val) => onChange('analysis.performance.nPlusOneQueries', val)}
            helpText="Find database query inefficiencies"
          />
          <SettingToggle
            label="Missing Index Detection"
            value={analysis.performance.missingIndexes}
            onChange={(val) => onChange('analysis.performance.missingIndexes', val)}
            helpText="Identify unindexed queries"
          />
          <SettingToggle
            label="Memory Leak Scanning"
            value={analysis.performance.memoryLeaks}
            onChange={(val) => onChange('analysis.performance.memoryLeaks', val)}
            helpText="Detect potential memory leaks"
          />
          <SettingToggle
            label="Bundle Size Analysis"
            value={analysis.performance.bundleSize}
            onChange={(val) => onChange('analysis.performance.bundleSize', val)}
            helpText="Check frontend bundle sizes"
          />
          <SettingToggle
            label="Slow Endpoint Detection"
            value={analysis.performance.slowEndpoints}
            onChange={(val) => onChange('analysis.performance.slowEndpoints', val)}
            helpText="Find performance bottlenecks"
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Mock Detection Protocol prevents false confidence from placeholder data. 
          Enable it to ensure test results represent real scans.
        </p>
      </div>
    </div>
  );
}

AnalysisSettings.propTypes = {
  config: PropTypes.shape({
    analysis: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default AnalysisSettings;
