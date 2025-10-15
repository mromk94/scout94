<?php
/**
 * Scout94 Health Monitor
 * Tracks and calculates Scout94's health score based on multiple metrics
 * 
 * MATHEMATICAL FRAMEWORK COMPLIANCE:
 * Follows formulas documented in MATHEMATICAL_FRAMEWORK.md
 * 
 * Health Formula: H = Σ(Metricᵢ × Weightᵢ) / Σ(Weightᵢ)
 * Where all metrics normalized to 0-100 scale
 * 
 * Weights (must sum to 1.0):
 * - Test Coverage: 0.25 (25%)
 * - Test Success Rate: 0.20 (20%)
 * - Audit Score: 0.30 (30%)
 * - Security Coverage: 0.15 (15%)
 * - Critical Errors: 0.10 (10%)
 */

class Scout94HealthMonitor {
    private $metrics = [];
    
    // Health thresholds
    const CRITICAL_HEALTH = 30;
    const POOR_HEALTH = 50;
    const FAIR_HEALTH = 70;
    const GOOD_HEALTH = 85;
    const EXCELLENT_HEALTH = 95;
    
    public function __construct() {
        $this->initializeMetrics();
    }
    
    private function initializeMetrics() {
        $this->metrics = [
            'test_coverage' => [
                'weight' => 0.25,
                'score' => 0,
                'max' => 100,
                'description' => 'Percentage of critical paths tested'
            ],
            'test_success_rate' => [
                'weight' => 0.20,
                'score' => 0,
                'max' => 100,
                'description' => 'Pass/fail ratio of tests'
            ],
            'audit_score' => [
                'weight' => 0.30,
                'score' => 0,
                'max' => 10,
                'description' => 'LLM auditor quality score'
            ],
            'security_coverage' => [
                'weight' => 0.15,
                'score' => 0,
                'max' => 100,
                'description' => 'Security test comprehensiveness'
            ],
            'critical_errors' => [
                'weight' => 0.10,
                'score' => 100, // Starts at 100, deducts for errors
                'max' => 100,
                'description' => 'Inverse of critical errors (fewer = higher)'
            ]
        ];
    }
    
    public function updateMetric($metricName, $value) {
        if (isset($this->metrics[$metricName])) {
            $this->metrics[$metricName]['score'] = $value;
        }
    }
    
    public function calculateOverallHealth() {
        $totalScore = 0;
        $totalWeight = 0;
        
        foreach ($this->metrics as $name => $metric) {
            // Normalize score to 0-100 scale
            // Formula: Normalized = (Raw Score / Max Possible) × 100
            $normalizedScore = ($metric['score'] / $metric['max']) * 100;
            $weightedScore = $normalizedScore * $metric['weight'];
            
            $totalScore += $weightedScore;
            $totalWeight += $metric['weight'];
        }
        
        // Verify weights sum to 1.0 (as per mathematical framework)
        if (abs($totalWeight - 1.0) > 0.001) {
            trigger_error("Weight sum deviation: $totalWeight (expected 1.0)", E_USER_WARNING);
        }
        
        // Overall Health = Σ(Metricᵢ × Weightᵢ)
        return round($totalScore / $totalWeight, 2);
    }
    
    public function getHealthStatus($healthScore = null) {
        if ($healthScore === null) {
            $healthScore = $this->calculateOverallHealth();
        }
        
        // Status thresholds as per MATHEMATICAL_FRAMEWORK.md:
        // H(x) function with defined breakpoints
        if ($healthScore >= self::EXCELLENT_HEALTH) { // ≥95
            return ['status' => 'EXCELLENT', 'emoji' => '💚', 'recommendation' => 'Production ready!'];
        } elseif ($healthScore >= self::GOOD_HEALTH) { // 85-94
            return ['status' => 'GOOD', 'emoji' => '🟢', 'recommendation' => 'Minor improvements suggested'];
        } elseif ($healthScore >= self::FAIR_HEALTH) { // 70-84
            return ['status' => 'FAIR', 'emoji' => '🟡', 'recommendation' => 'Needs attention'];
        } elseif ($healthScore >= self::POOR_HEALTH) { // 50-69
            return ['status' => 'POOR', 'emoji' => '🟠', 'recommendation' => 'Clinic visit recommended'];
        } elseif ($healthScore >= self::CRITICAL_HEALTH) { // 30-49
            return ['status' => 'CRITICAL', 'emoji' => '🔴', 'recommendation' => 'Immediate clinic treatment required'];
        } else { // <30
            return ['status' => 'FAILING', 'emoji' => '💀', 'recommendation' => 'Emergency clinic intervention needed'];
        }
    }
    
    public function needsClinic($healthScore = null) {
        if ($healthScore === null) {
            $healthScore = $this->calculateOverallHealth();
        }
        
        // Clinic admission criteria per MATHEMATICAL_FRAMEWORK.md:
        // Clinic Required = TRUE if H(x) < 70
        // This corresponds to POOR, CRITICAL, or FAILING states
        return $healthScore < self::FAIR_HEALTH; // Below 70 needs clinic
    }
    
    public function generateHealthReport() {
        $overallHealth = $this->calculateOverallHealth();
        $status = $this->getHealthStatus($overallHealth);
        
        $report = "\n";
        $report .= "╔═══════════════════════════════════════╗\n";
        $report .= "║   SCOUT94 HEALTH ASSESSMENT           ║\n";
        $report .= "╚═══════════════════════════════════════╝\n\n";
        
        $report .= "🏥 OVERALL HEALTH: " . $status['emoji'] . " " . round($overallHealth, 1) . "/100\n";
        $report .= "📊 STATUS: " . $status['status'] . "\n";
        $report .= "💡 RECOMMENDATION: " . $status['recommendation'] . "\n\n";
        
        $report .= "━━━ HEALTH METRICS ━━━\n\n";
        
        foreach ($this->metrics as $name => $metric) {
            $normalized = ($metric['score'] / $metric['max']) * 100;
            $bar = $this->generateHealthBar($normalized);
            
            $report .= ucwords(str_replace('_', ' ', $name)) . ":\n";
            $report .= "  $bar " . round($normalized, 1) . "%\n";
            $report .= "  Weight: " . ($metric['weight'] * 100) . "% | " . $metric['description'] . "\n\n";
        }
        
        if ($this->needsClinic($overallHealth)) {
            $report .= "⚠️  CLINIC VISIT REQUIRED\n";
            $report .= "Scout94 health is below optimal threshold (70)\n";
            $report .= "Initiating diagnostic and treatment protocols...\n";
        }
        
        return $report;
    }
    
    private function generateHealthBar($percentage) {
        $filled = round($percentage / 10);
        $empty = 10 - $filled;
        
        if ($percentage >= 85) {
            $color = '🟩';
        } elseif ($percentage >= 70) {
            $color = '🟨';
        } elseif ($percentage >= 50) {
            $color = '🟧';
        } else {
            $color = '🟥';
        }
        
        return str_repeat($color, $filled) . str_repeat('⬜', $empty);
    }
    
    public function getMetrics() {
        return $this->metrics;
    }
    
    public function exportHealthData() {
        return [
            'overall_health' => $this->calculateOverallHealth(),
            'status' => $this->getHealthStatus(),
            'metrics' => $this->metrics,
            'needs_clinic' => $this->needsClinic(),
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
}
