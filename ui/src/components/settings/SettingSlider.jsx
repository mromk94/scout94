/**
 * SettingSlider - Reusable slider component
 * 
 * Used for numeric range settings (e.g., verbosity, temperature)
 */

import PropTypes from 'prop-types';
import { Info } from 'lucide-react';

function SettingSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  helpText,
  disabled,
  leftLabel,
  rightLabel
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
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
        <span className="text-sm font-semibold text-blue-400">
          {value}{unit}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {leftLabel && <span className="text-xs text-gray-400 whitespace-nowrap">{leftLabel}</span>}
        
        <div className="flex-1 relative">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            disabled={disabled}
            className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        {rightLabel && <span className="text-xs text-gray-400 whitespace-nowrap">{rightLabel}</span>}
      </div>
    </div>
  );
}

SettingSlider.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  unit: PropTypes.string,
  helpText: PropTypes.string,
  disabled: PropTypes.bool,
  leftLabel: PropTypes.string,
  rightLabel: PropTypes.string
};

SettingSlider.defaultProps = {
  min: 0,
  max: 100,
  step: 1,
  unit: '',
  disabled: false
};

export default SettingSlider;
