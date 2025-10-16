/**
 * UISettings - Section 8 of admin settings
 * 
 * Covers: Theme, appearance, chat interface, IDE panel, notifications
 * Per: ADMIN_SETTINGS_PANEL_TODO.md Section 8
 */

import PropTypes from 'prop-types';
import SettingToggle from '../SettingToggle';
import SettingSlider from '../SettingSlider';
import SettingDropdown from '../SettingDropdown';
import SettingInput from '../SettingInput';

function UISettings({ config, onChange }) {
  const ui = config.ui;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">UI/UX Customization</h3>
        <p className="text-sm text-gray-400">
          Appearance, chat interface styling, IDE panel configuration, and notifications
        </p>
      </div>

      {/* Appearance */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-blue-400">
          Appearance
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Theme"
            value={ui.theme}
            onChange={(val) => onChange('ui.theme', val)}
            options={[
              { value: 'dark', label: 'Dark (Recommended)' },
              { value: 'light', label: 'Light' },
              { value: 'auto', label: 'Auto (System)' }
            ]}
            helpText="Overall color scheme"
          />

          <div>
            <label className="text-sm font-medium text-white mb-1 block">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={ui.accentColor}
                onChange={(e) => onChange('ui.accentColor', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={ui.accentColor}
                onChange={(e) => onChange('ui.accentColor', e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Primary color for buttons, highlights, and accents
            </p>
          </div>

          <SettingDropdown
            label="Font Size"
            value={ui.fontSize}
            onChange={(val) => onChange('ui.fontSize', val)}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium (Default)' },
              { value: 'large', label: 'Large' }
            ]}
            helpText="Base font size for interface"
          />

          <SettingToggle
            label="Compact Mode"
            value={ui.compactMode}
            onChange={(val) => onChange('ui.compactMode', val)}
            helpText="Reduce spacing and padding"
          />

          <SettingToggle
            label="Animations"
            value={ui.animations}
            onChange={(val) => onChange('ui.animations', val)}
            helpText="Enable smooth transitions and effects"
          />
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-purple-400">
          Chat Interface
        </h4>

        <div className="space-y-3">
          <SettingDropdown
            label="Bubble Style"
            value={ui.chat.bubbleStyle}
            onChange={(val) => onChange('ui.chat.bubbleStyle', val)}
            options={[
              { value: 'rounded', label: 'Rounded (Default)' },
              { value: 'square', label: 'Square' },
              { value: 'minimal', label: 'Minimal' }
            ]}
          />

          <SettingToggle
            label="Markdown Rendering"
            value={ui.chat.markdownRendering}
            onChange={(val) => onChange('ui.chat.markdownRendering', val)}
            helpText="Render rich text, code blocks, tables"
          />

          <SettingDropdown
            label="Syntax Highlighting Theme"
            value={ui.chat.syntaxTheme}
            onChange={(val) => onChange('ui.chat.syntaxTheme', val)}
            options={[
              { value: 'vscDarkPlus', label: 'VS Code Dark+' },
              { value: 'dracula', label: 'Dracula' },
              { value: 'github', label: 'GitHub Light' },
              { value: 'monokai', label: 'Monokai' },
              { value: 'nord', label: 'Nord' }
            ]}
            helpText="Code block color scheme"
          />

          <SettingInput
            label="Code Block Max Height"
            value={ui.chat.codeBlockMaxHeight}
            onChange={(val) => onChange('ui.chat.codeBlockMaxHeight', val)}
            type="number"
            unit="px"
            min={100}
            max={1000}
            helpText="Scrollable after this height"
          />

          <SettingDropdown
            label="Image Preview Size"
            value={ui.chat.imagePreviewSize}
            onChange={(val) => onChange('ui.chat.imagePreviewSize', val)}
            options={[
              { value: 'small', label: 'Small (200px)' },
              { value: 'medium', label: 'Medium (400px)' },
              { value: 'large', label: 'Large (600px)' }
            ]}
          />

          <SettingToggle
            label="Auto-scroll to Bottom"
            value={ui.chat.autoScroll}
            onChange={(val) => onChange('ui.chat.autoScroll', val)}
            helpText="Follow new messages automatically"
          />
        </div>
      </div>

      {/* IDE Panel */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-green-400">
          IDE Panel
        </h4>

        <div className="space-y-3">
          <SettingToggle
            label="Show Line Numbers"
            value={ui.ide.lineNumbers}
            onChange={(val) => onChange('ui.ide.lineNumbers', val)}
            helpText="Display line numbers in code views"
          />

          <SettingDropdown
            label="Syntax Highlighting Theme"
            value={ui.ide.syntaxTheme}
            onChange={(val) => onChange('ui.ide.syntaxTheme', val)}
            options={[
              { value: 'vscDarkPlus', label: 'VS Code Dark+' },
              { value: 'dracula', label: 'Dracula' },
              { value: 'github', label: 'GitHub Light' },
              { value: 'monokai', label: 'Monokai' },
              { value: 'nord', label: 'Nord' }
            ]}
          />

          <SettingToggle
            label="Word Wrap"
            value={ui.ide.wordWrap}
            onChange={(val) => onChange('ui.ide.wordWrap', val)}
            helpText="Wrap long lines to fit width"
          />

          <SettingToggle
            label="Breadcrumb Navigation"
            value={ui.ide.breadcrumbs}
            onChange={(val) => onChange('ui.ide.breadcrumbs', val)}
            helpText="Show file path at top"
          />

          <SettingInput
            label="File Tree Depth"
            value={ui.ide.fileTreeDepth}
            onChange={(val) => onChange('ui.ide.fileTreeDepth', val)}
            type="number"
            min={1}
            max={20}
            helpText="Max directory nesting level"
          />

          <SettingToggle
            label="Filter Minified Files"
            value={ui.ide.filterMinified}
            onChange={(val) => onChange('ui.ide.filterMinified', val)}
            helpText="Hide .min.js, .min.css files"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide text-yellow-400">
          Notifications
        </h4>

        <div className="space-y-3">
          <SettingToggle
            label="Desktop Notifications"
            value={ui.notifications.desktop}
            onChange={(val) => onChange('ui.notifications.desktop', val)}
            helpText="System notifications (requires permission)"
          />

          <SettingToggle
            label="Sound Alerts"
            value={ui.notifications.sound}
            onChange={(val) => onChange('ui.notifications.sound', val)}
            helpText="Play sound on notifications"
          />

          <SettingDropdown
            label="Toast Position"
            value={ui.notifications.position}
            onChange={(val) => onChange('ui.notifications.position', val)}
            options={[
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' }
            ]}
          />

          <SettingInput
            label="Auto-dismiss Timeout"
            value={ui.notifications.autoDismiss}
            onChange={(val) => onChange('ui.notifications.autoDismiss', val)}
            type="number"
            unit="ms"
            min={1000}
            max={30000}
            helpText="Hide notifications after X milliseconds (0 = manual)"
          />

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Notification Types
            </label>
            <p className="text-xs text-gray-400 mb-2">Which types to show:</p>
            <div className="flex flex-wrap gap-2">
              {['all', 'errors', 'warnings', 'success', 'info'].map(type => (
                <button
                  key={type}
                  onClick={() => {
                    const current = ui.notifications.typeFilter;
                    const hasType = current.includes(type);
                    if (type === 'all') {
                      onChange('ui.notifications.typeFilter', ['all']);
                    } else if (hasType) {
                      onChange('ui.notifications.typeFilter', current.filter(t => t !== type && t !== 'all'));
                    } else {
                      onChange('ui.notifications.typeFilter', [...current.filter(t => t !== 'all'), type]);
                    }
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    ui.notifications.typeFilter.includes(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Changes to theme and colors take effect immediately. 
          Use compact mode for smaller screens or when you want to see more content at once.
        </p>
      </div>
    </div>
  );
}

UISettings.propTypes = {
  config: PropTypes.shape({
    ui: PropTypes.object.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired
};

export default UISettings;
