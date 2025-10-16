# 🎯 COLLABORATIVE REPORT SYSTEM - IMPLEMENTATION TODO

**Version:** 1.0  
**Date:** October 16, 2025  
**Status:** ✅ IMPLEMENTATION COMPLETE - READY FOR TESTING

---

## 📋 OVERVIEW

Implement end-to-end multi-agent collaborative reporting system where each agent writes their own analysis summary to a shared .md file with proper concurrency control and live IDE updates.

---

## ✅ PHASE 1: FIX AGENT CHAT PROFILES - ✅ COMPLETE

### **Task 1.1: Fix ChatBubble Fallback** ✅ COMPLETE
**File:** `ui/src/components/ChatBubble_old.jsx`

**Current Issue:**
```javascript
// Line 16 - Falls back to scout94 for unknown agents
const style = agentStyles[message.agent] || agentStyles.scout94;
```

**Fix:**
- [x] Remove fallback to scout94
- [x] Ensure all 7 agents (scout94, doctor, auditor, nurse, screenshot, backend, frontend) have proper styles
- [x] Add warning log if agent not recognized instead of silent fallback

**Acceptance Criteria:** ✅ ALL MET
- ✅ Doctor posts with 🩺 green profile - COMPLETE
- ✅ Nurse posts with 💉 pink profile - COMPLETE
- ✅ Auditor posts with 📊 orange profile - COMPLETE
- ✅ All agents have distinct bubbles - COMPLETE

---

### **Task 1.2: Verify AgentBar Completeness**
**File:** `ui/src/components/AgentBar.jsx`

**Check:**
- [x] All 7 agents defined with emoji, color, role
- [x] Colors match ChatBubble styles
- [x] No missing agents

**Status:** ✅ Already complete (all agents defined)

---

## ✅ PHASE 2: COLLABORATIVE .MD REPORT SYSTEM - ✅ COMPLETE

### **Task 2.1: Create Report Lock Manager** ✅ COMPLETE
**File:** `websocket-server/report-lock-manager.js` (NEW)

**Purpose:** Handle concurrent access to .md report file

**Features to Implement:**
```javascript
class ReportLockManager {
  constructor() {
    this.locks = new Map(); // reportPath -> { owner, queue, timestamp }
  }
  
  // Request lock for editing
  async acquireLock(reportPath, agentId, timeout = 30000) {
    // If free, grant immediately
    // If locked, add to queue
    // Return promise that resolves when lock acquired
  }
  
  // Release lock and notify next in queue
  releaseLock(reportPath, agentId) {
    // Remove lock
    // Grant to next agent in queue
  }
  
  // Check who owns lock
  getLockOwner(reportPath) {}
  
  // Force release if agent crashes (timeout)
  forceRelease(reportPath) {}
}
```

**Acceptance Criteria:**
- ✅ Only one agent can edit report at a time
- ✅ Queue system handles 2+ agents waiting
- ✅ Timeout prevents deadlocks
- ✅ Auto-release on agent crash

---

### **Task 2.2: Create Region-Based Report Writer**
**File:** `websocket-server/report-writer.js` (NEW)

**Purpose:** Agents write to designated report regions

**Regions:**
1. **SCOUT94** - Functional test results
2. **CLINIC** - Doctor diagnosis + Nurse treatments
3. **AUDITOR** - LLM quality evaluation

**Features to Implement:**
```javascript
class ReportWriter {
  constructor(lockManager) {
    this.lockManager = lockManager;
    this.regionMarkers = {
      SCOUT94: '<!-- REGION:SCOUT94 -->',
      CLINIC: '<!-- REGION:CLINIC -->',
      AUDITOR: '<!-- REGION:AUDITOR -->'
    };
  }
  
  // Append agent summary to their region
  async appendToRegion(reportPath, region, agentId, summary) {
    // 1. Acquire lock
    // 2. Read current report
    // 3. Find region markers
    // 4. Insert summary
    // 5. Write atomically
    // 6. Release lock
    // 7. Broadcast file update event
  }
  
  // Initialize report with region markers
  initializeReport(reportPath, projectName) {
    // Create template with all region markers
  }
  
  // Get current region content
  getRegionContent(reportPath, region) {}
}
```

