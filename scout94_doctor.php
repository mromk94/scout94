<?php
/**
 * Scout94 Doctor - Diagnostic Module
 * Diagnoses why Scout94 is underperforming and prescribes treatments
 * 
 * LLM: Claude 3.5 Sonnet (best diagnostic reasoning)
 */

require_once __DIR__ . '/scout94_health_monitor.php';
require_once __DIR__ . '/llm_factory.php';

class Scout94Doctor {
    private $healthMonitor;
    private $diagnosis = [];
    private $prescriptions = [];
    private $llm;
    private $useLLM;
    
    public function __construct($useLLM = true) {
        $this->healthMonitor = new Scout94HealthMonitor();
        $this->useLLM = $useLLM;
        
        if ($useLLM) {
            try {
                $this->llm = LLMFactory::create('doctor');
                echo "🤖 Doctor AI: Claude 3.5 Sonnet\n";
            } catch (Exception $e) {
                echo "⚠️  Claude unavailable, using rule-based diagnosis\n";
                $this->useLLM = false;
            }
        }
    }
    
    public function diagnose($auditResults, $testOutput) {
        echo "\n";
        echo "╔═══════════════════════════════════════╗\n";
        echo "║   SCOUT94 DOCTOR - DIAGNOSTIC SCAN    ║\n";
        echo "╚═══════════════════════════════════════╝\n\n";
        
        echo "🩺 Running comprehensive diagnostic...\n\n";
        
        // Update health metrics based on audit
        $this->updateHealthMetrics($auditResults, $testOutput);
        
        // Generate health report
        $healthReport = $this->healthMonitor->generateHealthReport();
        echo $healthReport;
        
        // Perform detailed diagnosis
        $this->analyzeCriticalErrors($testOutput);
        $this->analyzeTestCoverage($auditResults);
        $this->analyzeSecurityGaps($auditResults);
        $this->analyzeMissingTests($auditResults);
        
        // Generate prescriptions
        $this->generatePrescriptions();
        
        return [
            'health_score' => $this->healthMonitor->calculateOverallHealth(),
            'needs_treatment' => $this->healthMonitor->needsClinic(),
            'diagnosis' => $this->diagnosis,
            'prescriptions' => $this->prescriptions,
            'health_data' => $this->healthMonitor->exportHealthData()
        ];
    }
    
    private function updateHealthMetrics($auditResults, $testOutput) {
        // Update audit score
        $auditScore = $auditResults['score'] ?? 0;
        $this->healthMonitor->updateMetric('audit_score', $auditScore);
        
        // Calculate test success rate
        preg_match('/Passed:\s*(\d+)/', $testOutput, $passedMatches);
        preg_match('/Failed:\s*(\d+)/', $testOutput, $failedMatches);
        
        $passed = isset($passedMatches[1]) ? (int)$passedMatches[1] : 0;
        $failed = isset($failedMatches[1]) ? (int)$failedMatches[1] : 0;
        $total = $passed + $failed;
        
        $successRate = $total > 0 ? ($passed / $total) * 100 : 0;
        $this->healthMonitor->updateMetric('test_success_rate', $successRate);
        
        // Count critical errors
        $criticalErrorCount = substr_count($testOutput, 'Critical Error');
        $criticalErrorScore = max(0, 100 - ($criticalErrorCount * 25)); // -25 per critical error
        $this->healthMonitor->updateMetric('critical_errors', $criticalErrorScore);
        
        // Estimate test coverage (based on audit completeness)
        $completeness = $auditResults['completeness_score'] ?? 0;
        $coverage = ($completeness / 10) * 100;
        $this->healthMonitor->updateMetric('test_coverage', $coverage);
        
        // Estimate security coverage
        $hasSecurityTests = stripos($testOutput, 'database injection') !== false;
        $securityCoverage = $hasSecurityTests ? 30 : 10; // Basic if DB test present
        $this->healthMonitor->updateMetric('security_coverage', $securityCoverage);
    }
    
    private function analyzeCriticalErrors($testOutput) {
        if (stripos($testOutput, 'Critical Error') !== false) {
            $this->diagnosis[] = [
                'severity' => 'CRITICAL',
                'category' => 'Test Infrastructure',
                'issue' => 'Critical errors preventing tests from running',
                'impact' => 'Tests report PASSED but have underlying failures'
            ];
        }
    }
    
    private function analyzeTestCoverage($auditResults) {
        $completeness = $auditResults['completeness_score'] ?? 0;
        
        if ($completeness < 5) {
            $this->diagnosis[] = [
                'severity' => 'HIGH',
                'category' => 'Test Coverage',
                'issue' => 'Insufficient test coverage',
                'impact' => 'Critical business functions may not be tested'
            ];
        }
    }
    
    private function analyzeSecurityGaps($auditResults) {
        $missingTests = $auditResults['missing_tests'] ?? [];
        
        $securityKeywords = ['security', 'XSS', 'CSRF', 'injection', 'authentication', 'authorization'];
        $securityGaps = 0;
        
        foreach ($missingTests as $test) {
            foreach ($securityKeywords as $keyword) {
                if (stripos($test, $keyword) !== false) {
                    $securityGaps++;
                    break;
                }
            }
        }
        
        if ($securityGaps > 3) {
            $this->diagnosis[] = [
                'severity' => 'HIGH',
                'category' => 'Security',
                'issue' => 'Major security testing gaps detected',
                'impact' => 'Production deployment poses security risks'
            ];
        }
    }
    
    private function analyzeMissingTests($auditResults) {
        $missingTests = $auditResults['missing_tests'] ?? [];
        
        if (count($missingTests) > 5) {
            $this->diagnosis[] = [
                'severity' => 'MEDIUM',
                'category' => 'Completeness',
                'issue' => count($missingTests) . ' critical tests missing',
                'impact' => 'Cannot verify all system requirements'
            ];
        }
    }
    
