// Parse Scout94 PHP test output and extract meaningful information

export function parseTestOutput(output) {
  const messages = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Extract test results
    if (trimmed.includes('✅') || trimmed.includes('PASSED')) {
      messages.push({
        type: 'success',
        text: trimmed,
        agent: 'scout94'
      });
    } else if (trimmed.includes('❌') || trimmed.includes('FAILED')) {
      messages.push({
        type: 'error',
        text: trimmed,
        agent: 'auditor'
      });
    } else if (trimmed.includes('Testing') || trimmed.includes('Running')) {
      messages.push({
        type: 'info',
        text: trimmed,
        agent: 'scout94'
      });
    } else if (trimmed.includes('screenshot')) {
      messages.push({
        type: 'screenshot',
        text: trimmed,
        agent: 'screenshot'
      });
    } else if (trimmed.length > 10) {
      messages.push({
        type: 'message',
        text: trimmed,
        agent: 'scout94'
      });
    }
  }
  
  return messages;
}

export function getAgentForTest(testType) {
  const agentMap = {
    'all': 'scout94',
    'visual': 'screenshot',
    'routing': 'backend',
    'audit': 'auditor',
    'visitor': 'frontend',
    'user': 'frontend',
    'admin': 'auditor',
    'database': 'backend',
  };
  
  return agentMap[testType] || 'scout94';
}

export function formatTestResult(result) {
  const agent = getAgentForTest(result.testType);
  const messages = [];
  
  // Add start message
  messages.push({
    agent,
    text: `🚀 Starting ${result.testType} test...`,
    type: 'message',
    timestamp: new Date()
  });
  
  // Parse output
  if (result.output) {
    const parsed = parseTestOutput(result.output);
    parsed.forEach(msg => {
      messages.push({
        agent: msg.agent,
        text: msg.text,
        type: msg.type,
        timestamp: new Date()
      });
    });
  }
  
  // Add result message
  if (result.success) {
    messages.push({
      agent,
      text: `✅ ${result.testType} test completed successfully!`,
      type: 'success',
      timestamp: new Date()
    });
  } else {
    messages.push({
      agent: 'auditor',
      text: `❌ ${result.testType} test failed`,
      type: 'error',
      timestamp: new Date()
    });
    
    if (result.error) {
      messages.push({
        agent: 'auditor',
        text: result.error,
        type: 'error',
        timestamp: new Date()
      });
    }
  }
  
  return messages;
}
