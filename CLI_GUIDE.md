# 🚀 SCOUT94 CLI MANAGER - COMPLETE GUIDE

## 📋 **OVERVIEW**

Comprehensive command-line interface for Scout94 that can be called from **ANY directory**, supports background execution, and provides full process management.

---

## ⚡ **QUICK START**

### **Installation:**
```bash
# Already installed! The script is executable and linked to /usr/local/bin
```

### **Basic Usage:**
```bash
# Start from current directory
scout94 start

# Start with specific path
scout94 start /path/to/project

# Start in clinic mode
scout94 start --mode=clinic

# Check status
scout94 status

# View logs
scout94 logs

# Stop
scout94 stop
```

---

## 📚 **COMMANDS**

### **1. START**
```bash
scout94 start [path] [--mode=audit|clinic|basic]
```

**What it does:**
- Starts Scout94 in background (daemon mode)
- Can be called from ANY directory
- Auto-detects target path or uses current directory
- Returns immediately (non-blocking)
- Logs output to `.scout94.log`

**Examples:**
```bash
# Start in current directory
cd /path/to/project
scout94 start

# Start with explicit path
scout94 start /Users/mac/CascadeProjects/MyProject

# Start in clinic mode (self-healing)
scout94 start --mode=clinic

# Start from different folder with path
cd ~
scout94 start /Users/mac/CascadeProjects/MyProject --mode=audit
```

**Modes:**
- `audit` (default) - LLM auditor + auto-retry
- `clinic` - Self-healing with doctor/clinic
- `basic` - Tests only, no auditor

---

### **2. STOP**
```bash
scout94 stop
```

**What it does:**
- Gracefully stops running Scout94 process
- Cleans up PID and state files
- Safe to run even if Scout94 not running

**Example:**
```bash
scout94 stop
# Output: ✅ Scout94 stopped
```

---

### **3. PAUSE**
```bash
scout94 pause
```

**What it does:**
- Pauses execution (sends STOP signal)
- Process remains in memory
- Can be resumed later

**Example:**
```bash
scout94 pause
# Output: ✅ Scout94 paused
#         💡 Use 'scout94 resume' to continue
```

---

### **4. RESUME**
```bash
scout94 resume
```

**What it does:**
- Resumes paused execution (sends CONT signal)
- Continues from where it left off

**Example:**
```bash
scout94 resume
# Output: ✅ Scout94 resumed
```

---

### **5. RESTART**
```bash
scout94 restart [path] [--mode=audit|clinic|basic]
```

**What it does:**
- Stops current instance (if running)
- Starts new instance with same or new parameters

**Example:**
```bash
# Restart with same path
scout94 restart

# Restart with new path and mode
scout94 restart /new/path --mode=clinic
```

---

### **6. STATUS**
```bash
scout94 status
```

**What it does:**
- Shows current running status
- Displays PID, target, mode, runtime
- Shows last 5 log lines
- Color-coded status indicators

**Example Output:**
```
╔═══════════════════════════════════════╗
║  SCOUT94 STATUS                       ║
╚═══════════════════════════════════════╝

Status: 🟢 running
PID: 12345
Target: /Users/mac/CascadeProjects/MyProject
Mode: audit
Started: 2025-10-15 21:30:00
Called from: /Users/mac/Documents

Runtime: 2m 35s

📊 Last 5 log lines:
   Running test: routing validation
   ✅ Routing test passed
   Running test: user journey - visitor
   ✅ Visitor journey passed
   Sending to auditor...

💡 Use 'scout94 logs' for full output
```

---

### **7. LOGS**
```bash
scout94 logs [--tail=N]
```

**What it does:**
- Shows log output
- Optionally tail last N lines

**Examples:**
```bash
# Show all logs
scout94 logs

# Show last 20 lines
scout94 logs --tail=20

# Show last 50 lines
scout94 logs --tail=50
```

---

### **8. REPORT**
```bash
scout94 report
```

**What it does:**
- Shows location of generated reports
- Detects report type (passed/failed/healed)

**Example Output:**
```
╔═══════════════════════════════════════╗
║  SCOUT94 REPORT                       ║
╚═══════════════════════════════════════╝

✅ Found: SCOUT94_AUDITED_REPORT.md
   Location: /Users/mac/CascadeProjects/MyProject/SCOUT94_AUDITED_REPORT.md
```

---

### **9. HELP**
```bash
scout94 help
```

Shows complete usage guide.

---

## 🌍 **CALL FROM ANYWHERE**

### **Key Feature: Location Independence**

```bash
# Scenario 1: Call from project directory
cd /Users/mac/CascadeProjects/MyProject
scout94 start
# Uses current directory automatically

# Scenario 2: Call from home directory
cd ~
scout94 start /Users/mac/CascadeProjects/MyProject
# Explicit path works

# Scenario 3: Call from completely different location
cd /tmp
scout94 start ~/CascadeProjects/MyProject
# Relative and absolute paths both work

# Scenario 4: SSH from remote
ssh user@server 'scout94 start /var/www/project --mode=clinic'
# Works over SSH without TTY
```

---

## 🔄 **BACKGROUND EXECUTION**

### **How it Works:**

1. **Daemon Mode:**
   - Scout94 runs in background
   - Terminal can be closed
   - Process continues running

2. **State Tracking:**
   - PID saved to `.scout94.pid`
   - State saved to `.scout94.state`
   - Logs saved to `.scout94.log`

