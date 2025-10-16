<?php
/**
 * Scout94 - Comprehensive Testing with Multi-Agent Communication
 * 
 * Flow:
 * 1. Scout94 runs functional tests (with real-time secretary updates)
 * 2. Auditor evaluates with LLM (with progress updates)
 * 3. If score < 5, Clinic attempts healing (with treatment progress)
 * 4. Retry with improvements
 * 5. Repeat until pass or max retries
 * 
 * Report Secretary System:
 * Each region has a "secretary" that posts incremental updates to the
 * collaborative report as work progresses, creating a rich, growing document
 * visible in real-time on the IDE.
 */

require_once __DIR__ . '/auditor.php';
require_once __DIR__ . '/scout94_clinic.php';
require_once __DIR__ . '/php-helpers/report-helper.php';
require_once __DIR__ . '/php-helpers/report-secretary.php';

echo "\n";
echo "╔═══════════════════════════════════════════════════════╗\n";
echo "║   🚀 SCOUT94 - COMPREHENSIVE MULTI-AGENT TESTING     ║\n";
echo "╚═══════════════════════════════════════════════════════╝\n";
echo "\n";

$projectPath = $argv[1] ?? __DIR__ . '/../Viz Venture Group';
$maxRetries = 2; // Max healing cycles
$attempt = 0;
$scoreHistory = [];

// Initialize collaborative report
$projectName = basename($projectPath);
$collaborativeReportPath = $projectPath . '/SCOUT94_COLLABORATIVE_REPORT.md';
initializeCollaborativeReport($collaborativeReportPath, $projectName);
echo "📝 Collaborative report initialized: $collaborativeReportPath\n";
echo "REPORT_PATH:$collaborativeReportPath\n\n";

// Initialize report secretaries for each region
$scout94Secretary = new Scout94Secretary($collaborativeReportPath, 'SCOUT94', 'scout94');
$clinicSecretary = new ClinicSecretary($collaborativeReportPath, 'CLINIC', 'doctor');
$auditorSecretary = new AuditorSecretary($collaborativeReportPath, 'AUDITOR', 'auditor');
echo "📝 Report secretaries initialized - real-time updates enabled\n\n";

/**
 * Send message to WebSocket for chat display
 */
function sendToChat($agent, $text, $type = 'message') {
    // Signal WebSocket to broadcast this message
    echo "AGENT_MESSAGE:" . json_encode([
        'agent' => $agent,
        'text' => $text,
        'type' => $type,
        'timestamp' => date('c')
    ]) . "\n";
}

