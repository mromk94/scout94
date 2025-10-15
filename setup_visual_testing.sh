#!/bin/bash
# Scout94 Visual Testing Setup Script

echo "╔═══════════════════════════════════════╗"
echo "║  SCOUT94 VISUAL TESTING SETUP         ║"
echo "╚═══════════════════════════════════════╝"
echo ""

SCOUT94_DIR="/Users/mac/CascadeProjects/scout94"
VENV_DIR="$SCOUT94_DIR/.venv"

# Step 1: Create virtual environment
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv "$VENV_DIR"
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Step 2: Activate and install dependencies
echo ""
echo "📥 Installing Python packages..."
source "$VENV_DIR/bin/activate"

echo "  Upgrading pip..."
pip install --quiet --upgrade pip setuptools wheel

echo "  Installing packages individually..."
# Install packages one by one for better error handling
pip install --quiet playwright==1.48.0
pip install --quiet pytest-playwright==0.5.2
pip install --quiet Pillow==10.4.0
pip install --quiet openai==1.54.3
pip install --quiet python-dotenv==1.0.1

if [ $? -eq 0 ]; then
    echo "✅ Python packages installed"
else
    echo "❌ Some packages failed to install"
    echo "   Try: source $VENV_DIR/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Step 3: Install Playwright browsers
echo ""
echo "🌐 Installing Playwright browsers..."
python -m playwright install chromium

if [ $? -eq 0 ]; then
    echo "✅ Playwright browsers installed"
else
    echo "❌ Playwright browser installation failed"
    echo "   Try: source $VENV_DIR/bin/activate && playwright install chromium"
    exit 1
fi

# Step 4: Update Python scripts to use venv
echo ""
echo "🔧 Updating scripts..."

# Update shebang in Python scripts to use venv
for script in scout94_visual_tester.py gpt4o_visual_analyzer.py run_visual_tests.py; do
    if [ -f "$SCOUT94_DIR/$script" ]; then
        # Add venv activation note
        sed -i '' "1s|#!/usr/bin/env python3|#!$VENV_DIR/bin/python3|" "$SCOUT94_DIR/$script" 2>/dev/null || true
    fi
done

echo "✅ Scripts updated"

# Step 5: Create activation helper
cat > "$SCOUT94_DIR/activate_visual.sh" << 'EOF'
#!/bin/bash
# Activate Scout94 Visual Testing Environment
source /Users/mac/CascadeProjects/scout94/.venv/bin/activate
echo "✅ Scout94 Visual Testing environment activated"
echo "💡 Run: python3 run_visual_tests.py <project_path> <url>"
EOF

chmod +x "$SCOUT94_DIR/activate_visual.sh"

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  SETUP COMPLETE!                      ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "📚 Quick Start:"
echo "  scout94 start --mode=visual"
echo ""
echo "🔧 Manual Usage:"
echo "  source $SCOUT94_DIR/.venv/bin/activate"
echo "  python3 run_visual_tests.py '/path/to/project' 'http://localhost:3000'"
echo ""
echo "📖 Documentation:"
echo "  cat $SCOUT94_DIR/VISUAL_TESTING_GUIDE.md"
echo ""
echo "💰 Cost: ~\$0.10 per run (5 pages analyzed)"
echo ""
