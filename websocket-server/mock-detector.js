/**
 * Mock Detection System
 * Detects when reports contain mock/placeholder data vs real scan results
 * 
 * PHILOSOPHY: Scout94 should be honest about what it knows and doesn't know.
 * If data is incomplete, missing, or placeholder - FLAG IT prominently.
 */

export class MockDetector {
  constructor() {
    this.mockIndicators = [];
    this.confidence = 100; // Start at 100% real, deduct for mock indicators
  }

  /**
   * Analyze comprehensive scan results for mock/placeholder patterns
   */
  analyzeComprehensiveScan(results) {
    console.log('🔍 Mock Detector: Analyzing scan authenticity...');
    
    this.mockIndicators = [];
    this.confidence = 100;
    
    // 1. Check if core scans actually ran
    this.checkProjectIndex(results.scans?.projectIndex);
    this.checkErrorAnalysis(results.scans?.errorAnalysis);
    this.checkSecurityAnalysis(results.scans?.securityAnalysis);
    this.checkDatabaseTest(results.scans?.databaseTest);
    this.checkPerformanceAnalysis(results.scans?.performanceAnalysis);
    
    // 2. Check deep analysis authenticity
    this.checkDeepAnalysis(results.deepAnalysis);
    
    // 3. Check root cause analysis
    this.checkRootCauseAnalysis(results.rootCauseAnalysis);
    
    // 4. Detect suspiciously perfect data
    this.detectPerfectData(results);
    
    // 5. Detect missing required data
    this.detectMissingData(results);
    
    return {
      isMock: this.confidence < 50,
      isPartiallyMock: this.confidence < 80 && this.confidence >= 50,
      confidence: this.confidence,
      indicators: this.mockIndicators,
      verdict: this.getVerdict()
    };
  }

  checkProjectIndex(scan) {
    if (!scan) {
      this.addIndicator('MISSING_SCAN', 'Project index scan not executed', 15);
      return;
    }
    
    if (!scan.success) {
      this.addIndicator('FAILED_SCAN', 'Project index scan failed', 10);
      return;
    }
    
    const summary = scan.summary;
    if (!summary || summary.totalFiles === 0) {
      this.addIndicator('EMPTY_PROJECT', 'Project has zero files (impossible)', 20);
    }
    
    // Real projects have multiple file types
    if (summary.phpFiles === 0 && summary.jsFiles === 0 && summary.cssFiles === 0) {
      this.addIndicator('NO_CODE_FILES', 'No code files found in project', 15);
    }
  }

  checkErrorAnalysis(scan) {
    if (!scan) {
      this.addIndicator('MISSING_ERROR_LOG', 'Error log not found or not scanned', 10);
      return;
    }
    
    if (!scan.success) {
      this.addIndicator('ERROR_LOG_FAILED', 'Error log scan failed', 5);
      return;
    }
    
    // Having ZERO errors is suspicious for a real application
    if (scan.summary?.totalErrors === 0 && scan.summary?.warnings === 0) {
      this.addIndicator('SUSPICIOUSLY_CLEAN', 'Zero errors/warnings (unrealistic for real app)', 8);
    }
  }

  checkSecurityAnalysis(scan) {
    if (!scan || !scan.success) {
      this.addIndicator('MISSING_SECURITY_SCAN', 'Security scan not executed', 12);
      return;
    }
    
    if (scan.filesScanned === 0) {
      this.addIndicator('NO_FILES_SCANNED', 'Zero files scanned for security', 15);
    }
    
    // Real apps typically have SOME security concerns
    if (scan.filesScanned > 20 && scan.totalIssues === 0) {
      this.addIndicator('PERFECT_SECURITY', `Scanned ${scan.filesScanned} files with zero issues (unrealistic)`, 10);
    }
  }

  checkDatabaseTest(scan) {
    if (!scan) {
      this.addIndicator('MISSING_DB_TEST', 'Database test not executed', 10);
      return;
    }
    
    // If not connected and no error message, it's likely not tested
    if (!scan.connected && !scan.error) {
      this.addIndicator('DB_NOT_TESTED', 'Database connection not actually tested', 8);
    }
  }

  checkPerformanceAnalysis(scan) {
    if (!scan) {
      this.addIndicator('MISSING_PERFORMANCE', 'Performance analysis not executed', 10);
      return;
    }
    
    if (!scan.success) {
      this.addIndicator('PERFORMANCE_FAILED', 'Performance scan failed', 5);
      return;
    }
    
    // Zero requests means log doesn't exist or is empty
    if (scan.metrics?.totalRequests === 0) {
      this.addIndicator('NO_PERFORMANCE_DATA', 'No performance data found in logs', 8);
    }
  }

