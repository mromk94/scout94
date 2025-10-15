<?php
/**
 * Scout94 Knowledge Base - Centralized Communication Hub
 * All actors (Scout94, Auditor, Doctor, Clinic, Risk Assessor) share information here
 * Creates persistent project mapping and learning across runs
 */

class Scout94KnowledgeBase {
    private $projectPath;
    private $knowledgeFile;
    private $knowledge = [];
    
    // Actor types
    const ACTOR_SCOUT94 = 'scout94';
    const ACTOR_AUDITOR = 'auditor';
    const ACTOR_DOCTOR = 'doctor';
    const ACTOR_CLINIC = 'clinic';
    const ACTOR_RISK_ASSESSOR = 'risk_assessor';
    const ACTOR_SANDBOX = 'sandbox';
    
    public function __construct($projectPath) {
        $this->projectPath = $projectPath;
        $this->knowledgeFile = $projectPath . '/.scout94_knowledge.json';
        $this->loadKnowledge();
    }
    
    private function loadKnowledge() {
        if (file_exists($this->knowledgeFile)) {
            $content = file_get_contents($this->knowledgeFile);
            $this->knowledge = json_decode($content, true) ?? [];
        } else {
            $this->initializeKnowledge();
        }
    }
    
    private function initializeKnowledge() {
        $this->knowledge = [
            'project_info' => [
                'path' => $this->projectPath,
                'first_scan' => date('Y-m-d H:i:s'),
                'total_runs' => 0,
                'last_run' => null
            ],
            'project_map' => [
                'structure' => [],
                'endpoints' => [],
                'critical_files' => [],
                'dependencies' => []
            ],
            'message_board' => [
                'messages' => [],
                'last_updated' => null
            ],
            'learning_history' => [
                'successful_patterns' => [],
                'known_issues' => [],
                'applied_fixes' => []
            ],
            'actor_states' => [
                self::ACTOR_SCOUT94 => ['status' => 'idle', 'last_run' => null],
                self::ACTOR_AUDITOR => ['status' => 'idle', 'last_audit' => null],
                self::ACTOR_DOCTOR => ['status' => 'idle', 'last_diagnosis' => null],
                self::ACTOR_CLINIC => ['status' => 'idle', 'last_treatment' => null],
                self::ACTOR_RISK_ASSESSOR => ['status' => 'idle', 'last_assessment' => null],
                self::ACTOR_SANDBOX => ['status' => 'idle', 'last_test' => null]
            ],
            'health_trends' => [
                'scores' => [],
                'improvements' => [],
                'degradations' => []
            ]
        ];
        
        $this->save();
    }
    
    // ============================================
    // MESSAGE BOARD - Actor Communication
    // ============================================
    
    public function postMessage($fromActor, $toActor, $messageType, $content, $priority = 'normal') {
        $message = [
            'id' => uniqid('msg_'),
            'timestamp' => date('Y-m-d H:i:s'),
            'from' => $fromActor,
            'to' => $toActor,
            'type' => $messageType,
            'priority' => $priority,
            'content' => $content,
            'read' => false
        ];
        
        $this->knowledge['message_board']['messages'][] = $message;
        $this->knowledge['message_board']['last_updated'] = date('Y-m-d H:i:s');
        
        $this->save();
        
        return $message['id'];
    }
    
    public function getMessagesFor($actor, $unreadOnly = false) {
        $messages = $this->knowledge['message_board']['messages'] ?? [];
        
        $filtered = array_filter($messages, function($msg) use ($actor, $unreadOnly) {
            $toMatch = ($msg['to'] === $actor || $msg['to'] === 'all');
            if ($unreadOnly) {
                return $toMatch && !$msg['read'];
            }
            return $toMatch;
        });
        
        // Sort by priority and timestamp
        usort($filtered, function($a, $b) {
            $priorityOrder = ['critical' => 0, 'high' => 1, 'normal' => 2, 'low' => 3];
            $priorityCompare = ($priorityOrder[$a['priority']] ?? 2) <=> ($priorityOrder[$b['priority']] ?? 2);
            
            if ($priorityCompare !== 0) {
                return $priorityCompare;
            }
            
            return strcmp($b['timestamp'], $a['timestamp']);
        });
        
        return $filtered;
    }
    
    public function markMessageAsRead($messageId) {
        foreach ($this->knowledge['message_board']['messages'] as &$msg) {
            if ($msg['id'] === $messageId) {
                $msg['read'] = true;
                break;
            }
        }
        $this->save();
    }
    
