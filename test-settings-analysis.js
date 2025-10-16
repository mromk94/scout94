/**
 * META-TEST: Scout94 analyzing its own admin settings panel
 * 
 * This script runs comprehensive analysis on the settings UI code
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { HolisticAnalyzer } from './websocket-server/holistic-analyzer.js';
import { RootCauseTracer } from './websocket-server/root-cause-tracer.js';
import { DuplicateAnalyzer } from './websocket-server/duplicate-analyzer.js';

const SETTINGS_PATH = './ui/src/components/settings';

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║  🔍 META-TEST: Scout94 Analyzing Its Own Settings Panel ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Phase 1: File Discovery
console.log('📂 Phase 1: Discovering settings files...\n');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      arrayOfFiles.push(fullPath);
    }
  });
  
  return arrayOfFiles;
}

const settingsFiles = getAllFiles(SETTINGS_PATH);
console.log(`✅ Found ${settingsFiles.length} files to analyze:`);
settingsFiles.forEach(f => console.log(`   - ${f}`));

// Phase 2: Basic Code Analysis
console.log('\n\n📊 Phase 2: Code Analysis...\n');

const analysis = {
  files: [],
  totalLines: 0,
  totalSize: 0,
  issues: [],
  patterns: {
    imports: new Set(),
    exports: new Set(),
    components: [],
    hooks: []
  }
};

settingsFiles.forEach(filePath => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const size = Buffer.byteLength(content, 'utf-8');
    
    analysis.totalLines += lines.length;
    analysis.totalSize += size;
    
    // Extract patterns
    const importMatches = content.match(/import .+ from .+/g) || [];
    importMatches.forEach(imp => analysis.patterns.imports.add(imp));
    
    const exportMatches = content.match(/export (default )?(function|const)/g) || [];
    exportMatches.forEach(exp => analysis.patterns.exports.add(exp));
    
    // Check for potential issues
    const fileIssues = [];
    
    // Issue 1: Missing PropTypes
    if (!content.includes('PropTypes') && filePath.includes('sections/')) {
      fileIssues.push({
        severity: 'LOW',
        type: 'missing_proptypes',
        message: 'Component missing PropTypes validation'
      });
    }
    
    // Issue 2: Hardcoded values (potential config)
    const hardcodedNumbers = content.match(/min={?\d+}?|max={?\d+}?/g) || [];
    if (hardcodedNumbers.length > 10) {
      fileIssues.push({
        severity: 'INFO',
        type: 'hardcoded_values',
        message: `${hardcodedNumbers.length} hardcoded min/max values (consider constants)`
      });
    }
    
    // Issue 3: Long functions (>100 lines)
    const functionMatches = content.match(/function \w+\([^)]*\) {[\s\S]*?^}/gm) || [];
    functionMatches.forEach(fn => {
      if (fn.split('\n').length > 100) {
        fileIssues.push({
          severity: 'MEDIUM',
          type: 'long_function',
          message: 'Function exceeds 100 lines (consider splitting)'
        });
      }
    });
    
    // Issue 4: Missing error handling
    const hasAsyncAwait = content.includes('async') && content.includes('await');
    const hasTryCatch = content.includes('try') && content.includes('catch');
    if (hasAsyncAwait && !hasTryCatch) {
      fileIssues.push({
        severity: 'HIGH',
        type: 'missing_error_handling',
        message: 'Async code without try-catch blocks'
      });
    }
    
    // Issue 5: Inline functions in JSX (performance)
    const inlineFunctions = content.match(/onClick={?\(\) =>/g) || [];
    if (inlineFunctions.length > 5) {
      fileIssues.push({
        severity: 'MEDIUM',
        type: 'inline_functions',
        message: `${inlineFunctions.length} inline arrow functions in JSX (affects re-renders)`
      });
    }
    
    // Issue 6: useState without memoization for complex objects
    const useStateMatches = content.match(/useState\(.*{.*}\)/g) || [];
    if (useStateMatches.length > 0 && !content.includes('useMemo')) {
      fileIssues.push({
        severity: 'LOW',
        type: 'missing_memoization',
        message: 'Complex state objects without useMemo'
      });
    }
    
    analysis.files.push({
      path: filePath,
      lines: lines.length,
      size,
      issues: fileIssues
    });
    
    analysis.issues.push(...fileIssues.map(issue => ({
      ...issue,
      file: filePath
    })));
    
  } catch (error) {
    console.error(`   ❌ Error analyzing ${filePath}:`, error.message);
  }
});

console.log(`✅ Analysis complete!`);
console.log(`   Total lines: ${analysis.totalLines.toLocaleString()}`);
console.log(`   Total size: ${(analysis.totalSize / 1024).toFixed(2)} KB`);
console.log(`   Unique imports: ${analysis.patterns.imports.size}`);

// Phase 3: Issue Summary
console.log('\n\n🔍 Phase 3: Issue Detection...\n');

const issuesBySeverity = {
  HIGH: analysis.issues.filter(i => i.severity === 'HIGH'),
  MEDIUM: analysis.issues.filter(i => i.severity === 'MEDIUM'),
  LOW: analysis.issues.filter(i => i.severity === 'LOW'),
  INFO: analysis.issues.filter(i => i.severity === 'INFO')
};

console.log(`Total Issues Found: ${analysis.issues.length}`);
console.log(`   🔴 HIGH: ${issuesBySeverity.HIGH.length}`);
console.log(`   🟡 MEDIUM: ${issuesBySeverity.MEDIUM.length}`);
console.log(`   🟢 LOW: ${issuesBySeverity.LOW.length}`);
console.log(`   ℹ️  INFO: ${issuesBySeverity.INFO.length}`);

if (issuesBySeverity.HIGH.length > 0) {
  console.log('\n🔴 HIGH Priority Issues:');
  issuesBySeverity.HIGH.forEach(issue => {
    console.log(`   - ${issue.file.split('/').pop()}: ${issue.message}`);
  });
}

if (issuesBySeverity.MEDIUM.length > 0) {
  console.log('\n🟡 MEDIUM Priority Issues:');
  issuesBySeverity.MEDIUM.forEach(issue => {
    console.log(`   - ${issue.file.split('/').pop()}: ${issue.message}`);
  });
}

// Phase 4: Duplicate Detection
console.log('\n\n🔎 Phase 4: Duplicate Code Detection...\n');

const duplicateAnalyzer = new DuplicateAnalyzer();
const codeBlocks = [];

settingsFiles.forEach(filePath => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    // Extract functions
    const functionMatches = content.match(/function \w+\([^)]*\) {[\s\S]*?^}/gm) || [];
    functionMatches.forEach(code => {
      codeBlocks.push({ file: filePath, code });
    });
  } catch (error) {
    // Skip
  }
});

console.log(`Scanning ${codeBlocks.length} code blocks for duplicates...`);

let duplicateCount = 0;
for (let i = 0; i < codeBlocks.length; i++) {
  for (let j = i + 1; j < codeBlocks.length; j++) {
    const similarity = duplicateAnalyzer.calculateSimilarity(
      codeBlocks[i].code,
      codeBlocks[j].code
    );
    
    if (similarity > 0.80) {
      duplicateCount++;
      if (duplicateCount <= 5) { // Only show first 5
        console.log(`   ⚠️  ${(similarity * 100).toFixed(0)}% similar:`);
        console.log(`      ${codeBlocks[i].file.split('/').pop()} ↔️ ${codeBlocks[j].file.split('/').pop()}`);
      }
    }
  }
}

console.log(`\n✅ Duplicate scan complete: ${duplicateCount} potential duplicates found`);

// Phase 5: Final Report
console.log('\n\n📋 Phase 5: Generating Report...\n');

const report = {
  timestamp: new Date().toISOString(),
  scope: 'Scout94 Admin Settings Panel',
  filesAnalyzed: settingsFiles.length,
  totalLines: analysis.totalLines,
  totalSizeKB: (analysis.totalSize / 1024).toFixed(2),
  issues: {
    total: analysis.issues.length,
    high: issuesBySeverity.HIGH.length,
    medium: issuesBySeverity.MEDIUM.length,
    low: issuesBySeverity.LOW.length,
    info: issuesBySeverity.INFO.length
  },
  duplicates: duplicateCount,
  healthScore: Math.max(0, 10 - (
    issuesBySeverity.HIGH.length * 2 +
    issuesBySeverity.MEDIUM.length * 0.5 +
    issuesBySeverity.LOW.length * 0.1
  )).toFixed(1)
};

console.log('═══════════════════════════════════════════════════════════');
console.log('                    FINAL REPORT                           ');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Health Score: ${report.healthScore}/10`);
console.log(`Files Analyzed: ${report.filesAnalyzed}`);
console.log(`Total Lines: ${report.totalLines.toLocaleString()}`);
console.log(`Total Size: ${report.totalSizeKB} KB`);
console.log(`Issues Found: ${report.issues.total}`);
console.log(`Duplicates: ${report.duplicates}`);
console.log('═══════════════════════════════════════════════════════════\n');

// Export detailed results
import { writeFileSync } from 'fs';
writeFileSync(
  './test-reports/settings-analysis-report.json',
  JSON.stringify({ report, analysis, issuesBySeverity }, null, 2)
);

console.log('✅ Detailed report saved to: test-reports/settings-analysis-report.json\n');
