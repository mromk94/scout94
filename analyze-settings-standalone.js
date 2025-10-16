/**
 * Standalone Settings Panel Analyzer
 * No external dependencies - pure analysis
 */

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

const SETTINGS_PATH = './ui/src/components/settings';

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║  🔍 META-TEST: Scout94 Analyzing Its Own Settings Panel ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Utility: Get all files recursively
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

// Utility: Calculate similarity between two strings
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };
  
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

// Phase 1: File Discovery
console.log('📂 Phase 1: Discovering settings files...\n');

const settingsFiles = getAllFiles(SETTINGS_PATH);
console.log(`✅ Found ${settingsFiles.length} files\n`);

// Phase 2: Comprehensive Analysis
console.log('📊 Phase 2: Analyzing code quality...\n');

const analysis = {
  files: [],
  totalLines: 0,
  totalSize: 0,
  issues: [],
  stats: {
    components: 0,
    imports: 0,
    exports: 0,
    functions: 0,
    hooks: 0,
    stateVariables: 0,
    props: 0
  }
};

settingsFiles.forEach(filePath => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const size = Buffer.byteLength(content, 'utf-8');
    
    analysis.totalLines += lines.length;
    analysis.totalSize += size;
    
    const fileIssues = [];
    const fileName = filePath.split('/').pop();
    
    // Stats collection
    if (content.match(/export default function/)) analysis.stats.components++;
    analysis.stats.imports += (content.match(/^import /gm) || []).length;
    analysis.stats.exports += (content.match(/export /g) || []).length;
    analysis.stats.functions += (content.match(/function \w+/g) || []).length;
    analysis.stats.hooks += (content.match(/use[A-Z]\w+/g) || []).length;
    analysis.stats.stateVariables += (content.match(/useState/g) || []).length;
    
    // Issue Detection
    
    // 1. Missing PropTypes (MEDIUM)
    if (filePath.includes('sections/') && !content.includes('PropTypes')) {
      fileIssues.push({
        severity: 'MEDIUM',
        type: 'missing_proptypes',
        category: 'type_safety',
        message: 'Component missing PropTypes or TypeScript types'
      });
    }
    
    // 2. Console.log statements (LOW)
    const consoleLogs = (content.match(/console\.(log|warn|error)/g) || []).length;
    if (consoleLogs > 0) {
      fileIssues.push({
        severity: 'LOW',
        type: 'debug_code',
        category: 'code_quality',
        message: `${consoleLogs} console statements (should be removed for production)`
      });
    }
    
    // 3. Missing error handling (HIGH)
    const hasAsync = content.includes('async') || content.includes('await');
    const hasTryCatch = content.includes('try') && content.includes('catch');
    if (hasAsync && !hasTryCatch) {
      fileIssues.push({
        severity: 'HIGH',
        type: 'missing_error_handling',
        category: 'reliability',
        message: 'Async operations without error handling'
      });
    }
    
    // 4. Inline arrow functions in JSX (MEDIUM - performance)
    const inlineFunctions = (content.match(/onClick={\(\)/g) || []).length;
    if (inlineFunctions > 3) {
      fileIssues.push({
        severity: 'MEDIUM',
        type: 'inline_jsx_functions',
        category: 'performance',
        message: `${inlineFunctions} inline arrow functions may cause unnecessary re-renders`
      });
    }
    
    // 5. Large components (MEDIUM)
    if (lines.length > 400) {
      fileIssues.push({
        severity: 'MEDIUM',
        type: 'large_component',
        category: 'maintainability',
        message: `Component is ${lines.length} lines (consider splitting)`
      });
    }
    
    // 6. Hardcoded strings (INFO)
    const hardcodedStrings = (content.match(/"[A-Z][a-z]+.*"/g) || []).length;
    if (hardcodedStrings > 20) {
      fileIssues.push({
        severity: 'INFO',
        type: 'hardcoded_strings',
        category: 'internationalization',
        message: `${hardcodedStrings} hardcoded strings (consider i18n)`
      });
    }
    
    // 7. Accessibility issues (MEDIUM)
    const hasButtons = content.includes('<button');
    const hasAria = content.includes('aria-');
    if (hasButtons && !hasAria) {
      fileIssues.push({
        severity: 'MEDIUM',
        type: 'missing_accessibility',
        category: 'accessibility',
        message: 'Interactive elements missing ARIA attributes'
      });
    }
    
    // 8. Magic numbers (LOW)
    const magicNumbers = (content.match(/\b[0-9]{2,}\b/g) || []).filter(n => 
      parseInt(n) > 10 && !['100', '200', '300', '400', '500', '600', '700', '800', '900'].includes(n)
    );
    if (magicNumbers.length > 10) {
      fileIssues.push({
        severity: 'LOW',
        type: 'magic_numbers',
        category: 'maintainability',
        message: `${magicNumbers.length} magic numbers (should be constants)`
      });
    }
    
    // 9. Unused imports (LOW)
    const importLines = lines.filter(l => l.trim().startsWith('import'));
    importLines.forEach(importLine => {
      const match = importLine.match(/import\s+{?\s*(\w+)/);
      if (match && match[1]) {
        const importName = match[1];
        // Simple check: if imported item not used elsewhere
        const usageCount = (content.match(new RegExp(`\\b${importName}\\b`, 'g')) || []).length;
        if (usageCount === 1) { // Only appears in import
          fileIssues.push({
            severity: 'LOW',
            type: 'unused_import',
            category: 'code_quality',
            message: `Unused import: ${importName}`
          });
        }
      }
    });
    
    // 10. Missing documentation (INFO)
    if (filePath.includes('sections/') && !content.match(/\/\*\*[\s\S]*?\*\//)) {
      fileIssues.push({
        severity: 'INFO',
        type: 'missing_docs',
        category: 'documentation',
        message: 'Component missing JSDoc documentation'
      });
    }
    
    analysis.files.push({
      path: filePath,
      name: fileName,
      lines: lines.length,
      size,
      issues: fileIssues
    });
    
    analysis.issues.push(...fileIssues.map(issue => ({
      ...issue,
      file: fileName
    })));
    
  } catch (error) {
    console.error(`   ❌ Error analyzing ${filePath}:`, error.message);
  }
});

// Phase 3: Duplicate Detection
console.log('🔎 Phase 3: Scanning for duplicate code...\n');

const duplicates = [];
for (let i = 0; i < analysis.files.length; i++) {
  for (let j = i + 1; j < analysis.files.length; j++) {
    try {
      const content1 = readFileSync(analysis.files[i].path, 'utf-8');
      const content2 = readFileSync(analysis.files[j].path, 'utf-8');
      
      const similarity = calculateSimilarity(content1, content2);
      
      if (similarity > 0.50 && similarity < 0.95) { // 50-95% similar (not identical)
        duplicates.push({
          file1: analysis.files[i].name,
          file2: analysis.files[j].name,
          similarity: (similarity * 100).toFixed(0) + '%'
        });
      }
    } catch (error) {
      // Skip
    }
  }
}

// Phase 4: Issue Categorization
const issuesBySeverity = {
  HIGH: analysis.issues.filter(i => i.severity === 'HIGH'),
  MEDIUM: analysis.issues.filter(i => i.severity === 'MEDIUM'),
  LOW: analysis.issues.filter(i => i.severity === 'LOW'),
  INFO: analysis.issues.filter(i => i.severity === 'INFO')
};

const issuesByCategory = {};
analysis.issues.forEach(issue => {
  if (!issuesByCategory[issue.category]) {
    issuesByCategory[issue.category] = [];
  }
  issuesByCategory[issue.category].push(issue);
});

// Phase 5: Health Score Calculation
const healthScore = Math.max(0, Math.min(10, 
  10 - (
    issuesBySeverity.HIGH.length * 1.5 +
    issuesBySeverity.MEDIUM.length * 0.4 +
    issuesBySeverity.LOW.length * 0.1 +
    duplicates.length * 0.2
  )
)).toFixed(1);

// Generate Report
console.log('═══════════════════════════════════════════════════════════');
console.log('                    ANALYSIS RESULTS                       ');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`📊 Code Statistics:`);
console.log(`   Files Analyzed: ${settingsFiles.length}`);
console.log(`   Total Lines: ${analysis.totalLines.toLocaleString()}`);
console.log(`   Total Size: ${(analysis.totalSize / 1024).toFixed(2)} KB`);
console.log(`   Components: ${analysis.stats.components}`);
console.log(`   Functions: ${analysis.stats.functions}`);
console.log(`   React Hooks: ${analysis.stats.hooks}`);
console.log(`   State Variables: ${analysis.stats.stateVariables}\n`);