3. **Process Management:**
   - Uses standard Unix signals
   - STOP for pause
   - CONT for resume
   - TERM/KILL for stop

---

## 🐙 **GITHUB ACTIONS INTEGRATION**

### **Example Workflow:**

```yaml
name: Scout94 Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      
      - name: Clone Scout94
        run: |
          git clone https://github.com/your-org/scout94.git /tmp/scout94
          chmod +x /tmp/scout94/scout94
          sudo ln -sf /tmp/scout94/scout94 /usr/local/bin/scout94
      
      - name: Setup Gemini API Key
        run: echo "GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}" > /tmp/scout94/.env
      
      - name: Run Scout94 Tests
        run: |
          scout94 start $GITHUB_WORKSPACE --mode=audit
          
          # Wait for completion (polling)
          while scout94 status | grep -q "running"; do
            echo "Scout94 still running..."
            sleep 10
          done
          
          # Show logs
          scout94 logs
          
          # Check if report exists
          scout94 report
      
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: scout94-report
          path: SCOUT94_*.md
```

---

## 🔐 **SSH USAGE**

### **Remote Execution:**

```bash
# Start Scout94 on remote server
ssh user@server 'scout94 start /var/www/myproject --mode=clinic'

# Check status remotely
ssh user@server 'scout94 status'

# View logs remotely
ssh user@server 'scout94 logs --tail=50'

# Stop remotely
ssh user@server 'scout94 stop'
```

### **Automated Deployment Script:**

```bash
#!/bin/bash
# deploy.sh

# Deploy code
rsync -avz ./myproject/ user@server:/var/www/myproject/

# Run Scout94 tests
ssh user@server << 'EOF'
  cd /var/www/myproject
  scout94 start --mode=audit
  
  # Wait for completion
  while scout94 status | grep -q "running"; do
    sleep 5
  done
  
  # Check if passed
  if scout94 report | grep -q "AUDITED_REPORT"; then
    echo "✅ Tests passed! Deploying..."
    # Deployment logic here
  else
    echo "❌ Tests failed! Aborting deployment"
    scout94 logs --tail=100
    exit 1
  fi
EOF
```

---

## 📊 **STATUS INDICATORS**

### **Color Codes:**

- 🟢 **GREEN** - Running normally
- 🟡 **YELLOW** - Paused
- 🔴 **RED** - Stopped/Failed
- 🔵 **BLUE** - Information

### **Status Types:**

| Status | Meaning | Actions Available |
|--------|---------|-------------------|
| `running` | Actively executing | pause, stop, logs |
| `paused` | Execution paused | resume, stop |
| `stopped` | Not running | start, restart |

---

## 🎯 **TYPICAL WORKFLOWS**

### **Workflow 1: Development Testing**

```bash
# Make code changes...

# Run tests
cd ~/myproject
scout94 start --mode=audit

# Check progress
scout94 status

# View live logs
watch -n 2 scout94 logs --tail=20

# When done, check report
scout94 report
```

### **Workflow 2: CI/CD Pipeline**

```bash
# In CI script
scout94 start $PROJECT_PATH --mode=clinic

# Poll for completion
until scout94 status | grep -q "stopped"; do
  sleep 10
done

# Get exit status from report
if scout94 report | grep -q "AUDITED_REPORT\|HEALED_REPORT"; then
  echo "PASSED"
  exit 0
else
  echo "FAILED"
  scout94 logs
  exit 1
fi
```

### **Workflow 3: Scheduled Testing**

```bash
# Crontab entry
0 2 * * * /usr/local/bin/scout94 start /var/www/project --mode=audit

# Check results in morning
scout94 report
scout94 logs --tail=100
```

---

## 🔧 **TROUBLESHOOTING**

### **"Command not found"**

```bash
# Option 1: Use full path
/Users/mac/CascadeProjects/scout94/scout94 start

# Option 2: Add to PATH
export PATH="/Users/mac/CascadeProjects/scout94:$PATH"

# Option 3: Create symlink (may need sudo)
sudo ln -sf /Users/mac/CascadeProjects/scout94/scout94 /usr/local/bin/scout94
```

### **"Already running" but status shows stopped**

```bash
# Clean up stale files
rm /Users/mac/CascadeProjects/scout94/.scout94.pid
rm /Users/mac/CascadeProjects/scout94/.scout94.state

# Try again
scout94 start
```

### **Logs not showing**

```bash
# Check if file exists
ls -la /Users/mac/CascadeProjects/scout94/.scout94.log

# View with tail
tail -f /Users/mac/CascadeProjects/scout94/.scout94.log
```

---

## 📁 **FILES CREATED**

```
/Users/mac/CascadeProjects/scout94/
├── .scout94.pid         ← Process ID
├── .scout94.state       ← State JSON
└── .scout94.log         ← Log output
```

**Note:** These files are auto-created/cleaned and can be safely deleted when Scout94 is not running.

---

## ✅ **FEATURES SUMMARY**

- ✅ Call from **ANY directory**
- ✅ Background execution (daemon mode)
- ✅ Process management (start/stop/pause/resume)
- ✅ Real-time status monitoring
- ✅ Log viewing (full or tail)
- ✅ Report detection
- ✅ SSH-compatible
- ✅ CI/CD ready
- ✅ GitHub Actions compatible
- ✅ No TTY required
- ✅ Color-coded output
- ✅ State persistence
- ✅ Multiple mode support

---

**Scout94 can now be managed from anywhere, by anyone, on any system!** 🚀✅
