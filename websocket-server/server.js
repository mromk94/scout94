import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { watch } from 'chokidar';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { handleAIConversation } from './ai-agent.js';
import { handleComprehensiveScan } from './comprehensive-scan-command.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 8094;

const wss = new WebSocketServer({ port: PORT });

console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 Scout94 WebSocket Server (REAL EXECUTION)         ║
╚═══════════════════════════════════════════════════════╝

✅ WebSocket server running on ws://localhost:${PORT}
✅ Real PHP test execution enabled
✅ Ready to broadcast to UI clients

🛡️  ACCOUNTABILITY PROTOCOL: ACTIVE & ENFORCED
    - All agents must follow accountability gates
    - Solutions validated before execution
    - Non-compliant actions will be BLOCKED

Agents online: 🚀 🩺 📊 📸 ⚙️ 🎨 💉
`);

// Track connected clients and running processes
const clients = new Set();
const runningProcesses = new Map();

// Graceful shutdown handling
let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`\n🛑 Received ${signal} - Starting graceful shutdown...`);
  
  // Stop accepting new connections
  wss.close(() => {
    console.log('✅ WebSocket server closed');
  });
  
  // Kill all running processes
  console.log(`🔪 Stopping ${runningProcesses.size} running processes...`);
  runningProcesses.forEach((proc, ws) => {
    try {
      proc.kill('SIGTERM');
      console.log(`  ✓ Killed process for client`);
    } catch (err) {
      console.error(`  ✗ Error killing process:`, err.message);
    }
  });
  runningProcesses.clear();
  
  // Close all client connections
  console.log(`👋 Disconnecting ${clients.size} clients...`);
  clients.forEach(client => {
    try {
      client.close(1000, 'Server shutting down');
    } catch (err) {
      console.error(`  ✗ Error closing client:`, err.message);
    }
  });
  clients.clear();
  
  console.log('✅ Graceful shutdown complete');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`✅ Client connected. Total clients: ${clients.size}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'message',
    agent: 'scout94',
    text: '🚀 Connected to Scout94 Mission Control!',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received:', message);

      // Handle different message types
      switch (message.type) {
        case 'run_test':
          handleRealTestRun(message.command, ws);
          break;
        case 'chat':
          handleChatMessage(message.message, ws);
          break;
        case 'stop_test':
          handleStopTest(ws);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    // Kill any running processes for this client
    if (runningProcesses.has(ws)) {
      const proc = runningProcesses.get(ws);
      proc.kill();
      runningProcesses.delete(ws);
    }
    console.log(`❌ Client disconnected. Total clients: ${clients.size}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast message to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(data);
    }
  });
}

// Run REAL PHP tests
async function handleRealTestRun(command, ws) {
  console.log(`🚀 Running REAL test: ${command}`);

  broadcast({
    type: 'message',
    agent: 'scout94',
    text: `🚀 Executing real test: ${command}`,
    timestamp: new Date().toISOString()
  });

  // Determine which PHP script to run based on command
  let scriptPath = '';
  const projectPath = '/Users/mac/CascadeProjects/Viz Venture Group';

  if (command.includes('All') || command.includes('routing')) {
    scriptPath = join(projectPath, 'tests', 'test_routing.php');
  } else if (command.includes('install') || command.includes('database')) {
    scriptPath = join(projectPath, 'tests', 'test_install_db.php');
  } else if (command.includes('visitor') || command.includes('Visitor')) {
    scriptPath = join(projectPath, 'tests', 'test_user_journey_visitor.php');
  } else if (command.includes('user') || command.includes('User')) {
    scriptPath = join(projectPath, 'tests', 'test_user_journey_user.php');
  } else {
    scriptPath = join(projectPath, 'tests', 'test_routing.php'); // default
  }

  if (!existsSync(scriptPath)) {
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: `❌ Test script not found: ${scriptPath}`,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Spawn PHP process
  const phpProcess = spawn('php', [scriptPath]);
  runningProcesses.set(ws, phpProcess);

  broadcast({
    type: 'message',
    agent: 'doctor',
    text: '🩺 Starting PHP test execution...',
    timestamp: new Date().toISOString()
  });

  // Capture stdout
  phpProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('PHP OUTPUT:', output);
    
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: output.trim(),
      timestamp: new Date().toISOString()
    });
  });

  // Capture stderr
  phpProcess.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('PHP ERROR:', error);
    
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: `❌ Error: ${error.trim()}`,
      timestamp: new Date().toISOString()
    });
  });

  // Handle completion
  phpProcess.on('close', (code) => {
    runningProcesses.delete(ws);
    
    const success = code === 0;
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: success ? '✅ Test completed successfully!' : `❌ Test failed with code ${code}`,
      timestamp: new Date().toISOString()
    });
  });
}

// Handle chat messages with REAL AI conversations
async function handleChatMessage(message, ws) {
  console.log(`💬 Chat message: ${message}`);

  // Check for special comprehensive scan command
  if (message.match(/^(run\s+)?comprehensive\s+scan|full\s+scan|deep\s+scan|scan\s+everything/i)) {
    await handleComprehensiveScan(ws, broadcast);
    return;
  }

  // Check for @everyone - trigger all agents
  if (message.match(/@everyone/i)) {
    const allAgents = ['scout94', 'doctor', 'auditor', 'screenshot', 'backend', 'frontend', 'nurse'];
    
    for (const agent of allAgents) {
      const testContext = {
        errorCount: 0,
        dbStatus: 'Connected',
        apiStatus: 'Normal',
        memoryUsage: '68%',
        cpuLoad: 'Moderate',
        endpointCount: 47,
        avgResponse: '85ms',
      };

      try {
        const result = await handleAIConversation(message.replace(/@everyone/gi, `@${agent}`), agent, testContext);
        broadcast({
          type: 'message',
          agent: result.agent,
          text: result.response,
          timestamp: new Date().toISOString()
        });
        // Small delay between agents
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error with agent ${agent}:`, error);
      }
    }
    return;
  }

  // Detect mentioned agent
  const mentionMatch = message.match(/@(\w+)/);
  const mentionedAgent = mentionMatch ? mentionMatch[1] : null;

  // Check for project path change
  if (message.startsWith('PROJECT_CHANGE:')) {
    const newPath = message.replace('PROJECT_CHANGE:', '');
    console.log(`📁 Project path changed to: ${newPath}`);
    
    // Update project path in AI agent knowledge
    const AnalysisEngine = await import('./analysis-engine.js');
    // You can store this in a global variable or pass it through context
    global.currentProjectPath = newPath;
    
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: `✅ Project changed to:\n\`${newPath}\`\n\nI'm now analyzing this directory. Type \`@scout94 status\` to see project details.`,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Get test context (you can enhance this with real data)
  const testContext = {
    errorCount: 0,
    dbStatus: 'Connected',
    apiStatus: 'Normal',
    memoryUsage: '68%',
    cpuLoad: 'Moderate',
    endpointCount: 47,
    avgResponse: '85ms',
    projectPath: global.currentProjectPath || '/Users/mac/CascadeProjects/Viz Venture Group'
  };

  try {
    // Use AI agent for response
    const result = await handleAIConversation(message, mentionedAgent, testContext);
    
    broadcast({
      type: 'message',
      agent: result.agent,
      text: result.response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI conversation error:', error);
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: "I'm having trouble processing that. Could you rephrase?",
      timestamp: new Date().toISOString()
    });
  }
}

// Stop running tests
function handleStopTest(ws) {
  console.log('🛑 Stopping test...');
  
  if (runningProcesses.has(ws)) {
    const proc = runningProcesses.get(ws);
    proc.kill('SIGTERM');
    runningProcesses.delete(ws);
    
    broadcast({
      type: 'message',
      agent: 'scout94',
      text: '🛑 Test execution stopped by user',
      timestamp: new Date().toISOString()
    });
  }
}

// Heartbeat to keep connections alive
setInterval(() => {
  broadcast({
    type: 'heartbeat',
    timestamp: new Date().toISOString(),
    clients: clients.size
  });
}, 30000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down WebSocket server...');
  
  // Kill all running processes
  runningProcesses.forEach((proc) => proc.kill());
  
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
