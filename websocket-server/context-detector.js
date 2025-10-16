/**
 * Context Detector
 * Phase 1 Improvement: Understand file context to filter false positives
 * 
 * Purpose: Detect file types and purposes to apply context-aware analysis
 * This prevents flagging intentional design patterns as issues
 */

import { readFileSync } from 'fs';
import { basename, dirname, extname } from 'path';

export class ContextDetector {
  /**
   * Detect context for a given file
   */
  detectFileContext(filePath, content = null) {
    // Read content if not provided
    if (!content) {
      try {
        content = readFileSync(filePath, 'utf-8');
      } catch (e) {
        content = '';
      }
    }
    
    const path = filePath.toLowerCase();
    const fileName = basename(filePath).toLowerCase();
    const dir = dirname(filePath).toLowerCase();
    
    return {
      // File type contexts
      isUIComponent: this.isUIComponent(path, content),
      isSettings: this.isSettings(path, fileName, content),
      isConfig: this.isConfig(path, fileName, content),
      isTest: this.isTest(path, fileName),
      isSchema: this.isSchema(path, fileName, content),
      isBuildArtifact: this.isBuildArtifact(path),
      isDocumentation: this.isDocumentation(path, fileName),
      
      // Code context
      isReactComponent: this.isReactComponent(content),
      isSettingsPanel: this.isSettingsPanel(path, content),
      isFormComponent: this.isFormComponent(content),
      isConstantsFile: this.isConstantsFile(fileName, content),
      
      // Purpose context
      purposelyLarge: this.isPurposelyLarge(path, content),
      hardcodedValuesExpected: this.expectsHardcodedValues(path, content),
      
      // Metadata
      fileType: extname(filePath).slice(1),
      directory: dir,
      fileName: fileName
    };
  }
  