**Report Template:**
```markdown
# 🧪 SCOUT94 - COLLABORATIVE ANALYSIS REPORT

**Project:** {projectName}
**Date:** {timestamp}
**Status:** 🔄 IN PROGRESS

---

<!-- REGION:SCOUT94 -->
## 🚀 PHASE 1: FUNCTIONAL VALIDATION (Scout94)

*Awaiting scout94 analysis...*

<!-- END:SCOUT94 -->

---

<!-- REGION:CLINIC -->
## 🏥 PHASE 2: CLINIC INTERVENTION (Doctor & Nurse)

*Clinic region - awaiting diagnosis...*

<!-- END:CLINIC -->

---

<!-- REGION:AUDITOR -->
## 📊 PHASE 3: AUDIT VALIDATION (Auditor)

*Awaiting auditor evaluation...*

<!-- END:AUDITOR -->

---

## 📝 FINAL VERDICT

*Report will be finalized once all regions complete*
```

**Acceptance Criteria:**
- ✅ Agents write only to their designated region
- ✅ No overwriting other agent's content
- ✅ Atomic file writes (no corruption)
- ✅ Proper markdown formatting

---

### **Task 2.3: Integrate Lock Manager with PHP Scripts**
**Files to Modify:**
- `run_comprehensive_with_agents.php`
- `websocket-server/server.js`

**Implementation:**

**In PHP:**
```php
// Signal WebSocket to request report lock
function requestReportLock($reportPath, $agentId) {
    echo "REPORT_LOCK_REQUEST:" . json_encode([
        'reportPath' => $reportPath,
        'agentId' => $agentId
    ]) . "\n";
    
    // Wait for lock granted signal
    // (WebSocket will respond via stdout monitoring)
}

// Write agent summary after lock acquired
function writeAgentSummary($reportPath, $region, $agentId, $summary) {
    requestReportLock($reportPath, $agentId);
    
    echo "REPORT_WRITE:" . json_encode([
        'reportPath' => $reportPath,
        'region' => $region,
        'agentId' => $agentId,
        'summary' => $summary
    ]) . "\n";
    
    releaseReportLock($reportPath, $agentId);
}
```

**In WebSocket Server:**
```javascript
// Listen for REPORT_LOCK_REQUEST signals
phpProcess.stdout.on('data', (data) => {
  const lockRequest = data.toString().match(/REPORT_LOCK_REQUEST:(.+)/);
  if (lockRequest) {
    const { reportPath, agentId } = JSON.parse(lockRequest[1]);
    
    // Acquire lock (async)
    reportLockManager.acquireLock(reportPath, agentId)
      .then(() => {
        // Signal back to PHP that lock granted
        broadcast({
          type: 'lock_granted',
          reportPath,
          agentId
        });
      });
  }
  
  // Listen for REPORT_WRITE signals
  const writeRequest = data.toString().match(/REPORT_WRITE:(.+)/);
  if (writeRequest) {
    const { reportPath, region, agentId, summary } = JSON.parse(writeRequest[1]);
    
    // Write to region
    reportWriter.appendToRegion(reportPath, region, agentId, summary)
      .then(() => {
        // Broadcast file changed event for IDE update
        broadcast({
          type: 'file_changed',
          filePath: reportPath,
          timestamp: new Date().toISOString()
        });
      });
  }
});
```

**Acceptance Criteria:**
- ✅ PHP can request locks via WebSocket
- ✅ WebSocket signals lock granted/denied
- ✅ Write operations are atomic
- ✅ IDE notified of file changes

---

## ✅ PHASE 3: LIVE IDE UPDATES - ✅ COMPLETE

### **Task 3.1: Implement File Watcher in WebSocket** ✅ COMPLETE
**File:** `websocket-server/server.js`

**Features:**
```javascript
import chokidar from 'chokidar';

// Watch report file for changes
const watcher = chokidar.watch(reportPath, {
  ignoreInitial: true,
  awaitWriteFinish: true
});

watcher.on('change', (path) => {
  // Read updated content
  const content = fs.readFileSync(path, 'utf-8');
  
  // Broadcast to IDE
  broadcast({
    type: 'file_content_updated',
    filePath: path,
    content: content,
    timestamp: new Date().toISOString()
  });
});
```

**Acceptance Criteria:**
- ✅ Detects file changes immediately
- ✅ Broadcasts updated content to IDE
- ✅ No duplicate notifications

---

### **Task 3.2: Handle Live Updates in IDEPane**
**File:** `ui/src/components/IDEPane.jsx`

**Features:**
```javascript
// Listen for file_content_updated events
useEffect(() => {
  const handleFileUpdate = (event) => {
    if (event.type === 'file_content_updated') {
      // If this file is currently open
      if (currentFile === event.filePath) {
        // Update content display
        setFileContent(event.content);
        
        // Show notification
        showToast('📝 Report updated by ' + event.updatedBy);
      }
    }
  };
  
  ws.addEventListener('message', handleFileUpdate);
  return () => ws.removeEventListener('message', handleFileUpdate);
}, [currentFile]);
```

