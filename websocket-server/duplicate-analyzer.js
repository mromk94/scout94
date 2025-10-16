/**
 * DUPLICATE ANALYZER
 * 
 * Purpose: Analyze code duplicates holistically before making decisions
 * Philosophy: Every duplicate exists for a reason - understand before deleting
 * 
 * Phase 1 Improvement: Added context-aware duplicate analysis
 * - Understands file purpose (UI, config, test, etc.)
 * - Detects intentional duplicates (different use cases)
 * - Provides merge strategies with steps
 */

import { ContextDetector } from './context-detector.js';

export class DuplicateAnalyzer {
  
  /**
   * Analyzes duplicate functions/code to understand their purpose
   * Phase 1 Enhancement: Now includes file context for better intent detection
   */
  static analyzeDuplicates(duplicate1, duplicate2, file1Path = null, file2Path = null) {
    const contextDetector = new ContextDetector();
    
    // Detect file contexts if paths provided
    const context1 = file1Path ? contextDetector.detectFileContext(file1Path, duplicate1) : null;
    const context2 = file2Path ? contextDetector.detectFileContext(file2Path, duplicate2) : null;
    
    // Analyze features
    const features1 = this.analyzeFeatures(duplicate1);
    const features2 = this.analyzeFeatures(duplicate2);
    
    // Compare features
    const comparison = this.compareFeatures(duplicate1, duplicate2);
    
    // Detect intent (why do both exist?)
    const intent = this.detectIntent(duplicate1, duplicate2, context1, context2);
    
    // Get recommendation with context awareness
    const recommendation = this.getRecommendation(duplicate1, duplicate2, intent, context1, context2);
    
    return {
      duplicate1: {
        ...features1,
        context: context1 ? contextDetector.describeContext(context1) : 'Unknown',
        filePath: file1Path
      },
      duplicate2: {
        ...features2,
        context: context2 ? contextDetector.describeContext(context2) : 'Unknown',
        filePath: file2Path
      },
      comparison,
      intent,
      recommendation
    };
  }
  
  /**
   * Detect why both duplicates might exist (intent analysis)
   */
  static detectIntent(code1, code2, context1, context2) {
    const intents = [];
    
    // Different file contexts suggest different purposes
    if (context1 && context2) {
      if (context1.isTest !== context2.isTest) {
        intents.push({
          reason: 'TEST_VS_PROD',
          confidence: 'HIGH',
          explanation: 'One is test code, one is production - both needed'
        });
      }
      
      if (context1.isSettings && context2.isSettings) {
        intents.push({
          reason: 'SETTINGS_SECTIONS',
          confidence: 'HIGH',
          explanation: 'Both are settings sections - likely intentional for UX organization'
        });
      }
      
      if (context1.isUIComponent && context2.isUIComponent) {
        const comp1 = this.compareFeatures(code1, code2);
        if (comp1.uniqueToFirst.length > 0 || comp1.uniqueToSecond.length > 0) {
          intents.push({
            reason: 'UI_VARIANTS',
            confidence: 'MEDIUM',
            explanation: 'Different UI components for different use cases'
          });
        }
      }
    }
    
    // Different parameter counts suggest different use cases
    const params1 = this.extractParameters(code1);
    const params2 = this.extractParameters(code2);
    if (params1.length !== params2.length) {
      intents.push({
        reason: 'OVERLOADED_FUNCTION',
        confidence: 'MEDIUM',
        explanation: 'Different signatures suggest function overloading pattern'
      });
    }
    
    // If no clear intent detected
    if (intents.length === 0) {
      intents.push({
        reason: 'UNINTENTIONAL_DUPLICATE',
        confidence: 'LOW',
        explanation: 'No clear reason found - likely accidental duplication'
      });
    }
    
    return intents;
  }

  /**
   * Extract features from a code duplicate
   */
  static analyzeFeatures(code) {
    return {
      name: this.extractName(code),
      parameters: this.extractParameters(code),
      returnType: this.extractReturnType(code),
      features: this.extractFeatures(code),
      complexity: this.measureComplexity(code),
      documentation: this.extractDocumentation(code),
      usageCount: 0, // Should be counted in actual codebase
      lastModified: null // Should check git history
    };
  }

