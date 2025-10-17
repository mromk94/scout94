/**
 * Development Artifact Detector
 * Finds test files, debug scripts, and other development artifacts
 * that shouldn't be in production
 * 
 * Purpose: Security and cleanliness check
 */

import { readdirSync, statSync } from 'fs';
import { join, basename, relative } from 'path';

export class ArtifactDetector {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.artifacts = [];
  }
  
  /**
   * Detect development artifacts in codebase
   */
  detectArtifacts() {
    console.log('🔍 Scanning for development artifacts...');
    
    const patterns = {
      TEST_FILES: {
        regex: /^test[_-]?.*\.(php|js|jsx|ts|tsx|py|rb)$/i,
        severity: 'MEDIUM',
        description: 'Test files'
      },
      DEBUG_FILES: {
        regex: /^debug[_-]?.*\.(php|js|jsx|ts|tsx|py|rb)$/i,
        severity: 'HIGH',
        description: 'Debug scripts'
      },
      BACKUP_FILES: {
        regex: /.*[_-](backup|old|bak|copy|original|final).*\.(php|js|jsx|ts|tsx|py|rb)$/i,
        severity: 'LOW',
        description: 'Backup files'
      },
      TEMP_FILES: {
        regex: /^(tmp|temp)[_-]?.*$/i,
        severity: 'LOW',
        description: 'Temporary files'
      },
      LOG_FILES: {
        regex: /\.(log|logs)$/i,
        severity: 'MEDIUM',
        description: 'Log files'
      },
      ENV_FILES: {
        regex: /^\.env\.(local|development|staging|test)$/,
        severity: 'HIGH',
        description: 'Environment files'
      },
      PHPINFO: {
        regex: /phpinfo\.php$/i,
        severity: 'CRITICAL',
        description: 'PHP info files (security risk)'
      },
      SAMPLE_FILES: {
        regex: /(sample|example|demo)[_-]?.*\.(php|js|jsx|ts|tsx)$/i,
        severity: 'LOW',
        description: 'Sample/demo files'
      },
      TODO_FILES: {
        regex: /todo\.(md|txt)$/i,
        severity: 'LOW',
        description: 'TODO files'
      }
    };
    
    const artifacts = this.scanDirectory(this.projectPath, patterns);
    
    console.log(`   Found ${artifacts.length} development artifacts`);
    
    return {
      artifacts,
      summary: {
        total: artifacts.length,
        byType: this.groupByType(artifacts),
        bySeverity: this.groupBySeverity(artifacts),
        risk: this.assessRisk(artifacts)
      },
      recommendations: this.generateRecommendations(artifacts)
    };
  }
  
  /**
   * Scan directory recursively
   */
  scanDirectory(dir, patterns, depth = 0, maxDepth = 10) {
    if (depth > maxDepth) return [];
    
    let results = [];
    
    // Skip these directories
    const skipDirs = ['node_modules', '.git', 'vendor', 'dist', 'build', '.next'];
    
    try {
      const items = readdirSync(dir);
      
      items.forEach(item => {
        // Skip certain directories
        if (skipDirs.includes(item)) return;
        
        const fullPath = join(dir, item);
        const relativePath = relative(this.projectPath, fullPath);
        
        try {
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            results = results.concat(
              this.scanDirectory(fullPath, patterns, depth + 1, maxDepth)
            );
          } else {
            // Check if file matches any pattern
            Object.entries(patterns).forEach(([type, config]) => {
              if (config.regex.test(item)) {
                results.push({
                  type,
                  file: relativePath,
                  basename: item,
                  size: stat.size,
                  severity: config.severity,
                  description: config.description
                });
              }
            });
          }
        } catch (error) {
          // Skip files we can't access
        }
      });
    } catch (error) {
      // Skip directories we can't access
    }
    
    return results;
  }
  
  /**
   * Group artifacts by type
   */
  groupByType(artifacts) {
    const groups = {};
    artifacts.forEach(artifact => {
      if (!groups[artifact.type]) {
        groups[artifact.type] = 0;
      }
      groups[artifact.type]++;
    });
    return groups;
  }
  
  /**
   * Group artifacts by severity
   */
  groupBySeverity(artifacts) {
    const groups = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
    
    artifacts.forEach(artifact => {
      groups[artifact.severity]++;
    });
    
    return groups;
  }
  
  /**
   * Assess overall risk
   */
  assessRisk(artifacts) {
    const bySeverity = this.groupBySeverity(artifacts);
    
    if (bySeverity.CRITICAL > 0) return 'CRITICAL';
    if (bySeverity.HIGH > 5) return 'HIGH';
    if (bySeverity.HIGH > 0 || bySeverity.MEDIUM > 10) return 'MEDIUM';
    if (bySeverity.MEDIUM > 0 || bySeverity.LOW > 5) return 'LOW';
    return 'NONE';
  }
  
  /**
   * Generate cleanup recommendations
   */
  generateRecommendations(artifacts) {
    const recommendations = [];
    const bySeverity = this.groupBySeverity(artifacts);
    
    if (bySeverity.CRITICAL > 0) {
      const critical = artifacts.filter(a => a.severity === 'CRITICAL');
      recommendations.push({
        priority: 'CRITICAL',
        type: 'SECURITY_RISK',
        message: `${bySeverity.CRITICAL} critical security risk file(s) found`,
        action: 'Remove immediately - these files expose sensitive information',
        files: critical.map(a => a.file)
      });
    }
    
    if (bySeverity.HIGH > 0) {
      const high = artifacts.filter(a => a.severity === 'HIGH');
      recommendations.push({
        priority: 'HIGH',
        type: 'HIGH_RISK_ARTIFACTS',
        message: `${bySeverity.HIGH} high-risk development file(s) found`,
        action: 'Move to development directory or exclude from production builds',
        files: high.slice(0, 10).map(a => a.file) // Show first 10
      });
    }
    
    if (bySeverity.MEDIUM > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'TEST_DEBUG_FILES',
        message: `${bySeverity.MEDIUM} test/debug files found in codebase`,
        action: 'Create /development directory and move test files there',
        files: artifacts
          .filter(a => a.severity === 'MEDIUM')
          .slice(0, 5)
          .map(a => a.file)
      });
    }
    
    if (bySeverity.LOW > 10) {
      recommendations.push({
        priority: 'LOW',
        type: 'CLEANUP_NEEDED',
        message: `${bySeverity.LOW} backup/temp files cluttering codebase`,
        action: 'Remove backup files and add to .gitignore',
        files: []
      });
    }
    
    return recommendations;
  }
}

export default ArtifactDetector;