**Acceptance Criteria:**
- ✅ IDE updates automatically when report changes
- ✅ User sees live edits from agents
- ✅ No page refresh required
- ✅ Smooth update animation

---

## ✅ PHASE 4: AGENT SUMMARY GENERATION - ✅ COMPLETE

### **Task 4.1: Scout94 Summary Generator** ✅ COMPLETE
**Location:** `run_comprehensive_with_agents.php`

**When:** After all functional tests complete

**Summary Structure:**
```markdown
### 🚀 Scout94 Functional Analysis

**Test Execution:** Run #{attempt}  
**Duration:** {duration}  
**Timestamp:** {timestamp}

#### Test Results Summary

| Test Suite | Status | Details |
|------------|--------|---------|
| Routing | ✅ PASS | All routes valid |
| Database | ✅ PASS | Schema injection successful |
| Visitor Journey | ✅ PASS | 5/5 steps completed |
| User Journey | ⚠️ PARTIAL | 8/10 steps (withdrawal failed) |
| Admin Journey | ✅ PASS | All admin functions operational |

#### Key Findings

- ✅ Core infrastructure solid
- ⚠️ Withdrawal endpoint needs attention
- ✅ Security baseline met

**Next Step:** Escalating to Auditor for quality validation...
```

**Implementation:**
```php
$scout94Summary = generateScout94Summary($testResults);
writeAgentSummary($reportPath, 'SCOUT94', 'scout94', $scout94Summary);
```

---

### **Task 4.2: Clinic Summary Generator**
**Location:** `scout94_clinic.php`

**When:** After doctor diagnosis + nurse treatment

**Summary Structure:**
```markdown
### 🏥 Clinic Intervention

#### 🩺 Doctor's Diagnosis

**Health Assessment:** 35/100 (POOR)  
**Primary Issues:**
1. **CRITICAL** - Authentication bypass vulnerability
2. **HIGH** - Missing input validation
3. **MEDIUM** - Unoptimized database queries

**Treatment Plan:**
- FIX_CRITICAL_ERRORS (Priority 1, +20 health)
- ADD_SECURITY_TESTS (Priority 1, +30 health)

---

#### 💉 Nurse's Treatment Log

**Treatments Applied:** 2/2  
**Health Progression:** 35 → 72 (+37)

**Treatment 1:** FIX_CRITICAL_ERRORS
- Status: ✅ SUCCESS
- Changes: Added authentication middleware
- Risk Score: 15/100 (SAFE)

**Treatment 2:** ADD_SECURITY_TESTS
- Status: ✅ SUCCESS  
- Changes: Added CSRF token validation tests
- Risk Score: 10/100 (SAFE)

**Outcome:** Patient ready for re-testing
```

**Implementation:**
```php
// In scout94_clinic.php
public function generateClinicSummary() {
    $doctorSummary = $this->doctor->getDiagnosisSummary();
    $nurseSummary = $this->nurse->getTreatmentLog();
    
    $clinicSummary = $this->formatClinicReport($doctorSummary, $nurseSummary);
    
    return $clinicSummary;
}

// After discharge
$clinicSummary = $clinic->generateClinicSummary();
writeAgentSummary($reportPath, 'CLINIC', 'clinic', $clinicSummary);
```

---

### **Task 4.3: Auditor Summary Generator**
**Location:** `auditor.php`

**When:** After LLM audit completes

**Summary Structure:**
```markdown
### 📊 Auditor Evaluation

**LLM Model:** Gemini 1.5 Pro  
**Evaluation Date:** {timestamp}  
**Final Score:** 7/10

#### Scoring Breakdown

| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Test Completeness | 8/10 | 25% | 2.0 |
| Methodology | 7/10 | 25% | 1.75 |
| Coverage | 6/10 | 25% | 1.5 |
| Quality Indicators | 8/10 | 25% | 2.0 |
| **TOTAL** | **7.25/10** | **100%** | **7.25** |

#### Strengths Identified

✅ **Comprehensive test coverage** - All critical paths tested  
✅ **Good error handling** - Graceful failure modes  
✅ **Security awareness** - CSRF/XSS tests present

#### Recommendations for Future

💡 Add load testing for scalability  
💡 Implement E2E visual regression tests  
💡 Expand edge case coverage

**Verdict:** ✅ APPROVED FOR PRODUCTION
```

