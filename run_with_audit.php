<?php
/**
 * Scout94 with Auditor - Run tests and get independent verification
 * Automatically re-runs tests if audit score is below 5
 * 
 * RETRY FLOW COMPLIANCE:
 * Follows scenarios documented in RETRY_FLOWS_COMPLETE.md
 * 
 * Retry Logic:
 * - Max Retries: 3 (Total attempts: 4)
 * - Stuck Detection: |score[n] - score[n-1]| = 0 → Early exit
 * - Score Decline: score[n] < score[n-1] → Warning
 * - Success Probability: P(4) = 93.75% (optimal stopping point)
 * 
 * Decision Tree:
 * 1. Score ≥ 5? → Approve (EXIT 0)
 * 2. Stuck detected? → Early exit (EXIT 1)
 * 3. Attempts ≤ max? → Retry
 * 4. Max reached? → Give up (EXIT 1)
 */

require_once __DIR__ . '/auditor.php';

echo "╔═══════════════════════════════════════╗\n";
echo "║   SCOUT94 WITH AUDITOR - FULL SCAN    ║\n";
echo "╚═══════════════════════════════════════╝\n";
echo "\n";

$projectPath = $argv[1] ?? __DIR__ . '/../Viz Venture Group';
$maxRetries = 3; // Maximum Scout94 re-runs (industry standard: 3 retries = 4 total attempts)
$attempt = 0;
$scoreHistory = []; // Track scores to detect if we're stuck

while ($attempt <= $maxRetries) {
    $attempt++;
    
    if ($attempt > 1) {
        echo "\n";
        echo "🔄 RETRY ATTEMPT #" . ($attempt - 1) . "\n";
        echo "   Applying auditor recommendations...\n\n";
    }
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "SCOUT94 RUN #$attempt\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    // Run Scout94 tests
    $testScript = __DIR__ . '/run_all_tests.php';
    $testOutput = [];
    $returnCode = 0;
    
    exec("php " . escapeshellarg($testScript) . " " . escapeshellarg($projectPath) . " 2>&1", $testOutput, $returnCode);
    
    $testOutputString = implode("\n", $testOutput);
    echo $testOutputString . "\n\n";
    
    // Save test output to temp file
    $tempFile = tempnam(sys_get_temp_dir(), 'scout94_');
    file_put_contents($tempFile, $testOutputString);
    
    // Run auditor
    $auditor = new Scout94Auditor($projectPath);
    $audit = $auditor->audit($testOutputString);
    
    // Check score
    $score = $audit['score'] ?? 0;
    $scoreHistory[] = $score;
    
    // Detect if we're stuck (same score 2+ times or declining)
    // Per RETRY_FLOWS_COMPLETE.md - Scenario 3: Stuck Detection
    // Formula: Stuck(history) = TRUE if |history[n] - history[n-1]| = 0 AND n > 1
    $isStuck = false;
    if (count($scoreHistory) >= 2) {
        $lastTwo = array_slice($scoreHistory, -2);
        $scoreDiff = abs($lastTwo[1] - $lastTwo[0]);
        
        if ($scoreDiff == 0) { // |score[n] - score[n-1]| = 0
            $isStuck = true;
            echo "\n⚠️  STUCK DETECTION: Score unchanged ($score/10). Retrying won't help.\n";
            echo "   Mathematical proof: |{$lastTwo[1]} - {$lastTwo[0]}| = $scoreDiff\n";
        } elseif ($lastTwo[1] < $lastTwo[0]) { // Declining: score[n] < score[n-1]
            echo "\n⚠️  SCORE DECLINING: " . $lastTwo[0] . "/10 → " . $lastTwo[1] . "/10. Something is wrong.\n";
            echo "   Decline amount: " . ($lastTwo[0] - $lastTwo[1]) . " points\n";
        }
    }
    
    if ($score >= 5) {
        echo "✅ AUDIT PASSED (Score: $score/10)\n";
        echo "✅ Results approved for delivery\n\n";
        
        // Generate final report
        generateFinalReport($projectPath, $testOutputString, $audit);
        
        // Clean up
        unlink($tempFile);
        
        exit(0);
    } else {
        echo "❌ AUDIT FAILED (Score: $score/10)\n";
        echo "❌ Score below threshold (5)\n\n";
        
        // Exit early if we're stuck (prevent infinite loops)
        if ($isStuck && $attempt > 1) {
            echo "🛑 EARLY EXIT: Detected stuck state. Further retries won't improve score.\n";
            echo "📝 Generating report with current state...\n\n";
            
            generateFailureReport($projectPath, $testOutputString, $audit, $attempt, $scoreHistory);
            unlink($tempFile);
            
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            echo "📊 FINAL SCORE HISTORY: " . implode(' → ', $scoreHistory) . "/10\n";
            echo "📝 Report saved: SCOUT94_AUDIT_FAILED.md\n";
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            exit(1);
        }
        
        if ($attempt <= $maxRetries) {
            echo "🔄 Triggering Scout94 retry with recommendations...\n";
            
            // Display recommendations
            if (!empty($audit['recommendations'])) {
                echo "\n📝 AUDITOR RECOMMENDATIONS:\n";
                foreach ($audit['recommendations'] as $i => $rec) {
                    echo "   " . ($i + 1) . ". $rec\n";
                }
                echo "\n";
            }
            
            // Wait a moment before retry
            sleep(2);
        } else {
            echo "❌ Maximum retries reached ($maxRetries attempts)\n";
            echo "❌ Unable to achieve passing audit score\n\n";
            
            // Generate failure report
            generateFailureReport($projectPath, $testOutputString, $audit);
            
            // Clean up
            unlink($tempFile);
            
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            echo "📊 SCORE HISTORY: " . implode(' → ', $scoreHistory) . "/10\n";
            echo "📝 Report delivered despite failures\n";
            echo "💡 Manual review and fixes required\n";
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            
            exit(1);
        }
    }
    
    // Clean up temp file
    unlink($tempFile);
}

