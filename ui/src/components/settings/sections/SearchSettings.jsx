/**
 * SearchSettings - Section 12 of admin settings
 * 
 * Covers: Settings search, quick actions, keyboard shortcuts
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 12
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Clock, Star, Keyboard } from 'lucide-react';

function SearchSettings({ config, onChange }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock search results
  const mockResults = searchQuery ? [
    { section: 'General', subsection: 'Execution Mode', setting: 'Default Mode', path: 'general.executionMode' },
    { section: 'Testing', subsection: 'Health Scoring', setting: 'Test Coverage Weight', path: 'testing.health.weights.testCoverage' },
    { section: 'LLM', subsection: 'Primary LLM', setting: 'API Key', path: 'llm.apiKey' },
    { section: 'Reporting', subsection: 'Format', setting: 'Output Formats', path: 'reporting.format' },
  ].filter(r => 
    r.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.setting.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Search & Quick Access</h3>
        <p className="text-sm text-gray-400">
          Quickly find and access settings, view recent changes, and keyboard shortcuts
        </p>
      </div>

      {/* Settings Search */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-5 border-2 border-blue-700/50">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Settings Search
        </h4>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search settings..."
            className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {searchQuery && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {mockResults.length > 0 ? (
              <>
                <p className="text-xs text-gray-400 mb-2">Results ({mockResults.length}):</p>
                {mockResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => alert(`Navigate to: ${result.path}`)}
                    className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition">
                          {result.section} → {result.subsection}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {result.setting}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.path}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No settings found</p>
              </div>
            )}
          </div>
        )}

        {!searchQuery && (
          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg text-center">
            <p className="text-sm text-gray-400">
              Start typing to search across all 200+ settings
            </p>
          </div>
        )}
      </div>

      {/* Recently Changed */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-green-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recently Changed
        </h4>

        <div className="space-y-2">
          {[
            { setting: 'Execution Mode', value: 'audit', time: '2 minutes ago', section: 'General' },
            { setting: 'Primary LLM', value: 'gpt-4o', time: '5 minutes ago', section: 'LLM' },
            { setting: 'Health Coverage Weight', value: '25%', time: '10 minutes ago', section: 'Testing' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-white">{item.setting}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.section} • {item.time}
                </p>
              </div>
              <div className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Accessed */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-yellow-400 flex items-center gap-2">
          <Star className="w-4 h-4" />
          Frequently Accessed
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Execution Mode', section: 'General', count: 12 },
            { name: 'Agent Enable/Disable', section: 'Agents', count: 8 },
            { name: 'LLM API Key', section: 'LLM', count: 6 },
            { name: 'Report Format', section: 'Reporting', count: 5 },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => alert(`Navigate to: ${item.section} → ${item.name}`)}
              className="p-3 bg-gray-900/50 hover:bg-gray-900 rounded-lg transition text-left group"
            >
              <p className="text-sm font-medium text-white group-hover:text-yellow-400 transition">
                {item.name}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">{item.section}</p>
                <p className="text-xs text-yellow-500">{item.count} views</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400 flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          Keyboard Shortcuts
        </h4>

        <div className="space-y-2">
          {[
            { keys: ['⌘', 'K'], action: 'Open settings search' },
            { keys: ['⌘', 'S'], action: 'Save settings' },
            { keys: ['⌘', 'R'], action: 'Reset current section' },
            { keys: ['Esc'], action: 'Close settings modal' },
            { keys: ['⌘', '1-9'], action: 'Jump to section' },
            { keys: ['Tab'], action: 'Navigate between fields' },
          ].map((shortcut, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
            >
              <p className="text-sm text-gray-300">{shortcut.action}</p>
              <div className="flex gap-1">
                {shortcut.keys.map((key, kidx) => (
                  <kbd
                    key={kidx}
                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono border border-gray-600"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Quick Actions
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm">
            💾 Export Settings
          </button>
          <button className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition text-sm">
            📥 Import Settings
          </button>
          <button className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition text-sm">
            🔄 Reset Section
          </button>
          <button className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition text-sm">
            ⚠️ Reset All
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Pro Tip:</strong> Use <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono">⌘ K</kbd> to quickly search 
          any setting. Press <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-mono">⌘ S</kbd> to save changes.
        </p>
      </div>
    </div>
  );
}

SearchSettings.propTypes = {
  config: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default SearchSettings;
