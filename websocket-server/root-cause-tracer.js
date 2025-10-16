/**
 * Root Cause Tracer
 * Phase 2: Connect issues to their root causes across files
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';

/**
 * Trace Root Cause of Issues
 * - Connect symptoms to actual problems
 * - Track dependencies causing issues
 * - Identify cascading failures
 */
export function traceRootCauses(projectMap, issues) {
  console.log('🔬 Phase 2: Tracing root causes...');
  
  const rootCauses = [];
  const issueConnections = {};
  
  // Group issues by type for pattern detection
  const issuesByType = groupIssuesByType(issues);
  
  // 1. Database Connection Issues → Missing Config
  const dbIssues = issuesByType.database || [];
  if (dbIssues.length > 0) {
    const rootCause = traceDatabaseIssues(projectMap, dbIssues);
    if (rootCause) rootCauses.push(rootCause);
  }
  
  // 2. Authentication Failures → Session/Token Issues
  const authIssues = issuesByType.authentication || [];
  if (authIssues.length > 0) {
    const rootCause = traceAuthIssues(projectMap, authIssues);
    if (rootCause) rootCauses.push(rootCause);
  }
  
  // 3. Performance Problems → Missing Indexes/N+1 Queries
  const perfIssues = issuesByType.performance || [];
  if (perfIssues.length > 0) {
    const rootCause = tracePerformanceIssues(projectMap, perfIssues);
    if (rootCause) rootCauses.push(rootCause);
  }
  
  // 4. Security Vulnerabilities → Input Validation Gaps
  const securityIssues = issuesByType.security || [];
  if (securityIssues.length > 0) {
    const rootCause = traceSecurityIssues(projectMap, securityIssues);
    if (rootCause) rootCauses.push(rootCause);
  }
  
  // 5. Code Quality Issues → Architecture Problems
  const qualityIssues = issuesByType.quality || [];
  if (qualityIssues.length > 0) {
    const rootCause = traceArchitectureIssues(projectMap, qualityIssues);
    if (rootCause) rootCauses.push(rootCause);
  }
  
  // 6. Dependency Issues → Missing/Outdated Packages
  const depIssues = issuesByType.dependency || [];
  if (depIssues.length > 0) {
    const rootCause = traceDependencyIssues(projectMap, depIssues);
    if (rootCause) rootCauses.push(rootCause);
  }
  
  console.log(`   ✓ Identified ${rootCauses.length} root causes`);
  
  return {
    rootCauses,
    issueConnections,
    impactAnalysis: analyzeImpact(rootCauses, issues)
  };
}

/**
 * Group Issues by Type for Pattern Detection
 */
function groupIssuesByType(issues) {
  const grouped = {};
  
  for (const issue of issues) {
    const type = categorizeIssue(issue);
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(issue);
  }
  
  return grouped;
}

function categorizeIssue(issue) {
  const text = (issue.description || issue.message || '').toLowerCase();
  
  if (text.match(/database|mysql|sql|connection|query/)) return 'database';
  if (text.match(/auth|login|session|token|permission/)) return 'authentication';
  if (text.match(/slow|performance|timeout|memory|cpu/)) return 'performance';
  if (text.match(/sql injection|xss|csrf|security|vulnerability/)) return 'security';
  if (text.match(/function|nesting|complexity|duplicate/)) return 'quality';
  if (text.match(/require|import|module|package|dependency/)) return 'dependency';
  
  return 'other';
}

/**
 * Trace Database Issues
 */
function traceDatabaseIssues(projectMap, issues) {
  const symptoms = issues.map(i => i.description).join(', ');
  
  // Check if database config exists
  const configFiles = ['config/database.php', 'database.php', '.env'];
  let missingConfig = [];
  
  for (const config of configFiles) {
    if (!findInStructure(projectMap.structure, config)) {
      missingConfig.push(config);
    }
  }
  
  if (missingConfig.length > 0) {
    return {
      rootCause: 'Missing or Misconfigured Database Connection',
      symptoms: symptoms,
      affectedIssues: issues.length,
      severity: 'CRITICAL',
      explanation: `Found ${issues.length} database-related issues. Root cause appears to be missing database configuration files: ${missingConfig.join(', ')}`,
      solution: {
        immediate: 'Create or verify database configuration file',
        longTerm: 'Implement proper database connection pooling and error handling',
        files: missingConfig,
        priority: 'HIGH'
      },
      impact: {
        scope: 'All database operations will fail',
        affectedFeatures: ['Data persistence', 'User authentication', 'API endpoints'],
        cascadeRisk: 'HIGH - Will cause failures in dependent features'
      }
    };
  }
  
  // Check for connection pooling issues
  if (issues.some(i => i.description?.includes('too many connections'))) {
    return {
      rootCause: 'Database Connection Pool Exhaustion',
      symptoms: symptoms,
      affectedIssues: issues.length,
      severity: 'HIGH',
      explanation: 'Database connection pool is being exhausted, likely due to unclosed connections',
      solution: {
        immediate: 'Restart database service and check connection limits',
        longTerm: 'Implement proper connection cleanup and increase pool size',
        code: 'Add try-finally blocks to ensure connections are closed',
        priority: 'HIGH'
      }
    };
  }
  
  return null;
}

/**
 * Trace Authentication Issues
 */
