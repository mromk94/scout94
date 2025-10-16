#!/bin/bash

# Scout94 One-Touch Launch Script
# Kills any existing instances and starts fresh

clear
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         🚀 SCOUT94 MISSION CONTROL LAUNCHER          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Load Rust/Cargo environment
echo "🦀 Loading Rust environment..."
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
    echo "✅ Cargo loaded: $(cargo --version)"
else
    echo "❌ Cargo not found! Please install Rust:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Thorough cleanup of all Scout94 processes
echo "🧹 Thorough cleanup of existing processes..."

# Kill all related processes
pkill -9 -f "Scout94" 2>/dev/null
pkill -9 -f "tauri dev" 2>/dev/null
pkill -9 -f "cargo run" 2>/dev/null
pkill -9 -f "vite.*3094" 2>/dev/null
pkill -9 -f "node.*8094" 2>/dev/null
killall -9 Scout94 2>/dev/null

# Kill processes on our ports
lsof -ti:3094 | xargs kill -9 2>/dev/null
lsof -ti:8094 | xargs kill -9 2>/dev/null

# Give processes time to die
sleep 2

# Verify ports are free
if lsof -i:3094 >/dev/null 2>&1; then
    echo "❌ Port 3094 still in use!"
    lsof -i:3094
    exit 1
fi

if lsof -i:8094 >/dev/null 2>&1; then
    echo "❌ Port 8094 still in use!"
    lsof -i:8094
    exit 1
fi

echo "✅ All processes cleaned up"
echo ""
echo "🚀 Starting Scout94 Desktop App..."
echo ""

# Navigate to UI directory and start Tauri
cd "$(dirname "$0")/ui"
npm run tauri dev

echo ""
echo "✅ Scout94 stopped"