    private function generatePrescriptions() {
        // Try LLM-enhanced prescriptions first
        if ($this->useLLM && $this->llm) {
            try {
                $this->prescriptions = $this->generateLLMPrescriptions();
                echo "✅ AI-generated prescriptions complete\n\n";
                return;
            } catch (Exception $e) {
                echo "⚠️  AI prescriptions failed, using rule-based\n";
            }
        }
        
        // Fallback: Rule-based prescriptions
        foreach ($this->diagnosis as $issue) {
            switch ($issue['category']) {
                case 'Test Infrastructure':
                    $this->prescriptions[] = [
                        'priority' => 1,
                        'type' => 'FIX_CRITICAL_ERRORS',
                        'action' => 'Resolve schema file paths and test setup issues',
                        'estimated_health_gain' => 20
                    ];
                    break;
                    
                case 'Test Coverage':
                    $this->prescriptions[] = [
                        'priority' => 2,
                        'type' => 'EXPAND_TEST_COVERAGE',
                        'action' => 'Add missing user journey tests and business function tests',
                        'estimated_health_gain' => 25
                    ];
                    break;
                    
                case 'Security':
                    $this->prescriptions[] = [
                        'priority' => 1,
                        'type' => 'ADD_SECURITY_TESTS',
                        'action' => 'Implement comprehensive security test suite',
                        'estimated_health_gain' => 30
                    ];
                    break;
                    
                case 'Completeness':
                    $this->prescriptions[] = [
                        'priority' => 3,
                        'type' => 'ADD_MISSING_TESTS',
                        'action' => 'Implement missing test scenarios',
                        'estimated_health_gain' => 15
                    ];
                    break;
            }
        }
        
        // Sort by priority
        usort($this->prescriptions, function($a, $b) {
            return $a['priority'] <=> $b['priority'];
        });
    }
    
    public function printDiagnosisReport() {
        echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "📋 DIAGNOSIS REPORT\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        if (empty($this->diagnosis)) {
            echo "✅ No major issues detected\n\n";
            return;
        }
        
        foreach ($this->diagnosis as $i => $issue) {
            $severityEmoji = $issue['severity'] === 'CRITICAL' ? '🔴' : 
                           ($issue['severity'] === 'HIGH' ? '🟠' : '🟡');
            
            echo ($i + 1) . ". $severityEmoji " . $issue['severity'] . " - " . $issue['category'] . "\n";
            echo "   Issue: " . $issue['issue'] . "\n";
            echo "   Impact: " . $issue['impact'] . "\n\n";
        }
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "💊 TREATMENT PRESCRIPTIONS\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        foreach ($this->prescriptions as $i => $rx) {
            echo ($i + 1) . ". [Priority " . $rx['priority'] . "] " . $rx['type'] . "\n";
            echo "   Action: " . $rx['action'] . "\n";
            echo "   Expected Health Gain: +" . $rx['estimated_health_gain'] . " points\n\n";
        }
        
        // Calculate total expected health gain
        $totalGain = array_sum(array_column($this->prescriptions, 'estimated_health_gain'));
        $currentHealth = $this->healthMonitor->calculateOverallHealth();
        $projectedHealth = min(100, $currentHealth + $totalGain);
        
        echo "📈 PROJECTED HEALTH AFTER TREATMENT:\n";
        echo "   Current: " . round($currentHealth, 1) . "/100\n";
        echo "   Projected: " . round($projectedHealth, 1) . "/100\n";
        echo "   Expected Improvement: +" . $totalGain . " points\n\n";
    }
    
    public function getPrescriptions() {
        return $this->prescriptions;
    }
    
    public function getHealthScore() {
        return $this->healthMonitor->calculateOverallHealth();
    }
    
    /**
     * Generate prescriptions using Claude AI
     */
    private function generateLLMPrescriptions() {
        $prompt = "You are an expert diagnostic AI for Scout94, a testing system.\n\n";
        $prompt .= "DIAGNOSIS ISSUES:\n";
        foreach ($this->diagnosis as $i => $issue) {
            $prompt .= ($i + 1) . ". [{$issue['severity']}] {$issue['category']}: {$issue['issue']}\n";
            $prompt .= "   Impact: {$issue['impact']}\n\n";
        }
        
        $prompt .= "\nGENERATE TREATMENT PRESCRIPTIONS:\n";
        $prompt .= "For each issue, provide:\n";
        $prompt .= "1. Priority (1-3, where 1 is highest)\n";
        $prompt .= "2. Type (brief code like FIX_DATABASE_TEST)\n";
        $prompt .= "3. Action (specific, actionable steps)\n";
        $prompt .= "4. Estimated health gain (0-50 points)\n\n";
        $prompt .= "Format as JSON array:\n";
        $prompt .= '```json
[
  {
    "priority": 1,
    "type": "FIX_DATABASE_TEST",
    "action": "Update schema file path in test_install_db.php to point to correct location",
    "estimated_health_gain": 25
  }
]
```';
        
        echo "🤖 Consulting Claude AI for treatment plan...\n";
        
        $response = $this->llm->analyze('', $prompt);
        
        // Extract JSON from response
        if (preg_match('/```json\s*([\s\S]*?)\s*```/', $response, $matches)) {
            $prescriptions = json_decode($matches[1], true);
            if ($prescriptions && is_array($prescriptions)) {
                return $prescriptions;
            }
        }
        
        // Try to parse entire response as JSON
        $prescriptions = json_decode($response, true);
        if ($prescriptions && is_array($prescriptions)) {
            return $prescriptions;
        }
        
        throw new Exception("Failed to parse LLM response");
    }
}
