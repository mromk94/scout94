# 💬 SCOUT94 COMMUNICATION FLOW

## 🎯 **CENTRALIZED MESSAGE BOARD ARCHITECTURE**

All Scout94 actors communicate through a centralized knowledge base, creating a learning ecosystem.

---

## 🏗️ **SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────┐
│                 KNOWLEDGE BASE (Central Hub)                │
│  📊 Project Map | 💬 Messages | 🧠 Learning | ❤️ Health     │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌───▼────┐         ┌───▼────┐
    │Scout94 │         │Auditor │         │ Doctor │
    │        │◄───────►│ Gemini │◄───────►│        │
    └───┬────┘         └───┬────┘         └───┬────┘
        │                  │                   │
        └───────┬──────────┼────────┬──────────┘
                │          │        │
           ┌────▼───┐  ┌──▼───┐  ┌▼─────┐
           │ Clinic │  │ Risk │  │Sandbox│
           │        │◄─►│Assess│◄─►│      │
           └────────┘  └──────┘  └──────┘
```

---

## 📡 **MESSAGE FLOW EXAMPLES**

### **Example 1: Test Failure Flow**

```
1. Scout94 → Knowledge Base
   ┌────────────────────────────────────────┐
   │ TYPE: test_completed                   │
   │ FROM: scout94                          │
   │ TO: auditor                            │
   │ PRIORITY: high                         │
   │ CONTENT: {                             │
   │   "tests_passed": 5,                   │
   │   "tests_failed": 0,                   │
   │   "critical_errors": 1,                │
   │   "score": 2                           │
   │ }                                      │
   └────────────────────────────────────────┘
         ↓
2. Auditor reads message from Knowledge Base
   ┌────────────────────────────────────────┐
   │ Auditor: "I see Scout94 has critical   │
   │ errors but reports all tests passed.   │
   │ This is inconsistent."                 │
   └────────────────────────────────────────┘
         ↓
3. Auditor → Knowledge Base
   ┌────────────────────────────────────────┐
   │ TYPE: audit_failed                     │
   │ FROM: auditor                          │
   │ TO: doctor                             │
   │ PRIORITY: critical                     │
   │ CONTENT: {                             │
   │   "score": 2,                          │
   │   "verdict": "FAIL",                   │
   │   "issues": [                          │
   │     "Reporting inconsistency",         │
   │     "Critical error not marked failed" │
   │   ]                                    │
   │ }                                      │
   └────────────────────────────────────────┘
         ↓
4. Doctor reads message and diagnoses
   ┌────────────────────────────────────────┐
   │ Doctor: "Patient Scout94 has critical  │
   │ infrastructure issues. Admitting to    │
   │ clinic for treatment."                 │
   └────────────────────────────────────────┘
         ↓
5. Doctor → Knowledge Base
   ┌────────────────────────────────────────┐
   │ TYPE: diagnosis_complete               │
   │ FROM: doctor                           │
   │ TO: clinic                             │
   │ PRIORITY: high                         │
   │ CONTENT: {                             │
   │   "health_score": 35,                  │
   │   "diagnosis": [                       │
   │     "Critical test infrastructure",    │
   │     "Security gaps"                    │
   │   ],                                   │
   │   "prescriptions": [                   │
   │     "FIX_CRITICAL_ERRORS",             │
   │     "ADD_SECURITY_TESTS"               │
   │   ]                                    │
   │ }                                      │
   └────────────────────────────────────────┘
```

---

### **Example 2: Clinic Treatment Flow**

```
1. Clinic → Knowledge Base
   ┌────────────────────────────────────────┐
   │ TYPE: treatment_planned                │
   │ FROM: clinic                           │
   │ TO: risk_assessor                      │
   │ PRIORITY: high                         │
   │ CONTENT: {                             │
   │   "treatment": "ADD_SECURITY_TESTS",   │
   │   "test_code": "<?php...",             │
   │   "sandbox_required": true             │
   │ }                                      │
   └────────────────────────────────────────┘
         ↓
2. Risk Assessor reads and analyzes
   ┌────────────────────────────────────────┐
   │ Risk Assessor: "Analyzing security     │
   │ test code for safety..."               │
   │ - File operations: 0                   │
   │ - System commands: 0                   │
   │ - Risk score: 15/100 → LOW             │
   └────────────────────────────────────────┘
         ↓