  /**
   * Check if an issue should be ignored based on context
   */
  shouldIgnoreIssue(issue, context) {
    // Magic numbers in settings/config are OK
    if (context.isConfig && issue.type === 'magic_number') {
      return true;
    }
    
    if (context.isSettings && issue.type === 'magic_number') {
      return true;
    }
    
    // Large components in settings (intentional for UX cohesion)
    if (context.isSettingsPanel && issue.type === 'component_size') {
      return true;
    }
    
    if (context.purposelyLarge && issue.type === 'file_length') {
      return true;
    }
    
    // Hardcoded UI values (colors, spacing, styling)
    if (context.isUIComponent && issue.type === 'hardcoded_value') {
      // Colors are OK
      if (issue.value && issue.value.match(/^#[0-9a-f]{3,8}$/i)) return true;
      if (issue.value && issue.value.match(/rgb\(|rgba\(|hsl\(/i)) return true;
      
      // CSS units are OK
      if (issue.value && issue.value.match(/^\d+(px|em|rem|%|vh|vw)$/)) return true;
      
      // Tailwind classes are OK
      if (issue.value && issue.value.match(/^(w|h|p|m|gap|space|rounded)-/)) return true;
    }
    
    // Constants in constants files are expected
    if (context.isConstantsFile && issue.type === 'hardcoded_value') {
      return true;
    }
    
    // Schema-related patterns
    if (context.isSchema && issue.type === 'sql_injection_risk') {
      // Schema definitions aren't injection risks
      return true;
    }
    
    // Test files have different standards
    if (context.isTest) {
      if (issue.type === 'magic_number') return true; // Test assertions use numbers
      if (issue.type === 'hardcoded_value') return true; // Test data
      if (issue.type === 'duplicate_code') return true; // Test patterns repeat
    }
    
    // Build artifacts should be ignored entirely
    if (context.isBuildArtifact) {
      return true; // Don't analyze minified/compiled code
    }
    
    return false;
  }
  
  /**
   * Calculate severity adjustment based on context
   */
  adjustSeverity(issue, context) {
    let adjustment = 0;
    
    // Reduce severity for UI components
    if (context.isUIComponent) {
      if (issue.type === 'complexity') adjustment -= 1; // UI can be complex
      if (issue.type === 'magic_number') adjustment -= 2; // UI has many constants
    }
    
    // Increase severity for security-critical files
    if (context.path && context.path.includes('auth')) {
      if (issue.type === 'security') adjustment += 1;
    }
    
    return adjustment;
  }
  
  // ==========================================
  // Context Detection Helpers
  // ==========================================
  
  isUIComponent(path, content) {
    return path.includes('/components/') || 
           path.includes('/ui/') ||
           content.includes('className=') ||
           content.includes('import React');
  }
  
  isSettings(path, fileName, content) {
    return path.includes('/settings') ||
           fileName.includes('settings') ||
           fileName.includes('config') ||
           content.includes('Settings') && content.includes('onChange');
  }
  
  isConfig(path, fileName, content) {
    return fileName.includes('config') ||
           fileName.includes('.env') ||
           fileName === 'constants.js' ||
           fileName === 'constants.php' ||
           path.includes('/config/') ||
           content.includes('export const') && content.includes('CONFIG');
  }
  
  isTest(path, fileName) {
    return fileName.includes('.test.') ||
           fileName.includes('.spec.') ||
           fileName.includes('_test.') ||
           path.includes('/tests/') ||
           path.includes('/__tests__/');
  }
  
  isSchema(path, fileName, content) {
    return fileName.includes('schema') ||
           fileName.includes('migration') ||
           fileName.includes('seed') ||
           content.includes('CREATE TABLE') ||
           content.includes('ALTER TABLE');
  }
  
  isBuildArtifact(path) {
    return path.includes('/dist/') ||
           path.includes('/build/') ||
           path.includes('.min.js') ||
           path.includes('.min.css') ||
           path.includes('/vendor/') ||
           path.includes('/node_modules/');
  }
  
  isDocumentation(path, fileName) {
    return fileName.includes('readme') ||
           fileName.includes('.md') ||
           path.includes('/docs/');
  }
  
  isReactComponent(content) {
    return content.includes('import React') ||
           content.includes('useState') ||
           content.includes('useEffect') ||
           content.includes('export default function');
  }
  
  isSettingsPanel(path, content) {
    return path.includes('/settings') &&
           (content.includes('SettingToggle') ||
            content.includes('SettingSlider') ||
            content.includes('onChange'));
  }
  
  isFormComponent(content) {
    return content.includes('<form') ||
           content.includes('onSubmit') ||
           content.includes('formData');
  }
  
  isConstantsFile(fileName, content) {
    return fileName.includes('constants') ||
           fileName.includes('config') ||
           (content.match(/^(export )?const \w+ = /gm) || []).length > 5;
  }
  
  isPurposelyLarge(path, content) {
    // Settings panels are intentionally large for UX
    if (path.includes('/settings') && content.length > 10000) {
      return true;
    }
    
    // Admin panels are intentionally comprehensive
    if (path.includes('/admin') && content.length > 15000) {
      return true;
    }
    
    return false;
  }
  
  expectsHardcodedValues(path, content) {
    // UI files expect colors, spacing, styles
    if (this.isUIComponent(path, content)) {
      return true;
    }
    
    // Config files are all about hardcoded values
    if (this.isConfig(path, '', content)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get human-readable context description
   */
  describeContext(context) {
    const descriptions = [];
    
    if (context.isUIComponent) descriptions.push('UI Component');
    if (context.isSettings) descriptions.push('Settings Panel');
    if (context.isConfig) descriptions.push('Configuration File');
    if (context.isTest) descriptions.push('Test File');
    if (context.isSchema) descriptions.push('Database Schema');
    if (context.isBuildArtifact) descriptions.push('Build Artifact');
    
    if (descriptions.length === 0) descriptions.push('Application Code');
    
    return descriptions.join(', ');
  }
}

export default new ContextDetector();
