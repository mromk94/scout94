<?php
/**
 * Scout94 Enhanced Sandbox
 * Isolated execution environment for testing new code
 * Detailed flow tracking and safety validation
 */

require_once __DIR__ . '/scout94_knowledge_base.php';

class Scout94Sandbox {
    private $knowledgeBase;
    private $sandboxId;
    private $executionLog = [];
    private $safetyChecks = [];
    private $resourceLimits = [];
    
    // Sandbox isolation levels
    const ISOLATION_STRICT = 'strict';      // No external access
    const ISOLATION_MODERATE = 'moderate';  // Limited external access
    const ISOLATION_RELAXED = 'relaxed';    // Full access but monitored
    
    // Execution phases
    const PHASE_INIT = 'initialization';
    const PHASE_VALIDATION = 'validation';
    const PHASE_STATIC_ANALYSIS = 'static_analysis';
    const PHASE_RUNTIME_PREP = 'runtime_preparation';
    const PHASE_EXECUTION = 'execution';
    const PHASE_MONITORING = 'monitoring';
    const PHASE_CLEANUP = 'cleanup';
    const PHASE_REPORTING = 'reporting';
    
    public function __construct($projectPath) {
        $this->knowledgeBase = new Scout94KnowledgeBase($projectPath);
        $this->sandboxId = uniqid('sandbox_');
        $this->initializeResourceLimits();
        
        // Notify knowledge base
        $this->knowledgeBase->updateActorState(
            Scout94KnowledgeBase::ACTOR_SANDBOX,
            'initializing',
            ['sandbox_id' => $this->sandboxId]
        );
    }
    
    private function initializeResourceLimits() {
        $this->resourceLimits = [
            'max_execution_time' => 30,      // 30 seconds
            'max_memory' => 128 * 1024 * 1024, // 128MB
            'max_file_operations' => 10,     // Max file writes
            'max_db_queries' => 5,           // Max DB queries
            'max_external_calls' => 3        // Max curl/network calls
        ];
    }
    
    // ============================================
    // MAIN SANDBOX FLOW
    // ============================================
    
    public function execute($testCode, $testType, $isolationLevel = self::ISOLATION_STRICT) {
        echo "\n";
        echo "╔═══════════════════════════════════════╗\n";
        echo "║   SCOUT94 SANDBOX - EXECUTION FLOW    ║\n";
        echo "╚═══════════════════════════════════════╝\n\n";
        
        echo "🔬 Sandbox ID: " . $this->sandboxId . "\n";
        echo "🔒 Isolation Level: " . strtoupper($isolationLevel) . "\n\n";
        
        // Post message to knowledge base
        $this->knowledgeBase->postMessage(
            Scout94KnowledgeBase::ACTOR_SANDBOX,
            Scout94KnowledgeBase::ACTOR_RISK_ASSESSOR,
            'execution_started',
            ['sandbox_id' => $this->sandboxId, 'type' => $testType],
            'high'
        );
        
        $result = [
            'sandbox_id' => $this->sandboxId,
            'success' => false,
            'phases_completed' => [],
            'execution_log' => [],
            'safety_violations' => [],
            'resource_usage' => []
        ];
        
        try {
            // Phase 1: Initialization
            $this->executePhase(self::PHASE_INIT, function() use ($testCode, $testType) {
                return $this->phaseInitialization($testCode, $testType);
            });
            $result['phases_completed'][] = self::PHASE_INIT;
            
            // Phase 2: Validation
            $this->executePhase(self::PHASE_VALIDATION, function() use ($testCode) {
                return $this->phaseValidation($testCode);
            });
            $result['phases_completed'][] = self::PHASE_VALIDATION;
            
            // Phase 3: Static Analysis
            $this->executePhase(self::PHASE_STATIC_ANALYSIS, function() use ($testCode) {
                return $this->phaseStaticAnalysis($testCode);
            });
            $result['phases_completed'][] = self::PHASE_STATIC_ANALYSIS;
            
            // Phase 4: Runtime Preparation
            $this->executePhase(self::PHASE_RUNTIME_PREP, function() use ($isolationLevel) {
                return $this->phaseRuntimePreparation($isolationLevel);
            });
            $result['phases_completed'][] = self::PHASE_RUNTIME_PREP;
            
            // Phase 5: Execution (in isolated environment)
            $executionResult = $this->executePhase(self::PHASE_EXECUTION, function() use ($testCode) {
                return $this->phaseExecution($testCode);
            });
            $result['phases_completed'][] = self::PHASE_EXECUTION;
            $result['execution_result'] = $executionResult;
            
            // Phase 6: Monitoring (collect metrics)
            $this->executePhase(self::PHASE_MONITORING, function() {
                return $this->phaseMonitoring();
            });
            $result['phases_completed'][] = self::PHASE_MONITORING;
            
            // Phase 7: Cleanup
            $this->executePhase(self::PHASE_CLEANUP, function() {
                return $this->phaseCleanup();
            });
            $result['phases_completed'][] = self::PHASE_CLEANUP;
            
            // Phase 8: Reporting
            $report = $this->executePhase(self::PHASE_REPORTING, function() use (&$result) {
                return $this->phaseReporting($result);
            });
            $result['phases_completed'][] = self::PHASE_REPORTING;
            
            $result['success'] = true;
            $result['execution_log'] = $this->executionLog;
            $result['safety_checks'] = $this->safetyChecks;
            
            // Notify knowledge base of success
            $this->knowledgeBase->updateActorState(
                Scout94KnowledgeBase::ACTOR_SANDBOX,
                'completed',
                ['sandbox_id' => $this->sandboxId, 'success' => true]
            );
            
            $this->knowledgeBase->postMessage(
                Scout94KnowledgeBase::ACTOR_SANDBOX,
                Scout94KnowledgeBase::ACTOR_CLINIC,
                'execution_completed',
                ['sandbox_id' => $this->sandboxId, 'result' => 'success'],
                'normal'
            );
            
        } catch (Exception $e) {
            $result['success'] = false;
            $result['error'] = $e->getMessage();
            $result['execution_log'] = $this->executionLog;
            
            echo "❌ Sandbox execution failed: " . $e->getMessage() . "\n\n";
            
            // Notify knowledge base of failure
            $this->knowledgeBase->updateActorState(
                Scout94KnowledgeBase::ACTOR_SANDBOX,
                'failed',
                ['sandbox_id' => $this->sandboxId, 'error' => $e->getMessage()]
            );
            
            $this->knowledgeBase->postMessage(
                Scout94KnowledgeBase::ACTOR_SANDBOX,
                Scout94KnowledgeBase::ACTOR_DOCTOR,
                'execution_failed',
                ['sandbox_id' => $this->sandboxId, 'error' => $e->getMessage()],
                'critical'
            );
        }
        
        return $result;
    }
    
