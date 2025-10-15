<?php
/**
 * Scout94 - Run All Tests
 * Executes all Scout94 validation tests in sequence
 */

echo "\n";
echo "╔═══════════════════════════════════════╗\n";
echo "║      SCOUT94 - FULL VALIDATION        ║\n";
echo "╚═══════════════════════════════════════╝\n";
echo "\n";

$tests = [
    'test_routing.php' => 'Routing Validation',
    'test_install_db.php' => 'Database Injection Test',
    'test_user_journey_visitor.php' => 'User Journey: Visitor',
    'test_user_journey_user.php' => 'User Journey: Registered User',
    'test_user_journey_admin.php' => 'User Journey: Admin',
    // Add more tests here as they're created
];

$results = [];
$totalTests = count($tests);
$passed = 0;
$failed = 0;

foreach ($tests as $script => $name) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Running: $name\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    $scriptPath = __DIR__ . '/' . $script;
    
    if (!file_exists($scriptPath)) {
        echo "⚠️  Test script not found: $script\n";
        echo "   (May not be implemented yet)\n\n";
        $results[$name] = 'SKIPPED';
        continue;
    }
    
    // Get project path from command line or use default
    $projectPath = $argv[1] ?? __DIR__ . '/../Viz Venture Group';
    
    // Execute the test
    $output = [];
    $returnCode = 0;
    exec("php " . escapeshellarg($scriptPath) . " " . escapeshellarg($projectPath) . " 2>&1", $output, $returnCode);
    
    // Display output
    echo implode("\n", $output) . "\n\n";
    
    // Record result
    if ($returnCode === 0) {
        $results[$name] = 'PASSED';
        $passed++;
    } else {
        $results[$name] = 'FAILED';
        $failed++;
    }
}

// Final Summary
echo "\n";
echo "╔═══════════════════════════════════════╗\n";
echo "║       SCOUT94 FINAL SUMMARY           ║\n";
echo "╚═══════════════════════════════════════╝\n";
echo "\n";

foreach ($results as $name => $status) {
    $icon = $status === 'PASSED' ? '✅' : ($status === 'FAILED' ? '❌' : '⚠️ ');
    printf("%-35s %s\n", $name, $icon . ' ' . $status);
}

echo "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "Total Tests: $totalTests\n";
echo "Passed: $passed\n";
echo "Failed: $failed\n";
echo "Skipped: " . ($totalTests - $passed - $failed) . "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

if ($failed === 0 && $passed > 0) {
    echo "✅✅✅ ALL TESTS PASSED - PRODUCTION READY!\n\n";
    exit(0);
} elseif ($failed === 0) {
    echo "⚠️  NO TESTS FAILED (but some may be incomplete)\n\n";
    exit(0);
} else {
    echo "❌ SOME TESTS FAILED - FIX ISSUES BEFORE DEPLOYING!\n\n";
    exit(1);
}
?>
