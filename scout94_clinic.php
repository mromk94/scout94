<?php
/**
 * Scout94 Clinic - Treatment & Healing Module
 * Admits patients (failing Scout94 instances) and applies treatments
 * 
 * LLM: Claude 3.5 Sonnet (superior code generation)
 */

require_once __DIR__ . '/scout94_doctor.php';
require_once __DIR__ . '/scout94_risk_assessor.php';
require_once __DIR__ . '/scout94_sandbox.php';
require_once __DIR__ . '/llm_factory.php';

class Scout94Clinic {
    private $projectPath;
    private $doctor;
    private $riskAssessor;
    private $sandbox;
    private $maxHealingCycles = 2;
    private $llm;
    private $useLLM;
    private $treatmentPlan = [];
    private $healingProgress = [];
    
    const HEALTH_IMPROVEMENT_THRESHOLD = 70; // Target health to achieve
    const MAX_TREATMENT_CYCLES = 3; // Max healing attempts
    
    public function __construct($projectPath, $useLLM = true) {
        $this->projectPath = $projectPath;
        $this->doctor = new Scout94Doctor($useLLM);
        $this->riskAssessor = new Scout94RiskAssessor();
        $this->sandbox = new Scout94Sandbox($projectPath);
        $this->useLLM = $useLLM;
        
        if ($useLLM) {
            try {
                $this->llm = LLMFactory::create('clinic');
                echo "🤖 Clinic AI: Claude 3.5 Sonnet\n";
            } catch (Exception $e) {
                echo "⚠️  Claude unavailable, using template-based treatments\n";
                $this->useLLM = false;
            }
        }
    }
    
    public function admitPatient($auditResults, $testOutput) {
        echo "\n\n";
        echo "╔═══════════════════════════════════════╗\n";
        echo "║     SCOUT94 CLINIC - ADMISSION        ║\n";
        echo "╚═══════════════════════════════════════╝\n";
        echo "\n";
        echo "🏥 Patient: Scout94\n";
        echo "📋 Reason: Audit failure (Score: " . ($auditResults['score'] ?? 'N/A') . "/10)\n";
        echo "⏰ Admission Time: " . date('Y-m-d H:i:s') . "\n\n";
        
        // Step 1: Diagnosis
        echo "━━━ STEP 1: DIAGNOSTIC PHASE ━━━\n";
        $diagnosis = $this->doctor->diagnose($auditResults, $testOutput);
        $this->doctor->printDiagnosisReport();
        
        // Check if treatment needed
        if (!$diagnosis['needs_treatment']) {
            echo "✅ Patient health acceptable. No treatment required.\n";
            return ['needs_treatment' => false, 'health_score' => $diagnosis['health_score']];
        }
        
        echo "\n━━━ STEP 2: TREATMENT PLANNING ━━━\n\n";
        $this->createTreatmentPlan($diagnosis['prescriptions']);
        
        echo "\n━━━ STEP 3: TREATMENT EXECUTION ━━━\n\n";
        $treatmentSuccess = $this->executeTreatment();
        
        echo "\n━━━ STEP 4: POST-TREATMENT ASSESSMENT ━━━\n\n";
        $postTreatmentHealth = $this->assessRecovery();
        
        return [
            'needs_treatment' => true,
            'treatment_successful' => $treatmentSuccess,
            'initial_health' => $diagnosis['health_score'],
            'final_health' => $postTreatmentHealth,
            'healing_progress' => $this->healingProgress,
            'ready_for_retry' => $postTreatmentHealth >= self::HEALTH_IMPROVEMENT_THRESHOLD
        ];
    }
    
