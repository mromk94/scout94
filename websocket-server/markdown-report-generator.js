/**
 * Markdown Report Generator
 * Phase 3: Generate detailed, actionable reports
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Generate Comprehensive Markdown Report
 */
export function generateMarkdownReport(projectMap, rootCauseAnalysis, scanResults) {
  console.log('📝 Phase 3: Generating markdown report...');
  
  const timestamp = new Date().toLocaleString();
  const { rootCauses, impactAnalysis } = rootCauseAnalysis;
  
  let markdown = '';
  
  // ============================================
  // HEADER
  // ============================================
  markdown += `# 🔍 Scout94 Comprehensive Analysis Report\n\n`;
  markdown += `**Generated:** ${timestamp}  \n`;
  markdown += `**Project:** ${scanResults.projectPath}  \n`;
  markdown += `**Architecture:** ${projectMap.architecture}  \n`;
  markdown += `**Frameworks:** ${projectMap.frameworks.join(', ')}  \n\n`;
  
  markdown += `---\n\n`;
  
  // ============================================
  // EXECUTIVE SUMMARY
  // ============================================
  markdown += `## 📊 Executive Summary\n\n`;
  
  const totalIssues = scanResults.securityIssues + scanResults.performanceIssues + 
                     scanResults.qualityIssues + scanResults.errors;
  
  markdown += `### Overall Health Score: ${calculateHealthScore(scanResults)}%\n\n`;
  
  markdown += `| Metric | Count | Status |\n`;
  markdown += `|--------|-------|--------|\n`;
  markdown += `| **Total Issues Found** | ${totalIssues} | ${totalIssues > 50 ? '🔴 Critical' : totalIssues > 20 ? '🟡 Warning' : '🟢 Good'} |\n`;
  markdown += `| **Root Causes Identified** | ${rootCauses.length} | ${rootCauses.length > 5 ? '🔴' : '🟢'} |\n`;
  markdown += `| **Critical Issues** | ${impactAnalysis.criticalCount} | ${impactAnalysis.criticalCount > 0 ? '🔴 Immediate Action Required' : '🟢'} |\n`;
  markdown += `| **Files Analyzed** | ${scanResults.totalFiles} | 📁 |\n`;
  markdown += `| **Security Vulnerabilities** | ${scanResults.securityIssues} | ${scanResults.securityIssues > 10 ? '🔴 High Risk' : scanResults.securityIssues > 0 ? '🟡' : '🟢'} |\n`;
  markdown += `| **Performance Issues** | ${scanResults.performanceIssues} | ${scanResults.performanceIssues > 10 ? '🟡' : '🟢'} |\n\n`;
  
  markdown += `### 🎯 Cascade Risk Assessment: **${impactAnalysis.cascadeRisk}**\n\n`;
  
  if (impactAnalysis.cascadeRisk === 'HIGH') {
    markdown += `⚠️ **WARNING:** Critical root causes detected that can cause cascading failures across multiple systems.\n\n`;
  }
  
  markdown += `---\n\n`;
  
  // ============================================
  // ROOT CAUSE ANALYSIS
  // ============================================
  markdown += `## 🔬 Root Cause Analysis\n\n`;
  markdown += `This section identifies the **underlying problems** causing multiple issues.\n\n`;
  
  if (rootCauses.length === 0) {
    markdown += `✅ **No major root causes identified!** Issues appear to be isolated.\n\n`;
  } else {
    rootCauses.forEach((rc, index) => {
      markdown += `### ${index + 1}. ${rc.rootCause}\n\n`;
      markdown += `**Severity:** \`${rc.severity}\` | **Priority:** \`${rc.solution.priority}\`  \n`;
      markdown += `**Affected Issues:** ${rc.affectedIssues} issues traced to this root cause\n\n`;
      
      markdown += `#### 🔍 Analysis\n\n`;
      markdown += `${rc.explanation}\n\n`;
      
      markdown += `#### 🩺 Symptoms\n\n`;
      markdown += `- ${rc.symptoms}\n\n`;
      
      if (rc.impact) {
        markdown += `#### 💥 Impact Assessment\n\n`;
        markdown += `- **Scope:** ${rc.impact.scope}\n`;
        markdown += `- **Affected Features:** ${rc.impact.affectedFeatures.join(', ')}\n`;
        markdown += `- **Cascade Risk:** ${rc.impact.cascadeRisk}\n\n`;
      }
      
      markdown += `#### ✅ Recommended Solutions\n\n`;
      markdown += `**Immediate Action (${rc.solution.priority} Priority):**\n`;
      markdown += `\`\`\`\n${rc.solution.immediate}\n\`\`\`\n\n`;
      
      markdown += `**Long-term Solution:**\n`;
      markdown += `\`\`\`\n${rc.solution.longTerm}\n\`\`\`\n\n`;
      
      if (rc.solution.code) {
        markdown += `**Code Example:**\n`;
        markdown += `\`\`\`\n${rc.solution.code}\n\`\`\`\n\n`;
      }
      
      if (rc.solution.files && rc.solution.files.length > 0) {
        markdown += `**Files to Create/Modify:**\n`;
        rc.solution.files.forEach(file => {
          markdown += `- \`${file}\`\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  // ============================================
  // PROJECT ARCHITECTURE OVERVIEW
  // ============================================
  markdown += `## 🏗️ Project Architecture\n\n`;
  markdown += `**Pattern:** ${projectMap.architecture}\n\n`;
  
  markdown += `### 📁 Directory Structure\n\n`;
  markdown += `\`\`\`\n`;
  markdown += formatStructure(projectMap.structure, 0);
  markdown += `\`\`\`\n\n`;
  
  markdown += `### 🔄 Data Flow\n\n`;
  if (projectMap.dataFlow.length > 0) {
    projectMap.dataFlow.forEach(flow => {
      markdown += `- **${flow.name}**\n`;
      markdown += `  \`${flow.components.join(' → ')}\`\n`;
    });
  } else {
    markdown += `No clear data flow patterns detected.\n`;
  }
  markdown += `\n---\n\n`;
  
  // ============================================
  // DETAILED ISSUE BREAKDOWN
  // ============================================
  markdown += `## 📋 Detailed Issue Breakdown\n\n`;
  
  // Security Issues
  if (scanResults.securityIssues > 0) {
    markdown += `### 🔒 Security Vulnerabilities (${scanResults.securityIssues})\n\n`;
    markdown += `**Risk Level:** ${scanResults.securityIssues > 10 ? 'HIGH 🔴' : scanResults.securityIssues > 3 ? 'MEDIUM 🟡' : 'LOW 🟢'}\n\n`;
    markdown += `Common vulnerability types to check:\n`;
    markdown += `- SQL Injection (parameterize queries)\n`;
    markdown += `- XSS (escape output)\n`;
    markdown += `- CSRF (implement tokens)\n`;
    markdown += `- Hardcoded credentials (use environment variables)\n\n`;
  }
  
  // Performance Issues
  if (scanResults.performanceIssues > 0) {
    markdown += `### ⚡ Performance Issues (${scanResults.performanceIssues})\n\n`;
    markdown += `Focus areas:\n`;
    markdown += `- N+1 query problems\n`;
    markdown += `- Missing database indexes\n`;
    markdown += `- Unoptimized loops\n`;
    markdown += `- Memory leaks\n\n`;
  }
  
  // Code Quality
  if (scanResults.qualityIssues > 0) {
    markdown += `### 🎨 Code Quality Issues (${scanResults.qualityIssues})\n\n`;
    markdown += `Maintainability concerns:\n`;
    markdown += `- Long functions (> 50 lines)\n`;
    markdown += `- Deep nesting (> 4 levels)\n`;
    markdown += `- Code duplication\n`;
    markdown += `- Magic numbers\n\n`;
  }
  
  markdown += `---\n\n`;
  
  // ============================================
  // ACTION PLAN
  // ============================================
  markdown += `## 🎯 Prioritized Action Plan\n\n`;
  markdown += `Follow this order to maximize impact:\n\n`;
  
  const prioritizedActions = impactAnalysis.priorityOrder || rootCauses;
  
  prioritizedActions.forEach((rc, index) => {
    markdown += `### ${index + 1}. ${rc.rootCause} [${rc.severity}]\n\n`;
    markdown += `**Action:** ${rc.solution.immediate}\n\n`;
    markdown += `**Expected Impact:** Resolves ${rc.affectedIssues} related issues\n\n`;
  });
  
  markdown += `---\n\n`;
  
  // ============================================
  // RECOMMENDATIONS
  // ============================================
  markdown += `## 💡 Long-term Recommendations\n\n`;
  markdown += `1. **Implement Automated Testing**\n`;
  markdown += `   - Unit tests for critical functions\n`;
  markdown += `   - Integration tests for API endpoints\n`;
  markdown += `   - End-to-end tests for user journeys\n\n`;
  
  markdown += `2. **Set Up Continuous Monitoring**\n`;
  markdown += `   - Error tracking (Sentry, Rollbar)\n`;
  markdown += `   - Performance monitoring (New Relic, DataDog)\n`;
  markdown += `   - Security scanning (Snyk, SonarQube)\n\n`;
  
  markdown += `3. **Establish Code Standards**\n`;
  markdown += `   - Linting rules (ESLint, PHP_CodeSniffer)\n`;
  markdown += `   - Code review process\n`;
  markdown += `   - Documentation requirements\n\n`;
  
  markdown += `4. **Improve Architecture**\n`;
  markdown += `   - Separate concerns (MVC, layered)\n`;
  markdown += `   - Implement dependency injection\n`;
  markdown += `   - Use design patterns appropriately\n\n`;
  
  markdown += `---\n\n`;
  
  // ============================================
  // FOOTER
  // ============================================
  markdown += `## 📌 Next Steps\n\n`;
  markdown += `1. ✅ Review this report with your team\n`;
  markdown += `2. 🎯 Address critical root causes first\n`;
  markdown += `3. 📊 Re-run analysis after fixes to verify improvements\n`;
  markdown += `4. 🔄 Schedule regular scans (weekly recommended)\n\n`;
  
  markdown += `---\n\n`;
  markdown += `*Generated by Scout94 Analysis Engine v1.0*  \n`;
  markdown += `*For questions or issues, refer to the Scout94 documentation*\n`;
  
  return markdown;
}

/**
 * Calculate Overall Health Score
 */
function calculateHealthScore(scanResults) {
  const totalIssues = scanResults.securityIssues + scanResults.performanceIssues + 
                     scanResults.qualityIssues + scanResults.errors;
  
  const maxScore = 100;
  const deduction = Math.min(totalIssues * 0.5, 80); // Max 80 points deduction
  
  return Math.max(Math.round(maxScore - deduction), 10); // Min score 10
}

/**
 * Format Directory Structure for Display
 */
function formatStructure(structure, depth, maxDepth = 3) {
  if (depth > maxDepth) return '';
  
  let output = '';
  const indent = '  '.repeat(depth);
  
  for (const [name, item] of Object.entries(structure)) {
    if (item.type === 'directory') {
      output += `${indent}📁 ${name}/ (${item.fileCount} files)\n`;
      if (item.children && Object.keys(item.children).length > 0) {
        output += formatStructure(item.children, depth + 1, maxDepth);
      }
    }
  }
  
  return output;
}

/**
 * Save Report to File System
 */
export function saveReport(markdown, projectPath) {
  const reportDir = join(projectPath, 'test-reports');
  
  // Create directory if it doesn't exist
  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `ANALYSIS-REPORT-${timestamp}.md`;
  const filepath = join(reportDir, filename);
  
  writeFileSync(filepath, markdown, 'utf-8');
  
  console.log(`   ✓ Report saved: ${filepath}`);
  
  return filepath;
}

export default {
  generateMarkdownReport,
  saveReport
};
