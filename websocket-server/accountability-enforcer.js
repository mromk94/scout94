/**
 * ACCOUNTABILITY ENFORCER
 * 
 * CRITICAL: This module BLOCKS all actions until accountability checks pass.
 * NO action can proceed without proper root cause investigation.
 * 
 * This enforces the protocol at the code level - not just documentation.
 */

export class AccountabilityEnforcer {
  
  /**
   * MANDATORY: Every action MUST pass this gate
   * Returns: { allowed: boolean, reason: string, requiredSteps: [] }
   */
  static enforceAccountability(action) {
    console.log('🛡️ ACCOUNTABILITY GATE ACTIVATED');
    console.log(`📋 Proposed action: ${action.type}`);
    
    // GATE 1: Root Cause Analysis Required?
    if (action.isCodeChange || action.isDelete || action.isFix) {
      if (!action.rootCauseAnalysis) {
        return this.BLOCK({
          reason: 'NO ROOT CAUSE ANALYSIS PROVIDED',
          requiredSteps: [
            '1. Stop and investigate WHY this code exists',
            '2. Document the root cause of the issue',
            '3. Trace back to the source',
            '4. Provide evidence of investigation'
          ],
          severity: 'CRITICAL'
        });
      }
      
      // Validate root cause analysis quality
      if (action.rootCauseAnalysis.length < 50) {
        return this.BLOCK({
          reason: 'ROOT CAUSE ANALYSIS TOO SHALLOW',
          requiredSteps: [
            'Provide detailed analysis (minimum 50 characters)',
            'Explain WHY the problem exists, not just WHAT is broken',
            'Show investigation steps taken'
          ],
          severity: 'HIGH'
        });
      }
    }
    
    // GATE 2: Investigation Evidence Required?
    if (action.isCodeChange || action.isDelete) {
      if (!action.investigationEvidence || action.investigationEvidence.length === 0) {
        return this.BLOCK({
          reason: 'NO INVESTIGATION EVIDENCE',
          requiredSteps: [
            '1. List files you read to understand the issue',
            '2. Show what data you checked',
            '3. Document what you verified',
            '4. Prove you investigated, not guessed'
          ],
          severity: 'CRITICAL'
        });
      }
    }
    
    // GATE 3: System Context Required?
    if (action.isArchitectureChange || action.isDelete) {
      if (!action.systemContext) {
        return this.BLOCK({
          reason: 'NO SYSTEM CONTEXT PROVIDED',
          requiredSteps: [
            '1. How does this fit in the larger system?',
            '2. What upstream dependencies exist?',
            '3. What downstream effects will occur?',
            '4. Are there related issues from same root cause?'
          ],
          severity: 'HIGH'
        });
      }
    }
    
    // GATE 4: Symptom vs Cause Check
    if (action.isFix) {
      const symptomPatterns = [
        /adjust.*css/i,
        /change.*style/i,
        /fix.*display/i,
        /workaround/i,
        /temporary/i,
        /for now/i
      ];
      
      const isTreatingSymptom = symptomPatterns.some(pattern => 
        pattern.test(action.description || '')
      );
      
      if (isTreatingSymptom && !action.confirmedRootCause) {
        return this.BLOCK({
          reason: 'APPEARS TO BE TREATING SYMPTOM, NOT ROOT CAUSE',
          requiredSteps: [
            '1. Verify this fixes the ACTUAL problem, not just the symptom',
            '2. Example: Changing CSS when real issue is wrong data',
            '3. Confirm you traced to root cause',
            '4. Set confirmedRootCause: true after verification'
          ],
          severity: 'HIGH'
        });
      }
    }
    
    // GATE 5: Deletion Check (MOST CRITICAL)
    if (action.isDelete) {
      if (!action.analyzedBothVersions) {
        return this.BLOCK({
          reason: 'DELETION WITHOUT ANALYSIS',
          requiredSteps: [
            '1. Analyze WHAT is being deleted',
            '2. Understand WHY it was there originally',
            '3. Check if it serves a purpose you missed',
            '4. Verify it\'s truly dead code, not needed feature',
            '5. Set analyzedBothVersions: true after analysis'
          ],
          severity: 'CRITICAL'
        });
      }
    }
    
    // GATE 6: Library Fighting Check
    if (action.isCodeChange) {
      const fightingPatterns = [
        /force.*display.*grid/i,
        /override.*internal/i,
        /hack.*library/i,
        /workaround.*library/i,
        /custom.*layout.*on.*library/i
      ];
      
      const isFightingLibrary = fightingPatterns.some(pattern => 
        pattern.test(action.description || '')
      );
      
      if (isFightingLibrary && !action.checkedNativeCapabilities) {
        return this.BLOCK({
          reason: 'FIGHTING LIBRARY INSTEAD OF USING IT PROPERLY',
          requiredSteps: [
            '1. Check library documentation for native capabilities',
            '2. Look for props/methods that do what you need',
            '3. Use library\'s way, not custom implementation',
            '4. Set checkedNativeCapabilities: true after verification'
          ],
          severity: 'HIGH'
        });
      }
    }
    
    // GATE 7: User Intent Check (for feature changes)
    if (action.isFeatureChange) {
      if (!action.verifiedUserIntent) {
        return this.BLOCK({
          reason: 'USER INTENT NOT VERIFIED',
          requiredSteps: [
            '1. Was this feature explicitly requested by user?',
            '2. Is removing it contradicting user requirements?',
            '3. Check conversation history',
            '4. Set verifiedUserIntent: true after verification'
          ],
          severity: 'HIGH'
        });
      }
    }
    
    // ALL GATES PASSED
    console.log('✅ ACCOUNTABILITY CHECKS PASSED');
    return this.ALLOW({
      message: 'All accountability requirements met',
      checkedGates: 7
    });
  }
  
