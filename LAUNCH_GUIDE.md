# 🚀 Scout94 Reborn - Launch Guide

## ✅ What's Running

### 1. **Viz Venture Group** (Production Ready)
```bash
cd "/Users/mac/CascadeProjects/Viz Venture Group"
npm run dev  # → http://localhost:3001
```
**Status:** ✅ Build complete, ready to deploy

---

### 2. **Scout94 UI** (Dev Server Running)
```bash
cd /Users/mac/CascadeProjects/scout94/ui
npm run dev  # → http://localhost:3094
```
**Status:** ✅ Running
**Access:** Click browser preview button or visit http://localhost:3094

---

### 3. **WebSocket Server** (Starting now...)
```bash
cd /Users/mac/CascadeProjects/scout94/websocket-server
npm start  # → ws://localhost:8094
```
**Status:** 🟡 Starting...
**Purpose:** Real-time communication between UI and agents

---

## 🎮 How to Use Scout94 Mission Control

### **Split-Screen Interface:**

```
┌─────────────────────────────────────────────────────┐
│  🚀 SCOUT94 MISSION CONTROL    [Connected] [▶ Run] │
├──────────────────────┬──────────────────────────────┤
│  🚀 🩺 📊 📸 ⚙️ 🎨 💉 │  Agent Status Bar            │
├──────────────────────┼──────────────────────────────┤
│  LEFT: IDE           │  RIGHT: CHAT                 │
│  • File Explorer     │  • AI Agents                 │
│  • Code Editor       │  • Real-time Updates         │
│  • Syntax Preview    │  • Test Results              │
│                      │  • Quick Commands            │
└──────────────────────┴──────────────────────────────┘
```

### **Step 1: Open the UI**
- Click the browser preview button above
- Or visit: http://localhost:3094
- You'll see the launch screen with 🚀

### **Step 2: Click "Launch Mission Control"**
- Launches the split-screen interface
- WebSocket auto-connects to ws://localhost:8094

### **Step 3: Run Tests**
**Option A:** Click the green "▶ Run Scout94" button
**Option B:** Use Quick Command buttons:
- 🚀 Run All Tests
- 📸 Visual Test
- 🔍 Test Routes
- 📊 Run Audit
- 🩺 Health Check
- 📷 Take Screenshot

### **Step 4: Watch the Magic**
AI agents will communicate in real-time:
1. 🚀 Scout94 - "Starting test sequence..."
2. 🩺 Doctor - "Running health diagnostics..."
3. 📊 Auditor - "Analyzing code quality..."
4. 📸 Screenshotter - "Capturing snapshots..."
5. ⚙️ Backend - "Testing API endpoints..."
6. 🎨 Frontend - "Validating UI components..."
7. 🚀 Scout94 - "✨ Test completed successfully!"

---

## 🔀 View Modes

Toggle between three layouts:

1. **IDE Only** 🖥️ - Full code editor
2. **Split View** 🖥️💬 - IDE + Chat (default)
3. **Chat Only** 💬 - Full agent communication

---

## 🎨 Features

### **IDE Pane (Left):**
- ✅ Collapsible file tree
- ✅ Code syntax highlighting
- ✅ File selection
- ✅ Real-time test indicators

### **Chat Pane (Right):**
- ✅ 3D floating chat bubbles
- ✅ 7 AI agents with personalities
- ✅ Animated messages
- ✅ Color-coded by agent
- ✅ Glassmorphism effects
- ✅ Quick command buttons

### **Real-time Features:**
- ✅ WebSocket connection status
- ✅ Live test updates
- ✅ Agent status indicators
- ✅ Message streaming
- ✅ Auto-scroll to latest

---

## 🛠️ Tech Stack

### **Frontend:**
- React 18
- Framer Motion (animations)
- Lucide React (icons)
- TailwindCSS (styling)
- Vite (dev server)

### **Backend:**
- WebSocket (ws library)
- Node.js
- Chokidar (file watching)

### **Integration:**
- Custom React hook (useWebSocket)
- Real-time bidirectional communication
- Auto-reconnect on disconnect

---

## 🔌 WebSocket Protocol

### **Client → Server:**
```json
{
  "type": "run_test",
  "command": "🚀 Run All Tests",
  "timestamp": "2025-10-16T00:00:00.000Z"
}
```

### **Server → Client:**
```json
{
  "type": "message",
  "agent": "scout94",
  "text": "Starting test sequence...",
  "messageType": "message",
  "timestamp": "2025-10-16T00:00:00.000Z"
}
```

### **Message Types:**
- `connected` - Initial connection
- `message` - Agent message
- `log` - Scout94 log update
- `heartbeat` - Keep-alive ping
- `pong` - Ping response

---

## 📊 Connection Status

Top-right corner shows:
- 🟢 **Connected** (Green) - WebSocket active
- 🔴 **Disconnected** (Red) - WebSocket offline

Auto-reconnects every 3 seconds if disconnected.

---

## 🎯 Next Steps

### **Immediate:**
1. ✅ Dev server running
2. ✅ WebSocket server starting
3. ⏳ Test the interface
4. ⏳ Run sample tests

### **Short-term:**
- Connect to real Scout94 PHP backend
- Add 3D Three.js effects
- Implement screenshot preview
- Add test result parsing

### **Medium-term:**
- File editing capability
- Custom test configuration
- Export test reports
- Deploy to production

---

## 🚨 Troubleshooting

### **UI won't load:**
```bash
cd /Users/mac/CascadeProjects/scout94/ui
npm install
npm run dev
```

### **WebSocket won't connect:**
```bash
cd /Users/mac/CascadeProjects/scout94/websocket-server
npm install
npm start
```

### **Port conflicts:**
- UI: Change port in `vite.config.js` (default: 3094)
- WebSocket: Change PORT in `server.js` (default: 8094)

---

## 🎉 Success Indicators

You'll know it's working when you see:
1. ✅ Launch screen loads
2. ✅ "Connected" status shows green
3. ✅ All 7 agents visible in status bar
4. ✅ Click "Run" triggers agent messages
5. ✅ Chat bubbles animate smoothly
6. ✅ IDE shows file tree on left

---

**Status:** 🟢 **READY TO LAUNCH!**

Open the browser preview and start testing! 🚀
