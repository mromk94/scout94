/**
 * i18n - Internationalization Setup
 * 
 * Basic structure for multi-language support
 * Currently supports: English (default)
 * Future: Add Spanish, French, German, etc.
 */

const translations = {
  en: {
    // Settings Panel
    settings: {
      title: 'Scout94 Settings',
      save: 'Save',
      reset: 'Reset',
      close: 'Close',
      export: 'Export Settings',
      import: 'Import Settings',
      
      // Sections
      general: 'General',
      agents: 'Agents',
      testing: 'Testing',
      analysis: 'Analysis',
      llm: 'LLM',
      reporting: 'Reporting',
      security: 'Security',
      ui: 'UI/UX',
      storage: 'Storage',
      communication: 'Communication',
      advanced: 'Advanced',
      search: 'Search'
    },
    
    // Common actions
    actions: {
      enable: 'Enable',
      disable: 'Disable',
      enableAll: 'Enable All',
      disableAll: 'Disable All',
      browse: 'Browse',
      clear: 'Clear',
      view: 'View',
      backup: 'Backup Now',
      restore: 'Restore'
    },
    
    // Validation messages
    validation: {
      weightsInvalid: 'Weights must sum to 1.0',
      weightsValid: 'Weights are valid',
      required: 'This field is required',
      invalidFormat: 'Invalid format'
    },
    
    // Test commands
    commands: {
      comprehensiveScan: 'Comprehensive Scan',
      funcTest: 'Functional Test',
      securityScan: 'Security Scan',
      perfTest: 'Performance Test',
      auditReport: 'Generate Audit',
      clinic: 'Medical Clinic'
    }
  }
  
  // Future: Add more languages
  // es: { ... },
  // fr: { ... },
  // de: { ... }
};

let currentLocale = 'en';

export const setLocale = (locale) => {
  if (translations[locale]) {
    currentLocale = locale;
    // Store in localStorage
    localStorage.setItem('scout94_locale', locale);
    // Trigger re-render if using React context
    return true;
  }
  return false;
};

export const t = (key, defaultValue = key) => {
  const keys = key.split('.');
  let value = translations[currentLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return defaultValue;
    }
  }
  
  return value || defaultValue;
};

export const getCurrentLocale = () => currentLocale;

export const getAvailableLocales = () => Object.keys(translations);

// Initialize from localStorage on load
const savedLocale = localStorage.getItem('scout94_locale');
if (savedLocale && translations[savedLocale]) {
  currentLocale = savedLocale;
}

export default { t, setLocale, getCurrentLocale, getAvailableLocales };