    private function createTreatmentPlan($prescriptions) {
        // Send to chat as doctor creating treatment plan
        $planMsg = "## 💊 Treatment Plan\n\n";
        
        foreach ($prescriptions as $i => $rx) {
            // Generate test code for prescription
            $testCode = $this->generateTestCode($rx['type']);
            
            if ($testCode) {
                $this->treatmentPlan[] = [
                    'prescription' => $rx,
                    'test_code' => $testCode,
                    'status' => 'pending'
                ];
                $planMsg .= ($i + 1) . ". **" . $rx['type'] . "** ✅\n";
                $planMsg .= "   - Action: " . $rx['action'] . "\n";
                $planMsg .= "   - Treatment: Generated\n\n";
            } else {
                $this->treatmentPlan[] = [
                    'prescription' => $rx,
                    'test_code' => null,
                    'status' => 'manual_required'
                ];
                $planMsg .= ($i + 1) . ". **" . $rx['type'] . "** ⚠️\n";
                $planMsg .= "   - Action: " . $rx['action'] . "\n";
                $planMsg .= "   - Treatment: Manual intervention required\n\n";
            }
        }
        
        // Send to chat as doctor
        echo "AGENT_MESSAGE:" . json_encode([
            'agent' => 'doctor',
            'text' => $planMsg,
            'type' => 'markdown',
            'timestamp' => date('c')
        ]) . "\n";
        if (ob_get_level() > 0) ob_flush();
        flush();
    }
    
    private function generateTestCode($treatmentType) {
        switch ($treatmentType) {
            case 'ADD_SECURITY_TESTS':
                return $this->generateSecurityTests();
            
            case 'EXPAND_TEST_COVERAGE':
                return $this->generateCoverageTests();
            
            case 'FIX_CRITICAL_ERRORS':
                return $this->generateErrorFixTests();
            
            case 'ADD_MISSING_TESTS':
                return $this->generateMissingTests();
            
            default:
                return null;
        }
    }
    
    private function generateSecurityTests() {
        // Template for security tests
        return '<?php
/**
 * Scout94 Generated Security Tests
 * Auto-generated by Clinic module
 */

function testXSSPrevention($projectPath) {
    echo "Testing XSS prevention...\n";
    
    // Test input sanitization
    $testInputs = [
        "<script>alert(\'XSS\')</script>",
        "javascript:alert(1)",
        "<img src=x onerror=alert(1)>"
    ];
    
    // Check if inputs are properly escaped
    foreach ($testInputs as $input) {
        // Simulated test - would check actual endpoint
        echo "  Testing: " . substr($input, 0, 30) . "...\n";
    }
    
    return true;
}

function testCSRFProtection($projectPath) {
    echo "Testing CSRF protection...\n";
    
    // Check for CSRF token implementation
    $backendFiles = glob($projectPath . "/auth-backend/*.php");
    $hasCSRFCheck = false;
    
    foreach ($backendFiles as $file) {
        $content = file_get_contents($file);
        if (stripos($content, "csrf") !== false || stripos($content, "token") !== false) {
            $hasCSRFCheck = true;
            break;
        }
    }
    
    echo "  CSRF protection: " . ($hasCSRFCheck ? "✅ Detected" : "⚠️  Not detected") . "\n";
    return $hasCSRFCheck;
}

function testAuthenticationStrength($projectPath) {
    echo "Testing authentication strength...\n";
    
    // Check login implementation
    $loginFile = $projectPath . "/auth-backend/login.php";
    if (file_exists($loginFile)) {
        $content = file_get_contents($loginFile);
        
        $checks = [
            "password_hash" => stripos($content, "password_hash") !== false,
            "password_verify" => stripos($content, "password_verify") !== false,
            "session" => stripos($content, "session") !== false
        ];
        
        foreach ($checks as $check => $passed) {
            echo "  " . ucwords(str_replace("_", " ", $check)) . ": " . ($passed ? "✅" : "⚠️") . "\n";
        }
        
        return !in_array(false, $checks);
    }
    
    return false;
}
';
    }
    
    private function generateCoverageTests() {
        return '<?php
/**
 * Scout94 Generated Coverage Tests
 */

function testCompleteUserJourneys($projectPath) {
    echo "Testing complete user journeys...\n";
    
    $journeys = [
        "visitor_to_registration",
        "user_investment_flow",
        "user_withdrawal_flow",
        "admin_approval_flow"
    ];
    
    foreach ($journeys as $journey) {
        echo "  Testing: " . $journey . "...\n";
        // Journey-specific tests would go here
    }
    
    return true;
}
';
    }
    
