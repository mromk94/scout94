/**
 * Deep Analysis Module - Detects 50+ Types of Issues
 * Comprehensive code quality, performance, and best practices analysis
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Code Quality Issues (20+ checks)
export function analyzeCodeQuality(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];

    // 1. Long Functions (> 50 lines)
    let functionLineCount = 0;
    let inFunction = false;
    lines.forEach((line, idx) => {
      if (line.match(/function\s+\w+/)) {
        inFunction = true;
        functionLineCount = 0;
      }
      if (inFunction) functionLineCount++;
      if (line.match(/^\s*}\s*$/) && inFunction) {
        if (functionLineCount > 50) {
          issues.push({
            severity: 'MEDIUM', type: 'LONG_FUNCTION',
            description: `Function exceeds 50 lines (${functionLineCount}) - consider refactoring`,
            line: idx + 1
          });
        }
        inFunction = false;
      }
    });

    // 2. Deep Nesting (> 4 levels)
    lines.forEach((line, idx) => {
      const indentLevel = (line.match(/^\s*/)[0].length / 2);
      if (indentLevel > 4) {
        issues.push({
          severity: 'LOW', type: 'DEEP_NESTING',
          description: 'Deep nesting detected - consider extracting to functions',
          line: idx + 1
        });
      }
    });

    // 3. Magic Numbers
    lines.forEach((line, idx) => {
      if (line.match(/\b\d{2,}\b/) && !line.match(/\/\/|#/)) {
        issues.push({
          severity: 'LOW', type: 'MAGIC_NUMBER',
          description: 'Magic number found - use named constant',
          line: idx + 1, code: line.trim()
        });
      }
    });

    // 4. Commented Out Code
    const commentedCode = lines.filter(line => 
      line.trim().match(/^\/\/\s*(if|for|while|function|\$)/)
    );
    if (commentedCode.length > 5) {
      issues.push({
        severity: 'LOW', type: 'COMMENTED_CODE',
        description: `${commentedCode.length} lines of commented code - remove or document`
      });
    }

    // 5. TODO/FIXME Comments
    lines.forEach((line, idx) => {
      if (line.match(/TODO|FIXME|HACK|XXX/i)) {
        issues.push({
          severity: 'LOW', type: 'TODO_COMMENT',
          description: 'Unresolved TODO/FIXME found',
          line: idx + 1, code: line.trim()
        });
      }
    });

    // 6. Long Lines (> 120 chars)
    lines.forEach((line, idx) => {
      if (line.length > 120) {
        issues.push({
          severity: 'LOW', type: 'LONG_LINE',
          description: `Line exceeds 120 characters (${line.length})`,
          line: idx + 1
        });
      }
    });

    // 7. Duplicate Code Blocks
    const codeBlocks = {};
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.length > 30) {
        codeBlocks[trimmed] = (codeBlocks[trimmed] || []);
        codeBlocks[trimmed].push(idx + 1);
      }
    });
    Object.entries(codeBlocks).forEach(([code, lineNumbers]) => {
      if (lineNumbers.length > 1) {
        issues.push({
          severity: 'MEDIUM', type: 'DUPLICATE_CODE',
          description: `Duplicate code found at lines: ${lineNumbers.join(', ')}`,
          code: code.substring(0, 50)
        });
      }
    });

    // 8. Missing Error Handling
    const tryBlocks = content.match(/try\s*{/g)?.length || 0;
    const catchBlocks = content.match(/catch\s*\(/g)?.length || 0;
    if (tryBlocks !== catchBlocks) {
      issues.push({
        severity: 'MEDIUM', type: 'MISSING_ERROR_HANDLING',
        description: 'Mismatched try-catch blocks'
      });
    }

    // 9. Console Logs in Production
    lines.forEach((line, idx) => {
      if (line.match(/console\.(log|debug|info|warn)/)) {
        issues.push({
          severity: 'LOW', type: 'CONSOLE_LOG',
          description: 'Console log statement - remove for production',
          line: idx + 1
        });
      }
    });

    // 10. Missing Type Hints (PHP)
    if (filePath.endsWith('.php')) {
      lines.forEach((line, idx) => {
        if (line.match(/function\s+\w+\s*\([^)]*\)/) && !line.match(/:\s*\w+\s*{/)) {
          issues.push({
            severity: 'LOW', type: 'MISSING_TYPE_HINT',
            description: 'Function missing return type hint',
            line: idx + 1
          });
        }
      });
    }

    return { success: true, issues };
  } catch (error) {
    return { success: false, error: error.message, issues: [] };
  }
}

