<?php
/**
 * LLM Factory - Multi-LLM Architecture
 * Routes different roles to specialized LLMs
 * 
 * Architecture:
 * - Scout94 → GPT-4o (fast, structured)
 * - Clinic/Doctor → Claude 3.5 Sonnet (best code generation)
 * - Auditor → Gemini 2.5 Flash (independent, free)
 * - Risk → GPT-4o-mini (fast, cheap)
 */

class LLMFactory {
    
    /**
     * Create LLM client for specific role
     */
    public static function create($role) {
        return match($role) {
            'scout94' => new GPT4oClient(),
            'doctor' => new ClaudeClient(),
            'clinic' => new ClaudeClient(),
            'auditor' => new GeminiClient(),
            'risk' => new GPT4oMiniClient(),
            default => throw new Exception("Unknown role: $role")
        };
    }
    
    /**
     * Get LLM info for role
     */
    public static function getInfo($role) {
        return match($role) {
            'scout94' => [
                'name' => 'GPT-4o',
                'provider' => 'OpenAI',
                'cost_per_1k' => 0.005,
                'strength' => 'Fast structured output'
            ],
            'doctor' => [
                'name' => 'Claude 3.5 Sonnet',
                'provider' => 'Anthropic',
                'cost_per_1k' => 0.003,
                'strength' => 'Best reasoning & diagnosis'
            ],
            'clinic' => [
                'name' => 'Claude 3.5 Sonnet',
                'provider' => 'Anthropic',
                'cost_per_1k' => 0.003,
                'strength' => 'Superior code generation'
            ],
            'auditor' => [
                'name' => 'Gemini 2.5 Flash',
                'provider' => 'Google',
                'cost_per_1k' => 0,
                'strength' => 'Independent review, free'
            ],
            'risk' => [
                'name' => 'GPT-4o-mini',
                'provider' => 'OpenAI',
                'cost_per_1k' => 0.00015,
                'strength' => 'Fast pattern matching'
            ],
            default => null
        };
    }
}

/**
 * GPT-4o Client
 */
class GPT4oClient {
    private $apiKey;
    private $model = 'gpt-4o';
    
    public function __construct() {
        $this->apiKey = $this->loadApiKey('OPENAI_API_KEY');
    }
    
    public function analyze($content, $prompt) {
        $messages = [
            ['role' => 'system', 'content' => $prompt],
            ['role' => 'user', 'content' => $content]
        ];
        
        return $this->makeRequest($messages);
    }
    
    private function makeRequest($messages) {
        $ch = curl_init('https://api.openai.com/v1/chat/completions');
        
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'model' => $this->model,
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 4000
            ])
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("GPT-4o API error: $httpCode - $response");
        }
        
        $data = json_decode($response, true);
        return $data['choices'][0]['message']['content'] ?? '';
    }
    
    private function loadApiKey($keyName) {
        $envFile = __DIR__ . '/.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, $keyName . '=') === 0) {
                    return trim(substr($line, strlen($keyName) + 1));
                }
            }
        }
        
        $key = getenv($keyName);
        if (!$key) {
            throw new Exception("$keyName not found in .env or environment");
        }
        return $key;
    }
}

/**
 * GPT-4o-mini Client
 */
class GPT4oMiniClient extends GPT4oClient {
    private $model = 'gpt-4o-mini';
}

/**
 * Claude Client
 */
class ClaudeClient {
    private $apiKey;
    private $model = 'claude-3-5-sonnet-20241022';
    
    public function __construct() {
        $this->apiKey = $this->loadApiKey('ANTHROPIC_API_KEY');
    }
    
    public function analyze($content, $prompt) {
        return $this->makeRequest($prompt, $content);
    }
    
    public function generateCode($instructions, $context = '') {
        $prompt = "You are an expert code generator. Generate production-ready code based on these instructions:\n\n$instructions";
        if ($context) {
            $prompt .= "\n\nContext:\n$context";
        }
        return $this->makeRequest($prompt, '');
    }
    
    private function makeRequest($systemPrompt, $userContent) {
        $ch = curl_init('https://api.anthropic.com/v1/messages');
        
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-api-key: ' . $this->apiKey,
                'anthropic-version: 2023-06-01'
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'model' => $this->model,
                'max_tokens' => 8000,
                'system' => $systemPrompt,
                'messages' => [
                    ['role' => 'user', 'content' => $userContent ?: 'Proceed with the task.']
                ]
            ])
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Claude API error: $httpCode - $response");
        }
        
        $data = json_decode($response, true);
        return $data['content'][0]['text'] ?? '';
    }
    
    private function loadApiKey($keyName) {
        $envFile = __DIR__ . '/.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, $keyName . '=') === 0) {
                    return trim(substr($line, strlen($keyName) + 1));
                }
            }
        }
        
        $key = getenv($keyName);
        if (!$key) {
            throw new Exception("$keyName not found in .env or environment");
        }
        return $key;
    }
}

/**
 * Gemini Client (already exists, just wrapper)
 */
class GeminiClient {
    private $auditor;
    
    public function __construct() {
        require_once __DIR__ . '/auditor.php';
        $this->auditor = new Scout94Auditor('');
    }
    
    public function analyze($content, $prompt = '') {
        // Use existing Gemini auditor
        return $this->auditor->audit($content);
    }
}
