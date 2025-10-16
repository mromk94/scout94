/**
 * Decision Framework for AI Agents
 * Prevents lazy shortcuts and ensures proper problem-solving
 */

import { DuplicateAnalyzer, DuplicateResolver } from './duplicate-analyzer.js';

/**
 * Decision Quality Validator
 * Evaluates if a proposed solution is a proper fix or a lazy shortcut
 */
export class DecisionValidator {
  
  /**
   * Analyze a proposed solution before executing
   */
  static validateSolution(problem, proposedSolution) {
    const analysis = {
      isValid: true,
      quality: 'GOOD',
      warnings: [],
      alternatives: [],
      reasoning: []
    };
    
    // Check 1: Is this deletion without replacement?
    if (this.isDeletionWithoutReplacement(proposedSolution)) {
      analysis.quality = 'BAD';
      analysis.warnings.push('LAZY_DELETION: Deleting code without providing replacement');
      analysis.alternatives.push('Install missing dependency instead of removing feature');
      analysis.reasoning.push('Deletion removes functionality - investigate why it was added first');
    }
    
    // Check 2: Is this addressing symptoms vs root cause?
    if (this.isSymptomFix(problem, proposedSolution)) {
      analysis.quality = 'POOR';
      analysis.warnings.push('SYMPTOM_FIX: Addressing symptom instead of root cause');
      analysis.alternatives.push('Trace to root cause before implementing fix');
      analysis.reasoning.push('User explicitly requested root cause analysis - apply same logic to our own fixes');
    }
    
    // Check 3: Does this break an in-progress feature?
    if (this.breaksInProgressFeature(proposedSolution)) {
      analysis.quality = 'BAD';
      analysis.warnings.push('FEATURE_BREAK: Breaks partially implemented feature');
      analysis.alternatives.push('Complete the feature implementation instead');
      analysis.reasoning.push('Check if feature was explicitly requested by user before removing');
    }
    
    // Check 4: Is this the path of least resistance (lazy)?
    if (this.isLazyShortcut(problem, proposedSolution)) {
      analysis.quality = 'POOR';
      analysis.warnings.push('LAZY_SHORTCUT: Taking easiest path instead of proper solution');
      analysis.alternatives.push('Invest time in proper fix even if it takes longer');
      analysis.reasoning.push('Shortcuts create technical debt and frustrate users');
    }
    
    // Check 5: Does this contradict user requirements?
    if (this.contradictsUserRequest(proposedSolution)) {
      analysis.quality = 'CRITICAL';
      analysis.isValid = false;
      analysis.warnings.push('CONTRADICTS_REQUEST: Solution goes against what user asked for');
      analysis.alternatives.push('Re-read user request and align solution with their goals');
      analysis.reasoning.push('User satisfaction requires completing their actual request');
    }
    
    // Check 6: Is this deleting a duplicate without analysis?
    if (this.isDuplicateDeletionWithoutAnalysis(proposedSolution)) {
      analysis.quality = 'BAD';
      analysis.warnings.push('UNANALYZED_DUPLICATE: Deleting duplicate code without understanding both versions');
      analysis.alternatives.push('Use DuplicateAnalyzer to compare features and merge intelligently');
      analysis.reasoning.push('Every duplicate exists for a reason - understand before deleting');
    }
    
    return analysis;
  }
  
  /**
   * Check if deleting a duplicate without proper analysis
   */
  static isDuplicateDeletionWithoutAnalysis(solution) {
    const hasDuplicateMention = /duplicate|duplicated|same.*function|repeated/i.test(solution.description || '');
    const hasAnalysis = /analyzed|compared|merged|features|both versions/i.test(solution.description || '');
    
    return hasDuplicateMention && !hasAnalysis;
  }
  
  /**
   * Check if solution is just deleting code without proper replacement
   */
  static isDeletionWithoutReplacement(solution) {
    const deletionPatterns = [
      /remove.*import/i,
      /delete.*feature/i,
      /comment.*out/i,
      /disable.*functionality/i,
      /remove.*package/i
    ];
    
    const hasReplacement = /install|add|implement|create|build/i.test(solution.description || '');
    const isDeletion = deletionPatterns.some(pattern => pattern.test(solution.description || ''));
    
    return isDeletion && !hasReplacement;
  }
  
