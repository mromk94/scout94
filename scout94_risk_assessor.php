<?php
/**
 * Scout94 Risk Assessor
 * Evaluates safety of new tests and code before deployment
 * Uses mathematical scoring to determine code exposure risk
 * 
 * MATHEMATICAL FRAMEWORK COMPLIANCE:
 * Follows formulas documented in MATHEMATICAL_FRAMEWORK.md
 * 
 * Risk Formula: Risk = Σ(Factorᵢ × Weightᵢ)
 * 
 * Factor Scoring Functions:
 * - System Commands: S(n) = min(100, n × 30)
 * - File Operations: F(n) = min(100, n × 15)
 * - Database Access: D(n) = min(100, n × 20)
 * - External Calls: E(n) = min(100, n × 10)
 * - Code Complexity: C(complexity, lines) = min(100, (complexity / max(1, lines/10)) × 50)
 * 
 * Weights (must sum to 1.0):
 * - System Commands: 0.30 (30%)
 * - File Operations: 0.25 (25%)
 * - Database Access: 0.20 (20%)
 * - External Calls: 0.15 (15%)
 * - Code Complexity: 0.10 (10%)
 * 
 * Approval Criteria: Risk < 75 AND Sandbox = PASSED
 */

class Scout94RiskAssessor {
    private $riskFactors = [];
    private $sandboxResults = [];
    
    // Risk thresholds
    const LOW_RISK = 30;
    const MEDIUM_RISK = 50;
    const HIGH_RISK = 75;
    
    // Risk factor weights
    const WEIGHTS = [
        'file_operations' => 0.25,      // File write/delete operations
        'database_access' => 0.20,      // Direct DB manipulation
        'external_calls' => 0.15,       // External API/network calls
        'system_commands' => 0.30,      // System exec/shell commands
        'code_complexity' => 0.10        // Cyclomatic complexity
    ];
    
    public function assessRisk($testCode, $testType) {
        echo "\n";
        echo "╔═══════════════════════════════════════╗\n";
        echo "║  SCOUT94 RISK ASSESSOR - SANDBOX TEST ║\n";
        echo "╚═══════════════════════════════════════╝\n\n";
        
        echo "🔬 Analyzing test code for risk factors...\n\n";
        
        // Analyze code for risk factors
        $this->analyzeFileOperations($testCode);
        $this->analyzeDatabaseAccess($testCode);
        $this->analyzeExternalCalls($testCode);
        $this->analyzeSystemCommands($testCode);
        $this->analyzeCodeComplexity($testCode);
        
        // Calculate overall risk score
        $riskScore = $this->calculateRiskScore();
        $riskLevel = $this->getRiskLevel($riskScore);
        
        // Sandbox test
        $sandboxPassed = $this->runSandboxTest($testCode, $testType);
        
        // Generate report
        $this->generateRiskReport($riskScore, $riskLevel, $sandboxPassed);
        
        return [
            'risk_score' => $riskScore,
            'risk_level' => $riskLevel,
            'sandbox_passed' => $sandboxPassed,
            'approved' => $this->isApproved($riskScore, $sandboxPassed),
            'risk_factors' => $this->riskFactors
        ];
    }
    
    private function analyzeFileOperations($code) {
        $dangerousFunctions = [
            'unlink', 'rmdir', 'file_put_contents', 'fwrite', 
            'rename', 'copy', 'move_uploaded_file', 'chmod'
        ];
        
        $detectedOperations = [];
        foreach ($dangerousFunctions as $func) {
            if (stripos($code, $func) !== false) {
                $detectedOperations[] = $func;
            }
        }
        
        // Formula: F(n) = min(100, n × 15)
        // Where n = number of file write/delete operations
        // Penalty: 15 points per operation
        $n = count($detectedOperations);
        $riskScore = min(100, $n * 15);
        
        $this->riskFactors['file_operations'] = [
            'score' => $riskScore,
            'detected' => $detectedOperations,
            'description' => 'File system modification operations',
            'formula' => "F($n) = min(100, $n × 15) = $riskScore"
        ];
    }
    