3. Risk Assessor → Knowledge Base
   ┌────────────────────────────────────────┐
   │ TYPE: risk_assessed                    │
   │ FROM: risk_assessor                    │
   │ TO: sandbox                            │
   │ PRIORITY: normal                       │
   │ CONTENT: {                             │
   │   "risk_score": 15,                    │
   │   "risk_level": "LOW",                 │
   │   "approved": true,                    │
   │   "requires_sandbox": true             │
   │ }                                      │
   └────────────────────────────────────────┘
         ↓
4. Sandbox reads and executes
   ┌────────────────────────────────────────┐
   │ Sandbox: "Creating isolated            │
   │ environment for test execution..."     │
   │ - Phase 1: ✅ Initialization           │
   │ - Phase 2: ✅ Validation               │
   │ - Phase 3: ✅ Static Analysis          │
   │ - Phase 4: ✅ Runtime Prep             │
   │ - Phase 5: ✅ Execution                │
   │ - Phase 6: ✅ Monitoring               │
   │ - Phase 7: ✅ Cleanup                  │
   │ - Phase 8: ✅ Reporting                │
   └────────────────────────────────────────┘
         ↓
5. Sandbox → Knowledge Base
   ┌────────────────────────────────────────┐
   │ TYPE: execution_completed              │
   │ FROM: sandbox                          │
   │ TO: clinic                             │
   │ PRIORITY: normal                       │
   │ CONTENT: {                             │
   │   "success": true,                     │
   │   "safety_score": 95,                  │
   │   "all_phases_passed": true,           │
   │   "execution_time_ms": 145             │
   │ }                                      │
   └────────────────────────────────────────┘
         ↓
6. Clinic applies treatment
   ┌────────────────────────────────────────┐
   │ Clinic: "Treatment approved and        │
   │ applied. Recalculating health..."      │
   │ - Old health: 35/100                   │
   │ - Health gain: +30                     │
   │ - New health: 65/100                   │
   └────────────────────────────────────────┘
         ↓
7. Clinic → Knowledge Base (Broadcast)
   ┌────────────────────────────────────────┐
   │ TYPE: treatment_applied                │
   │ FROM: clinic                           │
   │ TO: all                                │
   │ PRIORITY: normal                       │
   │ CONTENT: {                             │
   │   "treatment": "ADD_SECURITY_TESTS",   │
   │   "health_before": 35,                 │
   │   "health_after": 65,                  │
   │   "health_gain": 30,                   │
   │   "ready_for_retry": false             │
   │ }                                      │
   └────────────────────────────────────────┘
```

---

### **Example 3: Learning From Success**

```
1. Scout94 completes successful run
   ┌────────────────────────────────────────┐
   │ Scout94: "All tests passed after       │
   │ applying security fixes!"              │
   │ Score: 7/10                            │
   └────────────────────────────────────────┘
         ↓
2. Scout94 → Knowledge Base (Record Pattern)
   ┌────────────────────────────────────────┐
   │ METHOD: recordSuccessfulPattern()      │
   │ PATTERN: "security_tests_added"        │
   │ CONTEXT: {                             │
   │   "treatment": "ADD_SECURITY_TESTS",   │
   │   "health_gain": 30,                   │
   │   "audit_improvement": 2 → 7           │
   │ }                                      │
   └────────────────────────────────────────┘
         ↓
3. Knowledge Base stores in learning history
   ┌────────────────────────────────────────┐
   │ LEARNING_HISTORY:                      │
   │ successful_patterns: [                 │
   │   {                                    │
   │     "pattern": "security_tests_added", │
   │     "context": {...},                  │
   │     "timestamp": "2025-10-15 21:30"    │
   │   }                                    │
   │ ]                                      │
   └────────────────────────────────────────┘
         ↓
4. Future runs can reference this learning
   ┌────────────────────────────────────────┐
   │ Doctor (on next failure):              │
   │ "I see from history that adding        │
   │ security tests improved health by 30   │
   │ points last time. Recommending same."  │
   └────────────────────────────────────────┘
```

---

## 🗺️ **PROJECT MAPPING PROCESS**

### **Initial Scan:**

```
1. First Scout94 Run
   ↓
2. Knowledge Base: mapProject()
   ↓
┌─────────────────────────────────────────┐
│ DISCOVERING:                            │
│ ✅ Backend structure (/auth-backend)    │
│ ✅ Frontend structure (/src)            │
│ ✅ Database schema (/install)           │
│ ✅ Endpoints (all .php files)           │
│ ✅ Dependencies (package.json)          │
│ ✅ Critical files (.htaccess, config)   │
└─────────────────────────────────────────┘
   ↓