    public function broadcast($fromActor, $messageType, $content, $priority = 'normal') {
        return $this->postMessage($fromActor, 'all', $messageType, $content, $priority);
    }
    
    // ============================================
    // PROJECT MAPPING
    // ============================================
    
    public function mapProject() {
        echo "🗺️  Mapping project structure...\n";
        
        // Discover structure
        $this->discoverStructure();
        $this->discoverEndpoints();
        $this->discoverCriticalFiles();
        $this->discoverDependencies();
        
        $this->save();
        
        echo "✅ Project mapped successfully\n\n";
        
        return $this->knowledge['project_map'];
    }
    
    private function discoverStructure() {
        $structure = [
            'has_backend' => is_dir($this->projectPath . '/auth-backend'),
            'has_frontend' => is_dir($this->projectPath . '/src'),
            'has_database' => file_exists($this->projectPath . '/install/schema.sql'),
            'has_htaccess' => file_exists($this->projectPath . '/.htaccess'),
            'has_config' => file_exists($this->projectPath . '/auth-backend/config.php')
        ];
        
        $this->knowledge['project_map']['structure'] = $structure;
    }
    
    private function discoverEndpoints() {
        $endpoints = [];
        
        $backendDir = $this->projectPath . '/auth-backend';
        if (is_dir($backendDir)) {
            $files = glob($backendDir . '/*.php');
            foreach ($files as $file) {
                $filename = basename($file);
                if ($filename === 'config.php') continue;
                
                $endpoints[] = [
                    'file' => $filename,
                    'path' => '/auth-backend/' . $filename,
                    'discovered' => date('Y-m-d H:i:s')
                ];
            }
        }
        
        $this->knowledge['project_map']['endpoints'] = $endpoints;
    }
    
    private function discoverCriticalFiles() {
        $criticalPaths = [
            '/install/schema.sql',
            '/.htaccess',
            '/auth-backend/config.php',
            '/src/index.jsx',
            '/public/index.html'
        ];
        
        $criticalFiles = [];
        foreach ($criticalPaths as $path) {
            $fullPath = $this->projectPath . $path;
            $criticalFiles[$path] = [
                'exists' => file_exists($fullPath),
                'size' => file_exists($fullPath) ? filesize($fullPath) : 0,
                'last_checked' => date('Y-m-d H:i:s')
            ];
        }
        
        $this->knowledge['project_map']['critical_files'] = $criticalFiles;
    }
    
    private function discoverDependencies() {
        $dependencies = [];
        
        // Check package.json
        $packageJson = $this->projectPath . '/package.json';
        if (file_exists($packageJson)) {
            $content = json_decode(file_get_contents($packageJson), true);
            $dependencies['npm'] = array_merge(
                array_keys($content['dependencies'] ?? []),
                array_keys($content['devDependencies'] ?? [])
            );
        }
        
        // Check composer.json (if exists)
        $composerJson = $this->projectPath . '/composer.json';
        if (file_exists($composerJson)) {
            $content = json_decode(file_get_contents($composerJson), true);
            $dependencies['composer'] = array_keys($content['require'] ?? []);
        }
        
        $this->knowledge['project_map']['dependencies'] = $dependencies;
    }
    
    public function getProjectMap() {
        return $this->knowledge['project_map'];
    }
    
    // ============================================
    // ACTOR STATE MANAGEMENT
    // ============================================
    
    public function updateActorState($actor, $status, $data = []) {
        if (!isset($this->knowledge['actor_states'][$actor])) {
            $this->knowledge['actor_states'][$actor] = [];
        }
        
        $this->knowledge['actor_states'][$actor]['status'] = $status;
        $this->knowledge['actor_states'][$actor]['last_update'] = date('Y-m-d H:i:s');
        
        foreach ($data as $key => $value) {
            $this->knowledge['actor_states'][$actor][$key] = $value;
        }
        
        $this->save();
    }
    
    public function getActorState($actor) {
        return $this->knowledge['actor_states'][$actor] ?? null;
    }
    
    public function getAllActorStates() {
        return $this->knowledge['actor_states'];
    }
    
    // ============================================
    // LEARNING SYSTEM
    // ============================================
    
