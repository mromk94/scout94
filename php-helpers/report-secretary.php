<?php
/**
 * Report Secretary System
 * 
 * "Secretaries" that monitor agent activities and post incremental updates
 * to the collaborative report in real-time. They summarize output without
 * overwhelming LLMs, acting as minute-takers during the process.
 * 
 * Each region gets its own secretary:
 * - Scout94Secretary: Posts test progress as tests complete
 * - ClinicSecretary: Posts diagnosis and treatment progress
 * - AuditorSecretary: Posts evaluation progress
 */

class ReportSecretary {
    protected $reportPath;
    protected $region;
    protected $agentId;
    protected $updateCount = 0;
    
    public function __construct($reportPath, $region, $agentId) {
        $this->reportPath = $reportPath;
        $this->region = $region;
        $this->agentId = $agentId;
    }
    
    /**
     * Post incremental update to report
     * @param string $update Markdown content to append
     * @param bool $isProgress Whether this is a progress update (will be replaced) or permanent
     */
    protected function postUpdate($update, $isProgress = false) {
        $this->updateCount++;
        
        // Add update marker for progress updates
        if ($isProgress) {
            $update = "<!-- PROGRESS_UPDATE_{$this->updateCount} -->\n" . $update;
        }
        
        // Signal WebSocket to write
        echo "REPORT_WRITE:" . json_encode([
            'reportPath' => $this->reportPath,
            'region' => $this->region,
            'agentId' => $this->agentId,
            'summary' => $update
        ]) . "\n";
        
        // Flush immediately
        if (ob_get_level() > 0) ob_flush();
        flush();
        
        // Small delay for processing
        usleep(300000); // 0.3 seconds
    }
}

/**
 * Scout94 Secretary
 * Posts incremental test results as tests complete
 */
class Scout94Secretary extends ReportSecretary {
    private $testsCompleted = 0;
    private $testsPassed = 0;
    private $testsFailed = 0;
    
    /**
     * Post initial "tests starting" update
     */
    public function startSession($attempt) {
        $timestamp = date('g:i A');
        $update = <<<MARKDOWN
### 🚀 Scout94 Functional Analysis - Run #$attempt

**Started:** $timestamp  
**Status:** 🔄 Tests in progress...

---

MARKDOWN;
        
        $this->postUpdate($update);
    }
    
    /**
     * Post update when a test suite completes
     */
    public function testSuiteCompleted($suiteName, $passed, $details = '') {
        $this->testsCompleted++;
        if ($passed) $this->testsPassed++;
        else $this->testsFailed++;
        
        $status = $passed ? '✅ PASS' : '❌ FAIL';
        $update = "**Test $this->testsCompleted:** $suiteName - $status";
        if ($details) {
            $update .= " _($details)_";
        }
        $update .= "  \n";
        
        $this->postUpdate($update, true); // Progress update
    }
    
    /**
     * Post summary when all tests complete
     */
    public function completeSummary($totalTests, $passed, $failed, $testOutput) {
        $passRate = $totalTests > 0 ? round(($passed / $totalTests) * 100) : 0;
        $timestamp = date('g:i A');
        
        $update = <<<MARKDOWN

---

#### 📊 Final Test Summary

**Completed:** $timestamp  
**Total Tests:** $totalTests  
**Pass Rate:** $passRate%  

| Status | Count |
|--------|-------|
| ✅ Passed | $passed |
| ❌ Failed | $failed |

MARKDOWN;

        // Add key findings from test output
        if (preg_match_all('/✅.*|❌.*|⚠️.*/', $testOutput, $matches)) {
            $update .= "\n**Key Findings:**\n\n";
            $findings = array_slice($matches[0], 0, 5); // Top 5 findings
            foreach ($findings as $finding) {
                $update .= "- " . trim($finding) . "\n";
            }
        }
        
        $update .= "\n**Next:** Handing off to Auditor for validation...\n\n";
        
        $this->postUpdate($update);
    }
}

/**
 * Clinic Secretary
 * Posts diagnosis and treatment progress
 */
class ClinicSecretary extends ReportSecretary {
    /**
     * Post when patient is admitted
     */
    public function patientAdmitted($initialHealth) {
        $timestamp = date('g:i A');
        $update = <<<MARKDOWN
### 🏥 Clinic Intervention

**Patient Admitted:** $timestamp  
**Initial Health:** $initialHealth/100  
**Status:** 🔄 Diagnosis in progress...

---

MARKDOWN;
        
        $this->postUpdate($update);
    }
    
