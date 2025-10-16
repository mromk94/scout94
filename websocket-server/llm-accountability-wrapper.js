/**
 * LLM Accountability Wrapper
 * 
 * Wraps ANY LLM call to ensure accountability protocol is enforced.
 * Use this for OpenAI, Claude, or any other LLM integration.
 */

import { AccountabilityEnforcer } from './accountability-enforcer.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load accountability prompt
const ACCOUNTABILITY_SYSTEM_PROMPT = readFileSync(
  join(__dirname, 'ACCOUNTABILITY_SYSTEM_PROMPT.md'),
  'utf-8'
);

/**
 * Wrap LLM calls with accountability enforcement
 */
export class LLMAccountabilityWrapper {
  
  /**
   * Inject accountability protocol into LLM system prompt
   */
  static injectAccountabilityIntoPrompt(originalSystemPrompt) {
    return `${originalSystemPrompt}

---

${ACCOUNTABILITY_SYSTEM_PROMPT}

---

**CRITICAL:** The accountability protocol above is MANDATORY.
You MUST follow it for ALL actions. Your responses will be validated.`;
  }
  
  /**
   * Validate LLM response before executing actions
   */
  static async validateLLMResponse(llmResponse) {
    console.log('🛡️ Validating LLM response for accountability...');
    
    // Extract action from LLM response
    const action = this.extractActionFromResponse(llmResponse);
    
    if (!action) {
      console.log('ℹ️  No action extracted, validation skipped');
      return { valid: true, response: llmResponse };
    }
    
    // Enforce accountability
    const validation = AccountabilityEnforcer.enforceAccountability(action);
    
    if (!validation.allowed) {
      console.error('❌ LLM response BLOCKED by accountability enforcer');
      console.error(`Reason: ${validation.reason}`);
      
      return {
        valid: false,
        blocked: true,
        reason: validation.reason,
        requiredSteps: validation.requiredSteps,
        originalResponse: llmResponse,
        message: `🛑 This action was blocked by the accountability protocol.\n\n${validation.reason}\n\nRequired steps:\n${validation.requiredSteps.join('\n')}`
      };
    }
    
    console.log('✅ LLM response passed accountability validation');
    return { valid: true, response: llmResponse };
  }
  
  /**
   * Extract action descriptor from LLM response
   */
  static extractActionFromResponse(llmResponse) {
    // Check for code changes
    const hasCodeChange = /```/.test(llmResponse) || 
                         /edit|modify|change|update.*code/i.test(llmResponse);
    
    // Check for deletions
    const hasDeletion = /delete|remove|erase/i.test(llmResponse);
    
    // Check for fixes
    const isFix = /fix|solve|resolve|repair/i.test(llmResponse);
    
    // Extract root cause analysis if present
    const rootCauseMatch = llmResponse.match(/root cause:?\s*(.+?)(\n|$)/i);
    const rootCauseAnalysis = rootCauseMatch ? rootCauseMatch[1] : null;
    
    // Extract investigation evidence
    const investigationEvidence = [];
    const readFileMatches = llmResponse.match(/read|checked|verified|investigated:?\s*(.+?)(\n|$)/gi);
    if (readFileMatches) {
      investigationEvidence.push(...readFileMatches.map(m => m.trim()));
    }
    
    // If no significant action, return null
    if (!hasCodeChange && !hasDeletion && !isFix) {
      return null;
    }
    
    return {
      type: 'llm_proposed_action',
      description: llmResponse.substring(0, 200),
      isCodeChange: hasCodeChange,
      isDelete: hasDeletion,
      isFix: isFix,
      rootCauseAnalysis,
      investigationEvidence,
      systemContext: null, // LLM should provide this
      confirmedRootCause: rootCauseAnalysis !== null && rootCauseAnalysis.length > 50
    };
  }
  
  /**
   * Wrap OpenAI API call with accountability
   */
  static async callOpenAIWithAccountability(openai, messages, options = {}) {
    // Inject accountability into system message
    const messagesWithAccountability = [...messages];
    if (messagesWithAccountability[0]?.role === 'system') {
      messagesWithAccountability[0].content = this.injectAccountabilityIntoPrompt(
        messagesWithAccountability[0].content
      );
    } else {
      messagesWithAccountability.unshift({
        role: 'system',
        content: ACCOUNTABILITY_SYSTEM_PROMPT
      });
    }
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      ...options,
      messages: messagesWithAccountability
    });
    
    const llmResponse = response.choices[0].message.content;
    
    // Validate response
    const validation = await this.validateLLMResponse(llmResponse);
    
    return {
      ...response,
      accountabilityValidation: validation,
      wasBlocked: !validation.valid
    };
  }
  
  /**
   * Wrap Claude API call with accountability
   */
  static async callClaudeWithAccountability(anthropic, messages, options = {}) {
    // Inject accountability into system message
    const systemPrompt = options.system || '';
    const systemWithAccountability = this.injectAccountabilityIntoPrompt(systemPrompt);
    
    // Call Claude
    const response = await anthropic.messages.create({
      ...options,
      system: systemWithAccountability,
      messages
    });
    
    const llmResponse = response.content[0].text;
    
    // Validate response
    const validation = await this.validateLLMResponse(llmResponse);
    
    return {
      ...response,
      accountabilityValidation: validation,
      wasBlocked: !validation.valid
    };
  }
}

export default LLMAccountabilityWrapper;
