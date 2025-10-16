/**
 * Real Analysis Engine
 * Provides actual file scanning, log parsing, and code analysis
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

// Default project path (can be overridden)
let PROJECT_PATH = '/Users/mac/CascadeProjects/Viz Venture Group';

export function setProjectPath(newPath) {
  PROJECT_PATH = newPath;
  console.log(`📁 Analysis engine now targeting: ${PROJECT_PATH}`);
}

export function getProjectPath() {
  return global.currentProjectPath || PROJECT_PATH;
}

// ============================================
// FILE SYSTEM ANALYSIS
// ============================================

export function readLogFile(logPath) {
  try {
    if (!existsSync(logPath)) {
      return { success: false, error: 'Log file not found', lines: [] };
    }

    const content = readFileSync(logPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      success: true,
      lines: lines.slice(-100), // Last 100 lines
      totalLines: lines.length,
      fileSize: statSync(logPath).size,
      lastModified: statSync(logPath).mtime
    };
  } catch (error) {
    return { success: false, error: error.message, lines: [] };
  }
}

export function parseErrorLog(logPath) {
  try {
    const result = readLogFile(logPath);
    if (!result.success) return result;

    const errors = [];
    const warnings = [];
    const criticals = [];

    result.lines.forEach(line => {
      if (line.match(/\[error\]|\bERROR\b|Fatal error|Exception/i)) {
        errors.push(line);
      }
      if (line.match(/\[critical\]|\bCRITICAL\b|FATAL/i)) {
        criticals.push(line);
      }
      if (line.match(/\[warning\]|\bWARNING\b|Notice/i)) {
        warnings.push(line);
      }
    });

    // Extract common error patterns
    const sqlErrors = errors.filter(e => e.match(/SQL|mysql|database|query/i));
    const authErrors = errors.filter(e => e.match(/auth|login|session|token/i));
    const phpErrors = errors.filter(e => e.match(/PHP (Fatal|Parse|Notice|Warning)/));
    
    return {
      success: true,
      summary: {
        totalErrors: errors.length,
        criticalErrors: criticals.length,
        warnings: warnings.length,
        sqlErrors: sqlErrors.length,
        authErrors: authErrors.length,
        phpErrors: phpErrors.length
      },
      recentErrors: errors.slice(-10),
      recentCritical: criticals.slice(-5),
      patterns: {
        hasDatabaseIssues: sqlErrors.length > 0,
        hasAuthIssues: authErrors.length > 0,
        hasPHPErrors: phpErrors.length > 0
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// CODE ANALYSIS
// ============================================

export function analyzeSecurityInFile(filePath) {
  try {
    if (!existsSync(filePath) || !filePath.endsWith('.php')) {
      return { success: false, error: 'Invalid PHP file' };
    }

    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];

    // 1. SQL Injection (CRITICAL)
    lines.forEach((line, idx) => {
      if (line.match(/mysql_query|mysqli_query.*\$_(?:GET|POST|REQUEST|COOKIE)/)) {
        issues.push({
          severity: 'CRITICAL', type: 'SQL_INJECTION',
          description: 'Direct user input in SQL query - use prepared statements',
          line: idx + 1, code: line.trim()
        });
      }
      if (line.match(/\$_(GET|POST|REQUEST).*SELECT|INSERT|UPDATE|DELETE/i)) {
        issues.push({
          severity: 'CRITICAL', type: 'SQL_INJECTION',
          description: 'User input in SQL statement without sanitization',
          line: idx + 1, code: line.trim()
        });
      }
    });

    // 2. XSS Vulnerabilities (HIGH)
    lines.forEach((line, idx) => {
      if (line.match(/echo\s+\$_(?:GET|POST|REQUEST|COOKIE)|print\s+\$_/)) {
        issues.push({
          severity: 'HIGH', type: 'XSS',
          description: 'Unescaped output - use htmlspecialchars()',
          line: idx + 1, code: line.trim()
        });
      }
    });

    // 3. CSRF - Missing Token Validation (HIGH)
    if (content.match(/\$_POST/) && !content.match(/csrf|token|_token/i)) {
      issues.push({
        severity: 'HIGH', type: 'CSRF',
        description: 'Form processing without CSRF token validation'
      });
    }

    // 4. Hardcoded Credentials (CRITICAL)
    lines.forEach((line, idx) => {
      if (line.match(/password\s*=\s*["'][^$][^"']{3,}["']|api[_-]?key\s*=\s*["'][^$]/i)) {
        issues.push({
          severity: 'CRITICAL', type: 'HARDCODED_CREDENTIALS',
          description: 'Hardcoded credentials - use environment variables',
          line: idx + 1
        });
      }
    });

    // 5. File Upload Vulnerabilities (CRITICAL)
    if (content.match(/\$_FILES/) && !content.match(/getimagesize|finfo_file|mime/)) {
      issues.push({
        severity: 'CRITICAL', type: 'FILE_UPLOAD',
        description: 'File upload without type validation'
      });
    }

    // 6. Path Traversal (HIGH)
    lines.forEach((line, idx) => {
      if (line.match(/include|require.*\$_(?:GET|POST)/)) {
        issues.push({
          severity: 'HIGH', type: 'PATH_TRAVERSAL',
          description: 'Dynamic file inclusion - path traversal risk',
          line: idx + 1
        });
      }
    });

    // 7. Command Injection (CRITICAL)
    lines.forEach((line, idx) => {
      if (line.match(/exec|shell_exec|system|passthru.*\$/)) {
        issues.push({
          severity: 'CRITICAL', type: 'COMMAND_INJECTION',
          description: 'Command execution with user input',
          line: idx + 1
        });
      }
    });

    // 8. Weak Cryptography (MEDIUM)
    if (content.match(/md5\(.*password|sha1\(.*password/i)) {
      issues.push({
        severity: 'MEDIUM', type: 'WEAK_CRYPTO',
        description: 'Weak password hashing - use password_hash()'
      });
    }

    // 9. Error Information Disclosure (MEDIUM)
    if (content.match(/display_errors\s*=\s*1|error_reporting\s*\(\s*E_ALL/)) {
      issues.push({
        severity: 'MEDIUM', type: 'INFO_DISCLOSURE',
        description: 'Error display enabled - information leakage risk'
      });
    }

    // 10. Session Fixation (MEDIUM)
    if (content.match(/session_start/) && !content.match(/session_regenerate_id/)) {
      issues.push({
        severity: 'MEDIUM', type: 'SESSION_FIXATION',
        description: 'Session started without regeneration'
      });
    }

    return {
      success: true,
      filePath,
      issues,
      metrics: {
        totalIssues: issues.length,
        critical: issues.filter(i => i.severity === 'CRITICAL').length,
        high: issues.filter(i => i.severity === 'HIGH').length,
        medium: issues.filter(i => i.severity === 'MEDIUM').length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function findLineNumber(content, pattern) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(pattern)) {
      return i + 1;
    }
  }
  return null;
}

// ============================================
// PROJECT INDEXING
// ============================================

export function indexProject(basePath) {
  const index = {
    phpFiles: [],
    configFiles: [],
    apiEndpoints: [],
    testFiles: [],
    totalFiles: 0,
    totalSize: 0
  };

  function scanDirectory(dir, depth = 0) {
    if (depth > 5) return; // Prevent infinite recursion
    
    try {
      const items = readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = join(dir, item);
        
        try {
          const stats = statSync(fullPath);
          
          if (stats.isDirectory()) {
            // Skip common ignored directories
            if (!item.match(/node_modules|vendor|\.git|cache|tmp/)) {
              scanDirectory(fullPath, depth + 1);
            }
          } else if (stats.isFile()) {
            index.totalFiles++;
            index.totalSize += stats.size;
            
            const ext = extname(item);
            const relativePath = fullPath.replace(basePath, '');
            
            if (ext === '.php') {
              index.phpFiles.push(relativePath);
              
              // Detect API endpoints
              if (relativePath.includes('/api/')) {
                index.apiEndpoints.push(relativePath);
              }
              
              // Detect test files
              if (item.match(/test_|_test\.php|Test\.php/)) {
                index.testFiles.push(relativePath);
              }
            }
            
            // Config files
            if (item.match(/config|\.env|settings/)) {
              index.configFiles.push(relativePath);
            }
          }
        } catch (e) {
          // Skip files we can't access
        }
      });
    } catch (error) {
      // Skip directories we can't access
    }
  }

  scanDirectory(basePath);
  
  return {
    success: true,
    index,
    summary: {
      phpFiles: index.phpFiles.length,
      apiEndpoints: index.apiEndpoints.length,
      testFiles: index.testFiles.length,
      configFiles: index.configFiles.length,
      totalFiles: index.totalFiles,
      totalSizeMB: (index.totalSize / 1024 / 1024).toFixed(2)
    }
  };
}

// ============================================
// DATABASE ANALYSIS
// ============================================

export function testDatabaseConnection() {
  try {
    // Try to connect via PHP script
    const testScript = `
<?php
require_once '${PROJECT_PATH}/config/database.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Test query
    $stmt = $pdo->query("SELECT VERSION() as version, NOW() as time");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get table count
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'connected' => true,
        'version' => $result['version'],
        'serverTime' => $result['time'],
        'database' => DB_NAME,
        'tableCount' => count($tables),
        'tables' => $tables
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'connected' => false,
        'error' => $e->getMessage()
    ]);
}
?>
    `;

    // Write temp test file
    const tempFile = '/tmp/scout94_db_test.php';
    require('fs').writeFileSync(tempFile, testScript);
    
    // Execute
    const output = execSync(`php ${tempFile}`, { encoding: 'utf-8' });
    const result = JSON.parse(output);
    
    // Cleanup
    require('fs').unlinkSync(tempFile);
    
    return { success: true, ...result };
  } catch (error) {
    return { 
      success: false, 
      connected: false,
      error: error.message 
    };
  }
}

// ============================================
// PERFORMANCE ANALYSIS
// ============================================

export function analyzePerformance(logPath) {
  try {
    const result = readLogFile(logPath);
    if (!result.success) return result;

    const responseTimes = [];
    const slowQueries = [];
    const endpoints = {};

    result.lines.forEach(line => {
      // Extract response times (common log format)
      const timeMatch = line.match(/(\d+(?:\.\d+)?)\s*ms/);
      if (timeMatch) {
        responseTimes.push(parseFloat(timeMatch[1]));
      }

      // Extract slow query logs
      if (line.match(/slow query|query time > |execution time/i)) {
        slowQueries.push(line);
      }

      // Track endpoint usage
      const endpointMatch = line.match(/\/api\/[^\s]+/);
      if (endpointMatch) {
        const endpoint = endpointMatch[0];
        endpoints[endpoint] = (endpoints[endpoint] || 0) + 1;
      }
    });

    const avgResponseTime = responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)
      : 0;

    const maxResponseTime = responseTimes.length > 0
      ? Math.max(...responseTimes).toFixed(2)
      : 0;

    return {
      success: true,
      metrics: {
        avgResponseTime: `${avgResponseTime}ms`,
        maxResponseTime: `${maxResponseTime}ms`,
        totalRequests: responseTimes.length,
        slowQueries: slowQueries.length,
        mostUsedEndpoint: Object.entries(endpoints).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
      },
      recentSlowQueries: slowQueries.slice(-5),
      endpointStats: endpoints
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// COMPREHENSIVE SCAN
// ============================================

export async function runComprehensiveScan(projectPath) {
  if (!projectPath) {
    projectPath = getProjectPath();
  }
  console.log(`🔍 Starting comprehensive project scan of: ${projectPath}`);
  
  const results = {
    timestamp: new Date().toISOString(),
    projectPath,
    scans: {}
  };

  // 1. Index project
  console.log('📁 Indexing project files...');
  results.scans.projectIndex = indexProject(projectPath);

  // 2. Analyze logs
  console.log('📋 Analyzing error logs...');
  const errorLogPath = join(projectPath, 'logs', 'error.log');
  if (existsSync(errorLogPath)) {
    results.scans.errorAnalysis = parseErrorLog(errorLogPath);
  }

  // 3. Security scan on API files
  console.log('🔒 Scanning API security...');
  const securityIssues = [];
  const apiDir = join(projectPath, 'api');
  
  if (existsSync(apiDir)) {
    const scanApiDirectory = (dir) => {
      try {
        const items = readdirSync(dir);
        items.forEach(item => {
          const fullPath = join(dir, item);
          try {
            const stats = statSync(fullPath);
            if (stats.isDirectory()) {
              scanApiDirectory(fullPath);
            } else if (item.endsWith('.php')) {
              const analysis = analyzeSecurityInFile(fullPath);
              if (analysis.success && analysis.issues.length > 0) {
                securityIssues.push(analysis);
              }
            }
          } catch (e) {
            // Skip inaccessible files
          }
        });
      } catch (error) {
        // Skip inaccessible directories
      }
    };

    scanApiDirectory(apiDir);
  }

  results.scans.securityAnalysis = {
    success: true,
    filesScanned: securityIssues.length,
    totalIssues: securityIssues.reduce((sum, f) => sum + f.issues.length, 0),
    criticalIssues: securityIssues.reduce((sum, f) => 
      sum + f.issues.filter(i => i.severity === 'CRITICAL').length, 0
    ),
    filesWithIssues: securityIssues
  };

  // 4. Database test
  console.log('💾 Testing database connection...');
  results.scans.databaseTest = testDatabaseConnection();

  // 5. Performance analysis
  console.log('⚡ Analyzing performance...');
  const appLogPath = join(projectPath, 'logs', 'app.log');
  if (existsSync(appLogPath)) {
    results.scans.performanceAnalysis = analyzePerformance(appLogPath);
  }

  console.log('✅ Comprehensive scan complete!');
  
  return results;
}

export default {
  readLogFile,
  parseErrorLog,
  analyzeSecurityInFile,
  indexProject,
  testDatabaseConnection,
  analyzePerformance,
  runComprehensiveScan
};
