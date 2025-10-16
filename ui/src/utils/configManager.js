/**
 * Scout94 Configuration Manager
 * 
 * Purpose: Centralized configuration storage, validation, and management
 * Methodology: Root cause approach - handle config at the source, not scattered
 * 
 * Features:
 * - Persistent storage via localStorage
 * - Validation before save
 * - Default values from schema
 * - Export/Import configurations
 * - Per-section reset
 */

import { defaultConfig } from './configSchema';

const CONFIG_KEY = 'scout94_settings';
const CONFIG_VERSION = '1.0.0';

class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
    this.listeners = [];
  }

  /**
   * Load configuration from localStorage
   * Falls back to defaults if not found or invalid
   */
  loadConfig() {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (!stored) {
        return this.getDefaultConfig();
      }

      const parsed = JSON.parse(stored);
      
      // Version check
      if (parsed.version !== CONFIG_VERSION) {
        console.warn('Config version mismatch, migrating...');
        return this.migrateConfig(parsed);
      }

      // Validate structure
      if (this.validateConfig(parsed)) {
        return parsed;
      }

      console.warn('Invalid config structure, using defaults');
      return this.getDefaultConfig();
    } catch (error) {
      console.error('Failed to load config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return JSON.parse(JSON.stringify(defaultConfig));
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig(newConfig = null) {
    try {
      const configToSave = newConfig || this.config;
      
      // Validate before save
      if (!this.validateConfig(configToSave)) {
        throw new Error('Invalid configuration structure');
      }

      localStorage.setItem(CONFIG_KEY, JSON.stringify(configToSave));
      this.config = configToSave;
      
      // Notify listeners
      this.notifyListeners();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save config:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a specific setting value
   * Path format: 'section.subsection.key' (e.g., 'general.executionMode')
   */
  get(path) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[key];
    }
    
    return value;
  }

  /**
   * Set a specific setting value
   * Path format: 'section.subsection.key'
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let obj = this.config;
    
    // Navigate to parent object
    for (const key of keys) {
      if (!obj[key]) {
        obj[key] = {};
      }
      obj = obj[key];
    }
    
    // Set value
    obj[lastKey] = value;
    
    // Auto-save
    this.saveConfig();
    
    return { success: true };
  }

  /**
   * Reset entire config to defaults
   */
  resetAll() {
    this.config = this.getDefaultConfig();
    this.saveConfig();
    return { success: true };
  }

  /**
   * Reset a specific section to defaults
   */
  resetSection(sectionName) {
    const defaults = this.getDefaultConfig();
    if (defaults[sectionName]) {
      this.config[sectionName] = defaults[sectionName];
      this.saveConfig();
      return { success: true };
    }
    return { success: false, error: 'Section not found' };
  }

  /**
   * Export configuration as JSON
   */
  exportConfig() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      
      if (!this.validateConfig(imported)) {
        throw new Error('Invalid configuration structure');
      }

      this.saveConfig(imported);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate configuration structure
   * Ensures all required sections exist
   */
  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      return false;
    }

    // Check required top-level sections
    const requiredSections = [
      'version',
      'general',
      'agents',
      'testing',
      'analysis',
      'llm',
      'reporting',
      'security',
      'ui',
      'storage',
      'communication',
      'advanced'
    ];

    for (const section of requiredSections) {
      if (!config.hasOwnProperty(section)) {
        console.warn(`Missing required section: ${section}`);
        return false;
      }
    }

    // Validate health weights sum to 1.0 (Per MATHEMATICAL_FRAMEWORK.md)
    if (config.testing?.health?.weights) {
      const weights = config.testing.health.weights;
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1.0) > 0.001) {
        console.warn(`Health weights sum to ${sum}, should be 1.0`);
        return false;
      }
    }

    // Validate risk weights sum to 1.0 (Per MATHEMATICAL_FRAMEWORK.md)
    if (config.security?.risk?.weights) {
      const weights = config.security.risk.weights;
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1.0) > 0.001) {
        console.warn(`Risk weights sum to ${sum}, should be 1.0`);
        return false;
      }
    }

    return true;
  }

  /**
   * Migrate configuration from old version to new
   */
  migrateConfig(oldConfig) {
    // For now, just merge with defaults
    // In future, implement version-specific migrations
    const defaults = this.getDefaultConfig();
    return {
      ...defaults,
      ...oldConfig,
      version: CONFIG_VERSION
    };
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.config);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Get configuration summary for display
   */
  getSummary() {
    return {
      version: this.config.version,
      executionMode: this.config.general.executionMode,
      enabledAgents: Object.entries(this.config.agents)
        .filter(([_, config]) => config.enabled)
        .map(([agent]) => agent),
      primaryLLM: this.config.llm.primary,
      healthThreshold: this.config.testing.health.thresholds.fair,
      totalSettings: this.countSettings(this.config)
    };
  }

  /**
   * Count total number of settings
   */
  countSettings(obj, depth = 0) {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null && depth < 10) {
        count += this.countSettings(obj[key], depth + 1);
      } else {
        count++;
      }
    }
    return count;
  }
}

// Singleton instance
const configManager = new ConfigManager();

export default configManager;