function traceAuthIssues(projectMap, issues) {
  const symptoms = issues.map(i => i.description).join(', ');
  
  // Check for session configuration
  const hasSessionConfig = findInStructure(projectMap.structure, 'session') || 
                          findInStructure(projectMap.structure, 'auth');
  
  if (!hasSessionConfig) {
    return {
      rootCause: 'Missing Session Management Configuration',
      symptoms: symptoms,
      affectedIssues: issues.length,
      severity: 'HIGH',
      explanation: 'Authentication failures are occurring due to improper session management setup',
      solution: {
        immediate: 'Configure session handling (timeout, storage, security flags)',
        longTerm: 'Implement JWT or OAuth for stateless authentication',
        priority: 'HIGH'
      },
      impact: {
        scope: 'All authenticated user actions',
        affectedFeatures: ['Login', 'Protected routes', 'User sessions'],
        cascadeRisk: 'HIGH'
      }
    };
  }
  
  return null;
}

/**
 * Trace Performance Issues
 */
function tracePerformanceIssues(projectMap, issues) {
  const symptoms = issues.map(i => i.description).join(', ');
  
  // Check for N+1 query patterns
  const hasN1Queries = issues.some(i => i.type === 'N1_QUERY' || i.description?.includes('multiple queries'));
  
  if (hasN1Queries) {
    return {
      rootCause: 'N+1 Query Problem',
      symptoms: symptoms,
      affectedIssues: issues.length,
      severity: 'MEDIUM',
      explanation: 'Multiple database queries are being executed in loops instead of using efficient joins',
      solution: {
        immediate: 'Identify and refactor loops containing queries',
        longTerm: 'Implement eager loading, query optimization, and caching',
        code: 'Use JOIN statements or ORM eager loading instead of loops',
        priority: 'MEDIUM'
      },
      impact: {
        scope: 'Page load times and database load',
        affectedFeatures: ['List pages', 'Dashboard', 'Reports'],
        cascadeRisk: 'MEDIUM - Can cause server overload under high traffic'
      }
    };
  }
  
  // Check for missing indexes
  const hasMissingIndexes = issues.some(i => i.description?.includes('slow query') || i.description?.includes('table scan'));
  
  if (hasMissingIndexes) {
    return {
      rootCause: 'Missing Database Indexes',
      symptoms: 'Slow query execution times',
      affectedIssues: issues.length,
      severity: 'MEDIUM',
      explanation: 'Database queries are performing full table scans due to missing indexes',
      solution: {
        immediate: 'Analyze slow query log and add indexes on frequently queried columns',
        longTerm: 'Implement query performance monitoring and index optimization',
        priority: 'MEDIUM'
      }
    };
  }
  
  return null;
}

/**
 * Trace Security Issues
 */
function traceSecurityIssues(projectMap, issues) {
  const symptoms = issues.map(i => i.description).join(', ');
  
  // Check for centralized input validation
  const hasValidation = findInStructure(projectMap.structure, 'validation') ||
                       findInStructure(projectMap.structure, 'validator');
  
  if (!hasValidation && issues.length > 3) {
    return {
      rootCause: 'Missing Centralized Input Validation',
      symptoms: symptoms,
      affectedIssues: issues.length,
      severity: 'CRITICAL',
      explanation: 'Multiple security vulnerabilities exist due to lack of systematic input validation',
      solution: {
        immediate: 'Implement input sanitization on all user inputs',
        longTerm: 'Create a centralized validation layer with schema-based validation',
        priority: 'CRITICAL'
      },
      impact: {
        scope: 'All user inputs across the application',
        affectedFeatures: ['Forms', 'API endpoints', 'Search'],
        cascadeRisk: 'CRITICAL - Direct security vulnerability'
      }
    };
  }
  
  return null;
}

/**
 * Trace Architecture Issues
 */
function traceArchitectureIssues(projectMap, issues) {
  // Check for tight coupling
  const hasTightCoupling = issues.some(i => i.type === 'TIGHT_COUPLING');
  
  if (hasTightCoupling && projectMap.architecture === 'Monolithic') {
    return {
      rootCause: 'Monolithic Architecture with Tight Coupling',
      symptoms: 'Difficult to maintain, test, and scale',
      affectedIssues: issues.length,
      severity: 'MEDIUM',
      explanation: 'Code is tightly coupled without clear separation of concerns',
      solution: {
        immediate: 'Refactor into smaller, loosely coupled modules',
        longTerm: 'Consider migrating to layered or microservices architecture',
        priority: 'LOW'
      }
    };
  }
  
  return null;
}

/**
 * Trace Dependency Issues
 */
function traceDependencyIssues(projectMap, issues) {
  return {
    rootCause: 'Dependency Management Problems',
    symptoms: issues.map(i => i.description).join(', '),
    affectedIssues: issues.length,
    severity: 'LOW',
    explanation: 'Issues with package dependencies or imports',
    solution: {
      immediate: 'Run package update and verify imports',
      longTerm: 'Implement dependency monitoring and automated updates',
      priority: 'LOW'
    }
  };
}

/**
 * Analyze Impact of Root Causes
 */
function analyzeImpact(rootCauses, allIssues) {
  const criticalCauses = rootCauses.filter(rc => rc.severity === 'CRITICAL');
  const highCauses = rootCauses.filter(rc => rc.severity === 'HIGH');
  
  return {
    totalRootCauses: rootCauses.length,
    criticalCount: criticalCauses.length,
    highCount: highCauses.length,
    cascadeRisk: criticalCauses.length > 0 ? 'HIGH' : highCauses.length > 0 ? 'MEDIUM' : 'LOW',
    priorityOrder: rootCauses.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
  };
}

/**
 * Helper: Find file in structure
 */
function findInStructure(structure, searchTerm) {
  for (const [key, value] of Object.entries(structure)) {
    if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    if (value.type === 'directory' && value.children) {
      if (findInStructure(value.children, searchTerm)) return true;
    }
  }
  return false;
}

export default {
  traceRootCauses
};