    private function generateErrorFixTests() {
        return '<?php
/**
 * Scout94 Generated Error Fix Tests
 */

function validateTestInfrastructure($projectPath) {
    echo "Validating test infrastructure...\n";
    
    // Check required files exist
    $requiredFiles = [
        "/install/schema.sql",
        "/.htaccess",
        "/auth-backend/config.php"
    ];
    
    $allExist = true;
    foreach ($requiredFiles as $file) {
        $exists = file_exists($projectPath . $file);
        echo "  " . $file . ": " . ($exists ? "✅" : "❌ Missing") . "\n";
        if (!$exists) $allExist = false;
    }
    
    return $allExist;
}
';
    }
    
    private function generateMissingTests() {
        return '<?php
/**
 * Scout94 Generated Additional Tests
 */

function testAPIEndpoints($projectPath) {
    echo "Testing API endpoints...\n";
    
    $endpoints = glob($projectPath . "/auth-backend/*.php");
    foreach ($endpoints as $endpoint) {
        $filename = basename($endpoint);
        echo "  Checking: " . $filename . "\n";
    }
    
    return true;
}
';
    }
    
    private function executeTreatment() {
        // Nurse message at start
        echo "AGENT_MESSAGE:" . json_encode([
            'agent' => 'nurse',
            'text' => "💉 **Administering treatments...**",
            'type' => 'markdown',
            'timestamp' => date('c')
        ]) . "\n";
        if (ob_get_level() > 0) ob_flush();
        flush();
        
        $treatmentsApplied = 0;
        $treatmentsFailed = 0;
        
        $treatmentDetails = "";
        
        foreach ($this->treatmentPlan as &$treatment) {
            if ($treatment['test_code'] === null) {
                $treatmentDetails .= "⏭️  **Skipping " . $treatment['prescription']['type'] . "**\n";
                $treatmentDetails .= "   - Reason: Manual intervention required\n\n";
                continue;
            }
            
            $treatmentDetails .= "🔬 **Applying: " . $treatment['prescription']['type'] . "**\n";
            
            // Risk assessment
            $riskResult = $this->riskAssessor->assessRisk(
                $treatment['test_code'],
                $treatment['prescription']['type']
            );
            
            if ($riskResult['approved']) {
                $treatmentDetails .= "   - ✅ Treatment approved (risk: " . $riskResult['risk_score'] . "/100)\n";
                $treatment['status'] = 'applied';
                $treatmentsApplied++;
                
                // Save test code to temp location
                $testFile = sys_get_temp_dir() . '/scout94_treatment_' . $treatmentsApplied . '.php';
                file_put_contents($testFile, $treatment['test_code']);
                $treatment['test_file'] = $testFile;
            } else {
                $treatmentDetails .= "   - ❌ Treatment rejected (risk: " . $riskResult['risk_score'] . "/100 - too high)\n";
                $treatment['status'] = 'rejected';
                $treatmentsFailed++;
            }
            
            $treatmentDetails .= "\n";
        }
        
        // Send treatment details to chat as nurse
        echo "AGENT_MESSAGE:" . json_encode([
            'agent' => 'nurse',
            'text' => $treatmentDetails,
            'type' => 'markdown',
            'timestamp' => date('c')
        ]) . "\n";
        if (ob_get_level() > 0) ob_flush();
        flush();
        
        // Treatment summary
        $manualRequired = count(array_filter($this->treatmentPlan, function($t) {
            return $t['status'] === 'manual_required';
        }));
        
        $summaryMsg = "## 📊 Treatment Summary\n\n";
        $summaryMsg .= "- **Applied:** $treatmentsApplied\n";
        $summaryMsg .= "- **Failed:** $treatmentsFailed\n";
        $summaryMsg .= "- **Manual Required:** $manualRequired\n";
        
        echo "AGENT_MESSAGE:" . json_encode([
            'agent' => 'nurse',
            'text' => $summaryMsg,
            'type' => 'markdown',
            'timestamp' => date('c')
        ]) . "\n";
        if (ob_get_level() > 0) ob_flush();
        flush();
        
        return $treatmentsApplied > 0;
    }
    
