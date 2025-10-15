#!/usr/bin/env php
<?php
/**
 * Scout94 with Auto-Escalation
 * Automatically routes to clinic if audit fails
 * 
 * FLOW:
 * 1. Run Audit Mode
 * 2. If fails → Auto-escalate to Clinic
 * 3. Clinic heals → Retry Audit
 * 4. If still fails → Deliver report
 * 
 * This is the TRUE self-healing flow with auto-routing
 */

require_once __DIR__ . '/auditor.php';
require_once __DIR__ . '/scout94_clinic.php';
require_once __DIR__ . '/scout94_knowledge_base.php';

echo "╔═══════════════════════════════════════╗\n";
echo "║  SCOUT94 AUTO-ESCALATE MODE          ║\n";
echo "╚═══════════════════════════════════════╝\n";
echo "\n";
echo "🤖 Auto-routing enabled: Audit → Clinic → Audit\n";
echo "📡 Actor communication: Active\n";
echo "\n";

$projectPath = $argv[1] ?? getcwd();

if (!is_dir($projectPath)) {
    echo "❌ Invalid project path: $projectPath\n";
    exit(1);
}

echo "📂 Project: " . basename($projectPath) . "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Initialize knowledge base
$kb = new Scout94KnowledgeBase($projectPath);
$kb->startRun('auto_escalate');

// Track overall flow
$flowHistory = [];
$maxEscalations = 2; // Max times we'll escalate to clinic
$escalationCount = 0;

/**
 * Run audit phase
 */
function runAuditPhase($projectPath, $kb, &$flowHistory) {
    echo "┌─────────────────────────────────────┐\n";
    echo "│  PHASE 1: AUDIT MODE                │\n";
    echo "└─────────────────────────────────────┘\n\n";
    
    $kb->updateActorState(Scout94KnowledgeBase::ACTOR_SCOUT94, 'running');
    $kb->postMessage(
        Scout94KnowledgeBase::ACTOR_SCOUT94,
        Scout94KnowledgeBase::ACTOR_AUDITOR,
        'audit_phase_started',
        ['phase' => 'audit', 'timestamp' => date('Y-m-d H:i:s')],
        'high'
    );
    
    // Run tests
    ob_start();
    require __DIR__ . '/run_all_tests.php';
    $testOutput = ob_get_clean();
    
    // Send to auditor
    echo "\n📤 Sending results to Gemini Auditor...\n";
    $auditor = new Scout94Auditor($projectPath);
    $audit = $auditor->audit($testOutput);
    
    $score = $audit['score'] ?? 0;
    
    $kb->postMessage(
        Scout94KnowledgeBase::ACTOR_AUDITOR,
        Scout94KnowledgeBase::ACTOR_CLINIC,
        'audit_completed',
        ['score' => $score, 'verdict' => $audit['verdict'] ?? 'unknown'],
        'high'
    );
    
    $flowHistory[] = ['phase' => 'audit', 'score' => $score];
    
    echo "\n📊 Audit Score: $score/10\n";
    
    return [
        'score' => $score,
        'audit' => $audit,
        'testOutput' => $testOutput
    ];
}

/**
 * Run clinic phase
 */
function runClinicPhase($projectPath, $kb, &$flowHistory, $auditScore) {
    echo "\n┌─────────────────────────────────────┐\n";
    echo "│  PHASE 2: CLINIC AUTO-ESCALATION    │\n";
    echo "└─────────────────────────────────────┘\n\n";
    
    echo "🏥 Auto-routing to clinic...\n";
    echo "   Trigger: Score $auditScore < 5\n\n";
    
    $kb->updateActorState(Scout94KnowledgeBase::ACTOR_CLINIC, 'running');
    $kb->postMessage(
        Scout94KnowledgeBase::ACTOR_CLINIC,
        Scout94KnowledgeBase::ACTOR_DOCTOR,
        'clinic_admission',
        ['reason' => 'audit_failed', 'score' => $auditScore],
        'critical'
    );
    
    // Run clinic
    $clinic = new Scout94Clinic($projectPath);
    $treatmentResult = $clinic->admitPatient($auditScore);
    
    $flowHistory[] = [
        'phase' => 'clinic',
        'health_before' => $treatmentResult['health_before'] ?? 0,
        'health_after' => $treatmentResult['health_after'] ?? 0,
        'treatments_applied' => count($treatmentResult['treatments'] ?? [])
    ];
    
    $kb->postMessage(
        Scout94KnowledgeBase::ACTOR_CLINIC,
        Scout94KnowledgeBase::ACTOR_SCOUT94,
        'treatment_completed',
        $treatmentResult,
        'high'
    );
    
    return $treatmentResult;
}

// ============================================
// MAIN AUTO-ESCALATION LOOP
// ============================================

$finalResult = null;

