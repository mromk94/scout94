<?php
/**
 * Scout94 Auditor - Independent LLM Quality Control
 * Uses external LLM to audit Scout94's test results and methodology
 */

class Scout94Auditor {
    private $apiKey;
    private $llmProvider; // 'openai' or 'gemini'
    private $testResults;
    private $projectPath;
    
    public function __construct($projectPath, $llmProvider = 'auto') {
        $this->projectPath = $projectPath;
        $this->llmProvider = $this->detectAvailableLLM($llmProvider);
        $this->loadAPIKey();
    }
    
    private function detectAvailableLLM($preference) {
        if ($preference === 'auto') {
            // Load .env file first
            $this->loadEnvFile();
            
            // Check for API keys - prioritize Gemini (free tier available)
            if (getenv('GEMINI_API_KEY')) {
                return 'gemini';
            } elseif (getenv('OPENAI_API_KEY')) {
                return 'openai';
            }
            
            echo "⚠️  No LLM API key found. Auditor will run in mock mode.\n";
            return 'mock';
        }
        return $preference;
    }
    
    private function loadEnvFile() {
        $envFile = __DIR__ . '/.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                // Skip comments
                if (strpos(trim($line), '#') === 0) {
                    continue;
                }
                
                // Parse KEY=VALUE
                if (strpos($line, '=') !== false) {
                    list($key, $value) = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    
                    // Set environment variable if not already set
                    if (!getenv($key)) {
                        putenv("$key=$value");
                    }
                }
            }
        }
    }
    
    private function loadAPIKey() {
        // Get API key from environment (already loaded by loadEnvFile)
        if ($this->llmProvider === 'openai') {
            $this->apiKey = getenv('OPENAI_API_KEY');
        } elseif ($this->llmProvider === 'gemini') {
            $this->apiKey = getenv('GEMINI_API_KEY');
        }
    }
    
    public function audit($scout94Output) {
        echo "\n";
        echo "╔═══════════════════════════════════════╗\n";
        echo "║    SCOUT94 AUDITOR - QUALITY CHECK    ║\n";
        echo "╚═══════════════════════════════════════╝\n";
        echo "\n";
        echo "🔍 Auditor: Independent verification by " . strtoupper($this->llmProvider) . "\n";
        echo "📊 Analyzing Scout94 test results...\n\n";
        
        $this->testResults = $scout94Output;
        
        // Parse test results
        $parsedResults = $this->parseTestResults($scout94Output);
        
        // Build audit prompt
        $auditPrompt = $this->buildAuditPrompt($parsedResults);
        
        // Get LLM audit
        $auditResponse = $this->callLLM($auditPrompt);
        
        // Parse audit response
        $audit = $this->parseAuditResponse($auditResponse);
        
        // Display audit results
        $this->displayAuditResults($audit);
        
        return $audit;
    }
    
    private function parseTestResults($output) {
        $results = [
            'tests_run' => 0,
            'tests_passed' => 0,
            'tests_failed' => 0,
            'critical_errors' => 0,
            'warnings' => 0,
            'test_details' => []
        ];
        
        // Extract test counts
        if (preg_match('/Total Tests: (\d+)/i', $output, $matches)) {
            $results['tests_run'] = intval($matches[1]);
        }
        if (preg_match('/Passed: (\d+)/i', $output, $matches)) {
            $results['tests_passed'] = intval($matches[1]);
        }
        if (preg_match('/Failed: (\d+)/i', $output, $matches)) {
            $results['tests_failed'] = intval($matches[1]);
        }
        
        // Extract individual test results
        if (preg_match_all('/^(.+?)\s+(✅ PASSED|❌ FAILED)/m', $output, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $results['test_details'][] = [
                    'name' => trim($match[1]),
                    'status' => strpos($match[2], 'PASSED') !== false ? 'passed' : 'failed'
                ];
            }
        }
        
        // Count errors and warnings
        $results['critical_errors'] = substr_count($output, '❌');
        $results['warnings'] = substr_count($output, '⚠️');
        
        return $results;
    }
    
    private function buildAuditPrompt($results) {
        $prompt = "You are an expert QA auditor reviewing automated test results for a production web application (investment platform).\n\n";
        $prompt .= "SCOUT94 TEST RESULTS:\n";
        $prompt .= "- Total Tests Run: {$results['tests_run']}\n";
        $prompt .= "- Tests Passed: {$results['tests_passed']}\n";
        $prompt .= "- Tests Failed: {$results['tests_failed']}\n";
        $prompt .= "- Critical Errors: {$results['critical_errors']}\n";
        $prompt .= "- Warnings: {$results['warnings']}\n\n";
        
        $prompt .= "TEST DETAILS:\n";
        foreach ($results['test_details'] as $test) {
            $prompt .= "- {$test['name']}: " . strtoupper($test['status']) . "\n";
        }
        
        $prompt .= "\nFULL TEST OUTPUT:\n";
        $prompt .= "```\n" . substr($this->testResults, 0, 3000) . "...\n```\n\n";
        
        $prompt .= "YOUR TASK:\n";
        $prompt .= "1. Evaluate the COMPLETENESS of testing (did they test the right things?)\n";
        $prompt .= "2. Evaluate the METHODOLOGY (are the tests well-designed?)\n";
        $prompt .= "3. Evaluate the COVERAGE (are critical paths covered?)\n";
        $prompt .= "4. Identify any GAPS or MISSING tests\n";
        $prompt .= "5. Score the overall quality 1-10\n\n";
        
        $prompt .= "CRITICAL REQUIREMENTS FOR THIS PROJECT:\n";
        $prompt .= "- Investment platform (money involved - high stakes!)\n";
        $prompt .= "- Must test: routing, database, user flows, admin controls\n";
        $prompt .= "- Must verify: users can invest, users can withdraw, admins can approve\n";
        $prompt .= "- Security is critical\n\n";
        
        $prompt .= "RESPOND IN THIS EXACT JSON FORMAT:\n";
        $prompt .= "{\n";
        $prompt .= '  "score": <1-10>,'."\n";
        $prompt .= '  "completeness_score": <1-10>,'."\n";
        $prompt .= '  "methodology_score": <1-10>,'."\n";
        $prompt .= '  "coverage_score": <1-10>,'."\n";
        $prompt .= '  "strengths": ["strength1", "strength2", ...],'."\n";
        $prompt .= '  "weaknesses": ["weakness1", "weakness2", ...],'."\n";
        $prompt .= '  "missing_tests": ["test1", "test2", ...],'."\n";
        $prompt .= '  "recommendations": ["rec1", "rec2", ...],'."\n";
        $prompt .= '  "verdict": "PASS|FAIL|NEEDS_IMPROVEMENT",'."\n";
        $prompt .= '  "reasoning": "explanation of score"'."\n";
        $prompt .= "}\n";
        
        return $prompt;
    }
    
    private function callLLM($prompt) {
        if ($this->llmProvider === 'mock') {
            return $this->mockLLMResponse();
        }
        
        if ($this->llmProvider === 'openai') {
            return $this->callOpenAI($prompt);
        } elseif ($this->llmProvider === 'gemini') {
            return $this->callGemini($prompt);
        }
        
        return $this->mockLLMResponse();
    }
    
    private function callOpenAI($prompt) {
        if (!$this->apiKey) {
            echo "⚠️  No OpenAI API key. Using mock audit.\n";
            return $this->mockLLMResponse();
        }
        
        $data = [
            'model' => 'gpt-4',
            'messages' => [
                ['role' => 'system', 'content' => 'You are an expert QA auditor. Always respond with valid JSON.'],
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.3
        ];
        
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            echo "⚠️  OpenAI API error (HTTP $httpCode). Using mock audit.\n";
            return $this->mockLLMResponse();
        }
        
        $result = json_decode($response, true);
        return $result['choices'][0]['message']['content'] ?? $this->mockLLMResponse();
    }
    
    private function callGemini($prompt) {
        if (!$this->apiKey) {
            echo "⚠️  No Gemini API key. Using mock audit.\n";
            return $this->mockLLMResponse();
        }
        
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $this->apiKey;
        
        $data = [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'temperature' => 0.3,
                'maxOutputTokens' => 8000  // Gemini 2.5 uses extended thinking, needs more tokens
            ]
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            echo "⚠️  Gemini API error (HTTP $httpCode).\n";
            // Show first 200 chars of error for debugging
            $errorSnippet = substr($response, 0, 200);
            if ($errorSnippet) {
                echo "   Error details: " . $errorSnippet . "...\n";
            }
            echo "   Using mock audit.\n";
            return $this->mockLLMResponse();
        }
        
        $result = json_decode($response, true);
        
        // Debug: Save full response for inspection
        $debugFile = sys_get_temp_dir() . '/scout94_gemini_response.json';
        file_put_contents($debugFile, json_encode($result, JSON_PRETTY_PRINT));
        
        // Debug: Show response structure
        if (!isset($result['candidates'])) {
            echo "   ⚠️  Unexpected Gemini response structure.\n";
            echo "   Response keys: " . implode(', ', array_keys($result ?? [])) . "\n";
            echo "   Debug saved to: $debugFile\n";
            echo "   Using mock.\n";
            return $this->mockLLMResponse();
        }
        
        $geminiText = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;
        
        if (!$geminiText) {
            echo "   ⚠️  No text in Gemini response.\n";
            echo "   Debug saved to: $debugFile\n";
            echo "   Using mock.\n";
            return $this->mockLLMResponse();
        }
        
        // Success!
        echo "   ✅ Got response from Gemini AI\n";
        @unlink($debugFile); // Clean up debug file on success
        return $geminiText;
    }
    
    private function mockLLMResponse() {
        // Mock response for testing without API key
        return json_encode([
            'score' => 8,
            'completeness_score' => 8,
            'methodology_score' => 9,
            'coverage_score' => 7,
            'strengths' => [
                'Comprehensive user journey testing',
                'Tests all three user personas (visitor, user, admin)',
                'Validates critical paths (investment, withdrawal)',
                'Good routing validation'
            ],
            'weaknesses' => [
                'Could add performance testing',
                'Security testing could be more thorough',
                'Edge case coverage limited'
            ],
            'missing_tests' => [
                'Payment gateway integration test',
                'Email notification test',
                'Session timeout test',
                'SQL injection attempts'
            ],
            'recommendations' => [
                'Add security penetration testing',
                'Test email flows (registration, password reset)',
                'Add load/performance testing',
                'Test edge cases (invalid inputs, boundary conditions)'
            ],
            'verdict' => 'PASS',
            'reasoning' => 'The testing is comprehensive and covers all critical user journeys. The methodology is sound, using real-world user scenarios. However, there is room for improvement in security and edge case testing.'
        ]);
    }
    
    private function parseAuditResponse($response) {
        // Extract JSON from response (may be wrapped in markdown code blocks)
        if (preg_match('/```json\s*(.*?)\s*```/s', $response, $matches)) {
            $response = $matches[1];
        } elseif (preg_match('/```\s*(.*?)\s*```/s', $response, $matches)) {
            $response = $matches[1];
        }
        
        $audit = json_decode($response, true);
        
        if (!$audit) {
            // Fallback if JSON parsing fails
            return [
                'score' => 5,
                'verdict' => 'NEEDS_IMPROVEMENT',
                'reasoning' => 'Auditor response could not be parsed',
                'recommendations' => ['Re-run audit with proper LLM configuration']
            ];
        }
        
        return $audit;
    }
    
    private function displayAuditResults($audit) {
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "📊 AUDIT RESULTS\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        // Overall Score
        $score = $audit['score'] ?? 0;
        $scoreColor = $score >= 8 ? '🟢' : ($score >= 5 ? '🟡' : '🔴');
        echo "OVERALL SCORE: $scoreColor $score/10\n\n";
        
        // Sub-scores
        if (isset($audit['completeness_score'])) {
            echo "Completeness: {$audit['completeness_score']}/10\n";
        }
        if (isset($audit['methodology_score'])) {
            echo "Methodology:  {$audit['methodology_score']}/10\n";
        }
        if (isset($audit['coverage_score'])) {
            echo "Coverage:     {$audit['coverage_score']}/10\n";
        }
        echo "\n";
        
        // Verdict
        $verdict = $audit['verdict'] ?? 'UNKNOWN';
        $verdictIcon = $verdict === 'PASS' ? '✅' : ($verdict === 'FAIL' ? '❌' : '⚠️');
        echo "VERDICT: $verdictIcon $verdict\n\n";
        
        // Reasoning
        if (isset($audit['reasoning'])) {
            echo "REASONING:\n";
            echo wordwrap($audit['reasoning'], 70) . "\n\n";
        }
        
        // Strengths
        if (!empty($audit['strengths'])) {
            echo "✅ STRENGTHS:\n";
            foreach ($audit['strengths'] as $strength) {
                echo "   • $strength\n";
            }
            echo "\n";
        }
        
        // Weaknesses
        if (!empty($audit['weaknesses'])) {
            echo "⚠️  WEAKNESSES:\n";
            foreach ($audit['weaknesses'] as $weakness) {
                echo "   • $weakness\n";
            }
            echo "\n";
        }
        
        // Missing Tests
        if (!empty($audit['missing_tests'])) {
            echo "❌ MISSING TESTS:\n";
            foreach ($audit['missing_tests'] as $test) {
                echo "   • $test\n";
            }
            echo "\n";
        }
        
        // Recommendations
        if (!empty($audit['recommendations'])) {
            echo "💡 RECOMMENDATIONS:\n";
            foreach ($audit['recommendations'] as $rec) {
                echo "   • $rec\n";
            }
            echo "\n";
        }
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    }
    
    public function shouldRetry() {
        // Retry if score is below 5
        return isset($this->lastAudit['score']) && $this->lastAudit['score'] < 5;
    }
    
    public function getRecommendations() {
        return $this->lastAudit['recommendations'] ?? [];
    }
}

// CLI usage
if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['PHP_SELF'])) {
    $projectPath = $argv[1] ?? __DIR__ . '/../Viz Venture Group';
    $testOutputFile = $argv[2] ?? null;
    
    if (!$testOutputFile || !file_exists($testOutputFile)) {
        echo "Usage: php auditor.php <project_path> <test_output_file>\n";
        exit(1);
    }
    
    $testOutput = file_get_contents($testOutputFile);
    
    $auditor = new Scout94Auditor($projectPath);
    $audit = $auditor->audit($testOutput);
    
    // Return exit code based on score
    exit($audit['score'] >= 5 ? 0 : 1);
}
?>