console.log(`🔍 Issues Found: ${analysis.issues.length}`);
console.log(`   🔴 HIGH: ${issuesBySeverity.HIGH.length}`);
console.log(`   🟡 MEDIUM: ${issuesBySeverity.MEDIUM.length}`);
console.log(`   🟢 LOW: ${issuesBySeverity.LOW.length}`);
console.log(`   ℹ️  INFO: ${issuesBySeverity.INFO.length}\n`);

console.log(`📂 Issues by Category:`);
Object.entries(issuesByCategory).forEach(([category, issues]) => {
  console.log(`   ${category}: ${issues.length}`);
});

console.log(`\n🔄 Duplicate Code: ${duplicates.length} similar file pairs found\n`);

console.log(`💚 Health Score: ${healthScore}/10\n`);

// Detailed Issue Breakdown
if (issuesBySeverity.HIGH.length > 0) {
  console.log('🔴 HIGH Priority Issues (Must Fix):');
  issuesBySeverity.HIGH.forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue.file}: ${issue.message}`);
  });
  console.log('');
}

if (issuesBySeverity.MEDIUM.length > 0 && issuesBySeverity.MEDIUM.length <= 10) {
  console.log('🟡 MEDIUM Priority Issues (Should Fix):');
  issuesBySeverity.MEDIUM.slice(0, 10).forEach((issue, idx) => {
    console.log(`   ${idx + 1}. ${issue.file}: ${issue.message}`);
  });
  if (issuesBySeverity.MEDIUM.length > 10) {
    console.log(`   ... and ${issuesBySeverity.MEDIUM.length - 10} more`);
  }
  console.log('');
}

if (duplicates.length > 0 && duplicates.length <= 5) {
  console.log('🔄 Duplicate Code Detected:');
  duplicates.slice(0, 5).forEach((dup, idx) => {
    console.log(`   ${idx + 1}. ${dup.file1} ↔️ ${dup.file2} (${dup.similarity})`);
  });
  if (duplicates.length > 5) {
    console.log(`   ... and ${duplicates.length - 5} more pairs`);
  }
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════\n');

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  scope: 'Scout94 Admin Settings Panel (ui/src/components/settings)',
  summary: {
    filesAnalyzed: settingsFiles.length,
    totalLines: analysis.totalLines,
    totalSizeKB: (analysis.totalSize / 1024).toFixed(2),
    healthScore: parseFloat(healthScore),
    issues: {
      total: analysis.issues.length,
      high: issuesBySeverity.HIGH.length,
      medium: issuesBySeverity.MEDIUM.length,
      low: issuesBySeverity.LOW.length,
      info: issuesBySeverity.INFO.length
    },
    duplicates: duplicates.length
  },
  stats: analysis.stats,
  issuesBySeverity,
  issuesByCategory,
  duplicates,
  detailedFiles: analysis.files
};

// Ensure test-reports directory exists
if (!existsSync('./test-reports')) {
  mkdirSync('./test-reports', { recursive: true });
}

writeFileSync(
  './test-reports/settings-panel-analysis.json',
  JSON.stringify(report, null, 2)
);

console.log('✅ Detailed JSON report saved to: test-reports/settings-panel-analysis.json\n');
