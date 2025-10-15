<?php
/**
 * Scout94 Framework Loader
 * Ensures all components follow documented mathematical and flow frameworks
 */

class Scout94Framework {
    const FRAMEWORK_VERSION = '1.0.0';
    
    // Mathematical framework constants (per MATHEMATICAL_FRAMEWORK.md)
    const HEALTH_WEIGHTS = [
        'test_coverage' => 0.25,      // 25%
        'test_success_rate' => 0.20,  // 20%
        'audit_score' => 0.30,        // 30%
        'security_coverage' => 0.15,  // 15%
        'critical_errors' => 0.10     // 10%
    ];
    
    const RISK_WEIGHTS = [
        'system_commands' => 0.30,    // 30%
        'file_operations' => 0.25,    // 25%
        'database_access' => 0.20,    // 20%
        'external_calls' => 0.15,     // 15%
        'code_complexity' => 0.10     // 10%
    ];
    
    // Thresholds
    const HEALTH_EXCELLENT = 95;
    const HEALTH_GOOD = 85;
    const HEALTH_FAIR = 70;
    const HEALTH_POOR = 50;
    const HEALTH_CRITICAL = 30;
    
    const RISK_LOW = 30;
    const RISK_MEDIUM = 50;
    const RISK_HIGH = 75;
    
    // Retry configuration (per RETRY_FLOWS_COMPLETE.md)
    const MAX_AUDIT_RETRIES = 3;
    const MAX_HEALING_CYCLES = 2;
    const AUDIT_THRESHOLD = 5;
    const CLINIC_THRESHOLD = 70;
    
    public static function verifyCompliance() {
        $issues = [];
        
        $healthSum = array_sum(self::HEALTH_WEIGHTS);
        if (abs($healthSum - 1.0) > 0.001) {
            $issues[] = "Health weights sum to $healthSum (expected 1.0)";
        }
        
        $riskSum = array_sum(self::RISK_WEIGHTS);
        if (abs($riskSum - 1.0) > 0.001) {
            $issues[] = "Risk weights sum to $riskSum (expected 1.0)";
        }
        
        return empty($issues) ? true : $issues;
    }
    
    public static function calculateHealth($metrics) {
        $totalScore = 0;
        
        foreach (self::HEALTH_WEIGHTS as $name => $weight) {
            if (isset($metrics[$name])) {
                $score = $metrics[$name];
                if ($name === 'audit_score' && $score <= 10) {
                    $score = ($score / 10) * 100;
                }
                $totalScore += $score * $weight;
            }
        }
        
        return round($totalScore, 2);
    }
    
    public static function detectStuck($scoreHistory) {
        if (count($scoreHistory) < 2) return false;
        $lastTwo = array_slice($scoreHistory, -2);
        return abs($lastTwo[1] - $lastTwo[0]) == 0;
    }
    
    public static function successProbability($attempts, $p = 0.5) {
        return 1 - pow(1 - $p, $attempts);
    }
    
    public static function getInfo() {
        return [
            'version' => self::FRAMEWORK_VERSION,
            'compliant' => self::verifyCompliance() === true,
            'documentation' => [
                'mathematical_framework' => 'MATHEMATICAL_FRAMEWORK.md',
                'retry_flows' => 'RETRY_FLOWS_COMPLETE.md',
                'communication' => 'COMMUNICATION_FLOW.md'
            ]
        ];
    }
}