  /**
   * Compare two duplicates to find differences
   */
  static compareFeatures(code1, code2) {
    const features1 = this.extractFeatures(code1);
    const features2 = this.extractFeatures(code2);
    
    return {
      uniqueToFirst: features1.filter(f => !features2.includes(f)),
      uniqueToSecond: features2.filter(f => !features1.includes(f)),
      common: features1.filter(f => features2.includes(f)),
      moreFeatureRich: features1.length > features2.length ? 'first' : 'second'
    };
  }

  /**
   * Provide recommendation on how to handle duplicates
   * Phase 1 Enhancement: Uses intent analysis to make smarter recommendations
   */
  static getRecommendation(code1, code2, intent = [], context1 = null, context2 = null) {
    const comparison = this.compareFeatures(code1, code2);
    
    // Check if intentional duplicate (should keep both)
    if (intent && intent.length > 0) {
      const highConfidenceIntent = intent.find(i => i.confidence === 'HIGH');
      if (highConfidenceIntent) {
        if (['TEST_VS_PROD', 'SETTINGS_SECTIONS', 'UI_VARIANTS'].includes(highConfidenceIntent.reason)) {
          return {
            action: 'KEEP_BOTH',
            reason: `Intentional duplicate: ${highConfidenceIntent.explanation}`,
            details: {
              intent: highConfidenceIntent.reason,
              confidence: highConfidenceIntent.confidence
            },
            priority: 'LOW'
          };
        }
      }
    }
    
    // If one is strictly more feature-rich
    if (comparison.uniqueToFirst.length > 0 && comparison.uniqueToSecond.length === 0) {
      return {
        action: 'KEEP_FIRST',
        reason: 'First version has all features of second plus additional ones',
        details: `Unique features: ${comparison.uniqueToFirst.join(', ')}`,
        priority: 'MEDIUM'
      };
    }
    
    if (comparison.uniqueToSecond.length > 0 && comparison.uniqueToFirst.length === 0) {
      return {
        action: 'KEEP_SECOND',
        reason: 'Second version has all features of first plus additional ones',
        details: `Unique features: ${comparison.uniqueToSecond.join(', ')}`,
        priority: 'MEDIUM'
      };
    }
    
    // If both have unique features
    if (comparison.uniqueToFirst.length > 0 && comparison.uniqueToSecond.length > 0) {
      return {
        action: 'MERGE',
        reason: 'Both versions have unique valuable features',
        details: {
          fromFirst: comparison.uniqueToFirst,
          fromSecond: comparison.uniqueToSecond,
          mergeStrategy: this.generateMergeStrategy(code1, code2)
        },
        priority: 'HIGH'
      };
    }
    
    // If they're identical
    return {
      action: 'REMOVE_DUPLICATE',
      reason: 'Functions are identical - safe to remove one',
      details: 'Keep the one with better naming or more usage',
      priority: 'LOW'
    };
  }

