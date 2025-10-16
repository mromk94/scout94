import { WebSocketServer } from 'ws';
import { watch } from 'chokidar';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 8094;

const wss = new WebSocketServer({ port: PORT });

console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 Scout94 WebSocket Server                          ║
╚═══════════════════════════════════════════════════════╝

✅ WebSocket server running on ws://localhost:${PORT}
✅ Watching for Scout94 test updates...
✅ Ready to broadcast to UI clients

Agents online: 🚀 🩺 📊 📸 ⚙️ 🎨 💉
`);

// Track connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`✅ Client connected. Total clients: ${clients.size}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    agent: 'scout94',
    message: '🚀 Connected to Scout94 Mission Control!',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received:', message);

      // Handle different message types
      switch (message.type) {
        case 'run_test':
          handleTestRun(message.command);
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

// Simulate test execution
async function handleTestRun(command) {
  console.log(`🚀 Running test: ${command}`);

  const testSequence = [
    { agent: 'scout94', text: `🚀 Executing: ${command}`, delay: 100 },
    { agent: 'scout94', text: '📋 Preparing test environment...', delay: 500 },
    { agent: 'doctor', text: '🩺 Running health diagnostics...', delay: 1200 },
    { agent: 'doctor', text: '✅ System health: GOOD', delay: 2000, type: 'status' },
    { agent: 'auditor', text: '📊 Analyzing code quality...', delay: 2500 },
    { agent: 'auditor', text: '📈 Quality score: 9/10', delay: 3500, type: 'status' },
    { agent: 'screenshot', text: '📸 Capturing visual snapshots...', delay: 4000 },
    { agent: 'screenshot', text: '🖼️ 5 screenshots captured', delay: 5000, type: 'status' },
    { agent: 'backend', text: '⚙️ Testing API endpoints...', delay: 5500 },
    { agent: 'backend', text: '✅ All endpoints responding', delay: 6500, type: 'status' },
    { agent: 'frontend', text: '🎨 Validating UI components...', delay: 7000 },
    { agent: 'frontend', text: '✅ UI components valid', delay: 8000, type: 'status' },
    { agent: 'scout94', text: '✨ Test completed successfully!', delay: 8500, type: 'success' },
  ];

  for (const step of testSequence) {
    await new Promise(resolve => setTimeout(resolve, step.delay));
    broadcast({
      type: 'message',
      agent: step.agent,
      text: step.text,
      messageType: step.type || 'message',
      timestamp: new Date().toISOString()
    });
  }
}

// Watch Scout94 log file for real-time updates
const logPath = join(__dirname, '../.scout94.log');

if (existsSync(logPath)) {
  console.log('👁️ Watching Scout94 log file...');
  
  watch(logPath, { persistent: true }).on('change', (path) => {
    try {
      const content = readFileSync(path, 'utf-8');
      const lines = content.split('\n');
      const lastLine = lines[lines.length - 2] || lines[lines.length - 1];
      
      if (lastLine && lastLine.trim()) {
        broadcast({
          type: 'log',
          agent: 'scout94',
          text: lastLine,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error reading log file:', error);
    }
  });
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
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