3. PROJECT_MAP Created:
┌─────────────────────────────────────────┐
│ {                                       │
│   "structure": {                        │
│     "has_backend": true,                │
│     "has_frontend": true,               │
│     "has_database": true                │
│   },                                    │
│   "endpoints": [                        │
│     {"file": "login.php", ...},         │
│     {"file": "register.php", ...}       │
│   ],                                    │
│   "critical_files": {                   │
│     "/install/schema.sql": {            │
│       "exists": true,                   │
│       "size": 15420                     │
│     }                                   │
│   }                                     │
│ }                                       │
└─────────────────────────────────────────┘
   ↓
4. All actors can now reference this map
```

---

### **Using Project Map:**

```
Doctor diagnosing database test failure:
┌─────────────────────────────────────────┐
│ Doctor: "Let me check project map..."   │
│                                         │
│ map = knowledgeBase.getProjectMap()     │
│                                         │
│ if map['critical_files']['/install/    │
│        schema.sql']['exists']:          │
│     "File exists, path issue in test"   │
│ else:                                   │
│     "File missing, need to create"      │
└─────────────────────────────────────────┘

Risk Assessor checking endpoints:
┌─────────────────────────────────────────┐
│ Risk Assessor: "Checking if test        │
│ accesses known endpoints..."            │
│                                         │
│ endpoints = map['endpoints']            │
│ testTarget = extractTarget(testCode)    │
│                                         │
│ if testTarget in endpoints:             │
│     "Valid endpoint - lower risk"       │
│ else:                                   │
│     "Unknown endpoint - higher risk"    │
└─────────────────────────────────────────┘
```

---

## 🧠 **PERSISTENT LEARNING**

### **Knowledge Accumulation:**

```
Run 1 (Fresh project):
┌─────────────────────────────────────────┐
│ Knowledge Base: EMPTY                   │
│ - No patterns known                     │
│ - No issues recorded                    │
│ - No fixes applied                      │
└─────────────────────────────────────────┘
         ↓
   Discovers issues, applies fixes
         ↓
Run 2 (After fixes):
┌─────────────────────────────────────────┐
│ Knowledge Base: LEARNING                │
│ - Patterns: 2 successful                │
│ - Known Issues: 3 recorded              │
│ - Fixes Applied: 2                      │
└─────────────────────────────────────────┘
         ↓
   Uses history to make better decisions
         ↓
Run 10 (Mature system):
┌─────────────────────────────────────────┐
│ Knowledge Base: EXPERT                  │
│ - Patterns: 25 successful               │
│ - Known Issues: 8 recurring             │
│ - Fixes Applied: 15                     │
│ - Health Trend: +5 pts/run              │
└─────────────────────────────────────────┘
         ↓
   Predicts issues before they happen!
```

---

### **Issue Tracking:**

```
First occurrence:
┌─────────────────────────────────────────┐
│ recordKnownIssue(                       │
│   "Schema file not found",              │
│   "critical",                           │
│   "Check /install/schema.sql path"      │
│ )                                       │
│                                         │
│ Stored as:                              │
│ {                                       │
│   "issue": "Schema file not found",     │
│   "severity": "critical",               │
│   "solution": "Check path...",          │
│   "occurrences": 1,                     │
│   "first_seen": "2025-10-15 20:00"      │
│ }                                       │
└─────────────────────────────────────────┘

Second occurrence (same issue):
┌─────────────────────────────────────────┐
│ recordKnownIssue(                       │
│   "Schema file not found",              │
│   "critical"                            │
│ )                                       │
│                                         │
│ Updated to:                             │
│ {                                       │
│   "issue": "Schema file not found",     │
│   "occurrences": 2,  ← Incremented!     │
│   "last_seen": "2025-10-15 21:00"       │
│ }                                       │
└─────────────────────────────────────────┘

Doctor on third occurrence:
┌─────────────────────────────────────────┐
│ Doctor: "This is a recurring issue      │
│ (seen 2 times before). Known solution:  │
│ Check /install/schema.sql path"         │
│                                         │
│ → Applies fix automatically             │
└─────────────────────────────────────────┘
```

---

## 📊 **REAL-TIME ACTOR STATES**

### **Dashboard View:**

```
╔═══════════════════════════════════════╗
║  SCOUT94 KNOWLEDGE BASE DASHBOARD    ║
╚═══════════════════════════════════════╝

👥 ACTOR STATES:
   🟢 Scout94: ACTIVE (running tests)
   🔄 Auditor: RUNNING (analyzing results)
   ⚪ Doctor: IDLE (waiting for audit)
   ⚪ Clinic: IDLE
   ⚪ Risk Assessor: IDLE
   ⚪ Sandbox: IDLE

💬 MESSAGE BOARD:
   Total Messages: 15
   Unread: 3
   
   Latest:
   🔴 [CRITICAL] auditor → doctor
      "Audit failed: Score 2/10"
   
   🟠 [HIGH] scout94 → auditor
      "Test completed: 5 passed, 1 error"
   
   🟢 [NORMAL] doctor → clinic
      "Diagnosis ready for review"

🧠 LEARNING:
   Known Issues: 5
   Successful Patterns: 12
   Applied Fixes: 8
   
🗺️  PROJECT MAP:
   Endpoints: 15
   Critical Files: 5
   Structure: Complete

❤️  HEALTH:
   Current: 52/100 (POOR)
   Trend: +8 pts/cycle (improving)
   Last 5 scores: [35, 42, 48, 50, 52]
```

---

## 🔄 **MESSAGE PRIORITIES**

```
Priority System:

CRITICAL (Red Flag 🔴):
- Audit failures
- Critical errors detected
- Security vulnerabilities
- System crashes

HIGH (Orange Flag 🟠):
- Test failures
- Health below threshold
- Treatment needed
- Risk assessment failures

NORMAL (Yellow Flag 🟡):
- Test completions
- Treatments applied
- Status updates
- Info sharing

LOW (Blue Flag 🔵):
- Debug information
- Performance metrics
- Statistics
- Historical data

Processing Order:
1. CRITICAL messages first
2. Then HIGH
3. Then NORMAL
4. Then LOW
```

---

## 💡 **INTELLIGENT INSIGHTS**

### **Automatic Pattern Detection:**

```
Knowledge Base analyzes history and generates insights:

Insight 1: Recurring Issues
┌─────────────────────────────────────────┐
│ TYPE: recurring_issues                  │
│ SEVERITY: high                          │
│ MESSAGE: "3 recurring issues detected"  │
│ DATA: [                                 │
│   {                                     │
│     "issue": "Schema file not found",   │
│     "occurrences": 5                    │
│   },                                    │
│   {                                     │
│     "issue": "Missing security tests",  │
│     "occurrences": 3                    │
│   }                                     │
│ ]                                       │
│                                         │
│ RECOMMENDATION:                         │
│ "These issues keep coming back.         │
│  Consider permanent fix in codebase."   │
└─────────────────────────────────────────┘

Insight 2: Declining Health
┌─────────────────────────────────────────┐
│ TYPE: declining_health                  │
│ SEVERITY: high                          │
│ MESSAGE: "Health consistently low"      │
│ DATA: {                                 │
│   "recent_scores": [45, 42, 38, 35],    │
│   "average": 40,                        │
│   "trend": -2.5 pts/cycle               │
│ }                                       │
│                                         │
│ RECOMMENDATION:                         │
│ "Negative trend detected. Immediate     │
│  clinic admission recommended."         │
└─────────────────────────────────────────┘

Insight 3: Learning Progress
┌─────────────────────────────────────────┐
│ TYPE: learning_progress                 │
│ SEVERITY: info                          │
│ MESSAGE: "15 successful patterns learned"│
│ DATA: {                                 │
│   "pattern_count": 15,                  │
│   "effectiveness": "85%"                │
│ }                                       │
│                                         │
│ RECOMMENDATION:                         │
│ "System is learning well. Continue      │
│  current approach."                     │
└─────────────────────────────────────────┘
```

---

## 🎯 **COMMUNICATION BENEFITS**

### **1. No Siloed Information**
- All actors see the same data
- No duplicate discoveries
- Coordinated decisions

### **2. Persistent Memory**
- Knowledge survives across runs
- Learn from past mistakes
- Build on successes

### **3. Transparency**
- Every decision documented
- Full audit trail
- Message history preserved

### **4. Efficiency**
- Actors don't repeat work
- Solutions reused
- Faster diagnosis

### **5. Intelligence**
- Pattern recognition
- Trend analysis
- Predictive insights

---

## 📁 **KNOWLEDGE BASE FILE**

**Location:** `{project}/.scout94_knowledge.json`

**Example:**
```
/Users/mac/CascadeProjects/Viz Venture Group/
    .scout94_knowledge.json  ← Persistent storage
```

**Benefits:**
- Git-ignored (private data)
- Project-specific
- Survives restarts
- Portable
- JSON format (human-readable)

---

**All actors communicate through the Knowledge Base - creating an intelligent, learning system! 🧠💬**