  /**
   * Check if fixing symptom instead of root cause
   */
  static isSymptomFix(problem, solution) {
    // If error is about missing dependency, solution should install it
    if (/not found|cannot find|missing|undefined/i.test(problem.description || '')) {
      if (!/install|npm|yarn|add package/i.test(solution.description || '')) {
        return true; // Symptom fix - not addressing the missing dependency
      }
    }
    
    // If error is about compilation, solution should fix the code, not hide it
    if (/compilation|syntax|parse error/i.test(problem.description || '')) {
      if (/remove|delete|comment|disable/i.test(solution.description || '')) {
        return true; // Symptom fix - hiding the error instead of fixing it
      }
    }
    
    return false;
  }
  
  /**
   * Check if solution breaks a feature that's being built
   */
  static breaksInProgressFeature(solution) {
    const breakingActions = [
      'remove import that powers',
      'delete component used by',
      'disable feature that was requested',
      'comment out required functionality'
    ];
    
    return breakingActions.some(action => 
      (solution.description || '').toLowerCase().includes(action)
    );
  }
  
  /**
   * Check if taking lazy shortcut instead of proper solution
   */
  static isLazyShortcut(problem, solution) {
    const lazyIndicators = [
      'for now',
      'temporarily',
      'quick fix',
      'easiest way',
      'just remove',
      'simple solution',
      'we\'re not using it yet'
    ];
    
    return lazyIndicators.some(indicator => 
      (solution.reasoning || solution.description || '').toLowerCase().includes(indicator)
    );
  }
  
  /**
   * Check if solution contradicts what user explicitly requested
   */
  static contradictsUserRequest(solution) {
    // This needs context of user's original request
    // For now, check for obvious contradictions
    const contradictionPatterns = [
      /remove.*auto.*display/i, // If user asked for auto-display
      /delete.*report.*generation/i, // If user asked for reports
      /disable.*analysis/i // If user asked for analysis
    ];
    
    return contradictionPatterns.some(pattern => 
      pattern.test(solution.description || '')
    );
  }
}

/**
 * Proper Problem-Solving Framework
 */
export class ProperSolutionFramework {
  
  /**
   * Generate proper solution instead of lazy one
   */
  static generateProperSolution(problem) {
    const solution = {
      approach: 'ROOT_CAUSE',
      steps: [],
      reasoning: [],
      avoids: []
    };
    
    // Step 1: Understand the problem
    solution.steps.push({
      phase: 'UNDERSTAND',
      action: 'Analyze what the error actually means',
      details: this.analyzeProblem(problem)
    });
    
    // Step 2: Identify root cause
    solution.steps.push({
      phase: 'ROOT_CAUSE',
      action: 'Identify underlying issue, not just symptom',
      details: this.identifyRootCause(problem)
    });
    
    // Step 3: Check user intent
    solution.steps.push({
      phase: 'USER_INTENT',
      action: 'Verify if this feature was explicitly requested',
      details: 'Check conversation history and user requirements'
    });
    
    // Step 4: Proper fix
    solution.steps.push({
      phase: 'IMPLEMENT',
      action: 'Implement proper solution that completes the feature',
      details: this.generateProperFix(problem)
    });
    
    // What to avoid
    solution.avoids = [
      'Deleting code as first resort',
      'Removing features without checking if they were requested',
      'Taking path of least resistance',
      'Hiding errors instead of fixing them',
      'Leaving features incomplete'
    ];
    
    return solution;
  }
  
  static analyzeProblem(problem) {
    if (/cannot find|not found/i.test(problem.description || '')) {
      return {
        type: 'MISSING_DEPENDENCY',
        rootCause: 'Package not installed',
        properFix: 'Install the missing package with npm/yarn'
      };
    }
    
    if (/undefined|is not defined/i.test(problem.description || '')) {
      return {
        type: 'MISSING_IMPORT',
        rootCause: 'Variable or function not imported',
        properFix: 'Add proper import statement'
      };
    }
    
    return {
      type: 'UNKNOWN',
      rootCause: 'Needs investigation',
      properFix: 'Research the error and implement proper fix'
    };
  }
  
