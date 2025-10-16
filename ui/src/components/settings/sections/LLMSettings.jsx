/**
 * LLMSettings - Section 5 of admin settings
 * 
 * Covers: Provider selection, multi-LLM specialization, parameters, cost management
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 5 + MULTI_LLM_PLAN.md
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, DollarSign } from 'lucide-react';
import SettingToggle from '../SettingToggle';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';

function LLMSettings({ config, onChange }) {
  const llm = config.llm;
  const [showApiKey, setShowApiKey] = useState(false);

  // Calculate estimated monthly cost
  const estimatedCost = (llm.costManagement.monthlyBudget * 
    (llm.costManagement.trackUsage ? 1 : 0)).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">LLM Configuration</h3>
        <p className="text-sm text-gray-400">
          AI provider selection, multi-LLM specialization, parameters, and cost management
        </p>
      </div>

      {/* Primary LLM Selection */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-5 border-2 border-blue-700/50">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Primary LLM Provider
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Primary LLM"
            value={llm.primary}
            onChange={(val) => onChange('llm.primary', val)}
            options={[
              { value: 'gpt-4o', label: 'OpenAI GPT-4o (Fast, reliable)' },
              { value: 'gemini', label: 'Google Gemini 1.5 Pro (Free tier)' },
              { value: 'claude', label: 'Anthropic Claude 3.5 Sonnet (Best reasoning)' },
              { value: 'mock', label: 'Mock Mode (Testing only)' }
            ]}
            helpText="Default LLM for agents without specific assignment"
          />

          <div>
            <label className="text-sm font-medium text-white mb-1 flex items-center gap-2">
              API Key
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                className="p-1 hover:bg-gray-700 rounded transition"
              >
                {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </label>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={llm.apiKey}
              onChange={(e) => onChange('llm.apiKey', e.target.value)}
              placeholder="sk-proj-... or AIza... (stored locally)"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              🔒 Stored in localStorage (not sent to any server except LLM provider)
            </p>
          </div>

          <SettingDropdown
            label="Fallback LLM"
            value={llm.fallback}
            onChange={(val) => onChange('llm.fallback', val)}
            options={[
              { value: 'gemini', label: 'Google Gemini (Free tier)' },
              { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
              { value: 'claude', label: 'Anthropic Claude' },
              { value: 'mock', label: 'Mock Mode' }
            ]}
            helpText="Used if primary LLM fails"
          />
        </div>
      </div>

      {/* Multi-LLM Specialization */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400">
          Multi-LLM Specialization
          <span className="text-xs text-gray-400 ml-2 font-normal">
            Per MULTI_LLM_PLAN.md
          </span>
        </h4>

        <p className="text-xs text-gray-400 mb-4">
          Assign specialized LLMs to each agent for optimal quality and cost efficiency
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">🚀 Scout94 (Testing)</label>
              <SettingDropdown
                label=""
                value={llm.agents.scout94}
                onChange={(val) => onChange('llm.agents.scout94', val)}
                options={[
                  { value: 'gpt-4o', label: 'GPT-4o ($0.002/run)' },
                  { value: 'gemini', label: 'Gemini (FREE)' },
                  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 ($0.015)' }
                ]}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">📊 Auditor (QA Review)</label>
              <SettingDropdown
                label=""
                value={llm.agents.auditor}
                onChange={(val) => onChange('llm.agents.auditor', val)}
                options={[
                  { value: 'gemini', label: 'Gemini (FREE) ⭐' },
                  { value: 'gpt-4o', label: 'GPT-4o ($0.002)' },
                  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 ($0.015)' }
                ]}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">🩺 Doctor (Diagnosis)</label>
              <SettingDropdown
                label=""
                value={llm.agents.doctor}
                onChange={(val) => onChange('llm.agents.doctor', val)}
                options={[
                  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 ($0.015) ⭐' },
                  { value: 'gpt-4o', label: 'GPT-4o ($0.002)' },
                  { value: 'gemini', label: 'Gemini (FREE)' }
                ]}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">💉 Nurse (Treatment)</label>
              <SettingDropdown
                label=""
                value={llm.agents.nurse}
                onChange={(val) => onChange('llm.agents.nurse', val)}
                options={[
                  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 ($0.015) ⭐' },
                  { value: 'gpt-4o', label: 'GPT-4o ($0.002)' },
                  { value: 'gemini', label: 'Gemini (FREE)' }
                ]}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">⚖️ Risk Assessor</label>
              <SettingDropdown
                label=""
                value={llm.agents.riskAssessor}
                onChange={(val) => onChange('llm.agents.riskAssessor', val)}
                options={[
                  { value: 'gpt-4o-mini', label: 'GPT-4o-mini ($0.0001) ⭐' },
                  { value: 'gemini', label: 'Gemini (FREE)' },
                  { value: 'gpt-4o', label: 'GPT-4o ($0.002)' }
                ]}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">📸 Screenshot (Visual)</label>
              <SettingDropdown
                label=""
                value={llm.agents.screenshot}
                onChange={(val) => onChange('llm.agents.screenshot', val)}
                options={[
                  { value: 'gpt-4o-vision', label: 'GPT-4o Vision ($0.007) ⭐' },
                  { value: 'gemini', label: 'Gemini (FREE)' },
                  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 ($0.015)' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* LLM Parameters */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-green-400">
          LLM Parameters
        </h4>

        <div className="space-y-4">
          <SettingSlider
            label="Temperature"
            value={llm.parameters.temperature}
            onChange={(val) => onChange('llm.parameters.temperature', val)}
            min={0}
            max={1}
            step={0.1}
            leftLabel="Deterministic"
            rightLabel="Creative"
            helpText="Lower = more consistent, Higher = more varied responses"
          />

          <SettingSlider
            label="Max Tokens"
            value={llm.parameters.maxTokens}
            onChange={(val) => onChange('llm.parameters.maxTokens', val)}
            min={512}
            max={4096}
            step={128}
            helpText="Response length limit"
          />

          <SettingSlider
            label="Top P (Nucleus Sampling)"
            value={llm.parameters.topP}
            onChange={(val) => onChange('llm.parameters.topP', val)}
            min={0}
            max={1}
            step={0.1}
            helpText="Controls diversity of output"
          />

          <SettingInput
            label="API Timeout"
            value={llm.parameters.timeout}
            onChange={(val) => onChange('llm.parameters.timeout', val)}
            type="number"
            unit="sec"
            min={10}
            max={120}
            helpText="Request timeout in seconds"
          />

          <SettingSlider
            label="Retry Attempts on Failure"
            value={llm.parameters.retryAttempts}
            onChange={(val) => onChange('llm.parameters.retryAttempts', val)}
            min={0}
            max={5}
            step={1}
            helpText="How many times to retry failed API calls"
          />
        </div>
      </div>

      {/* Cost Management */}
      <div className="bg-gradient-to-br from-green-900/20 to-yellow-900/20 rounded-xl p-5 border-2 border-green-700/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wide text-green-400">
            Cost Management
          </h4>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-green-300">
              ${estimatedCost}/month
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <SettingInput
            label="Monthly Budget"
            value={llm.costManagement.monthlyBudget}
            onChange={(val) => onChange('llm.costManagement.monthlyBudget', val)}
            type="number"
            unit="USD"
            min={0}
            max={1000}
            helpText="Maximum spend per month"
          />

          <SettingSlider
            label="Alert Threshold"
            value={llm.costManagement.alertThreshold * 100}
            onChange={(val) => onChange('llm.costManagement.alertThreshold', val / 100)}
            min={0}
            max={100}
            step={5}
            unit="%"
            helpText="Alert when reaching X% of budget"
          />

          <SettingToggle
            label="Track Usage"
            value={llm.costManagement.trackUsage}
            onChange={(val) => onChange('llm.costManagement.trackUsage', val)}
            helpText="Monitor API usage and costs"
          />

          <SettingToggle
            label="Per-Agent Cost Breakdown"
            value={llm.costManagement.perAgentBreakdown}
            onChange={(val) => onChange('llm.costManagement.perAgentBreakdown', val)}
            helpText="Track costs by individual agent"
          />
        </div>

        {/* Cost Estimates */}
        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
          <p className="text-xs font-semibold text-gray-300 mb-2">Estimated Costs (per run):</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Scout94 (GPT-4o):</span>
              <span className="text-green-300">$0.002</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Auditor (Gemini):</span>
              <span className="text-green-300">FREE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Doctor (Claude):</span>
              <span className="text-yellow-300">$0.015</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nurse (Claude):</span>
              <span className="text-yellow-300">$0.015</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Risk (GPT-4o-mini):</span>
              <span className="text-green-300">$0.0001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Screenshot (Vision):</span>
              <span className="text-orange-300">$0.007/page</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between font-semibold">
            <span className="text-gray-300">Total per full run:</span>
            <span className="text-blue-300">~$0.04</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 At 20 runs/month = ~$0.80 (well under typical budgets)
          </p>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Multi-LLM specialization optimizes both quality and cost. 
          Gemini for auditing (free), Claude for diagnosis (best reasoning), GPT-4o-mini for risk assessment (cheap).
        </p>
      </div>
    </div>
  );
}

LLMSettings.propTypes = {
  config: PropTypes.shape({
    llm: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default LLMSettings;
