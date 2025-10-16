/**
 * ReportingSettings - Section 6 of admin settings
 * 
 * Covers: Report formats, collaborative reporting, summary generation
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 6 + PROGRESSIVE_REPORT_FLOW.md
 */

import PropTypes from 'prop-types';
import SettingToggle from '../SettingToggle';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';

function ReportingSettings({ config, onChange }) {
  const reporting = config.reporting;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Reporting Configuration</h3>
        <p className="text-sm text-gray-400">
          Report formats, collaborative reporting with live updates, and summary generation
        </p>
      </div>

      {/* Report Format */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Report Format
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Output Formats
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Markdown (.md)"
                value={reporting.format.markdown}
                onChange={(val) => onChange('reporting.format.markdown', val)}
                helpText="Human-readable, IDE-friendly"
              />
              <SettingToggle
                label="JSON (.json)"
                value={reporting.format.json}
                onChange={(val) => onChange('reporting.format.json', val)}
                helpText="Machine-readable, API-friendly"
              />
              <SettingToggle
                label="HTML (.html)"
                value={reporting.format.html}
                onChange={(val) => onChange('reporting.format.html', val)}
                helpText="Web browser viewable"
              />
              <SettingToggle
                label="PDF (.pdf)"
                value={reporting.format.pdf}
                onChange={(val) => onChange('reporting.format.pdf', val)}
                helpText="Print-ready format"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Report Components
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Executive Summary"
                value={reporting.components.executiveSummary}
                onChange={(val) => onChange('reporting.components.executiveSummary', val)}
              />
              <SettingToggle
                label="Health Score"
                value={reporting.components.healthScore}
                onChange={(val) => onChange('reporting.components.healthScore', val)}
              />
              <SettingToggle
                label="Test Results"
                value={reporting.components.testResults}
                onChange={(val) => onChange('reporting.components.testResults', val)}
              />
              <SettingToggle
                label="Root Cause Analysis"
                value={reporting.components.rootCauseAnalysis}
                onChange={(val) => onChange('reporting.components.rootCauseAnalysis', val)}
              />
              <SettingToggle
                label="Security Findings"
                value={reporting.components.securityFindings}
                onChange={(val) => onChange('reporting.components.securityFindings', val)}
              />
              <SettingToggle
                label="Performance Recommendations"
                value={reporting.components.performanceRecommendations}
                onChange={(val) => onChange('reporting.components.performanceRecommendations', val)}
              />
              <SettingToggle
                label="Code Quality"
                value={reporting.components.codeQuality}
                onChange={(val) => onChange('reporting.components.codeQuality', val)}
              />
              <SettingToggle
                label="Authenticity Verification"
                value={reporting.components.authenticityVerification}
                onChange={(val) => onChange('reporting.components.authenticityVerification', val)}
                helpText="Mock Detection results"
              />
            </div>
          </div>

          <SettingInput
            label="Report Location"
            value={reporting.location}
            onChange={(val) => onChange('reporting.location', val)}
            placeholder="test-reports"
            helpText="Relative to project root or absolute path"
          />

          <SettingDropdown
            label="Naming Convention"
            value={reporting.namingConvention}
            onChange={(val) => onChange('reporting.namingConvention', val)}
            options={[
              { value: 'timestamped', label: 'Timestamped (REPORT-2025-10-16-2100.md)' },
              { value: 'descriptive', label: 'Descriptive (ANALYSIS-REPORT-{date}.md)' },
              { value: 'simple', label: 'Simple (REPORT.md - overwrites)' }
            ]}
          />
        </div>
      </div>

      {/* Collaborative Reporting */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-5 border-2 border-purple-700/50">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400">
          Collaborative Reporting
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per PROGRESSIVE_REPORT_FLOW.md
          </span>
        </h4>

        <p className="text-xs text-gray-400 mb-4">
          Multiple agents write to same report concurrently using region-based locking
        </p>

        <div className="space-y-3">
          <SettingToggle
            label="Enable Live Updates"
            value={reporting.collaborative.liveUpdates}
            onChange={(val) => onChange('reporting.collaborative.liveUpdates', val)}
            helpText="Real-time report updates as agents work"
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Report Regions
            </label>
            <div className="grid grid-cols-3 gap-2">
              <SettingToggle
                label="🚀 SCOUT94"
                value={reporting.collaborative.regions.scout94}
                onChange={(val) => onChange('reporting.collaborative.regions.scout94', val)}
                helpText="Test results section"
              />
              <SettingToggle
                label="🩺 CLINIC"
                value={reporting.collaborative.regions.clinic}
                onChange={(val) => onChange('reporting.collaborative.regions.clinic', val)}
                helpText="Diagnosis & treatment"
              />
              <SettingToggle
                label="📊 AUDITOR"
                value={reporting.collaborative.regions.auditor}
                onChange={(val) => onChange('reporting.collaborative.regions.auditor', val)}
                helpText="LLM evaluation"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Report Secretary Scripts
              <span className="text-xs text-gray-400 ml-2">
                (Per-agent summary generators)
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <SettingToggle
                label="Scout94 Secretary"
                value={reporting.collaborative.secretaryScripts.scout94}
                onChange={(val) => onChange('reporting.collaborative.secretaryScripts.scout94', val)}
              />
              <SettingToggle
                label="Clinic Secretary"
                value={reporting.collaborative.secretaryScripts.clinic}
                onChange={(val) => onChange('reporting.collaborative.secretaryScripts.clinic', val)}
              />
              <SettingToggle
                label="Auditor Secretary"
                value={reporting.collaborative.secretaryScripts.auditor}
                onChange={(val) => onChange('reporting.collaborative.secretaryScripts.auditor', val)}
              />
            </div>
          </div>

          <SettingDropdown
            label="Update Frequency"
            value={reporting.collaborative.updateFrequency}
            onChange={(val) => onChange('reporting.collaborative.updateFrequency', val)}
            options={[
              { value: 'realtime', label: 'Real-time (Immediate)' },
              { value: 'every5s', label: 'Every 5 seconds' },
              { value: 'every10s', label: 'Every 10 seconds' },
              { value: 'onComplete', label: 'On completion only' }
            ]}
            helpText="How often to update report file"
          />

          <SettingInput
            label="Report Lock Timeout"
            value={reporting.collaborative.lockTimeout}
            onChange={(val) => onChange('reporting.collaborative.lockTimeout', val)}
            type="number"
            unit="sec"
            min={10}
            max={300}
            helpText="Force release lock after X seconds"
          />

          <SettingToggle
            label="Show Region Markers"
            value={reporting.collaborative.showRegionMarkers}
            onChange={(val) => onChange('reporting.collaborative.showRegionMarkers', val)}
            helpText="Display HTML comment markers in reports"
          />

          <SettingToggle
            label="Auto-open in IDE"
            value={reporting.collaborative.autoOpenIDE}
            onChange={(val) => onChange('reporting.collaborative.autoOpenIDE', val)}
            helpText="Automatically display report after generation"
          />
        </div>
      </div>

      {/* Summary Generation */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-green-400">
          Summary Generation
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Summary Length"
            value={reporting.summary.length}
            onChange={(val) => onChange('reporting.summary.length', val)}
            options={[
              { value: 'adaptive', label: 'Adaptive (Based on findings)' },
              { value: 'concise', label: 'Concise (1-2 paragraphs)' },
              { value: 'detailed', label: 'Detailed (Full breakdown)' }
            ]}
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Summary Components
            </label>
            <div className="grid grid-cols-2 gap-2">
              <SettingToggle
                label="Status Overview"
                value={reporting.summary.components.status}
                onChange={(val) => onChange('reporting.summary.components.status', val)}
              />
              <SettingToggle
                label="Key Metrics"
                value={reporting.summary.components.metrics}
                onChange={(val) => onChange('reporting.summary.components.metrics', val)}
              />
              <SettingToggle
                label="Issues Found"
                value={reporting.summary.components.issues}
                onChange={(val) => onChange('reporting.summary.components.issues', val)}
              />
              <SettingToggle
                label="Recommendations"
                value={reporting.summary.components.recommendations}
                onChange={(val) => onChange('reporting.summary.components.recommendations', val)}
              />
              <SettingToggle
                label="Time Estimates"
                value={reporting.summary.components.timeEstimates}
                onChange={(val) => onChange('reporting.summary.components.timeEstimates', val)}
              />
            </div>
          </div>

          <SettingDropdown
            label="Tone"
            value={reporting.summary.tone}
            onChange={(val) => onChange('reporting.summary.tone', val)}
            options={[
              { value: 'technical', label: 'Technical (Developer-focused)' },
              { value: 'balanced', label: 'Balanced (Recommended)' },
              { value: 'executive', label: 'Executive (High-level)' }
            ]}
            helpText="Writing style for summaries"
          />
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-4">
        <p className="text-sm text-purple-300">
          💡 <strong>Tip:</strong> Collaborative reporting allows multiple agents to write to the same report 
          simultaneously using region-based locking. Enable live updates to see progress in real-time.
        </p>
      </div>
    </div>
  );
}

ReportingSettings.propTypes = {
  config: PropTypes.shape({
    reporting: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default ReportingSettings;