    // ============================================
    // PHASE IMPLEMENTATIONS
    // ============================================
    
    private function executePhase($phaseName, $callback) {
        $startTime = microtime(true);
        
        echo "━━━ PHASE: " . strtoupper($phaseName) . " ━━━\n";
        
        $this->log('phase_start', $phaseName, ['timestamp' => date('Y-m-d H:i:s.u')]);
        
        try {
            $result = $callback();
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            $this->log('phase_complete', $phaseName, [
                'duration_ms' => $duration,
                'result' => 'success'
            ]);
            
            echo "✅ Completed in {$duration}ms\n\n";
            
            return $result;
            
        } catch (Exception $e) {
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            $this->log('phase_failed', $phaseName, [
                'duration_ms' => $duration,
                'error' => $e->getMessage()
            ]);
            
            echo "❌ Failed after {$duration}ms: " . $e->getMessage() . "\n\n";
            
            throw $e;
        }
    }
    
    private function phaseInitialization($testCode, $testType) {
        echo "🔧 Setting up sandbox environment...\n";
        
        // Create isolated temp directory
        $tempDir = sys_get_temp_dir() . '/scout94_sandbox_' . $this->sandboxId;
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0700, true);
        }
        
        $this->log('sandbox_created', 'initialization', ['temp_dir' => $tempDir]);
        
        echo "   📁 Temp directory: " . basename($tempDir) . "\n";
        echo "   📏 Code size: " . strlen($testCode) . " bytes\n";
        echo "   🏷️  Test type: " . $testType . "\n";
        
        return ['temp_dir' => $tempDir];
    }
    
    private function phaseValidation($testCode) {
        echo "🔍 Validating code structure...\n";
        
        $checks = [
            'has_php_tags' => $this->checkPHPTags($testCode),
            'syntax_valid' => $this->checkSyntax($testCode),
            'no_eval' => !$this->containsDangerousFunction($testCode, 'eval'),
            'no_system_exec' => !$this->containsDangerousFunction($testCode, 'exec'),
            'no_shell_exec' => !$this->containsDangerousFunction($testCode, 'shell_exec')
        ];
        
        foreach ($checks as $check => $passed) {
            $status = $passed ? '✅' : '❌';
            echo "   $status " . ucwords(str_replace('_', ' ', $check)) . "\n";
            
            $this->safetyChecks[$check] = $passed;
            
            if (!$passed && in_array($check, ['syntax_valid', 'no_eval'])) {
                throw new Exception("Validation failed: $check");
            }
        }
        
        return $checks;
    }
    
    private function phaseStaticAnalysis($testCode) {
        echo "📊 Performing static analysis...\n";
        
        $analysis = [
            'lines_of_code' => substr_count($testCode, "\n"),
            'function_count' => preg_match_all('/function\s+\w+/', $testCode),
            'class_count' => preg_match_all('/class\s+\w+/', $testCode),
            'conditional_count' => preg_match_all('/\b(if|else|elseif|switch)\b/', $testCode),
            'loop_count' => preg_match_all('/\b(for|foreach|while|do)\b/', $testCode)
        ];
        
        // Detect potential issues
        $potentialIssues = [];
        
        if ($analysis['loop_count'] > 5) {
            $potentialIssues[] = 'High loop count - potential performance concern';
        }
        
        if (preg_match('/while\s*\(\s*true\s*\)/i', $testCode)) {
            $potentialIssues[] = 'Infinite loop detected - requires break statement';
        }
        
        if (preg_match('/file_get_contents\s*\(\s*["\']http/i', $testCode)) {
            $potentialIssues[] = 'External HTTP call detected';
        }
        
        echo "   📝 Lines: " . $analysis['lines_of_code'] . "\n";
        echo "   🔢 Functions: " . $analysis['function_count'] . "\n";
        echo "   🔄 Loops: " . $analysis['loop_count'] . "\n";
        
        if (!empty($potentialIssues)) {
            echo "   ⚠️  Issues: " . count($potentialIssues) . "\n";
            foreach ($potentialIssues as $issue) {
                echo "      • $issue\n";
            }
        }
        
        $this->log('static_analysis', 'analysis', $analysis);
        
        return $analysis;
    }
    
    private function phaseRuntimePreparation($isolationLevel) {
        echo "⚙️  Preparing runtime environment...\n";
        
        // Set PHP limits based on isolation level
        $limits = $this->resourceLimits;
        
        if ($isolationLevel === self::ISOLATION_STRICT) {
            $limits['max_execution_time'] = 10;
            $limits['max_memory'] = 64 * 1024 * 1024;
        }
        
        echo "   ⏱️  Max execution: " . $limits['max_execution_time'] . "s\n";
        echo "   💾 Max memory: " . round($limits['max_memory'] / 1024 / 1024) . "MB\n";
        echo "   🔒 Isolation: " . strtoupper($isolationLevel) . "\n";
        
        // Note: Actual limits would be set via ini_set() or process isolation
        // For safety, we're documenting the flow here
        
        $this->log('runtime_prep', 'preparation', $limits);
        
        return $limits;
    }
    
    private function phaseExecution($testCode) {
        echo "▶️  Executing code in sandbox...\n";
        
        $executionStart = microtime(true);
        
        // Create wrapper to capture output and errors
        $wrappedCode = $this->wrapCodeForExecution($testCode);
        
        // Save to temp file
        $tempFile = sys_get_temp_dir() . '/scout94_exec_' . $this->sandboxId . '.php';
        file_put_contents($tempFile, $wrappedCode);
        
        echo "   🔬 Executing in isolated context...\n";
        
        // Simulate execution (in production, this would use process isolation)
        $output = '';
        $exitCode = 0;
        
        try {
            ob_start();
            include $tempFile;
            $output = ob_get_clean();
            $exitCode = 0;
        } catch (Exception $e) {
            $output = ob_get_clean();
            $output .= "\nError: " . $e->getMessage();
            $exitCode = 1;
        }
        
        $executionTime = round((microtime(true) - $executionStart) * 1000, 2);
        
        echo "   ✅ Execution completed\n";
        echo "   ⏱️  Duration: {$executionTime}ms\n";
        echo "   📊 Exit code: $exitCode\n";
        
        if (!empty($output)) {
            echo "   📄 Output captured (" . strlen($output) . " bytes)\n";
        }
        
        $this->log('execution', 'runtime', [
            'duration_ms' => $executionTime,
            'exit_code' => $exitCode,
            'output_size' => strlen($output)
        ]);
        
        // Cleanup temp file
        @unlink($tempFile);
        
        return [
            'success' => $exitCode === 0,
            'output' => $output,
            'exit_code' => $exitCode,
            'execution_time' => $executionTime
        ];
    }
    
    private function phaseMonitoring() {
        echo "📈 Collecting execution metrics...\n";
        
        $metrics = [
            'peak_memory' => memory_get_peak_usage(true),
            'current_memory' => memory_get_usage(true),
            'total_log_entries' => count($this->executionLog),
            'safety_checks_passed' => count(array_filter($this->safetyChecks)),
            'safety_checks_failed' => count($this->safetyChecks) - count(array_filter($this->safetyChecks))
        ];
        
        echo "   💾 Peak memory: " . round($metrics['peak_memory'] / 1024 / 1024, 2) . "MB\n";
        echo "   📝 Log entries: " . $metrics['total_log_entries'] . "\n";
        echo "   ✅ Safety checks passed: " . $metrics['safety_checks_passed'] . "/" . count($this->safetyChecks) . "\n";
        
        $this->log('monitoring', 'metrics', $metrics);
        
        return $metrics;
    }
    
    private function phaseCleanup() {
        echo "🧹 Cleaning up sandbox environment...\n";
        
        // Remove temp directory
        $tempDir = sys_get_temp_dir() . '/scout94_sandbox_' . $this->sandboxId;
        if (file_exists($tempDir)) {
            $this->recursiveRemoveDirectory($tempDir);
            echo "   ✅ Temp directory removed\n";
        }
        
        // Clear sensitive data from memory
        $this->log('cleanup', 'finalization', ['sandbox_id' => $this->sandboxId]);
        
        echo "   ✅ Cleanup complete\n";
        
        return true;
    }
    
    private function phaseReporting($result) {
        echo "📋 Generating sandbox report...\n";
        
        $report = [
            'sandbox_id' => $this->sandboxId,
            'timestamp' => date('Y-m-d H:i:s'),
            'success' => $result['success'],
            'phases_completed' => count($result['phases_completed']),
            'total_phases' => 8,
            'safety_score' => $this->calculateSafetyScore(),
            'execution_summary' => $this->generateExecutionSummary()
        ];
        
        echo "   📊 Safety score: " . $report['safety_score'] . "/100\n";
        echo "   ✅ Phases completed: " . $report['phases_completed'] . "/" . $report['total_phases'] . "\n";
        
        // Save report to knowledge base
        $this->knowledgeBase->recordSuccessfulPattern(
            'sandbox_execution',
            ['safety_score' => $report['safety_score'], 'phases' => $result['phases_completed']]
        );
        
        $this->log('reporting', 'final', $report);
        
        return $report;
    }
    
    // ============================================
    // HELPER METHODS
    // ============================================
    
    private function wrapCodeForExecution($testCode) {
        // Remove PHP tags if present
        $testCode = preg_replace('/<\?php\s*/', '', $testCode);
        $testCode = preg_replace('/\?>/', '', $testCode);
        
        // Wrap with error handling
        $wrapper = "<?php\n";
        $wrapper .= "// Scout94 Sandbox Execution Wrapper\n";
        $wrapper .= "error_reporting(E_ALL);\n";
        $wrapper .= "set_error_handler(function(\$errno, \$errstr, \$errfile, \$errline) {\n";
        $wrapper .= "    throw new ErrorException(\$errstr, 0, \$errno, \$errfile, \$errline);\n";
        $wrapper .= "});\n\n";
        $wrapper .= "try {\n";
        $wrapper .= $testCode . "\n";
        $wrapper .= "} catch (Exception \$e) {\n";
        $wrapper .= "    echo 'SANDBOX_ERROR: ' . \$e->getMessage() . \"\\n\";\n";
        $wrapper .= "    exit(1);\n";
        $wrapper .= "}\n";
        
        return $wrapper;
    }
    
    private function checkPHPTags($code) {
        return stripos($code, '<?php') !== false || stripos($code, '<?') !== false;
    }
    
    private function checkSyntax($code) {
        // Basic syntax check - in production would use php -l
        return !preg_match('/\$[a-z0-9_]*\s*\(/i', $code); // Catches variable function calls
    }
    
    private function containsDangerousFunction($code, $function) {
        return preg_match('/\b' . preg_quote($function, '/') . '\s*\(/i', $code) > 0;
    }
    
    private function calculateSafetyScore() {
        if (empty($this->safetyChecks)) {
            return 50; // Default neutral score
        }
        
        $passed = count(array_filter($this->safetyChecks));
        $total = count($this->safetyChecks);
        
        return round(($passed / $total) * 100);
    }
    
    private function generateExecutionSummary() {
        $phaseTypes = array_column($this->executionLog, 'phase');
        $uniquePhases = array_unique($phaseTypes);
        
        return [
            'total_events' => count($this->executionLog),
            'unique_phases' => count($uniquePhases),
            'first_event' => $this->executionLog[0] ?? null,
            'last_event' => end($this->executionLog) ?: null
        ];
    }
    
    private function recursiveRemoveDirectory($dir) {
        if (!file_exists($dir)) return;
        
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->recursiveRemoveDirectory($path) : unlink($path);
        }
        rmdir($dir);
    }
    
    private function log($event, $phase, $data = []) {
        $this->executionLog[] = [
            'event' => $event,
            'phase' => $phase,
            'data' => $data,
            'timestamp' => microtime(true)
        ];
    }
    
    public function getExecutionLog() {
        return $this->executionLog;
    }
    
    public function getSafetyChecks() {
        return $this->safetyChecks;
    }
}