    private function analyzeDatabaseAccess($code) {
        $dbPatterns = [
            '/DROP\s+TABLE/i',
            '/DELETE\s+FROM/i',
            '/TRUNCATE/i',
            '/UPDATE.*SET/i',
            '/INSERT\s+INTO/i',
            '/ALTER\s+TABLE/i'
        ];
        
        $detectedPatterns = [];
        foreach ($dbPatterns as $pattern) {
            if (preg_match($pattern, $code)) {
                $detectedPatterns[] = $pattern;
            }
        }
        
        $riskScore = min(100, count($detectedPatterns) * 20);
        
        $this->riskFactors['database_access'] = [
            'score' => $riskScore,
            'detected' => $detectedPatterns,
            'description' => 'Database modification queries'
        ];
    }
    
    private function analyzeExternalCalls($code) {
        $externalFunctions = [
            'curl_exec', 'file_get_contents', 'fopen', 
            'fsockopen', 'stream_socket_client', 'socket_connect'
        ];
        
        $detectedCalls = [];
        foreach ($externalFunctions as $func) {
            if (stripos($code, $func) !== false) {
                $detectedCalls[] = $func;
            }
        }
        
        $riskScore = min(100, count($detectedCalls) * 10);
        
        $this->riskFactors['external_calls'] = [
            'score' => $riskScore,
            'detected' => $detectedCalls,
            'description' => 'External network/API calls'
        ];
    }
    
    private function analyzeSystemCommands($code) {
        $systemFunctions = [
            'exec', 'shell_exec', 'system', 'passthru', 
            'proc_open', 'popen', '`', 'eval'
        ];
        
        $detectedCommands = [];
        foreach ($systemFunctions as $func) {
            if (stripos($code, $func) !== false) {
                $detectedCommands[] = $func;
            }
        }
        
        // System commands are highest risk
        // Formula: S(n) = min(100, n × 30)
        // Where n = number of system command calls
        // Penalty: 30 points per command
        $n = count($detectedCommands);
        $riskScore = min(100, $n * 30);
        
        $this->riskFactors['system_commands'] = [
            'score' => $riskScore,
            'detected' => $detectedCommands,
            'description' => 'System command execution',
            'formula' => "S($n) = min(100, $n × 30) = $riskScore"
        ];
    }
    
    private function analyzeCodeComplexity($code) {
        // Simple complexity metrics
        $lines = substr_count($code, "\n");
        $conditionals = preg_match_all('/\b(if|else|elseif|switch|case)\b/', $code);
        $loops = preg_match_all('/\b(for|foreach|while|do)\b/', $code);
        
        $complexity = $conditionals + $loops;
        $riskScore = min(100, ($complexity / max(1, $lines / 10)) * 50);
        
        $this->riskFactors['code_complexity'] = [
            'score' => $riskScore,
            'lines' => $lines,
            'complexity' => $complexity,
            'description' => 'Code complexity and structure'
        ];
    }
    
    private function calculateRiskScore() {
        $totalScore = 0;
        $totalWeight = 0;
        
        foreach (self::WEIGHTS as $factor => $weight) {
            if (isset($this->riskFactors[$factor])) {
                $score = $this->riskFactors[$factor]['score'];
                // Apply weight: Risk = Σ(Factorᵢ × Weightᵢ)
                $totalScore += $score * $weight;
                $totalWeight += $weight;
            }
        }
        
        // Verify weights sum to 1.0 (as per mathematical framework)
        if (abs($totalWeight - 1.0) > 0.001) {
            trigger_error("Risk weight sum deviation: $totalWeight (expected 1.0)", E_USER_WARNING);
        }
        
        return round($totalScore, 2);
    }
    
    private function getRiskLevel($riskScore) {
        if ($riskScore < self::LOW_RISK) {
            return ['level' => 'LOW', 'emoji' => '🟢', 'action' => 'APPROVED'];
        } elseif ($riskScore < self::MEDIUM_RISK) {
            return ['level' => 'MEDIUM', 'emoji' => '🟡', 'action' => 'REVIEW_REQUIRED'];
        } elseif ($riskScore < self::HIGH_RISK) {
            return ['level' => 'HIGH', 'emoji' => '🟠', 'action' => 'CAUTION_ADVISED'];
        } else {
            return ['level' => 'CRITICAL', 'emoji' => '🔴', 'action' => 'REJECTED'];
        }
    }
    
