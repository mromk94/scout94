#!/usr/bin/env node

/**
 * Scout94 Self-Test
 * 
 * Purpose: Test Scout94 comprehensively on its own codebase
 * Requested by: User on Oct 16, 2025
 * Honesty: Complete transparency on results
 */

import WebSocket from 'ws';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🧪 SCOUT94 SELF-TEST - Complete Honesty Required\n');
console.log('Testing Scout94 on its own codebase...\n');

const ws = new WebSocket('ws://localhost:8094');
const results = {
  connectionSuccess: false,
  messagesReceived: [],
  scanComplete: false,
  errors: [],
  timestamp: new Date().toISOString()
};

ws.on('open', () => {
  console.log('✅ Connected to Scout94 WebSocket\n');
  results.connectionSuccess = true;
  
  // Set project path to Scout94 itself
  const setProjectMessage = {
    type: 'set_project_path',
    path: '/Users/mac/CascadeProjects/scout94'
  };
  
  console.log('📂 Setting project path to Scout94 itself...');
  ws.send(JSON.stringify(setProjectMessage));
  
  // Wait a bit, then run comprehensive scan
  setTimeout(() => {
    console.log('🔍 Starting comprehensive scan...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const scanMessage = {
      type: 'command',
      command: 'comprehensive'
    };
    
    ws.send(JSON.stringify(scanMessage));
  }, 2000);
  
  // Set timeout for test completion
  setTimeout(() => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⏱️ Test timeout reached (5 minutes)\n');
    
    // Save results
    const reportPath = '/Users/mac/CascadeProjects/scout94/SELF_TEST_RESULTS.md';
    const report = generateReport(results);
    writeFileSync(reportPath, report, 'utf-8');
    
    console.log(`📊 Results saved to: ${reportPath}\n`);
    
    ws.close();
    process.exit(0);
  }, 300000); // 5 minutes
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    results.messagesReceived.push(message);
    
    // Display agent messages
    if (message.type === 'message' && message.agent && message.text) {
      const emoji = getAgentEmoji(message.agent);
      console.log(`${emoji} ${message.agent}:`);
      console.log(message.text);
      console.log('');
    }
    
    // Check for scan completion
    if (message.type === 'scan_complete' || 
        (message.text && message.text.includes('Comprehensive Scan Complete'))) {
      results.scanComplete = true;
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ SCAN COMPLETE!\n');
      
      // Save results
      const reportPath = '/Users/mac/CascadeProjects/scout94/SELF_TEST_RESULTS.md';
      const report = generateReport(results);
      writeFileSync(reportPath, report, 'utf-8');
      
      console.log(`📊 Results saved to: ${reportPath}\n`);
      console.log('📝 Analyzing results with complete honesty...\n');
      
      // Close after a short delay
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 2000);
    }
  } catch (error) {
    results.errors.push(error.message);
    console.error('❌ Error processing message:', error.message);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  results.errors.push(error.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('🔌 Disconnected from Scout94\n');
  
  if (!results.scanComplete) {
    console.log('⚠️ Scan did not complete before disconnect\n');
  }
});

function getAgentEmoji(agent) {
  const emojis = {
    'scout94': '🚀',
    'doctor': '🩺',
    'auditor': '📊',
    'nurse': '💉',
    'screenshot': '📸',
    'backend': '⚙️',
    'frontend': '🎨'
  };
  return emojis[agent] || '🤖';
}

function generateReport(results) {
  let report = '# 🧪 Scout94 Self-Test Results\n\n';
  report += `**Date:** ${new Date().toLocaleString()}\n`;
  report += `**Duration:** Test execution\n\n`;
  report += '---\n\n';
  
  report += '## Connection Status\n\n';
  report += `- **Connected:** ${results.connectionSuccess ? '✅ YES' : '❌ NO'}\n`;
  report += `- **Scan Complete:** ${results.scanComplete ? '✅ YES' : '❌ NO'}\n`;
  report += `- **Messages Received:** ${results.messagesReceived.length}\n`;
  report += `- **Errors:** ${results.errors.length}\n\n`;
  
  if (results.errors.length > 0) {
    report += '## Errors Encountered\n\n';
    results.errors.forEach((error, i) => {
      report += `${i + 1}. ${error}\n`;
    });
    report += '\n';
  }
  
  report += '## Complete Message Log\n\n';
  report += '```json\n';
  report += JSON.stringify(results.messagesReceived, null, 2);
  report += '\n```\n\n';
  
  report += '## Honest Analysis\n\n';
  report += 'To be completed after scan finishes...\n\n';
  
  return report;
}
