#!/bin/bash

echo "
╔═══════════════════════════════════════════════════════════╗
║  🚀 Scout94 Native Mac App - Quick Setup                  ║
╚═══════════════════════════════════════════════════════════╝
"

cd /Users/mac/CascadeProjects/scout94/ui

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust not found. Installing..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source $HOME/.cargo/env
else
    echo "✅ Rust is installed: $(rustc --version)"
fi

# Install Tauri CLI
echo ""
echo "📦 Installing Tauri dependencies..."
npm install --save-dev @tauri-apps/cli @tauri-apps/api

# Update package.json with Tauri scripts
echo ""
echo "📝 Updating package.json scripts..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['tauri'] = 'tauri';
pkg.scripts['tauri:dev'] = 'tauri dev';
pkg.scripts['tauri:build'] = 'tauri build';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Scripts updated');
"

# Create placeholder icons directory
echo ""
echo "🎨 Creating icons directory..."
mkdir -p src-tauri/icons

echo "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SETUP COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next steps:

1. Run in development mode:
   npm run tauri:dev

2. Build the Mac app:
   npm run tauri:build

3. Find your .dmg installer at:
   src-tauri/target/release/bundle/dmg/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"