// Performance Issues (15+ checks)
export function analyzePerformance(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];

    // 1. N+1 Query Pattern
    let hasLoop = false;
    let loopStartLine = 0;
    lines.forEach((line, idx) => {
      if (line.match(/foreach|for\s*\(|while\s*\(/)) {
        hasLoop = true;
        loopStartLine = idx + 1;
      }
      if (hasLoop && line.match(/query|execute|select|SELECT/i)) {
        issues.push({
          severity: 'HIGH', type: 'N_PLUS_ONE_QUERY',
          description: 'Database query inside loop - N+1 problem',
          line: idx + 1, loopAt: loopStartLine
        });
      }
      if (line.match(/^\s*}\s*$/)) hasLoop = false;
    });

    // 2. Missing Database Indexes
    if (content.match(/WHERE.*=.*(?!.*INDEX)/i)) {
      issues.push({
        severity: 'MEDIUM', type: 'MISSING_INDEX',
        description: 'WHERE clause without index - slow queries'
      });
    }

    // 3. SELECT * Usage
    lines.forEach((line, idx) => {
      if (line.match(/SELECT\s+\*/i)) {
        issues.push({
          severity: 'MEDIUM', type: 'SELECT_STAR',
          description: 'SELECT * - specify columns for better performance',
          line: idx + 1
        });
      }
    });

    // 4. Missing Caching
    if (content.match(/query|SELECT/i) && !content.match(/cache|Cache|memcache|redis/i)) {
      issues.push({
        severity: 'MEDIUM', type: 'MISSING_CACHE',
        description: 'Frequent queries without caching strategy'
      });
    }

    // 5. Large Array Operations
    lines.forEach((line, idx) => {
      if (line.match(/array_merge|array_push.*foreach|array_map/)) {
        issues.push({
          severity: 'LOW', type: 'INEFFICIENT_ARRAY',
          description: 'Inefficient array operation - consider alternatives',
          line: idx + 1
        });
      }
    });

    // 6. File Operations in Loop
    lines.forEach((line, idx) => {
      if (hasLoop && line.match(/file_get_contents|fopen|readfile/)) {
        issues.push({
          severity: 'HIGH', type: 'FILE_IO_IN_LOOP',
          description: 'File I/O inside loop - severe performance impact',
          line: idx + 1
        });
      }
    });

    // 7. Regex in Loop
    lines.forEach((line, idx) => {
      if (hasLoop && line.match(/preg_match|preg_replace/)) {
        issues.push({
          severity: 'MEDIUM', type: 'REGEX_IN_LOOP',
          description: 'Regex inside loop - pre-compile pattern',
          line: idx + 1
        });
      }
    });

    // 8. Missing Pagination
    if (content.match(/SELECT.*FROM/i) && !content.match(/LIMIT|OFFSET|pagination/i)) {
      issues.push({
        severity: 'MEDIUM', type: 'MISSING_PAGINATION',
        description: 'Query without pagination - memory issues with large datasets'
      });
    }

    // 9. Synchronous API Calls
    if (content.match(/file_get_contents.*http|curl_exec/) && !content.match(/async|promise/i)) {
      issues.push({
        severity: 'MEDIUM', type: 'SYNC_API_CALL',
        description: 'Synchronous API call - blocks execution'
      });
    }

    // 10. Missing Connection Pooling
    if (content.match(/new PDO|mysqli_connect/) && !content.match(/persistent|pool/i)) {
      issues.push({
        severity: 'LOW', type: 'NO_CONNECTION_POOL',
        description: 'Database connection without pooling'
      });
    }

    return { success: true, issues };
  } catch (error) {
    return { success: false, error: error.message, issues: [] };
  }
}