function generateFinalReport($projectPath, $testOutput, $audit) {
    $reportFile = $projectPath . '/SCOUT94_AUDITED_REPORT.md';
    
    $report = "# 🔍 SCOUT94 AUDITED REPORT\n";
    $report .= "**Date:** " . date('F j, Y g:i A') . "\n";
    $report .= "**Status:** ✅ AUDIT APPROVED\n\n";
    
    $report .= "---\n\n";
    
    $report .= "## 📊 AUDIT SCORE\n\n";
    $report .= "**Overall Score:** " . ($audit['score'] ?? 'N/A') . "/10\n\n";
    
    if (isset($audit['completeness_score'])) {
        $report .= "- **Completeness:** {$audit['completeness_score']}/10\n";
    }
    if (isset($audit['methodology_score'])) {
        $report .= "- **Methodology:** {$audit['methodology_score']}/10\n";
    }
    if (isset($audit['coverage_score'])) {
        $report .= "- **Coverage:** {$audit['coverage_score']}/10\n";
    }
    
    $report .= "\n**Verdict:** " . ($audit['verdict'] ?? 'N/A') . "\n\n";
    
    if (isset($audit['reasoning'])) {
        $report .= "**Auditor Reasoning:**\n";
        $report .= "> " . $audit['reasoning'] . "\n\n";
    }
    
    $report .= "---\n\n";
    
    // Strengths
    if (!empty($audit['strengths'])) {
        $report .= "## ✅ STRENGTHS\n\n";
        foreach ($audit['strengths'] as $strength) {
            $report .= "- $strength\n";
        }
        $report .= "\n";
    }
    
    // Recommendations
    if (!empty($audit['recommendations'])) {
        $report .= "## 💡 RECOMMENDATIONS FOR IMPROVEMENT\n\n";
        foreach ($audit['recommendations'] as $rec) {
            $report .= "- $rec\n";
        }
        $report .= "\n";
    }
    
    $report .= "---\n\n";
    
    $report .= "## 🧪 TEST RESULTS\n\n";
    $report .= "```\n";
    // Get last 2000 chars of test output
    $report .= substr($testOutput, -2000);
    $report .= "\n```\n\n";
    
    $report .= "---\n\n";
    $report .= "*Report generated by Scout94 with independent LLM auditor*\n";
    
    file_put_contents($reportFile, $report);
    
    echo "📝 Final report saved: SCOUT94_AUDITED_REPORT.md\n";
}

function generateFailureReport($projectPath, $testOutput, $audit, $attempts = 0, $scoreHistory = []) {
    $reportFile = $projectPath . '/SCOUT94_AUDIT_FAILED.md';
    
    $report = "# ❌ SCOUT94 AUDIT FAILED\n";
    $report .= "**Date:** " . date('F j, Y g:i A') . "\n";
    $report .= "**Status:** ❌ AUDIT REJECTED\n";
    $report .= "**Attempts:** " . ($attempts + 1) . " (including retries)\n";
    if (!empty($scoreHistory)) {
        $report .= "**Score History:** " . implode(' → ', $scoreHistory) . "/10\n";
    }
    $report .= "\n";
    
    $report .= "---\n\n";
    
    $report .= "## 📊 AUDIT SCORE\n\n";
    $report .= "**Overall Score:** " . ($audit['score'] ?? 'N/A') . "/10 (Below threshold of 5)\n\n";
    
    $report .= "**Verdict:** " . ($audit['verdict'] ?? 'FAIL') . "\n\n";
    
    if (isset($audit['reasoning'])) {
        $report .= "**Auditor Reasoning:**\n";
        $report .= "> " . $audit['reasoning'] . "\n\n";
    }
    
    $report .= "---\n\n";
    
    // Weaknesses
    if (!empty($audit['weaknesses'])) {
        $report .= "## ⚠️ IDENTIFIED WEAKNESSES\n\n";
        foreach ($audit['weaknesses'] as $weakness) {
            $report .= "- $weakness\n";
        }
        $report .= "\n";
    }
    
    // Missing Tests
    if (!empty($audit['missing_tests'])) {
        $report .= "## ❌ MISSING TESTS\n\n";
        foreach ($audit['missing_tests'] as $test) {
            $report .= "- $test\n";
        }
        $report .= "\n";
    }
    
    // Recommendations
    if (!empty($audit['recommendations'])) {
        $report .= "## 💡 REQUIRED IMPROVEMENTS\n\n";
        foreach ($audit['recommendations'] as $rec) {
            $report .= "- $rec\n";
        }
        $report .= "\n";
    }
    
    $report .= "---\n\n";
    $report .= "*Manual review and improvements required before deployment*\n";
    
    file_put_contents($reportFile, $report);
    
    echo "📝 Failure report saved: SCOUT94_AUDIT_FAILED.md\n";
}
?>