    /**
     * Post diagnosis results
     */
    public function diagnosisComplete($diagnosis) {
        $update = <<<MARKDOWN
#### 🩺 Doctor's Diagnosis

**Health Assessment:** {$diagnosis['health_score']}/100

**Primary Issues Identified:**

MARKDOWN;

        if (isset($diagnosis['issues']) && is_array($diagnosis['issues'])) {
            $priority = 1;
            foreach ($diagnosis['issues'] as $issue) {
                $update .= "$priority. **{$issue['severity']}** - {$issue['description']}\n";
                $priority++;
            }
        }
        
        $update .= "\n**Status:** Preparing treatment plan...\n\n";
        
        $this->postUpdate($update);
    }
    
    /**
     * Post when treatment starts
     */
    public function treatmentStarted($planCount) {
        $update = <<<MARKDOWN
#### 💉 Nurse's Treatment Log

**Treatments Prescribed:** $planCount  
**Status:** 🔄 Applying treatments...

MARKDOWN;
        
        $this->postUpdate($update);
    }
    
    /**
     * Post each treatment application
     */
    public function treatmentApplied($treatmentNum, $type, $success, $riskScore) {
        $status = $success ? '✅ SUCCESS' : '❌ FAILED';
        $risk = $riskScore < 30 ? 'SAFE' : ($riskScore < 60 ? 'MODERATE' : 'HIGH');
        
        $update = "**Treatment $treatmentNum:** $type - $status (Risk: $risk)  \n";
        
        $this->postUpdate($update, true);
    }
    
    /**
     * Post final outcome
     */
    public function treatmentComplete($initialHealth, $finalHealth, $success) {
        $healthGain = $finalHealth - $initialHealth;
        $outcome = $success ? 'Patient ready for re-testing' : 'Treatment incomplete';
        
        $update = <<<MARKDOWN

---

#### 📊 Treatment Outcome

**Initial Health:** $initialHealth/100  
**Final Health:** $finalHealth/100  
**Health Gain:** +$healthGain  
**Outcome:** $outcome

MARKDOWN;
        
        $this->postUpdate($update);
    }
}

/**
 * Auditor Secretary
 * Posts evaluation progress
 */
class AuditorSecretary extends ReportSecretary {
    /**
     * Post when audit starts
     */
    public function auditStarted($llmModel) {
        $timestamp = date('g:i A');
        $update = <<<MARKDOWN
### 📊 Auditor Evaluation

**LLM Model:** $llmModel  
**Evaluation Started:** $timestamp  
**Status:** 🔄 Analyzing test results...

---

MARKDOWN;
        
        $this->postUpdate($update);
    }
    
    /**
     * Post evaluation criteria being checked
     */
    public function evaluatingCriteria($criteriaName) {
        $update = "**Evaluating:** $criteriaName...  \n";
        $this->postUpdate($update, true);
    }
    
    /**
     * Post final verdict
     */
    public function auditComplete($score, $verdict, $strengths, $gaps, $recommendations) {
        $timestamp = date('g:i A');
        $verdictEmoji = $score >= 5 ? '✅' : '❌';
        
        $update = <<<MARKDOWN
#### 📊 Final Evaluation

**Completed:** $timestamp  
**Final Score:** $score/10  
**Verdict:** $verdictEmoji $verdict

MARKDOWN;

        // Strengths
        if (is_array($strengths) && count($strengths) > 0) {
            $update .= "\n**Strengths:**\n\n";
            foreach (array_slice($strengths, 0, 3) as $strength) {
                $update .= "- ✅ $strength\n";
            }
        }
        
        // Gaps
        if (is_array($gaps) && count($gaps) > 0) {
            $update .= "\n**Areas for Improvement:**\n\n";
            foreach (array_slice($gaps, 0, 3) as $gap) {
                $update .= "- ⚠️ $gap\n";
            }
        }
        
        // Recommendations
        if (is_array($recommendations) && count($recommendations) > 0) {
            $update .= "\n**Recommendations:**\n\n";
            foreach (array_slice($recommendations, 0, 3) as $rec) {
                $update .= "- 💡 $rec\n";
            }
        }
        
        $update .= "\n";
        
        $this->postUpdate($update);
    }
}

?>