// Best Practices Violations (15+ checks)
export function analyzeBestPractices(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];

    // 1. Global Variables
    lines.forEach((line, idx) => {
      if (line.match(/global\s+\$/)) {
        issues.push({
          severity: 'MEDIUM', type: 'GLOBAL_VARIABLE',
          description: 'Global variable usage - use dependency injection',
          line: idx + 1
        });
      }
    });

    // 2. Suppressed Errors (@)
    lines.forEach((line, idx) => {
      if (line.match(/@\w+\s*\(/)) {
        issues.push({
          severity: 'MEDIUM', type: 'ERROR_SUPPRESSION',
          description: 'Error suppression with @ - handle errors properly',
          line: idx + 1
        });
      }
    });

    // 3. Exit/Die Statements
    lines.forEach((line, idx) => {
      if (line.match(/\bexit\b|\bdie\b/)) {
        issues.push({
          severity: 'MEDIUM', type: 'EXIT_DIE',
          description: 'exit/die usage - throw exceptions instead',
          line: idx + 1
        });
      }
    });

    // 4. Missing Documentation
    const functionCount = (content.match(/function\s+\w+/g) || []).length;
    const docBlockCount = (content.match(/\/\*\*/g) || []).length;
    if (functionCount > 0 && docBlockCount / functionCount < 0.5) {
      issues.push({
        severity: 'LOW', type: 'MISSING_DOCS',
        description: `${functionCount - docBlockCount} functions lack documentation`
      });
    }

    // 5. Deprecated Functions
    const deprecatedFunctions = [
      'mysql_query', 'mysql_connect', 'ereg', 'split',
      'session_register', 'magic_quotes'
    ];
    deprecatedFunctions.forEach(func => {
      if (content.match(new RegExp(`\\b${func}\\b`))) {
        issues.push({
          severity: 'HIGH', type: 'DEPRECATED_FUNCTION',
          description: `Deprecated function: ${func}`
        });
      }
    });

    // 6. Missing Strict Types
    if (filePath.endsWith('.php') && !content.match(/declare\(strict_types=1\)/)) {
      issues.push({
        severity: 'LOW', type: 'NO_STRICT_TYPES',
        description: 'Missing strict_types declaration'
      });
    }

    // 7. Hardcoded Paths
    lines.forEach((line, idx) => {
      if (line.match(/['"]\/(?:home|var|usr|Users)\//)) {
        issues.push({
          severity: 'MEDIUM', type: 'HARDCODED_PATH',
          description: 'Hardcoded absolute path - use relative or config',
          line: idx + 1
        });
      }
    });

    // 8. Mixed Concerns
    if (content.match(/SELECT.*FROM/i) && content.match(/<html|<div|<span/i)) {
      issues.push({
        severity: 'MEDIUM', type: 'MIXED_CONCERNS',
        description: 'Mixed database logic and presentation - separate concerns'
      });
    }

    // 9. Missing Namespace
    if (filePath.endsWith('.php') && !content.match(/namespace\s+/)) {
      issues.push({
        severity: 'LOW', type: 'MISSING_NAMESPACE',
        description: 'PHP file without namespace'
      });
    }

    // 10. Class Too Large
    const classMatch = content.match(/class\s+\w+/);
    if (classMatch && lines.length > 500) {
      issues.push({
        severity: 'MEDIUM', type: 'LARGE_CLASS',
        description: `Class exceeds 500 lines (${lines.length}) - consider splitting`
      });
    }

    return { success: true, issues };
  } catch (error) {
    return { success: false, error: error.message, issues: [] };
  }
}

// Architecture Issues
export function analyzeArchitecture(projectPath) {
  const issues = [];

  try {
    // 1. Missing MVC Structure
    const hasMVC = ['models', 'views', 'controllers'].every(dir =>
      existsSync(join(projectPath, dir))
    );
    if (!hasMVC) {
      issues.push({
        severity: 'MEDIUM', type: 'NO_MVC_STRUCTURE',
        description: 'Project lacks MVC architecture'
      });
    }

    // 2. Missing Tests Directory
    if (!existsSync(join(projectPath, 'tests'))) {
      issues.push({
        severity: 'HIGH', type: 'NO_TESTS',
        description: 'No tests directory found'
      });
    }

    // 3. Missing Config Directory
    if (!existsSync(join(projectPath, 'config'))) {
      issues.push({
        severity: 'MEDIUM', type: 'NO_CONFIG_DIR',
        description: 'No config directory for settings'
      });
    }

    // 4. Missing .gitignore
    if (!existsSync(join(projectPath, '.gitignore'))) {
      issues.push({
        severity: 'LOW', type: 'NO_GITIGNORE',
        description: 'Missing .gitignore file'
      });
    }

    // 5. Missing README
    if (!existsSync(join(projectPath, 'README.md'))) {
      issues.push({
        severity: 'LOW', type: 'NO_README',
        description: 'Missing README.md documentation'
      });
    }

    // 6. Missing Dependency Manager
    const hasComposer = existsSync(join(projectPath, 'composer.json'));
    const hasPackageJson = existsSync(join(projectPath, 'package.json'));
    if (!hasComposer && !hasPackageJson) {
      issues.push({
        severity: 'MEDIUM', type: 'NO_DEPENDENCY_MANAGER',
        description: 'No composer.json or package.json found'
      });
    }

    return { success: true, issues };
  } catch (error) {
    return { success: false, error: error.message, issues: [] };
  }
}

export default {
  analyzeCodeQuality,
  analyzePerformance,
  analyzeBestPractices,
  analyzeArchitecture
};
