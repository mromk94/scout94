#!/bin/bash
# Quick test to verify visual testing setup

echo "╔═══════════════════════════════════════╗"
echo "║  SCOUT94 VISUAL TESTING VERIFICATION  ║"
echo "╚═══════════════════════════════════════╝"
echo ""

SCOUT94_DIR="/Users/mac/CascadeProjects/scout94"
VENV_DIR="$SCOUT94_DIR/.venv"

# Check virtual environment
if [ -d "$VENV_DIR" ]; then
    echo "✅ Virtual environment exists"
else
    echo "❌ Virtual environment not found"
    exit 1
fi

# Activate and test imports
source "$VENV_DIR/bin/activate"

echo "🔍 Testing Python packages..."

python3 << 'EOF'
import sys
errors = []

try:
    import playwright
    print("  ✅ playwright")
except ImportError as e:
    print(f"  ❌ playwright: {e}")
    errors.append("playwright")

try:
    import openai
    print("  ✅ openai")
except ImportError as e:
    print(f"  ❌ openai: {e}")
    errors.append("openai")

try:
    from PIL import Image
    print("  ✅ Pillow (PIL)")
except ImportError as e:
    print(f"  ❌ Pillow: {e}")
    errors.append("Pillow")

try:
    from dotenv import load_dotenv
    print("  ✅ python-dotenv")
except ImportError as e:
    print(f"  ❌ python-dotenv: {e}")
    errors.append("python-dotenv")

try:
    from playwright.sync_api import sync_playwright
    print("  ✅ Playwright sync API")
except ImportError as e:
    print(f"  ❌ Playwright sync API: {e}")
    errors.append("Playwright sync API")

if errors:
    print(f"\n❌ {len(errors)} package(s) failed")
    sys.exit(1)
else:
    print("\n✅ All packages working!")
    sys.exit(0)
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "╔═══════════════════════════════════════╗"
    echo "║  VERIFICATION PASSED!                 ║"
    echo "╚═══════════════════════════════════════╝"
    echo ""
    echo "🚀 Ready to use:"
    echo "  scout94 start --mode=visual"
    echo ""
else
    echo ""
    echo "❌ Verification failed"
    echo "   Try running: bash setup_visual_testing.sh"
    exit 1
fi