    public function recordSuccessfulPattern($pattern, $context) {
        $this->knowledge['learning_history']['successful_patterns'][] = [
            'pattern' => $pattern,
            'context' => $context,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Keep only last 50 patterns
        $this->knowledge['learning_history']['successful_patterns'] = array_slice(
            $this->knowledge['learning_history']['successful_patterns'],
            -50
        );
        
        $this->save();
    }
    
    public function recordKnownIssue($issue, $severity, $solution = null) {
        $issueRecord = [
            'issue' => $issue,
            'severity' => $severity,
            'solution' => $solution,
            'first_seen' => date('Y-m-d H:i:s'),
            'occurrences' => 1
        ];
        
        // Check if issue already exists
        $found = false;
        foreach ($this->knowledge['learning_history']['known_issues'] as &$existing) {
            if ($existing['issue'] === $issue) {
                $existing['occurrences']++;
                $existing['last_seen'] = date('Y-m-d H:i:s');
                if ($solution) {
                    $existing['solution'] = $solution;
                }
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            $this->knowledge['learning_history']['known_issues'][] = $issueRecord;
        }
        
        $this->save();
    }
    
    public function recordAppliedFix($fix, $success, $healthGain = 0) {
        $this->knowledge['learning_history']['applied_fixes'][] = [
            'fix' => $fix,
            'success' => $success,
            'health_gain' => $healthGain,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Keep only last 100 fixes
        $this->knowledge['learning_history']['applied_fixes'] = array_slice(
            $this->knowledge['learning_history']['applied_fixes'],
            -100
        );
        
        $this->save();
    }
    
    public function getKnownIssues() {
        return $this->knowledge['learning_history']['known_issues'] ?? [];
    }
    
    public function getSuccessfulPatterns() {
        return $this->knowledge['learning_history']['successful_patterns'] ?? [];
    }
    
    // ============================================
    // HEALTH TRENDS
    // ============================================
    
    public function recordHealthScore($score, $metrics = []) {
        $this->knowledge['health_trends']['scores'][] = [
            'score' => $score,
            'metrics' => $metrics,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Calculate trends
        $this->calculateTrends();
        
        // Keep only last 100 scores
        $this->knowledge['health_trends']['scores'] = array_slice(
            $this->knowledge['health_trends']['scores'],
            -100
        );
        
        $this->save();
    }
    
    private function calculateTrends() {
        $scores = $this->knowledge['health_trends']['scores'];
        if (count($scores) < 2) {
            return;
        }
        
        $recent = array_slice($scores, -10);
        $trend = 0;
        
        for ($i = 1; $i < count($recent); $i++) {
            $diff = $recent[$i]['score'] - $recent[$i - 1]['score'];
            if ($diff > 0) {
                $this->knowledge['health_trends']['improvements'][] = [
                    'from' => $recent[$i - 1]['score'],
                    'to' => $recent[$i]['score'],
                    'gain' => $diff,
                    'timestamp' => $recent[$i]['timestamp']
                ];
            } elseif ($diff < 0) {
                $this->knowledge['health_trends']['degradations'][] = [
                    'from' => $recent[$i - 1]['score'],
                    'to' => $recent[$i]['score'],
                    'loss' => abs($diff),
                    'timestamp' => $recent[$i]['timestamp']
                ];
            }
        }
        
        // Keep only last 50 trends
        $this->knowledge['health_trends']['improvements'] = array_slice(
            $this->knowledge['health_trends']['improvements'] ?? [],
            -50
        );
        $this->knowledge['health_trends']['degradations'] = array_slice(
            $this->knowledge['health_trends']['degradations'] ?? [],
            -50
        );
    }
    
    public function getHealthTrends() {
        return $this->knowledge['health_trends'];
    }
    
    // ============================================
    // RUN TRACKING
    // ============================================
    
    public function startRun($runType) {
        $this->knowledge['project_info']['total_runs']++;
        $this->knowledge['project_info']['last_run'] = [
            'type' => $runType,
            'started' => date('Y-m-d H:i:s'),
            'status' => 'running'
        ];
        $this->save();
    }
    
    public function endRun($status, $summary = []) {
        if (isset($this->knowledge['project_info']['last_run'])) {
            $this->knowledge['project_info']['last_run']['ended'] = date('Y-m-d H:i:s');
            $this->knowledge['project_info']['last_run']['status'] = $status;
            $this->knowledge['project_info']['last_run']['summary'] = $summary;
        }
        $this->save();
    }
    
    // ============================================
    // QUERIES & INSIGHTS
    // ============================================
    
    public function getInsights() {
        $insights = [];
        
        // Issue frequency
        $issues = $this->knowledge['learning_history']['known_issues'] ?? [];
        $recurringIssues = array_filter($issues, function($issue) {
            return $issue['occurrences'] > 2;
        });
        
        if (!empty($recurringIssues)) {
            $insights[] = [
                'type' => 'recurring_issues',
                'severity' => 'high',
                'message' => count($recurringIssues) . ' recurring issues detected',
                'data' => $recurringIssues
            ];
        }
        
        // Health trends
        $scores = array_slice($this->knowledge['health_trends']['scores'] ?? [], -5);
        if (count($scores) >= 3) {
            $recentScores = array_column($scores, 'score');
            $avgRecent = array_sum($recentScores) / count($recentScores);
            
            if ($avgRecent < 50) {
                $insights[] = [
                    'type' => 'declining_health',
                    'severity' => 'high',
                    'message' => 'Health consistently low (avg: ' . round($avgRecent, 1) . ')',
                    'data' => ['recent_scores' => $recentScores]
                ];
            }
        }
        
        // Successful patterns
        $patterns = $this->knowledge['learning_history']['successful_patterns'] ?? [];
        if (count($patterns) >= 10) {
            $insights[] = [
                'type' => 'learning_progress',
                'severity' => 'info',
                'message' => count($patterns) . ' successful patterns learned',
                'data' => ['pattern_count' => count($patterns)]
            ];
        }
        
        return $insights;
    }
    
    public function generateDashboard() {
        echo "\n";
        echo "╔═══════════════════════════════════════╗\n";
        echo "║  SCOUT94 KNOWLEDGE BASE DASHBOARD    ║\n";
        echo "╚═══════════════════════════════════════╝\n\n";
        
        // Project Info
        echo "📊 PROJECT INFO:\n";
        echo "   Path: " . basename($this->projectPath) . "\n";
        echo "   Total Runs: " . $this->knowledge['project_info']['total_runs'] . "\n";
        echo "   First Scan: " . $this->knowledge['project_info']['first_scan'] . "\n\n";
        
        // Actor States
        echo "👥 ACTOR STATES:\n";
        foreach ($this->knowledge['actor_states'] as $actor => $state) {
            $emoji = $state['status'] === 'active' ? '🟢' : 
                    ($state['status'] === 'running' ? '🔄' : '⚪');
            echo "   $emoji " . ucwords(str_replace('_', ' ', $actor)) . ": " . 
                 strtoupper($state['status']) . "\n";
        }
        echo "\n";
        
        // Message Board
        $unreadMessages = array_filter(
            $this->knowledge['message_board']['messages'] ?? [],
            function($msg) { return !$msg['read']; }
        );
        echo "💬 MESSAGE BOARD:\n";
        echo "   Total Messages: " . count($this->knowledge['message_board']['messages'] ?? []) . "\n";
        echo "   Unread: " . count($unreadMessages) . "\n\n";
        
        // Learning
        echo "🧠 LEARNING:\n";
        echo "   Known Issues: " . count($this->knowledge['learning_history']['known_issues'] ?? []) . "\n";
        echo "   Successful Patterns: " . count($this->knowledge['learning_history']['successful_patterns'] ?? []) . "\n";
        echo "   Applied Fixes: " . count($this->knowledge['learning_history']['applied_fixes'] ?? []) . "\n\n";
        
        // Health Trends
        $scores = $this->knowledge['health_trends']['scores'] ?? [];
        if (!empty($scores)) {
            $latestScore = end($scores)['score'];
            echo "❤️  HEALTH:\n";
            echo "   Latest Score: " . $latestScore . "/100\n";
            echo "   Total Measurements: " . count($scores) . "\n\n";
        }
        
        // Insights
        $insights = $this->getInsights();
        if (!empty($insights)) {
            echo "💡 INSIGHTS:\n";
            foreach ($insights as $insight) {
                $emoji = $insight['severity'] === 'high' ? '🔴' : 
                        ($insight['severity'] === 'medium' ? '🟡' : '🔵');
                echo "   $emoji " . $insight['message'] . "\n";
            }
        }
        
        echo "\n";
    }
    
    // ============================================
    // PERSISTENCE
    // ============================================
    
    private function save() {
        $json = json_encode($this->knowledge, JSON_PRETTY_PRINT);
        file_put_contents($this->knowledgeFile, $json);
    }
    
    public function export() {
        return $this->knowledge;
    }
    
    public function reset() {
        $this->initializeKnowledge();
        echo "Knowledge base reset successfully.\n";
    }
}
