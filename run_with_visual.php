<?php
/**
 * Scout94 with Visual Testing
 * Runs full Scout94 suite + Hybrid Visual Testing
 */

echo "╔═══════════════════════════════════════╗\n";
echo "║  SCOUT94 WITH VISUAL TESTING          ║\n";
echo "╚═══════════════════════════════════════╝\n";
echo "\n";

$projectPath = $argv[1] ?? getcwd();
$baseUrl = $argv[2] ?? 'http://localhost:3000';

if (!is_dir($projectPath)) {
    echo "❌ Invalid project path: $projectPath\n";
    exit(1);
}

echo "📂 Project: " . basename($projectPath) . "\n";
echo "🌐 URL: $baseUrl\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Phase 1: Standard Scout94 Tests
echo "┌─────────────────────────────────────┐\n";
echo "│  PHASE 1: FUNCTIONAL TESTING        │\n";
echo "└─────────────────────────────────────┘\n\n";

require __DIR__ . '/run_all_tests.php';

// Phase 2: Visual Testing
echo "\n┌─────────────────────────────────────┐\n";
echo "│  PHASE 2: VISUAL TESTING            │\n";
echo "└─────────────────────────────────────┘\n\n";

// Check if venv exists
$venvPython = __DIR__ . '/.venv/bin/python3';
$python = file_exists($venvPython) ? $venvPython : 'python3';

$pythonCmd = $python . ' ' . __DIR__ . '/run_visual_tests.py "' . $projectPath . '" "' . $baseUrl . '"';

echo "🐍 Running: $pythonCmd\n\n";

// Check if visual testing is set up
if (!file_exists(__DIR__ . '/.venv')) {
    echo "⚠️  Visual testing not set up yet!\n";
    echo "   Run: bash " . __DIR__ . "/setup_visual_testing.sh\n\n";
}

passthru($pythonCmd, $exitCode);

if ($exitCode !== 0) {
    echo "\n⚠️  Visual testing completed with issues\n";
}

echo "\n╔═══════════════════════════════════════╗\n";
echo "║  SCOUT94 COMPLETE                     ║\n";
echo "╚═══════════════════════════════════════╝\n\n";

echo "📊 Reports Generated:\n";
echo "  • SCOUT94_FINAL_REPORT.md (Functional)\n";
echo "  • SCOUT94_VISUAL_REPORT.json (Playwright)\n";
echo "  • SCOUT94_AI_VISUAL_REPORT.json (AI Analysis)\n";
echo "  • SCOUT94_HYBRID_VISUAL_REPORT.md (Combined)\n\n";

exit($exitCode);
