#!/usr/bin/env node

/**
 * Test Fix Verification
 * Directly test if NaN/undefined fixes work
 */

import { generateMarkdownReport } from './websocket-server/markdown-report-generator.js';
import { detectMockData } from './websocket-server/mock-detector.js';

console.log('🧪 Testing NaN/undefined Fixes\n');
console.log('═══════════════════════════════════════\n');

// Simulate scan results that previously caused NaN/undefined
const mockResults = {
  projectPath: '/test/project',
  timestamp: new Date().toISOString(),
  scans: {
    projectIndex: {
      success: true,
      summary: {
        totalFiles: 150,
        phpFiles: 45,
        jsFiles: 30
      }
    },
    errorAnalysis: {
      success: true,
      summary: {
        totalErrors: 5,
        warnings: 3
      }
    }
  },
  securityScan: {
    vulnerabilities: [
      { type: 'SQL Injection', severity: 'HIGH' },
      { type: 'XSS', severity: 'MEDIUM' }
    ]
  },
  deepAnalysis: {
    codeQuality: [
      { issues: [{ type: 'complexity' }, { type: 'duplication' }] }
    ],
    performance: [
      { issues: [{ type: 'slow query' }] }
    ]
  },
  rootCauseAnalysis: {
    rootCauses: [],
    impactAnalysis: {
      cascadeRisk: 'LOW',
      criticalCount: 0
    }
  }
};

const projectMap = {
  architecture: 'Monolithic',
  frameworks: ['React', 'Node.js'],
  entryPoints: ['index.js']
};

console.log('✅ Test 1: Generate Report with Real Data\n');
try {
  const report = generateMarkdownReport(projectMap, mockResults.rootCauseAnalysis, mockResults);
  
  // Check for NaN
  if (report.includes('NaN')) {
    console.log('❌ FAIL: Report still contains NaN');
    console.log('   Locations:', report.match(/NaN/g).length, 'instances\n');
  } else {
    console.log('✅ PASS: No NaN values found\n');
  }
  
  // Check for undefined
  if (report.includes('undefined')) {
    console.log('❌ FAIL: Report contains undefined');
    console.log('   Locations:', report.match(/undefined/g).length, 'instances\n');
  } else {
    console.log('✅ PASS: No undefined values found\n');
  }
  
  // Extract health score
  const healthMatch = report.match(/Overall Health Score: ([\d.]+)%/);
  if (healthMatch) {
    const score = parseFloat(healthMatch[1]);
    if (Number.isFinite(score)) {
      console.log(`✅ PASS: Health Score is valid number: ${score}%\n`);
    } else {
      console.log(`❌ FAIL: Health Score is not finite: ${healthMatch[1]}\n`);
    }
  } else {
    console.log('❌ FAIL: Health Score not found in report\n');
  }
  
  // Check metrics
  const metricsSection = report.match(/\| \*\*Total Issues Found\*\* \| (\d+) \|/);
  if (metricsSection) {
    console.log(`✅ PASS: Total Issues shows number: ${metricsSection[1]}\n`);
  } else {
    console.log('❌ FAIL: Total Issues metric not found or invalid\n');
  }
  
} catch (error) {
  console.log('❌ ERROR:', error.message, '\n');
}

console.log('═══════════════════════════════════════\n');
console.log('✅ Test 2: Mock Detection of Invalid Values\n');

// Test with invalid values
const invalidResults = {
  ...mockResults,
  scans: {
    projectIndex: {
      success: true,
      summary: {
        totalFiles: undefined  // This should be caught
      }
    },
    errorAnalysis: {
      success: true,
      summary: {
        totalErrors: NaN  // This should be caught
      }
    }
  }
};

try {
  const mockDetection = detectMockData(invalidResults);
  
  console.log(`Confidence: ${mockDetection.confidence}%`);
  console.log(`Verdict: ${mockDetection.verdict.status}`);
  console.log(`Is Mock: ${mockDetection.isMock}`);
  console.log(`Indicators: ${mockDetection.indicators.length}\n`);
  
  // Check if NaN was detected
  const nanDetected = mockDetection.indicators.some(i => i.type === 'NAN_VALUE');
  const undefinedDetected = mockDetection.indicators.some(i => i.type === 'UNDEFINED_VALUE');
  
  if (nanDetected) {
    console.log('✅ PASS: NaN values detected by mock detector');
  } else {
    console.log('❌ FAIL: NaN values NOT detected');
  }
  
  if (undefinedDetected) {
    console.log('✅ PASS: undefined values detected by mock detector');
  } else {
    console.log('❌ FAIL: undefined values NOT detected');
  }
  
  console.log('\nAll Indicators:');
  mockDetection.indicators.forEach((ind, i) => {
    console.log(`  ${i + 1}. ${ind.type}: ${ind.description}`);
  });
  
} catch (error) {
  console.log('❌ ERROR:', error.message);
}

console.log('\n═══════════════════════════════════════');
console.log('✅ Fix Verification Complete');
console.log('═══════════════════════════════════════\n');