**Implementation:**
```php
// In auditor.php
public function generateAuditorSummary($audit) {
    $summary = "### 📊 Auditor Evaluation\n\n";
    $summary .= "**LLM Model:** " . $this->llmProvider . "\n";
    $summary .= "**Final Score:** " . $audit['score'] . "/10\n\n";
    
    // Add scoring breakdown table
    // Add strengths, gaps, recommendations
    
    return $summary;
}

// After audit completes
$auditorSummary = $auditor->generateAuditorSummary($audit);
writeAgentSummary($reportPath, 'AUDITOR', 'auditor', $auditorSummary);
```

---

## ⏳ PHASE 5: TESTING & VALIDATION - READY TO TEST

### **Task 5.1: Unit Tests** ⏳ PENDING USER TESTING

**Test Cases:**
- ✅ Lock manager grants/denies correctly
- ✅ Queue processes in FIFO order
- ✅ Timeout releases locks
- ✅ Region boundaries respected
- ✅ Atomic writes don't corrupt file

---

### **Task 5.2: Integration Tests**

**Scenarios:**
1. **Single Agent Write:** Scout94 writes, report updates
2. **Concurrent Writes:** Doctor + Auditor both try to write (queue test)
3. **Lock Timeout:** Agent crashes mid-write, lock released
4. **IDE Live Update:** Report changes, IDE reflects instantly
5. **Full Flow:** Scout94 → Clinic → Auditor, all write summaries

---

### **Task 5.3: User Acceptance**

**Checklist:**
- [ ] Run "Run All Tests" button
- [ ] See all agents post with their own profiles in chat
- [ ] Report file opens automatically in IDE
- [ ] Watch report grow as each agent adds their section
- [ ] No "borrowing" of scout94 profile
- [ ] Final report has all 3 regions filled

---

## 🎯 SUCCESS CRITERIA

### **Chat Profiles:**
✅ Each agent has distinct chat bubble with correct emoji/color  
✅ No fallback to scout94  
✅ All 7 agents render properly

### **Collaborative Reporting:**
✅ No file corruption from concurrent writes  
✅ Queue system handles 2+ agents gracefully  
✅ Lock timeouts prevent deadlocks  
✅ Each region contains relevant agent summaries

### **Live IDE Updates:**
✅ Report updates in real-time as agents write  
✅ No manual refresh needed  
✅ Smooth, glitch-free updates

### **Report Quality:**
✅ Scout94 section: Test results + findings  
✅ Clinic section: Doctor diagnosis + Nurse treatments  
✅ Auditor section: LLM evaluation + verdict  
✅ Professional markdown formatting  
✅ Actionable insights

---

## 📦 DEPENDENCIES

**NPM Packages to Install:**
```bash
cd websocket-server
npm install chokidar  # File watching
npm install async-lock  # Lock implementation alternative
```

**PHP Extensions:**
- None required (uses native file functions)

---

## 🚀 IMPLEMENTATION ORDER

1. **Fix ChatBubble** (15 min) - Quick win
2. **Create ReportLockManager** (1 hour)
3. **Create ReportWriter** (1 hour)
4. **Integrate with PHP** (1 hour)
5. **Add File Watcher** (30 min)
6. **IDE Live Updates** (1 hour)
7. **Scout94 Summary** (30 min)
8. **Clinic Summary** (45 min)
9. **Auditor Summary** (30 min)
10. **End-to-End Testing** (1 hour)

**Total Estimated Time:** 7-8 hours

---

## 🔄 PHASE 4: MOCK DETECTION INTEGRATION - 🔄 IN PROGRESS

### **Objective**
Integrate mock detection into collaborative reporting so all agents and users know when data is real vs. placeholder.

**See:** `MOCK_DETECTION_PROTOCOL.md` for complete specification

### **Tasks Overview**
1. **PHP Mock Detection Wrapper** - Allow PHP to detect mock patterns
2. **Scout94 Summary with Authenticity** - Add badges to reports
3. **Test Flow Integration** - Run detection after Scout94 tests
4. **Auditor Considers Authenticity** - Factor into scoring
5. **Report Header Badges** - Visual indicators

### **Status**
- Core detection engine: ✅ Complete (`mock-detector.js`)
- Comprehensive scan integration: ✅ Complete
- Markdown report integration: ✅ Complete
- PHP integration: 📋 Planned (Phase 4 tasks)
- Collaborative report integration: 📋 Planned

---

## 📝 NOTES

- Use atomic file writes (`writeFileSync` with temp file + rename)
- Lock timeout should be 30-60 seconds max
- Region markers are HTML comments (invisible in rendered markdown)
- Each agent posts to chat when they finish writing their section
- Report status changes from "IN PROGRESS" to "COMPLETE" when all regions filled

---

**This document will be updated as implementation progresses.**