while ($escalationCount <= $maxEscalations) {
    // Run audit
    $auditResult = runAuditPhase($projectPath, $kb, $flowHistory);
    $score = $auditResult['score'];
    
    // Check if passed
    if ($score >= 5) {
        echo "\n✅ AUDIT PASSED!\n";
        echo "   Score: $score/10\n";
        echo "   Escalations used: $escalationCount/$maxEscalations\n\n";
        
        $finalResult = [
            'status' => 'passed',
            'score' => $score,
            'escalations' => $escalationCount,
            'flow' => $flowHistory
        ];
        break;
    }
    
    // Failed - check if we can escalate
    if ($escalationCount >= $maxEscalations) {
        echo "\n❌ MAX ESCALATIONS REACHED\n";
        echo "   Score: $score/10\n";
        echo "   Attempts: " . ($escalationCount + 1) . "\n\n";
        
        $finalResult = [
            'status' => 'failed',
            'score' => $score,
            'escalations' => $escalationCount,
            'flow' => $flowHistory
        ];
        break;
    }
    
    // Escalate to clinic
    $escalationCount++;
    echo "\n🚨 ESCALATION #$escalationCount\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    
    $clinicResult = runClinicPhase($projectPath, $kb, $flowHistory, $score);
    
    // Check if clinic helped
    $healthAfter = $clinicResult['health_after'] ?? 0;
    
    if ($healthAfter < 70) {
        echo "\n⚠️  CLINIC UNABLE TO HEAL\n";
        echo "   Health: $healthAfter/100 (need ≥70)\n\n";
        
        $finalResult = [
            'status' => 'clinic_failed',
            'score' => $score,
            'health' => $healthAfter,
            'escalations' => $escalationCount,
            'flow' => $flowHistory
        ];
        break;
    }
    
    echo "\n💚 CLINIC TREATMENT SUCCESSFUL\n";
    echo "   Health: {$clinicResult['health_before']}/100 → $healthAfter/100\n";
    echo "   Treatments applied: " . count($clinicResult['treatments'] ?? []) . "\n\n";
    echo "🔄 Retrying audit with improvements...\n\n";
    
    sleep(2); // Brief pause before retry
}

// ============================================
// GENERATE FINAL REPORT
// ============================================

echo "\n╔═══════════════════════════════════════╗\n";
echo "║  AUTO-ESCALATION SUMMARY              ║\n";
echo "╚═══════════════════════════════════════╝\n\n";

echo "📊 Flow History:\n";
foreach ($flowHistory as $i => $step) {
    echo "   Step " . ($i + 1) . ": {$step['phase']}";
    if (isset($step['score'])) {
        echo " (score: {$step['score']}/10)";
    }
    if (isset($step['health_after'])) {
        echo " (health: {$step['health_before']} → {$step['health_after']})";
    }
    echo "\n";
}

echo "\n📈 Results:\n";
echo "   Status: {$finalResult['status']}\n";
echo "   Final Score: {$finalResult['score']}/10\n";
echo "   Escalations: {$finalResult['escalations']}/$maxEscalations\n";

// Save to knowledge base
$kb->endRun('completed', $finalResult);
$kb->recordHealthScore(
    $finalResult['health'] ?? ($finalResult['score'] * 10),
    ['flow' => 'auto_escalate', 'escalations' => $finalResult['escalations']]
);

// Generate report
$reportPath = $projectPath . '/SCOUT94_AUTO_ESCALATE_REPORT.md';
$report = "# 🤖 SCOUT94 AUTO-ESCALATION REPORT\n\n";
$report .= "**Date:** " . date('Y-m-d H:i:s') . "\n";
$report .= "**Status:** " . strtoupper($finalResult['status']) . "\n";
$report .= "**Final Score:** {$finalResult['score']}/10\n\n";

$report .= "## 🔄 Auto-Routing Flow\n\n";
foreach ($flowHistory as $i => $step) {
    $report .= "### Step " . ($i + 1) . ": " . ucfirst($step['phase']) . "\n";
    if (isset($step['score'])) {
        $report .= "- Score: {$step['score']}/10\n";
    }
    if (isset($step['health_after'])) {
        $report .= "- Health: {$step['health_before']}/100 → {$step['health_after']}/100\n";
        $report .= "- Treatments: {$step['treatments_applied']}\n";
    }
    $report .= "\n";
}

$report .= "## 📊 Summary\n\n";
$report .= "- **Escalations:** {$finalResult['escalations']}/$maxEscalations\n";
$report .= "- **Auto-routing:** " . ($finalResult['escalations'] > 0 ? "✅ Used" : "❌ Not needed") . "\n";
$report .= "- **Actor communication:** ✅ Active\n";

file_put_contents($reportPath, $report);

echo "\n📝 Report saved: SCOUT94_AUTO_ESCALATE_REPORT.md\n";

exit($finalResult['status'] === 'passed' ? 0 : 1);
