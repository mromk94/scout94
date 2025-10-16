/**
 * WeightValidator - Reusable component for weight validation UI
 * 
 * Used in SecuritySettings and TestingSettings to validate that weights sum to 1.0
 * Per: DRY principle - extract common validation logic
 */

import PropTypes from 'prop-types';

function WeightValidator({ weights, label, helpText }) {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isValid = Math.abs(totalWeight - 1.0) < 0.001;

  return (
    <div className={`p-4 rounded-lg border ${
      isValid 
        ? 'bg-green-900/20 border-green-700/50' 
        : 'bg-red-900/20 border-red-700/50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">
          {label || 'Weight Validation'}
        </span>
        <span className={`text-sm font-bold ${
          isValid ? 'text-green-400' : 'text-red-400'
        }`}>
          {isValid ? '✅ Valid' : '❌ Invalid'}
        </span>
      </div>
      
      <div className="text-xs text-gray-400 mb-2">
        {helpText || 'Weights must sum to exactly 1.0 for proper calculation'}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Total</div>
          <div className={`text-lg font-mono font-bold ${
            isValid ? 'text-green-400' : 'text-red-400'
          }`}>
            {totalWeight.toFixed(4)}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Expected</div>
          <div className="text-lg font-mono font-bold text-blue-400">
            1.0000
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Difference</div>
          <div className={`text-lg font-mono font-bold ${
            Math.abs(totalWeight - 1.0) < 0.001 ? 'text-green-400' : 'text-red-400'
          }`}>
            {(totalWeight - 1.0) >= 0 ? '+' : ''}{(totalWeight - 1.0).toFixed(4)}
          </div>
        </div>
      </div>
      
      {!isValid && (
        <div className="mt-3 p-2 bg-red-900/30 border border-red-700/50 rounded text-xs text-red-300">
          ⚠️ <strong>Warning:</strong> Weights do not sum to 1.0. 
          Adjust values until total equals exactly 1.0000 for accurate calculations.
        </div>
      )}
    </div>
  );
}

WeightValidator.propTypes = {
  weights: PropTypes.objectOf(PropTypes.number).isRequired,
  label: PropTypes.string,
  helpText: PropTypes.string
};

export default WeightValidator;