    private function runSandboxTest($testCode, $testType) {
        echo "🧪 Running sandbox simulation...\n";
        
        // Simulate sandbox environment
        $sandboxChecks = [
            'syntax_valid' => $this->checkSyntax($testCode),
            'no_prohibited_functions' => $this->checkProhibitedFunctions($testCode),
            'no_infinite_loops' => $this->checkForInfiniteLoops($testCode),
            'safe_file_paths' => $this->checkFilePaths($testCode)
        ];
        
        $passed = !in_array(false, $sandboxChecks, true);
        
        $this->sandboxResults = $sandboxChecks;
        
        echo "   Sandbox checks: " . ($passed ? "✅ PASSED" : "❌ FAILED") . "\n\n";
        
        return $passed;
    }
    
    private function checkSyntax($code) {
        // Basic PHP syntax check
        return stripos($code, '<?php') !== false;
    }
    
    private function checkProhibitedFunctions($code) {
        $prohibited = ['eval', 'assert', 'create_function'];
        foreach ($prohibited as $func) {
            if (stripos($code, $func . '(') !== false) {
                return false;
            }
        }
        return true;
    }
    
    private function checkForInfiniteLoops($code) {
        // Simple heuristic: check for while(true) without break
        if (preg_match('/while\s*\(\s*true\s*\)/i', $code)) {
            if (!preg_match('/break\s*;/i', $code)) {
                return false;
            }
        }
        return true;
    }
    
    private function checkFilePaths($code) {
        // Ensure file operations use safe paths (within project)
        $dangerousPaths = ['/', '/etc', '/var', '/usr', '/bin', '/sys'];
        foreach ($dangerousPaths as $path) {
            if (preg_match('/["\']' . preg_quote($path, '/') . '/', $code)) {
                return false;
            }
        }
        return true;
    }
    
    private function generateRiskReport($riskScore, $riskLevel, $sandboxPassed) {
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "📊 RISK ASSESSMENT REPORT\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        echo "🎯 OVERALL RISK SCORE: " . $riskLevel['emoji'] . " " . $riskScore . "/100\n";
        echo "📋 RISK LEVEL: " . $riskLevel['level'] . "\n";
        echo "⚖️  DECISION: " . $riskLevel['action'] . "\n\n";
        
        echo "━━━ RISK BREAKDOWN ━━━\n\n";
        
        foreach ($this->riskFactors as $name => $factor) {
            $weight = self::WEIGHTS[$name] * 100;
            $bar = $this->generateRiskBar($factor['score']);
            
            echo ucwords(str_replace('_', ' ', $name)) . ":\n";
            echo "  $bar " . round($factor['score'], 1) . "/100 (Weight: {$weight}%)\n";
            
            if (!empty($factor['detected'])) {
                echo "  Detected: " . implode(', ', array_slice($factor['detected'], 0, 3));
                if (count($factor['detected']) > 3) {
                    echo " +" . (count($factor['detected']) - 3) . " more";
                }
                echo "\n";
            }
            echo "\n";
        }
        
        echo "━━━ SANDBOX RESULTS ━━━\n\n";
        foreach ($this->sandboxResults as $check => $passed) {
            $status = $passed ? '✅' : '❌';
            echo "$status " . ucwords(str_replace('_', ' ', $check)) . "\n";
        }
        echo "\n";
        
        if ($this->isApproved($riskScore, $sandboxPassed)) {
            echo "✅ TEST CODE APPROVED FOR DEPLOYMENT\n";
        } else {
            echo "❌ TEST CODE REJECTED - Risk too high or sandbox failed\n";
        }
    }
    
    private function generateRiskBar($score) {
        $filled = round($score / 10);
        $empty = 10 - $filled;
        
        if ($score < 30) {
            $color = '🟩';
        } elseif ($score < 50) {
            $color = '🟨';
        } elseif ($score < 75) {
            $color = '🟧';
        } else {
            $color = '🟥';
        }
        
        return str_repeat($color, $filled) . str_repeat('⬜', $empty);
    }
    
    private function isApproved($riskScore, $sandboxPassed) {
        return $riskScore < self::HIGH_RISK && $sandboxPassed;
    }
}