  /**
   * Extract function name
   */
  static extractName(code) {
    const match = code.match(/(?:function|fn|def|async fn)\s+(\w+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Extract parameters
   */
  static extractParameters(code) {
    const match = code.match(/\(([^)]*)\)/);
    if (!match) return [];
    
    return match[1]
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => {
        const parts = p.split(':');
        return {
          name: parts[0]?.trim(),
          type: parts[1]?.trim()
        };
      });
  }

  /**
   * Extract return type
   */
  static extractReturnType(code) {
    // Rust style
    const rustMatch = code.match(/-> ([^{]+)/);
    if (rustMatch) return rustMatch[1].trim();
    
    // TypeScript style
    const tsMatch = code.match(/\):\s*([^{]+)/);
    if (tsMatch) return tsMatch[1].trim();
    
    return 'unknown';
  }

  /**
   * Extract features/capabilities from code
   */
  static extractFeatures(code) {
    const features = [];
    
    // Check what the function does
    if (code.includes('metadata')) features.push('metadata_extraction');
    if (code.includes('size')) features.push('size_info');
    if (code.includes('is_directory')) features.push('type_detection');
    if (code.includes('recursive')) features.push('recursive_scan');
    if (code.includes('filter') || code.includes('ignore')) features.push('filtering');
    if (code.includes('sort')) features.push('sorting');
    if (code.includes('permission') || code.includes('access')) features.push('permission_check');
    if (code.includes('cache')) features.push('caching');
    if (code.includes('async') || code.includes('await')) features.push('async_operation');
    
    // Check return type richness
    if (code.includes('Vec<String>')) features.push('simple_list');
    if (code.includes('Vec<FileInfo>') || code.includes('Vec<FileNode>')) features.push('rich_metadata');
    
    return features;
  }

  /**
   * Measure code complexity
   */
  static measureComplexity(code) {
    const lines = code.split('\n').length;
    const conditions = (code.match(/if|else|match|switch/g) || []).length;
    const loops = (code.match(/for|while|loop/g) || []).length;
    
    return {
      lines,
      conditions,
      loops,
      score: lines + (conditions * 2) + (loops * 3)
    };
  }

  /**
   * Extract documentation
   */
  static extractDocumentation(code) {
    const docMatch = code.match(/\/\*\*[\s\S]*?\*\/|\/\/\/[^\n]*/g);
    return docMatch ? docMatch.join('\n') : 'No documentation';
  }

  /**
   * Generate merge strategy
   */
  static generateMergeStrategy(code1, code2) {
    const comparison = this.compareFeatures(code1, code2);
    
    return {
      baseVersion: comparison.moreFeatureRich === 'first' ? 'code1' : 'code2',
      addFeatures: comparison.moreFeatureRich === 'first' 
        ? comparison.uniqueToSecond 
        : comparison.uniqueToFirst,
      testingNeeded: true,
      steps: [
        '1. Start with the more feature-rich version',
        '2. Add unique features from the other version',
        '3. Reconcile parameter differences',
        '4. Update documentation',
        '5. Test all use cases',
        '6. Remove the duplicate'
      ]
    };
  }
}

/**
 * DUPLICATE RESOLUTION WORKFLOW
 */
export class DuplicateResolver {
  
  static async resolve(duplicate1, duplicate2) {
    console.log('🔍 ANALYZING DUPLICATES...\n');
    
    // Step 1: Analyze
    const analysis = DuplicateAnalyzer.analyzeDuplicates(duplicate1, duplicate2);
    
    console.log('📊 Analysis Results:');
    console.log('Version 1 Features:', analysis.duplicate1.features);
    console.log('Version 2 Features:', analysis.duplicate2.features);
    console.log('\n🔬 Comparison:');
    console.log('Unique to V1:', analysis.comparison.uniqueToFirst);
    console.log('Unique to V2:', analysis.comparison.uniqueToSecond);
    console.log('Common:', analysis.comparison.common);
    
    // Step 2: Get recommendation
    console.log('\n💡 Recommendation:', analysis.recommendation.action);
    console.log('Reason:', analysis.recommendation.reason);
    console.log('Details:', analysis.recommendation.details);
    
    // Step 3: Execute based on recommendation
    switch (analysis.recommendation.action) {
      case 'KEEP_FIRST':
        return { action: 'remove_second', keepVersion: 1 };
      
      case 'KEEP_SECOND':
        return { action: 'remove_first', keepVersion: 2 };
      
      case 'MERGE':
        const mergeStrategy = DuplicateAnalyzer.generateMergeStrategy(duplicate1, duplicate2);
        console.log('\n🔀 Merge Strategy:', mergeStrategy);
        return { action: 'merge', strategy: mergeStrategy };
      
      case 'REMOVE_DUPLICATE':
        return { action: 'remove_either', keepVersion: 1 };
    }
  }
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const example1 = `
pub async fn list_directory(directory_path: String) -> Result<Vec<String>, String> {
    // Returns just file names
}`;

  const example2 = `
pub async fn list_directory(dir_path: String) -> Result<Vec<FileInfo>, String> {
    // Returns rich metadata: name, path, is_directory, size
}`;

  DuplicateResolver.resolve(example1, example2);
}
