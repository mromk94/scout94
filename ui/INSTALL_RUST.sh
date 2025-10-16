#!/bin/bash

echo "
╔═══════════════════════════════════════════════════════════╗
║  🦀 Installing Rust for Tauri                             ║
╚═══════════════════════════════════════════════════════════╝
"

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Source the cargo environment
source "$HOME/.cargo/env"

# Verify installation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Rust installed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rustc --version
cargo --version

echo ""
echo "Now run:"
echo "  source \$HOME/.cargo/env"
echo "  npm run tauri:dev"