  static identifyRootCause(problem) {
    // Import error → Missing package
    if (/Failed to resolve import/i.test(problem.description || '')) {
      return 'Package needs to be installed via package manager';
    }
    
    // Compilation error → Code syntax issue
    if (/syntax error|parse error/i.test(problem.description || '')) {
      return 'Code has syntax issues that need to be corrected';
    }
    
    return 'Root cause needs investigation';
  }
  
  static generateProperFix(problem) {
    const problemType = this.analyzeProblem(problem).type;
    
    switch (problemType) {
      case 'MISSING_DEPENDENCY':
        return {
          command: 'npm install [package-name]',
          explanation: 'Install the required dependency',
          followUp: 'Verify import works after installation'
        };
        
      case 'MISSING_IMPORT':
        return {
          action: 'Add import statement',
          explanation: 'Import the required module/component',
          followUp: 'Verify usage is correct'
        };
        
      default:
        return {
          action: 'Investigate and implement proper fix',
          explanation: 'Research the error and fix root cause',
          followUp: 'Test that feature works as intended'
        };
    }
  }
}

/**
 * Decision-Making Rules for AI Agents
 */
export const DECISION_RULES = {
  // ALWAYS do these
  ALWAYS: [
    'Read user request carefully before implementing',
    'Install missing dependencies instead of removing features',
    'Complete features that were explicitly requested',
    'Fix root causes, not symptoms',
    'Think through consequences before deleting code',
    'Verify if feature is needed before removing it',
    'Analyze BOTH versions of duplicate code before deciding',
    'Compare features and understand intent behind each duplicate',
    'Merge features when both duplicates have unique value',
    'Never destroy intentional work without investigation'
  ],
  
  // NEVER do these
  NEVER: [
    'Delete features as first response to errors',
    'Take lazy shortcuts to avoid proper work',
    'Remove functionality without checking user requirements',
    'Hide errors instead of fixing them',
    'Abandon partially completed features',
    'Choose "easiest" over "correct"'
  ],
  
  // When facing errors
  ERROR_RESPONSE: {
    step1: 'Understand what the error actually means',
    step2: 'Identify root cause (missing package, syntax, logic)',
    step3: 'Check if feature was requested by user',
    step4: 'Implement proper fix (install, correct, complete)',
    step5: 'Verify feature works as user intended',
    
    avoid: [
      'Deleting imports because "we\'re not using it yet"',
      'Commenting out code to make error go away',
      'Removing features to avoid fixing the real problem'
    ]
  },
  
  // Quality checks before executing solution
  QUALITY_GATES: [
    'Does this complete the user\'s request?',
    'Am I fixing the root cause or just hiding the symptom?',
    'Am I deleting something that was explicitly requested?',
    'Is this the lazy way out?',
    'Will this frustrate the user?',
    'Have I analyzed both duplicates if deleting one?'
  ],
  
  // Duplicate code handling
  DUPLICATE_HANDLING: {
    step1: 'Identify that duplicates exist (same function/class name)',
    step2: 'Extract features from BOTH versions',
    step3: 'Compare: parameters, return types, functionality, complexity',
    step4: 'Understand WHY both exist (ongoing dev, different use cases, evolution)',
    step5: 'Decision Matrix:',
    decisions: {
      keepFirst: 'If Version 1 is superset of Version 2',
      keepSecond: 'If Version 2 is superset of Version 1',
      merge: 'If both have unique valuable features',
      removeDuplicate: 'Only if truly identical with no differences'
    },
    philosophy: 'Nobody writes code for no reason. Every duplicate has intent behind it.',
    tools: 'Use DuplicateAnalyzer.analyzeDuplicates() before making decisions'
  }
};

export default {
  DecisionValidator,
  ProperSolutionFramework,
  DECISION_RULES,
  DuplicateAnalyzer,
  DuplicateResolver
};
