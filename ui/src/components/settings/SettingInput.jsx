/**
 * SettingInput - Reusable text/number input component
 * 
 * Used for string and number inputs throughout the admin panel
 */

import PropTypes from 'prop-types';
import { Info } from 'lucide-react';

function SettingInput({
  label,
  value,
  onChange,
  type,
  placeholder,
  helpText,
  disabled,
  unit,
  min,
  max
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
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

SettingInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['text', 'number', 'password']),
  placeholder: PropTypes.string,
  helpText: PropTypes.string,
  disabled: PropTypes.bool,
  unit: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number
};

SettingInput.defaultProps = {
  type: 'text',
  placeholder: '',
  unit: '',
  disabled: false
};

export default SettingInput;
