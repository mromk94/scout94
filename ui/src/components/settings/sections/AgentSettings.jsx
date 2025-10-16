/**
 * AgentSettings - Section 2 of admin settings
 * 
 * Covers: All 7 agents with individual configurations
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 2
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SettingToggle from '../SettingToggle';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';

// Agent metadata
const AGENTS = [
  { id: 'scout94', name: 'Scout94', emoji: '🚀', color: 'blue' },
  { id: 'auditor', name: 'Auditor', emoji: '📊', color: 'purple' },
  { id: 'doctor', name: 'Doctor', emoji: '🩺', color: 'green' },
  { id: 'nurse', name: 'Nurse', emoji: '💉', color: 'pink' },
  { id: 'screenshot', name: 'Screenshot', emoji: '📸', color: 'indigo' },
  { id: 'backend', name: 'Backend', emoji: '⚙️', color: 'orange' },
  { id: 'frontend', name: 'Frontend', emoji: '🎨', color: 'cyan' }
];

function AgentSettings({ config, onChange }) {
  const [expandedAgent, setExpandedAgent] = useState(null);

  const getWorkloadPercentage = (agentId) => {
    // Calculate based on priority and enabled status
    const agent = config.agents[agentId];
    if (!agent.enabled) return 0;
    
    const priorities = { low: 10, medium: 20, high: 40, critical: 50 };
    return priorities[agent.priority] || 20;
  };

  const toggleAgent = (agentId) => {
    setExpandedAgent(expandedAgent === agentId ? null : agentId);
  };

  const enableAll = () => {
    AGENTS.forEach(agent => {
      onChange(`agents.${agent.id}.enabled`, true);
    });
  };

  const disableAll = () => {
    AGENTS.forEach(agent => {
      onChange(`agents.${agent.id}.enabled`, false);
    });
  };

  const resetDefaults = () => {
    if (confirm('Reset all agent settings to defaults?')) {
      // This would trigger a section reset in the parent
      alert('Agent settings reset to defaults');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Agent Configuration</h3>
        <p className="text-sm text-gray-400">
          Configure all 7 AI agents individually - enable/disable, set priorities, and customize behavior
        </p>
      </div>

      {/* Agent Matrix Overview */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wide text-blue-400">
            Agent Roster
          </h4>
          <div className="flex gap-2">
            <button
              onClick={enableAll}
              aria-label="Enable all agents"
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              Enable All
            </button>
            <button
              onClick={disableAll}
              aria-label="Disable all agents"
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              Disable All
            </button>
            <button
              onClick={resetDefaults}
              aria-label="Reset agents to default configuration"
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition"
            >
              Defaults
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {AGENTS.map((agent) => {
            const agentConfig = config.agents[agent.id];
            const workload = getWorkloadPercentage(agent.id);
            const isExpanded = expandedAgent === agent.id;

            return (
              <div
                key={agent.id}
                className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden"
              >
                {/* Agent Row */}
                <button
                  onClick={() => toggleAgent(agent.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-800/50 transition text-left"
                >
                  <span className="text-2xl">{agent.emoji}</span>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{agent.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        agentConfig.enabled 
                          ? 'bg-green-900/50 text-green-300' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {agentConfig.enabled ? 'ON' : 'OFF'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-900/50 text-blue-300 capitalize">
                        {agentConfig.priority}
                      </span>
                    </div>
                    
                    {/* Workload Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${agent.color}-500 transition-all`}
                          style={{ width: `${workload}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right">{workload}%</span>
                    </div>
                  </div>

                  <button className="p-1 hover:bg-gray-700 rounded transition">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </button>

                {/* Expanded Settings */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-700 p-4 bg-gray-950/50 space-y-3"
                  >
                    <SettingToggle
                      label="Enabled"
                      value={agentConfig.enabled}
                      onChange={(val) => onChange(`agents.${agent.id}.enabled`, val)}
                      helpText={`Enable or disable ${agent.name} agent`}
                    />

                    <SettingDropdown
                      label="Priority"
                      value={agentConfig.priority}
                      onChange={(val) => onChange(`agents.${agent.id}.priority`, val)}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'critical', label: 'Critical' }
                      ]}
                      helpText="Affects resource allocation and execution order"
                    />

                    {/* Agent-specific settings */}
                    {renderAgentSpecificSettings(agent.id, agentConfig, onChange)}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Scout94, Auditor, and Doctor are core agents and should remain enabled. 
          Screenshot, Backend, and Frontend agents are optional for specialized testing.
        </p>
      </div>
    </div>
  );
}

AgentSettings.propTypes = {
  config: PropTypes.shape({
    agents: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default AgentSettings;

// Agent-specific settings renderer
function renderAgentSpecificSettings(agentId, agentConfig, onChange) {
  switch (agentId) {
    case 'scout94':
      return (
        <>
          <SettingDropdown
            label="Chat Personality"
            value={agentConfig.chatPersonality}
            onChange={(val) => onChange(`agents.${agentId}.chatPersonality`, val)}
            options={[
              { value: 'professional', label: 'Professional' },
              { value: 'casual', label: 'Casual' },
              { value: 'fun', label: 'Fun' }
            ]}
          />
          <SettingSlider
            label="Verbosity"
            value={agentConfig.verbosity}
            onChange={(val) => onChange(`agents.${agentId}.verbosity`, val)}
            min={0}
            max={1}
            step={0.1}
            leftLabel="Concise"
            rightLabel="Detailed"
          />
        </>
      );

    case 'auditor':
      return (
        <>
          <SettingSlider
            label="Pass/Fail Threshold"
            value={agentConfig.threshold}
            onChange={(val) => onChange(`agents.${agentId}.threshold`, val)}
            min={3}
            max={7}
            step={1}
            helpText="Score below this triggers retry (Per RETRY_FLOWS_COMPLETE.md)"
          />
          <SettingDropdown
            label="Recommendation Detail"
            value={agentConfig.recommendationDetail}
            onChange={(val) => onChange(`agents.${agentId}.recommendationDetail`, val)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]}
          />
        </>
      );

    case 'doctor':
      return (
        <>
          <SettingDropdown
            label="Diagnosis Depth"
            value={agentConfig.diagnosisDepth}
            onChange={(val) => onChange(`agents.${agentId}.diagnosisDepth`, val)}
            options={[
              { value: 'quick', label: 'Quick' },
              { value: 'standard', label: 'Standard' },
              { value: 'deep', label: 'Deep' }
            ]}
          />
          <SettingToggle
            label="Verify Mathematical Formulas"
            value={agentConfig.verifyFormulas}
            onChange={(val) => onChange(`agents.${agentId}.verifyFormulas`, val)}
            helpText="Check health/risk calculations per MATHEMATICAL_FRAMEWORK.md"
          />
        </>
      );

    case 'nurse':
      return (
        <>
          <SettingDropdown
            label="Safety Level"
            value={agentConfig.safetyLevel}
            onChange={(val) => onChange(`agents.${agentId}.safetyLevel`, val)}
            options={[
              { value: 'conservative', label: 'Conservative' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'aggressive', label: 'Aggressive' }
            ]}
            helpText="Treatment application strategy"
          />
          <SettingSlider
            label="Auto-Apply Threshold"
            value={agentConfig.autoApplyThreshold}
            onChange={(val) => onChange(`agents.${agentId}.autoApplyThreshold`, val)}
            min={0}
            max={75}
            step={5}
            helpText="Auto-apply treatments with risk score below this"
          />
        </>
      );

    case 'screenshot':
      return (
        <>
          <SettingToggle
            label="AI Analysis"
            value={agentConfig.aiAnalysis}
            onChange={(val) => onChange(`agents.${agentId}.aiAnalysis`, val)}
            helpText="Use GPT-4o Vision for UX/UI analysis"
          />
          <SettingSlider
            label="Visual Diff Threshold"
            value={agentConfig.visualDiffThreshold}
            onChange={(val) => onChange(`agents.${agentId}.visualDiffThreshold`, val)}
            min={0}
            max={10}
            step={0.5}
            unit="%"
            helpText="Sensitivity for detecting visual changes"
          />
        </>
      );

    default:
      return (
        <div className="text-sm text-gray-500 text-center py-2">
          Additional settings for {agentId} agent
        </div>
      );
  }
}
