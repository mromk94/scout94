/**
 * SettingToggle - Reusable toggle switch component
 * 
 * Used for boolean settings throughout the admin panel
 */

import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

function SettingToggle({ 
  label, 
  value, 
  onChange, 
  helpText,
  disabled 
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 flex-1">
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
      
      <button
        role="switch"
        aria-checked={value}
        aria-label={label}
        aria-disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${value ? 'bg-blue-600' : 'bg-gray-600'}`}
      >
        <motion.div
          animate={{ x: value ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
        />
      </button>
    </div>
  );
}

SettingToggle.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  helpText: PropTypes.string,
  disabled: PropTypes.bool
};

SettingToggle.defaultProps = {
  disabled: false
};

export default SettingToggle;