  checkDeepAnalysis(deepAnalysis) {
    if (!deepAnalysis) {
      this.addIndicator('MISSING_DEEP_ANALYSIS', 'Deep code analysis not performed', 12);
      return;
    }
    
    // Check if arrays are empty
    const hasCodeQuality = deepAnalysis.codeQuality && deepAnalysis.codeQuality.length > 0;
    const hasPerformance = deepAnalysis.performance && deepAnalysis.performance.length > 0;
    const hasBestPractices = deepAnalysis.bestPractices && deepAnalysis.bestPractices.length > 0;
    
    if (!hasCodeQuality && !hasPerformance && !hasBestPractices) {
      this.addIndicator('EMPTY_DEEP_ANALYSIS', 'Deep analysis returned zero results', 15);
    }
  }

  checkRootCauseAnalysis(rootCauseAnalysis) {
    if (!rootCauseAnalysis) {
      this.addIndicator('MISSING_ROOT_CAUSE', 'Root cause analysis not performed', 10);
      return;
    }
    
    // Having zero root causes when there ARE issues is suspicious
    if (rootCauseAnalysis.rootCauses?.length === 0) {
      // This is actually OK if there are truly no issues
      // But if we detected other problems, this is suspicious
      if (this.mockIndicators.length > 0) {
        this.addIndicator('INCONSISTENT_ROOT_CAUSE', 'Issues found but zero root causes identified', 8);
      }
    }
  }

  detectPerfectData(results) {
    // Real world data is messy - too perfect is suspicious
    const hasAnyIssues = 
      (results.scans?.errorAnalysis?.summary?.totalErrors || 0) > 0 ||
      (results.scans?.securityAnalysis?.totalIssues || 0) > 0 ||
      (results.scans?.performanceAnalysis?.metrics?.slowQueries || 0) > 0;
    
    if (!hasAnyIssues && this.mockIndicators.length === 0) {
      // Absolutely perfect = likely mock
      this.addIndicator('TOO_PERFECT', 'Scan results are unrealistically perfect', 12);
    }
  }

  detectMissingData(results) {
    // Check for core data structures
    if (!results.projectPath) {
      this.addIndicator('NO_PROJECT_PATH', 'Project path not specified', 10);
    }
    
    if (!results.timestamp) {
      this.addIndicator('NO_TIMESTAMP', 'Scan timestamp missing', 5);
    }
    
    // If scans object is empty or missing
    if (!results.scans || Object.keys(results.scans).length === 0) {
      this.addIndicator('NO_SCANS', 'Zero scans executed (complete mock)', 30);
    }
  }

  addIndicator(type, description, confidencePenalty) {
    this.mockIndicators.push({
      type,
      description,
      confidencePenalty
    });
    this.confidence = Math.max(0, this.confidence - confidencePenalty);
  }

  getVerdict() {
    if (this.confidence >= 80) {
      return {
        status: 'REAL',
        emoji: '✅',
        message: 'Scan results appear to be from real analysis'
      };
    } else if (this.confidence >= 50) {
      return {
        status: 'PARTIAL',
        emoji: '⚠️',
        message: 'Scan contains mix of real and placeholder data'
      };
    } else if (this.confidence >= 20) {
      return {
        status: 'MOSTLY_MOCK',
        emoji: '❌',
        message: 'Scan results are primarily mock/placeholder data'
      };
    } else {
      return {
        status: 'COMPLETE_MOCK',
        emoji: '🚫',
        message: 'Scan did not execute - complete mock data'
      };
    }
  }

  /**
   * Generate mock detection report section
   */
  generateReportSection(detection) {
    let section = `## 🔍 Data Authenticity Analysis\n\n`;
    
    section += `**Authenticity Confidence:** ${detection.confidence}%  \n`;
    section += `**Verdict:** ${detection.verdict.emoji} **${detection.verdict.status}**  \n`;
    section += `**Assessment:** ${detection.verdict.message}\n\n`;
    
    if (detection.indicators.length > 0) {
      section += `### ⚠️ Mock/Placeholder Indicators Detected\n\n`;
      section += `The following patterns suggest incomplete or mock data:\n\n`;
      
      detection.indicators.forEach((indicator, idx) => {
        section += `${idx + 1}. **${indicator.type}**  \n`;
        section += `   - ${indicator.description}  \n`;
        section += `   - Confidence impact: -${indicator.confidencePenalty}%\n\n`;
      });
      
      section += `### 💡 Recommendations\n\n`;
      section += `To get real, actionable data:\n\n`;
      
      if (detection.indicators.find(i => i.type.includes('LOG'))) {
        section += `- Ensure log files exist: \`logs/error.log\`, \`logs/app.log\`\n`;
      }
      if (detection.indicators.find(i => i.type.includes('SECURITY'))) {
        section += `- Verify \`api/\` directory exists with PHP files to scan\n`;
      }
      if (detection.indicators.find(i => i.type.includes('DB'))) {
        section += `- Configure database connection in project\n`;
      }
      if (detection.indicators.find(i => i.type.includes('PROJECT'))) {
        section += `- Verify project path is correct and accessible\n`;
      }
      
      section += `\n`;
    }
    
    section += `---\n\n`;
    
    return section;
  }
}

export function detectMockData(results) {
  const detector = new MockDetector();
  return detector.analyzeComprehensiveScan(results);
}

export default MockDetector;