  /**
   * BLOCK an action - returns rejection with required steps
   */
  static BLOCK({ reason, requiredSteps, severity }) {
    console.error('❌ ACCOUNTABILITY GATE BLOCKED');
    console.error(`Severity: ${severity}`);
    console.error(`Reason: ${reason}`);
    console.error('Required steps:');
    requiredSteps.forEach(step => console.error(`  ${step}`));
    
    return {
      allowed: false,
      blocked: true,
      severity,
      reason,
      requiredSteps,
      message: `🛑 ACTION BLOCKED: ${reason}`,
      instruction: 'Complete required steps before proceeding'
    };
  }
  
  /**
   * ALLOW an action - returns approval
   */
  static ALLOW({ message, checkedGates }) {
    return {
      allowed: true,
      blocked: false,
      message,
      checkedGates
    };
  }
  
  /**
   * Pre-action wrapper - enforces accountability before execution
   */
  static async enforceBeforeAction(action, executionFunction) {
    const validation = this.enforceAccountability(action);
    
    if (!validation.allowed) {
      throw new Error(`ACCOUNTABILITY GATE BLOCKED: ${validation.reason}\n\nRequired steps:\n${validation.requiredSteps.join('\n')}`);
    }
    
    console.log('✅ Proceeding with action (accountability verified)');
    return await executionFunction();
  }
  
  /**
   * Generate action descriptor from parameters
   */
  static createAction({
    type,
    description,
    isCodeChange = false,
    isDelete = false,
    isFix = false,
    isArchitectureChange = false,
    isFeatureChange = false,
    rootCauseAnalysis = null,
    investigationEvidence = [],
    systemContext = null,
    confirmedRootCause = false,
    analyzedBothVersions = false,
    checkedNativeCapabilities = false,
    verifiedUserIntent = false
  }) {
    return {
      type,
      description,
      isCodeChange,
      isDelete,
      isFix,
      isArchitectureChange,
      isFeatureChange,
      rootCauseAnalysis,
      investigationEvidence,
      systemContext,
      confirmedRootCause,
      analyzedBothVersions,
      checkedNativeCapabilities,
      verifiedUserIntent,
      timestamp: new Date().toISOString()
    };
  }
}

// Example usage:
/*
// BEFORE making any code change:
const action = AccountabilityEnforcer.createAction({
  type: 'code_change',
  description: 'Remove $schema line from JSON',
  isCodeChange: true,
  isDelete: true,
  rootCauseAnalysis: 'Investigated: $schema is for IDE validation only, causes lint warning because URL unreachable. Auto-display uses WebSocket broadcast with type: open_file, not JSON schema. Removal does not affect functionality.',
  investigationEvidence: [
    'Read comprehensive-scan-command.js lines 228-234',
    'Found broadcast({type: open_file}) handles auto-display',
    'Verified $schema only affects editor, not runtime',
    'Checked no other systems depend on schema validation'
  ],
  systemContext: 'Part of Tauri configuration. Other systems (auto-display) use WebSocket messages, not JSON schema.',
  analyzedBothVersions: true,
  confirmedRootCause: true
});

// This will either allow or block the action
const validation = AccountabilityEnforcer.enforceAccountability(action);
if (validation.allowed) {
  // Proceed with change
  removeSchemaLine();
} else {
  console.error(validation.message);
  console.error(validation.requiredSteps);
}
*/

export default AccountabilityEnforcer;