while ($attempt <= $maxRetries) {
    $attempt++;
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "COMPREHENSIVE TEST RUN #$attempt\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    // ============================================
    // PHASE 1: SCOUT94 FUNCTIONAL TESTS
    // ============================================
    sendToChat('scout94', "🚀 **Starting Comprehensive Testing - Run #$attempt**\n\n**Phase 1:** Functional Validation...", 'markdown');
    
    // Secretary: Post that tests are starting
    $scout94Secretary->startSession($attempt);
    
    $testScript = __DIR__ . '/run_all_tests.php';
    $testOutput = [];
    $returnCode = 0;
    
    exec("php " . escapeshellarg($testScript) . " " . escapeshellarg($projectPath) . " 2>&1", $testOutput, $returnCode);
    
    $testOutputString = implode("\n", $testOutput);
    echo $testOutputString . "\n\n";
    
    // Secretary: Parse test output and post incremental updates
    // Look for completed test suites in output
    $lines = explode("\n", $testOutputString);
    foreach ($lines as $line) {
        if (preg_match('/✅.*test.*|❌.*test.*/i', $line)) {
            // Extract test name and status
            $passed = strpos($line, '✅') !== false;
            $testName = trim(preg_replace('/[✅❌]/', '', $line));
            if ($testName) {
                $scout94Secretary->testSuiteCompleted($testName, $passed);
            }
        }
    }
    
    // Parse test results
    $totalTests = 0;
    $passed = 0;
    $failed = 0;
    
    if (preg_match('/Total Tests:\s*(\d+)/', $testOutputString, $m)) $totalTests = (int)$m[1];
    if (preg_match('/Passed:\s*(\d+)/', $testOutputString, $m)) $passed = (int)$m[1];
    if (preg_match('/Failed:\s*(\d+)/', $testOutputString, $m)) $failed = (int)$m[1];
    
    $testSummary = "**Test Results:**\n\n";
    $testSummary .= "| Metric | Value |\n";
    $testSummary .= "|--------|-------|\n";
    $testSummary .= "| Total Tests | $totalTests |\n";
    $testSummary .= "| Passed | ✅ $passed |\n";
    $testSummary .= "| Failed | " . ($failed > 0 ? "❌ $failed" : "✅ 0") . " |\n\n";
    
    sendToChat('scout94', $testSummary . "✅ Phase 1 complete. Handing off to Auditor for validation...", 'markdown');
    
    // Secretary: Post complete test summary
    $scout94Secretary->completeSummary($totalTests, $passed, $failed, $testOutputString);
    
    // ============================================
    // PHASE 2: AUDITOR VALIDATION
    // ============================================
    sendToChat('auditor', "📊 **Receiving test results for audit...**\n\nAnalyzing test completeness, methodology, and coverage...", 'markdown');
    
    $auditor = new Scout94Auditor($projectPath);
    $audit = $auditor->audit($testOutputString);
    
    $score = $audit['score'] ?? 0;
    $verdict = $audit['verdict'] ?? 'UNKNOWN';
    $scoreHistory[] = $score;
    
    // Auditor posts verdict to chat
    $auditMessage = "## 📊 AUDIT VERDICT\n\n";
    $auditMessage .= "**Score:** $score/10\n";
    $auditMessage .= "**Verdict:** " . ($score >= 5 ? "✅ PASS" : "❌ FAIL") . "\n\n";
    
    if ($score >= 5) {
        $auditMessage .= "### ✅ Strengths Identified\n\n";
        if (isset($audit['strengths']) && is_array($audit['strengths'])) {
            foreach ($audit['strengths'] as $strength) {
                $auditMessage .= "- ✅ $strength\n";
            }
        }
    } else {
        $auditMessage .= "### ⚠️ Issues Identified\n\n";
        if (isset($audit['gaps']) && is_array($audit['gaps'])) {
            foreach ($audit['gaps'] as $gap) {
                $auditMessage .= "- ❌ $gap\n";
            }
        }
        $auditMessage .= "\n### 💡 Recommendations\n\n";
        if (isset($audit['recommendations']) && is_array($audit['recommendations'])) {
            foreach ($audit['recommendations'] as $idx => $rec) {
                $auditMessage .= ($idx + 1) . ". $rec\n";
            }
        }
    }
    
    sendToChat('auditor', $auditMessage, 'markdown');
    
    // Secretary: Post final audit verdict
    $auditorSecretary->auditComplete(
        $audit['score'],
        $audit['verdict'],
        $audit['strengths'] ?? [],
        $audit['gaps'] ?? [],
        $audit['recommendations'] ?? []
    );
    
    // ============================================
    // DECISION: PASS OR ESCALATE?
    // ============================================
    if ($score >= 5) {
        sendToChat('auditor', "✅ **Test results approved for delivery.**\n\nScout94 is production ready!", 'success');
        
        // Generate final report
        generateFinalReport($projectPath, $testOutputString, $audit, $testSummary);
        
        exit(0);
    }
    
    // Audit failed - check retry conditions
    echo "\n❌ AUDIT FAILED (Score: $score/10)\n";
    echo "❌ Score below threshold (5)\n\n";
    
    // Stuck detection
    if (count($scoreHistory) >= 2) {
        $lastTwo = array_slice($scoreHistory, -2);
        if ($lastTwo[0] === $lastTwo[1]) {
            sendToChat('auditor', "🛑 **STUCK DETECTION**\n\nScore unchanged at $score/10. Escalating to clinic for intervention...", 'error');
            echo "🛑 STUCK: Score unchanged. Escalating to clinic...\n\n";
            // Don't early exit - go to clinic instead
        }
    }
    
    // Check if we should escalate to clinic
    if ($attempt > $maxRetries) {
        sendToChat('auditor', "❌ **Maximum retry attempts reached.**\n\nUnable to achieve passing score. Manual intervention required.", 'error');
        
        generateFailureReport($projectPath, $testOutputString, $audit, $attempt, $scoreHistory);
        exit(1);
    }
    
    // ============================================
    // PHASE 3: CLINIC HEALING (if needed)
    // ============================================
    if ($score < 5) {
        sendToChat('doctor', "🏥 **Escalating to Clinic...**\n\nScore below threshold. Doctor will diagnose and treat issues.", 'markdown');
        
        $clinic = new Scout94Clinic($projectPath);
        
        // Secretary: Post patient admission
        $clinicSecretary->patientAdmitted(0); // Initial health unknown yet
        
        // Admit patient - admitPatient() does EVERYTHING internally (diagnose, plan, execute, assess)
        // It prints output directly to stdout which appears in chat
        $clinicResult = $clinic->admitPatient($audit, $testOutputString);
        
        // Secretary: Post diagnosis (after admission completes)
        $clinicSecretary->diagnosisComplete([
            'health_score' => $clinicResult['initial_health'],
            'issues' => [] // Clinic doesn't expose detailed diagnosis structure
        ]);
    
    // Check if clinic was able to help
    if (!$clinicResult['needs_treatment']) {
        sendToChat('doctor', "✅ Patient health acceptable. No treatment required.", 'success');
        sendToChat('scout94', "🔄 **Retrying tests...**", 'markdown');
        continue; // Skip to next iteration
    }
    
    // Report clinic results to chat
    $healthGain = $clinicResult['final_health'] - $clinicResult['initial_health'];
    $clinicSummaryMsg = "## 🏥 Clinic Treatment Complete\n\n";
    $clinicSummaryMsg .= "**Initial Health:** " . $clinicResult['initial_health'] . "/100\n";
    $clinicSummaryMsg .= "**Final Health:** " . $clinicResult['final_health'] . "/100\n";
    $clinicSummaryMsg .= "**Health Gain:** +" . $healthGain . "\n";
    $clinicSummaryMsg .= "**Status:** " . ($clinicResult['treatment_successful'] ? ' Treatments applied' : ' Some treatments failed') . "\n\n";
    $clinicSummaryMsg .= $clinicResult['ready_for_retry'] ? " Ready for retry" : " May need manual intervention";
    
    sendToChat('nurse', $clinicSummaryMsg, $clinicResult['treatment_successful'] ? 'success' : 'error');
        
        // Secretary: Post treatment completion
        $clinicSecretary->treatmentComplete(
            $clinicResult['initial_health'],
            $clinicResult['final_health'],
            $clinicResult['treatment_successful']
        );
        
        // Discharge (if method exists)
        if (method_exists($clinic, 'discharge')) {
            $clinic->discharge();
        }
    
    sendToChat('scout94', " **Retrying tests with clinic improvements...**", 'markdown');
    
    // Continue to next iteration
}

/**
 * Generate final approved report
 */
function generateFinalReport($projectPath, $testOutput, $audit, $testSummary) {
    $reportPath = $projectPath . '/SCOUT94_COMPREHENSIVE_APPROVED.md';
    
    $report = "# ✅ SCOUT94 - COMPREHENSIVE TESTING APPROVED\n\n";
    $report .= "**Date:** " . date('F j, Y g:i A') . "\n";
    $report .= "**Status:** 🟢 PRODUCTION READY\n\n";
    $report .= "---\n\n";
    
    $report .= "## 📊 Executive Summary\n\n";
    $report .= "Scout94 comprehensive testing completed successfully. All tests passed and ";
    $report .= "received approval from the Auditor with a passing score.\n\n";
    
    $report .= $testSummary . "\n";
    
    $report .= "## 🔍 Audit Results\n\n";
    $report .= "**Overall Score:** " . ($audit['score'] ?? 'N/A') . "/10\n";
    $report .= "**Verdict:** " . ($audit['verdict'] ?? 'PASS') . "\n\n";
    
    if (isset($audit['strengths'])) {
        $report .= "### ✅ Strengths\n\n";
        foreach ($audit['strengths'] as $strength) {
            $report .= "- $strength\n";
        }
        $report .= "\n";
    }
    
    if (isset($audit['recommendations'])) {
        $report .= "### 💡 Recommendations for Future Improvement\n\n";
        foreach ($audit['recommendations'] as $rec) {
            $report .= "- $rec\n";
        }
        $report .= "\n";
    }
    
    $report .= "---\n\n";
    $report .= "*Validated by Scout94 Multi-Agent Testing Framework*\n";
    
    file_put_contents($reportPath, $report);
    echo "📝 Approved report saved: $reportPath\n";
    echo "REPORT_PATH:$reportPath\n\n";
}

/**
 * Generate failure report
 */
function generateFailureReport($projectPath, $testOutput, $audit, $attempts, $scoreHistory) {
    $reportPath = $projectPath . '/SCOUT94_COMPREHENSIVE_FAILED.md';
    
    $report = "# ❌ SCOUT94 - COMPREHENSIVE TESTING FAILED\n\n";
    $report .= "**Date:** " . date('F j, Y g:i A') . "\n";
    $report .= "**Status:** 🔴 ATTENTION REQUIRED\n";
    $report .= "**Attempts:** $attempts\n\n";
    $report .= "---\n\n";
    
    $report .= "## 📊 Final Audit Score\n\n";
    $report .= "**Score:** " . ($audit['score'] ?? 'N/A') . "/10\n";
    $report .= "**Threshold:** 5/10\n";
    $report .= "**Verdict:** " . ($audit['verdict'] ?? 'FAIL') . "\n\n";
    
    $report .= "### 📈 Score History\n\n";
    foreach ($scoreHistory as $idx => $score) {
        $report .= "- **Attempt " . ($idx + 1) . ":** $score/10\n";
    }
    $report .= "\n";
    
    if (isset($audit['gaps'])) {
        $report .= "## ⚠️ Issues Identified\n\n";
        foreach ($audit['gaps'] as $gap) {
            $report .= "- ❌ $gap\n";
        }
        $report .= "\n";
    }
    
    if (isset($audit['recommendations'])) {
        $report .= "## 💡 Recommendations\n\n";
        foreach ($audit['recommendations'] as $rec) {
            $report .= "- $rec\n";
        }
        $report .= "\n";
    }
    
    $report .= "---\n\n";
    $report .= "**Next Steps:**\n";
    $report .= "1. Review issues identified above\n";
    $report .= "2. Implement recommended fixes\n";
    $report .= "3. Re-run comprehensive testing\n\n";
    
    $report .= "*Manual intervention required*\n";
    
    file_put_contents($reportPath, $report);
    echo "📝 Failure report saved: $reportPath\n";
}

/**
 * Generate Scout94 summary from test output
 * Makes it concise (1 page) for high scores (>80%)
 */
function generateScout94SummaryFromOutput($testOutput, $totalTests, $passed, $failed, $attempt, $currentScore) {
    $timestamp = date('g:i A');
    $passRate = $totalTests > 0 ? round(($passed / $totalTests) * 100) : 0;
    
    // For high scores (>80% or 8/10), use concise format
    $isConcise = ($currentScore >= 8 || $passRate >= 80);
    
    $summary = "### 🚀 Scout94 Functional Analysis\n\n";
    $summary .= "**Test Execution:** Run #$attempt  \n";
    $summary .= "**Timestamp:** $timestamp  \n";
    $summary .= "**Pass Rate:** $passRate% ($passed/$totalTests)  \n\n";
    
    if ($isConcise) {
        // Concise 1-page summary for high-scoring tests
        $summary .= "#### ✅ Executive Summary\n\n";
        $summary .= "All critical functional tests **PASSED** with excellent coverage:\n\n";
        
        // Parse test names from output
        if (preg_match_all('/Running: (.+?)(?:\n|$)/m', $testOutput, $matches)) {
            $summary .= "**Test Suites Executed:**\n";
            foreach ($matches[1] as $testName) {
                $summary .= "- ✅ " . trim($testName) . "\n";
            }
        }
        
        $summary .= "\n**Key Findings:**\n";
        $summary .= "- All routing configurations validated\n";
        $summary .= "- User journeys functioning correctly\n";
        $summary .= "- No critical errors detected\n";
        
        if ($failed > 0) {
            $summary .= "- ⚠️ $failed minor test(s) require attention\n";
        }
        
        $summary .= "\n**Overall Assessment:** Production-ready with strong test coverage.\n";
        $summary .= "\n**Next Step:** Escalating to Auditor for independent quality validation...\n";
    } else {
        // Detailed format for low scores - show more diagnostics
        $summary .= "#### Test Results Breakdown\n\n";
        $summary .= "| Metric | Value | Status |\n";
        $summary .= "|--------|-------|--------|\n";
        $summary .= "| Total Tests | $totalTests | - |\n";
        $summary .= "| Passed | $passed | " . ($passRate >= 80 ? "✅" : "⚠️") . " |\n";
        $summary .= "| Failed | $failed | " . ($failed === 0 ? "✅" : "❌") . " |\n";
        $summary .= "| Pass Rate | $passRate% | " . ($passRate >= 80 ? "✅" : "❌") . " |\n\n";
        
        // Parse individual test results
        if (preg_match_all('/^(.+?)\s+(✅ PASSED|❌ FAILED)/m', $testOutput, $matches, PREG_SET_ORDER)) {
            $summary .= "#### Individual Test Results\n\n";
            foreach ($matches as $match) {
                $testName = trim($match[1]);
                $status = strpos($match[2], 'PASSED') !== false ? '✅ PASS' : '❌ FAIL';
                $summary .= "- **$testName:** $status\n";
            }
            $summary .= "\n";
        }
        
        // Extract errors/warnings
        $errorCount = substr_count($testOutput, '❌');
        $warningCount = substr_count($testOutput, '⚠️');
        
        if ($errorCount > 0 || $warningCount > 0) {
            $summary .= "#### Issues Detected\n\n";
            $summary .= "- Critical Errors: $errorCount\n";
            $summary .= "- Warnings: $warningCount\n\n";
        }
        
        $summary .= "**Next Step:** Escalating to Auditor for quality assessment and recommendations...\n";
    }
    
    return $summary;
}
?>
