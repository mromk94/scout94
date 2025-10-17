/**
 * Comprehensive Scan Command Handler
 * Run deep analysis when user requests it
 */

import * as AnalysisEngine from './analysis-engine.js';
import { spawn } from 'child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { DuplicateAnalyzer, DuplicateResolver } from './duplicate-analyzer.js';
import * as DeepAnalysis from './deep-analysis.js';
import * as HolisticAnalyzer from './holistic-analyzer.js';
import * as RootCauseTracer from './root-cause-tracer.js';
import * as MarkdownReportGenerator from './markdown-report-generator.js';
import { MockDetector, detectMockData } from './mock-detector.js';
import containerizedTestRunner from './containerized-test-runner.js';
import configLoader from './config-loader.js';
import { UniversalTestRunner } from './universal-test-runner.js';
import { DuplicateFileDetector } from './duplicate-file-detector.js';
import { ArtifactDetector } from './artifact-detector.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function handleComprehensiveScan(ws, broadcast) {
  broadcast({
    type: 'message',
    agent: 'scout94',
    text: '🔍 **Starting Intelligent Comprehensive Analysis...**\n\n**Phase 1:** Building holistic project understanding...\n**Phase 2:** Tracing root causes...\n**Phase 3:** Generating actionable report...\n\nThis will take a moment...',
    contentType: 'markdown',
    timestamp: new Date().toISOString()
  });

  try {
    // PHASE 1: Build Holistic Understanding
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: '📊 Phase 1: Analyzing project architecture and structure...',
      timestamp: new Date().toISOString()
    });
    
    const projectPath = AnalysisEngine.getProjectPath();
    const projectMap = HolisticAnalyzer.buildProjectMap(projectPath);
    
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: `✅ Project understanding complete!\n- Architecture: ${projectMap.architecture}\n- Frameworks: ${projectMap.frameworks.join(', ')}\n- Entry points: ${projectMap.entryPoints.length}`,
      timestamp: new Date().toISOString()
    });
    
    // Run standard comprehensive scan
    const results = await AnalysisEngine.runComprehensiveScan();
    
    // PHASE 2: Deep Analysis & Root Cause Tracing
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: '🔬 Phase 2: Detecting issues and tracing root causes...',
      timestamp: new Date().toISOString()
    });

    const PROJECT_PATH = results.projectPath;
    const deepResults = {
      codeQuality: [],
      performance: [],
      bestPractices: [],
      architecture: DeepAnalysis.analyzeArchitecture(PROJECT_PATH)
    };

    // Scan all PHP files with deep analysis
    if (results.scans.projectIndex?.success) {
      const phpFiles = results.scans.projectIndex.index.phpFiles.slice(0, 20); // First 20 files
      phpFiles.forEach(file => {
        const fullPath = `${PROJECT_PATH}${file}`;
        deepResults.codeQuality.push(DeepAnalysis.analyzeCodeQuality(fullPath));
        deepResults.performance.push(DeepAnalysis.analyzePerformance(fullPath));
        deepResults.bestPractices.push(DeepAnalysis.analyzeBestPractices(fullPath));
      });
    }

    results.deepAnalysis = deepResults;
    
    // Collect all issues for root cause analysis
    const allIssues = [
      ...(results.securityScan?.vulnerabilities || []).map(v => ({
        type: 'security',
        description: v.type,
        severity: v.severity,
        file: v.file
      })),
      ...(deepResults.codeQuality?.issues || []),
      ...(deepResults.performance?.issues || []),
      ...(deepResults.bestPractices?.issues || [])
    ];
    
    // Trace root causes
    const rootCauseAnalysis = RootCauseTracer.traceRootCauses(projectMap, allIssues);
    results.rootCauseAnalysis = rootCauseAnalysis;
    
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: `🔬 Root cause analysis complete!\n- ${rootCauseAnalysis.rootCauses.length} root causes identified\n- Cascade risk: ${rootCauseAnalysis.impactAnalysis.cascadeRisk}`,
      timestamp: new Date().toISOString()
    });
    
    // PHASE 2.4: Universal Testing (detect and test any project type)
    try {
      broadcast({
        type: 'message',
        agent: 'scout94',
        text: '🧪 Running universal tests (auto-detecting project type)...',
        timestamp: new Date().toISOString()
      });
      
      const universalRunner = new UniversalTestRunner(PROJECT_PATH);
      const universalResults = await universalRunner.runTests();
      results.universalTests = universalResults;
      
      // Format and broadcast results
      const testSummary = universalRunner.formatResults(universalResults);
      broadcast({
        type: 'message',
        agent: 'scout94',
        text: '```\n' + testSummary + '\n```',
        contentType: 'markdown',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Universal testing error:', error);
      results.universalTests = { error: error.message };
    }
    
    // PHASE 2.4.1: Duplicate File Detection
    try {
      broadcast({
        type: 'message',
        agent: 'scout94',
        text: '🔍 Detecting duplicate files...',
        timestamp: new Date().toISOString()
      });
      
      const duplicateDetector = new DuplicateFileDetector(PROJECT_PATH);
      duplicateDetector.findDuplicates(PROJECT_PATH);
      duplicateDetector.findSimilarNames(PROJECT_PATH);
      const duplicateReport = duplicateDetector.generateReport();
      results.duplicateFiles = duplicateReport;
      
      if (duplicateReport.summary.totalIssues > 0) {
        broadcast({
          type: 'message',
          agent: 'scout94',
          text: `📋 Found ${duplicateReport.summary.exactDuplicateGroups} exact duplicates and ${duplicateReport.summary.similarNameGroups} similar name patterns`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Duplicate detection error:', error);
      results.duplicateFiles = { error: error.message };
    }
    
    // PHASE 2.4.2: Development Artifact Detection
    try {
      broadcast({
        type: 'message',
        agent: 'scout94',
        text: '🔍 Scanning for development artifacts...',
        timestamp: new Date().toISOString()
      });
      
      const artifactDetector = new ArtifactDetector(PROJECT_PATH);
      const artifactReport = artifactDetector.detectArtifacts();
      results.developmentArtifacts = artifactReport;
      
      if (artifactReport.summary.total > 0) {
        const riskIcon = artifactReport.summary.risk === 'CRITICAL' ? '🔴' : 
                        artifactReport.summary.risk === 'HIGH' ? '🟡' : '🟢';
        broadcast({
          type: 'message',
          agent: 'scout94',
          text: `${riskIcon} Found ${artifactReport.summary.total} development artifacts (Risk: ${artifactReport.summary.risk})`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Artifact detection error:', error);
      results.developmentArtifacts = { error: error.message };
    }
    
    // PHASE 2.5: Containerized Testing (if enabled)
    try {
      const config = configLoader.getConfig();
      if (config.testEnvironment?.containerized) {
        const containerResults = await containerizedTestRunner.runContainerizedTests(
          config,
          PROJECT_PATH,
          broadcast
        );
        results.containerizedTests = containerResults;
      }
    } catch (error) {
      // Don't fail the whole scan if containerized testing fails
      console.error('Containerized testing error:', error);
      results.containerizedTests = { error: error.message };
    }
    
    // MOCK DETECTION - Check data authenticity
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: '🔍 **Analyzing data authenticity...**\n\nChecking for mock/placeholder patterns...',
      contentType: 'markdown',
      timestamp: new Date().toISOString()
    });
    
    const mockDetection = detectMockData(results);
    results.mockDetection = mockDetection;
    
    // Report mock detection findings
    let mockMsg = `## 🔍 Data Authenticity Report\n\n`;
    mockMsg += `**Confidence:** ${mockDetection.confidence}% ${mockDetection.verdict.emoji}\n`;
    mockMsg += `**Status:** ${mockDetection.verdict.status}\n`;
    mockMsg += `**Assessment:** ${mockDetection.verdict.message}\n\n`;
    
    if (mockDetection.indicators.length > 0) {
      mockMsg += `### ⚠️ Issues Detected (${mockDetection.indicators.length})\n\n`;
      mockDetection.indicators.slice(0, 5).forEach((indicator, idx) => {
        mockMsg += `${idx + 1}. **${indicator.type}**: ${indicator.description}\n`;
      });
      if (mockDetection.indicators.length > 5) {
        mockMsg += `\n_+ ${mockDetection.indicators.length - 5} more issues (see full report)_\n`;
      }
    } else {
      mockMsg += `✅ All scan data appears authentic and complete!\n`;
    }
    
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: mockMsg,
      contentType: 'markdown',
      messageType: mockDetection.isMock ? 'error' : (mockDetection.isPartiallyMock ? 'warning' : 'success'),
      timestamp: new Date().toISOString()
    });
    
    // Send detailed results
    let report = `📊 **Comprehensive Scan Complete!**\n\n`;
    report += `**Timestamp:** ${new Date(results.timestamp).toLocaleString()}\n\n`;

    // Project Index
    if (results.scans.projectIndex?.success) {
      const idx = results.scans.projectIndex.summary;
      report += `📁 **Project Structure:**\n`;
      report += `• Total Files: ${idx.totalFiles}\n`;
      report += `• PHP Files: ${idx.phpFiles}\n`;
      report += `• API Endpoints: ${idx.apiEndpoints}\n`;
      report += `• Test Files: ${idx.testFiles}\n`;
      report += `• Project Size: ${idx.totalSizeMB} MB\n\n`;
    }

    // Error Analysis
    if (results.scans.errorAnalysis?.success) {
      const err = results.scans.errorAnalysis.summary;
      report += `🩺 **Error Analysis:**\n`;
      report += `• Total Errors: ${err.totalErrors}\n`;
      report += `• Critical: ${err.criticalErrors} ${err.criticalErrors > 0 ? '🚨' : '✅'}\n`;
      report += `• Warnings: ${err.warnings}\n`;
      report += `• SQL Errors: ${err.sqlErrors}\n`;
      report += `• Auth Errors: ${err.authErrors}\n\n`;
    }

    // Security Analysis
    if (results.scans.securityAnalysis) {
      const sec = results.scans.securityAnalysis;
      report += `🛡️ **Security Scan:**\n`;
      report += `• Files Scanned: ${sec.filesScanned}\n`;
      report += `• Total Issues: ${sec.totalIssues}\n`;
      report += `• Critical Issues: ${sec.criticalIssues} ${sec.criticalIssues > 0 ? '🚨' : '✅'}\n\n`;
      
      if (sec.filesWithIssues.length > 0) {
        report += `**Top Vulnerable Files:**\n`;
        sec.filesWithIssues.slice(0, 3).forEach(f => {
          report += `• \`${f.filePath}\` (${f.issues.length} issues)\n`;
        });
        report += `\n`;
      }
    }

    // Database Test
    if (results.scans.databaseTest) {
      const db = results.scans.databaseTest;
      report += `💾 **Database:**\n`;
      if (db.connected) {
        report += `• Status: ✅ Connected\n`;
        report += `• Database: ${db.database}\n`;
        report += `• Version: ${db.version}\n`;
        report += `• Tables: ${db.tableCount}\n\n`;
      } else {
        report += `• Status: ❌ Connection Failed\n`;
        report += `• Error: ${db.error}\n\n`;
      }
    }

    // Performance Analysis
    if (results.scans.performanceAnalysis?.success) {
      const perf = results.scans.performanceAnalysis.metrics;
      report += `⚡ **Performance:**\n`;
      report += `• Avg Response Time: ${perf.avgResponseTime}\n`;
      report += `• Max Response Time: ${perf.maxResponseTime}\n`;
      report += `• Total Requests: ${perf.totalRequests}\n`;
      report += `• Slow Queries: ${perf.slowQueries}\n\n`;
    }

    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Deep Analysis Summary
    if (results.deepAnalysis) {
      const cqIssues = results.deepAnalysis.codeQuality.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
      const perfIssues = results.deepAnalysis.performance.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
      const bpIssues = results.deepAnalysis.bestPractices.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
      const archIssues = results.deepAnalysis.architecture.issues?.length || 0;

      report += `🔬 **Deep Analysis:**\n`;
      report += `• Code Quality Issues: ${cqIssues}\n`;
      report += `• Performance Issues: ${perfIssues}\n`;
      report += `• Best Practice Violations: ${bpIssues}\n`;
      report += `• Architecture Issues: ${archIssues}\n\n`;
      report += `**Total Issues Found: ${cqIssues + perfIssues + bpIssues + archIssues + (results.scans.securityAnalysis?.totalIssues || 0)}**\n\n`;
    }

    // Recommendations
    const recommendations = generateRecommendations(results);
    if (recommendations.length > 0) {
      report += `**📋 Top Recommendations:**\n`;
      recommendations.slice(0, 10).forEach((rec, idx) => {
        report += `${idx + 1}. ${rec}\n`;
      });
    } else {
      report += `✅ **No critical issues found!** System is healthy.`;
    }

    // Send summary to chat as markdown
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: report,
      contentType: 'markdown',
      timestamp: new Date().toISOString()
    });

    // PHASE 3: Generate Markdown Report
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: '📝 Phase 3: Generating comprehensive markdown report...',
      timestamp: new Date().toISOString()
    });
    
    const markdown = MarkdownReportGenerator.generateMarkdownReport(
      projectMap,
      rootCauseAnalysis,
      results
    );
    
    const reportPath = MarkdownReportGenerator.saveReport(markdown, results.projectPath);
    
    // Save JSON backup
    const reportDir = join(results.projectPath, 'test-reports');
    const jsonPath = join(reportDir, `scan-data-${Date.now()}.json`);
    writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    
    // Send special command to auto-open report in IDE
    broadcast({
      type: 'open_file',
      filePath: reportPath,
      agent: 'scout94',
      timestamp: new Date().toISOString()
    });
    
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: `✅ **Analysis Complete!**\n\n📄 Detailed report saved to:\n\`${reportPath}\`\n\n📊 Opening report in IDE...`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scan error:', error);
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: `❌ Scan failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
}

function generateRecommendations(results) {
  const recommendations = [];

  // Database issues
  if (results.scans.databaseTest && !results.scans.databaseTest.connected) {
    recommendations.push('🚨 1. Fix database connection - check config/database.php');
  }

  // Security issues
  if (results.scans.securityAnalysis && results.scans.securityAnalysis.criticalIssues > 0) {
    recommendations.push(`🚨 2. Fix ${results.scans.securityAnalysis.criticalIssues} critical security vulnerabilities`);
  }

  // Error rate
  if (results.scans.errorAnalysis?.success) {
    const errors = results.scans.errorAnalysis.summary;
    if (errors.criticalErrors > 0) {
      recommendations.push(`⚠️ 3. Investigate ${errors.criticalErrors} critical errors in logs`);
    }
    if (errors.sqlErrors > 5) {
      recommendations.push('⚠️ 4. Review database queries - high SQL error rate');
    }
  }

  // Performance
  if (results.scans.performanceAnalysis?.success) {
    const perf = results.scans.performanceAnalysis.metrics;
    if (parseInt(perf.avgResponseTime) > 150) {
      recommendations.push('⚡ 5. Optimize API response time - consider caching');
    }
    if (perf.slowQueries > 0) {
      recommendations.push(`⚡ 6. Optimize ${perf.slowQueries} slow database queries`);
    }
  }

  return recommendations;
}

export default { handleComprehensiveScan };
