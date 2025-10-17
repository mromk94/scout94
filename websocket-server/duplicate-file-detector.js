/**
 * Duplicate File Detector
 * Finds duplicate files by content hash and similar naming patterns
 * 
 * Purpose: Detect code duplication that indicates cleanup needed
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, dirname, relative } from 'path';
import crypto from 'crypto';

export class DuplicateFileDetector {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.duplicates = [];
    this.similarGroups = [];
  }
  
  /**
   * Find duplicate files by content hash
   */
  findDuplicates(directory, extensions = ['.jsx', '.js', '.php', '.ts', '.tsx']) {
    console.log('🔍 Scanning for duplicate files...');
    
    const fileHashes = new Map();
    const files = this.getAllFiles(directory, extensions);
    
    console.log(`   Found ${files.length} files to analyze`);
    
    files.forEach(file => {
      try {
        const content = readFileSync(file, 'utf-8');
        
        // Skip very small files (likely not duplicates worth worrying about)
        if (content.length < 100) return;
        
        // Create content hash
        const hash = crypto.createHash('md5').update(content).digest('hex');
        
        if (fileHashes.has(hash)) {
          fileHashes.get(hash).push(file);
        } else {
          fileHashes.set(hash, [file]);
        }
      } catch (error) {
        // Skip files we can't read
      }
    });
    
    // Find groups with duplicates
    fileHashes.forEach((files, hash) => {
      if (files.length > 1) {
        const sizes = files.map(f => {
          try {
            return statSync(f).size;
          } catch {
            return 0;
          }
        });
        
        this.duplicates.push({
          hash,
          files: files.map(f => relative(this.projectPath, f)),
          count: files.length,
          size: sizes[0],
          type: 'EXACT_DUPLICATE',
          wastedSpace: sizes[0] * (files.length - 1)
        });
      }
    });
    
    console.log(`   Found ${this.duplicates.length} duplicate file groups`);
    
    return this.duplicates;
  }
  
  /**
   * Find files with similar names (potential duplicates)
   */
  findSimilarNames(directory, patterns = ['Dashboard', 'Config', 'db', 'Layout', 'auth', 'test']) {
    console.log('🔍 Scanning for similar file names...');
    
    const similarGroups = new Map();
    const files = this.getAllFiles(directory);
    
    patterns.forEach(pattern => {
      const matching = files.filter(f => {
        const name = basename(f).toLowerCase();
        const patternLower = pattern.toLowerCase();
        
        // Match files containing the pattern
        return name.includes(patternLower) && 
               // But not in node_modules, vendor, etc.
               !f.includes('node_modules') &&
               !f.includes('vendor') &&
               !f.includes('.git');
      });
      
      if (matching.length > 1) {
        // Group by directory to find local duplicates
        const byDir = new Map();
        matching.forEach(file => {
          const dir = dirname(file);
          if (!byDir.has(dir)) {
            byDir.set(dir, []);
          }
          byDir.get(dir).push(file);
        });
        
        // Only report if multiple in same directory
        byDir.forEach((dirFiles, dir) => {
          if (dirFiles.length > 1) {
            const key = `${pattern}_${dir}`;
            similarGroups.set(key, {
              pattern,
              directory: relative(this.projectPath, dir),
              files: dirFiles.map(f => relative(this.projectPath, f))
            });
          }
        });
      }
    });
    
    this.similarGroups = Array.from(similarGroups.values()).map(group => ({
      pattern: group.pattern,
      directory: group.directory,
      files: group.files,
      count: group.files.length,
      type: 'SIMILAR_NAME'
    }));
    
    console.log(`   Found ${this.similarGroups.length} similar name groups`);
    
    return this.similarGroups;
  }
  
  /**
   * Get all files recursively
   */
  getAllFiles(dir, extensions = null) {
    let results = [];
    
    // Skip these directories
    const skipDirs = ['node_modules', '.git', 'vendor', 'dist', 'build', '.next', '.nuxt', 'coverage'];
    
    try {
      const list = readdirSync(dir);
      
      list.forEach(file => {
        // Skip hidden files and specific directories
        if (file.startsWith('.') && file !== '.gitignore') return;
        if (skipDirs.includes(file)) return;
        
        const filePath = join(dir, file);
        
        try {
          const stat = statSync(filePath);
          
          if (stat && stat.isDirectory()) {
            results = results.concat(this.getAllFiles(filePath, extensions));
          } else {
            if (!extensions || extensions.some(ext => file.endsWith(ext))) {
              results.push(filePath);
            }
          }
        } catch (error) {
          // Skip files/dirs we can't access
        }
      });
    } catch (error) {
      // Skip directories we can't access
    }
    
    return results;
  }
  
  /**
   * Analyze and generate report
   */
  generateReport() {
    const exactDupes = this.duplicates;
    const similarNames = this.similarGroups;
    
    // Calculate impact
    const totalWastedSpace = exactDupes.reduce((sum, dup) => sum + dup.wastedSpace, 0);
    const totalDuplicateFiles = exactDupes.reduce((sum, dup) => sum + (dup.count - 1), 0);
    
    return {
      exactDuplicates: exactDupes,
      similarNames: similarNames,
      summary: {
        exactDuplicateGroups: exactDupes.length,
        similarNameGroups: similarNames.length,
        totalIssues: exactDupes.length + similarNames.length,
        wastedSpace: totalWastedSpace,
        wastedSpaceKB: Math.round(totalWastedSpace / 1024),
        totalDuplicateFiles: totalDuplicateFiles
      },
      recommendations: this.generateRecommendations(exactDupes, similarNames)
    };
  }
  
  /**
   * Generate cleanup recommendations
   */
  generateRecommendations(exactDupes, similarNames) {
    const recommendations = [];
    
    if (exactDupes.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'EXACT_DUPLICATES',
        message: `Found ${exactDupes.length} groups of exact duplicate files`,
        action: 'Review and consolidate duplicate files to reduce maintenance burden',
        files: exactDupes.slice(0, 3).map(d => d.files) // Show first 3 examples
      });
    }
    
    if (similarNames.length > 0) {
      const dashboardDupes = similarNames.filter(g => 
        g.pattern.toLowerCase().includes('dashboard')
      );
      
      const configDupes = similarNames.filter(g => 
        g.pattern.toLowerCase().includes('config') ||
        g.pattern.toLowerCase().includes('db')
      );
      
      if (dashboardDupes.length > 0) {
        recommendations.push({
          priority: 'HIGH',
          type: 'MULTIPLE_DASHBOARDS',
          message: `Found ${dashboardDupes.length} groups of dashboard implementations`,
          action: 'Consolidate to single dashboard implementation, archive old versions',
          files: dashboardDupes.map(d => d.files)
        });
      }
      
      if (configDupes.length > 0) {
        recommendations.push({
          priority: 'HIGH',
          type: 'MULTIPLE_CONFIGS',
          message: `Found ${configDupes.length} groups of configuration files`,
          action: 'Create single source of truth for configuration',
          files: configDupes.map(d => d.files)
        });
      }
    }
    
    return recommendations;
  }
}

export default DuplicateFileDetector;