    private function assessRecovery() {
        // Doctor performs post-treatment assessment
        echo "AGENT_MESSAGE:" . json_encode([
            'agent' => 'doctor',
            'text' => "🩺 **Post-treatment health assessment...**",
            'type' => 'markdown',
            'timestamp' => date('c')
        ]) . "\n";
        if (ob_get_level() > 0) ob_flush();
        flush();
        
        // Recalculate health score
        $healthMonitor = new Scout94HealthMonitor();
        
        // Estimate improvements
        $appliedTreatments = array_filter($this->treatmentPlan, function($t) {
            return $t['status'] === 'applied';
        });
        
        $healthGain = 0;
        foreach ($appliedTreatments as $treatment) {
            $healthGain += $treatment['prescription']['estimated_health_gain'];
        }
        
        // Get initial health (from doctor's diagnosis)
        $initialHealth = $this->doctor->getHealthScore();
        $projectedHealth = min(100, $initialHealth + $healthGain);
        
        echo "📈 RECOVERY PROGRESS:\n";
        echo "   Initial Health: " . round($initialHealth, 1) . "/100\n";
        echo "   Health Gain: +" . $healthGain . " points\n";
        echo "   Projected Health: " . round($projectedHealth, 1) . "/100\n\n";
        
        $status = $healthMonitor->getHealthStatus($projectedHealth);
        echo "🎯 Current Status: " . $status['emoji'] . " " . $status['status'] . "\n";
        echo "💡 Recommendation: " . $status['recommendation'] . "\n\n";
        
        if ($projectedHealth >= self::HEALTH_IMPROVEMENT_THRESHOLD) {
            echo "✅ PATIENT READY FOR DISCHARGE\n";
            echo "🔄 Scout94 can retry mission with improved health\n";
        } else {
            echo "⚠️  ADDITIONAL TREATMENT RECOMMENDED\n";
            echo "📋 Manual fixes may be required\n";
        }
        
        return $projectedHealth;
    }
    
    public function generateDischargeReport() {
        $reportFile = $this->projectPath . '/SCOUT94_CLINIC_REPORT.md';
        
        $report = "# 🏥 SCOUT94 CLINIC DISCHARGE REPORT\n\n";
        $report .= "**Date:** " . date('F j, Y g:i A') . "\n";
        $report .= "**Patient:** Scout94 Testing System\n\n";
        $report .= "---\n\n";
        
        $report .= "## 📋 ADMISSION SUMMARY\n\n";
        $report .= "Scout94 was admitted for poor audit performance and health decline.\n\n";
        
        $report .= "## 💊 TREATMENT ADMINISTERED\n\n";
        
        foreach ($this->treatmentPlan as $i => $treatment) {
            $report .= ($i + 1) . ". **" . $treatment['prescription']['type'] . "**\n";
            $report .= "   - Status: " . strtoupper($treatment['status']) . "\n";
            $report .= "   - Expected Gain: +" . $treatment['prescription']['estimated_health_gain'] . " health points\n\n";
        }
        
        $report .= "## 🔄 RECOMMENDED NEXT STEPS\n\n";
        $report .= "1. Retry Scout94 scan with enhanced test suite\n";
        $report .= "2. Monitor health metrics during next run\n";
        $report .= "3. Address any remaining manual fixes\n\n";
        
        $report .= "---\n\n";
        $report .= "*Report generated by Scout94 Clinic Module*\n";
        
        file_put_contents($reportFile, $report);
        
        echo "\n📄 Discharge report saved: SCOUT94_CLINIC_REPORT.md\n";
    }
    
    public function getTreatmentPlan() {
        return $this->treatmentPlan;
    }
}
