/**
 * SettingDropdown - Reusable dropdown component
 * 
 * Used for enum/choice settings throughout the admin panel
 */

import PropTypes from 'prop-types';
import { ChevronDown, Info } from 'lucide-react';

function SettingDropdown({
  label,
  value,
  onChange,
  options,
  helpText,
  disabled
}) {
  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-white">{label}</span>
        {helpText && (
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 hover:text-blue-400 cursor-help" />
            <div className="absolute left-0 top-6 w-64 p-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {helpText}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm appearance-none cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

SettingDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  helpText: PropTypes.string,
  disabled: PropTypes.bool
};

SettingDropdown.defaultProps = {
  disabled: false
};

export default SettingDropdown;
