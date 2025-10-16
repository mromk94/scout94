# 🔍 MOCK DETECTION PROTOCOL

**Status:** ✅ ACTIVE & ENFORCED  
**Applies To:** All Scout94 testing variants  
**Philosophy:** Be honest about data authenticity - flag mock/placeholder data prominently

---

## 🎯 Core Principle

**Scout94 must distinguish between:**
- ✅ **Real scan data** - Actual files analyzed, logs parsed, tests executed
- ⚠️ **Partial data** - Some scans succeeded, others failed or skipped
- ❌ **Mock/placeholder data** - Empty results, missing files, no real analysis

**WHY THIS MATTERS:**
- Users trust Scout94's reports for production decisions
- Mock data can give false confidence ("zero errors" when logs don't exist)
- Placeholder patterns must be detected and flagged clearly
- Reports must show what's real vs. what's missing

---

## 📊 Mock Detection Flow

### **Phase 1: Data Collection**
```
Scout94 runs comprehensive scan
├── Project indexing
├── Error log parsing  
├── Security analysis
├── Database testing
└── Performance metrics
```

### **Phase 2: Authenticity Analysis**
```
MockDetector analyzes results
├── Check: Did each scan actually execute?
├── Check: Are results realistic or suspiciously perfect?
├── Check: Missing required data structures?
├── Check: Empty/zero-value patterns?
└── Calculate: Confidence score (0-100%)
```

### **Phase 3: Verdict & Reporting**
```
Confidence Score → Verdict
├── 80-100%: ✅ REAL (authentic data)
├── 50-79%:  ⚠️ PARTIAL (mixed real/mock)
├── 20-49%:  ❌ MOSTLY_MOCK (primarily fake)
└── 0-19%:   🚫 COMPLETE_MOCK (no real scans)
```

### **Phase 4: User Communication**
```
Report findings in multiple places:
├── Chat message (with emoji indicators)
├── Markdown report (dedicated section)
├── Collaborative report (authenticity badge)
└── Console logs (for debugging)
```

---

## 🔍 Detection Patterns

### **Critical Indicators (High Penalty)**

| Pattern | Description | Penalty | Why It Matters |
|---------|-------------|---------|----------------|
| `NO_SCANS` | Zero scans executed | -30% | Complete mock - nothing ran |
| `EMPTY_PROJECT` | Project has zero files | -20% | Physically impossible |
| `NO_CODE_FILES` | No PHP/JS/CSS files found | -15% | Either wrong path or mock |
| `NO_FILES_SCANNED` | Security scan found nothing | -15% | Directory doesn't exist |
| `EMPTY_DEEP_ANALYSIS` | Deep analysis returned zero | -15% | Analysis didn't run |

### **Suspicious Indicators (Medium Penalty)**

| Pattern | Description | Penalty | Why Suspicious |
|---------|-------------|---------|----------------|
| `MISSING_SCAN` | Core scan not executed | -12-15% | Required data missing |
| `PERFECT_SECURITY` | 20+ files, zero issues | -10% | Unrealistic for real code |
| `TOO_PERFECT` | Absolutely no issues anywhere | -12% | Real apps have problems |
| `MISSING_ERROR_LOG` | Error log not found | -10% | Can't analyze actual errors |
| `MISSING_PERFORMANCE` | No performance data | -10% | App logs don't exist |

### **Warning Indicators (Low Penalty)**

| Pattern | Description | Penalty | Why Flagged |
|---------|-------------|---------|-------------|
| `SUSPICIOUSLY_CLEAN` | Zero errors/warnings | -8% | Real apps have some issues |
| `NO_PERFORMANCE_DATA` | Zero requests in logs | -8% | Logs are empty |
| `DB_NOT_TESTED` | Database not actually tested | -8% | Connection not attempted |
| `INCONSISTENT_ROOT_CAUSE` | Issues but no root causes | -8% | Analysis incomplete |

---

## 📝 Report Format

### **In Chat Messages**
```markdown
## 🔍 Data Authenticity Report

**Confidence:** 45% ⚠️
**Status:** PARTIAL
**Assessment:** Scan contains mix of real and placeholder data

### ⚠️ Issues Detected (8)

1. **MISSING_ERROR_LOG**: Error log not found or not scanned
2. **NO_FILES_SCANNED**: Zero files scanned for security
3. **MISSING_PERFORMANCE**: Performance analysis not executed
4. **EMPTY_DEEP_ANALYSIS**: Deep analysis returned zero results
5. **NO_PERFORMANCE_DATA**: No performance data found in logs

+ 3 more issues (see full report)

### 💡 Recommendations

To get authentic data:
- Ensure log files exist: `logs/error.log`, `logs/app.log`
- Verify `api/` directory exists with PHP files
- Check project path is correct and accessible
```

### **In Markdown Reports**
```markdown
## 🔍 Data Authenticity Analysis

**Authenticity Confidence:** 45%  
**Verdict:** ⚠️ **PARTIAL**  
**Assessment:** Scan contains mix of real and placeholder data

### ⚠️ Mock/Placeholder Indicators Detected

The following patterns suggest incomplete or mock data:

1. **MISSING_ERROR_LOG**  
   - Error log not found or not scanned  
   - Confidence impact: -10%

2. **NO_FILES_SCANNED**  
   - Zero files scanned for security  
   - Confidence impact: -15%

[... full list of all indicators ...]

### 💡 Recommendations

To get real, actionable data:
- Ensure log files exist: `logs/error.log`, `logs/app.log`
- Verify `api/` directory exists with PHP files to scan
- Configure database connection in project
- Verify project path is correct and accessible
```

### **In Collaborative Reports**
```markdown
# 🧪 SCOUT94 - COLLABORATIVE ANALYSIS REPORT

**Project:** Viz Venture Group
**Status:** 🔄 IN PROGRESS
**Data Authenticity:** ⚠️ 45% (PARTIAL) - See authenticity section below

---

[... normal report sections ...]

---

## 🔍 Data Authenticity Analysis

[... full mock detection report ...]
```

---

## 🎨 Visual Indicators

### **Chat Bubble Colors**
- ✅ **Green bubble** = High confidence (80-100%)
- ⚠️ **Yellow bubble** = Medium confidence (50-79%)
- ❌ **Red bubble** = Low confidence (0-49%)

### **Report Badges**
```markdown
**Data Quality:** ✅ VERIFIED (98% confidence)
**Data Quality:** ⚠️ PARTIAL (65% confidence)
**Data Quality:** ❌ MOCK (12% confidence)
```

### **IDE Indicators**
- Report file icon shows warning badge if confidence < 80%
- Toast notification mentions authenticity when report opens
- Section headers show warning icons for mock sections

---

## 🔧 Integration Points

### **1. Comprehensive Scan** (`comprehensive-scan-command.js`)
```javascript
// After all scans complete
const mockDetection = detectMockData(results);
results.mockDetection = mockDetection;

// Broadcast to chat
broadcast({
  type: 'message',
  agent: 'scout94',
  text: generateMockReport(mockDetection),
  messageType: mockDetection.isMock ? 'error' : 'success'
});
```

### **2. Collaborative Test Runs** (`run_comprehensive_with_agents.php`)
```php
// After Scout94 tests
$mockDetection = detectMockInTestResults($testOutput);
if ($mockDetection['isMock']) {
    sendToChat('scout94', "⚠️ **Warning:** Test results may contain placeholder data\n\n" . 
        "Confidence: {$mockDetection['confidence']}%", 'warning');
}

// Write to collaborative report
$scout94Summary = generateScout94Summary($testResults, $mockDetection);
writeAgentSummary($reportPath, 'SCOUT94', 'scout94', $scout94Summary);
```

### **3. Markdown Report Generation** (`markdown-report-generator.js`)
```javascript
// Always include authenticity section
if (results.mockDetection) {
  const detector = new MockDetector();
  markdown += detector.generateReportSection(results.mockDetection);
}
```

### **4. Auditor Evaluation** (`auditor.php`)
```php
// Auditor checks if Scout94 data is authentic
if (isset($testResults['mockDetection']) && $testResults['mockDetection']['confidence'] < 80) {
    $audit['warnings'][] = "Test data authenticity concern: {$testResults['mockDetection']['verdict']}";
    $audit['score'] -= 1; // Deduct score for mock data
}
```

---

## 📋 Implementation Checklist

### **Phase 1: Core Detection** ✅ COMPLETE
- [x] Create `mock-detector.js` module
- [x] Implement confidence scoring algorithm
- [x] Define detection patterns (critical, suspicious, warning)
- [x] Create verdict generator
- [x] Build report section generator

### **Phase 2: Comprehensive Scan Integration** ✅ COMPLETE
- [x] Import mock detector in `comprehensive-scan-command.js`
- [x] Run detection after all scans complete
- [x] Broadcast authenticity report to chat
- [x] Include in markdown reports
- [x] Store detection results in scan data

### **Phase 3: Collaborative Reporting Integration** 🔄 IN PROGRESS
- [ ] Add PHP wrapper function for mock detection
- [ ] Integrate into `run_comprehensive_with_agents.php`
- [ ] Include authenticity in Scout94 summary
- [ ] Pass detection data to Auditor
- [ ] Add authenticity badges to collaborative reports

### **Phase 4: Visual Indicators** 📋 PLANNED
- [ ] Add warning icons to IDE file display
- [ ] Color-code chat bubbles by confidence
- [ ] Show authenticity toast when opening reports
- [ ] Add status badge to report headers
- [ ] Highlight mock sections in rendered markdown

### **Phase 5: Documentation** 🔄 IN PROGRESS
- [x] Create MOCK_DETECTION_PROTOCOL.md
- [ ] Update README.md with mock detection info
- [ ] Add to TESTING_ORDER.md
- [ ] Reference in ACCOUNTABILITY_PROTOCOL.md
- [ ] Create examples and troubleshooting guide

---

## 🧪 Example Scenarios

### **Scenario 1: Perfect Real Data**
```
Project: 788 files indexed
Error log: 45 errors found
Security: 23 files scanned, 12 issues found
Database: Connected successfully
Performance: 1,247 requests analyzed

→ Confidence: 98% ✅ REAL
→ Verdict: All scan data appears authentic
```

### **Scenario 2: Partial Mock Data**
```
Project: 788 files indexed ✅
Error log: Not found ⚠️
Security: 0 files scanned ❌
Database: Not tested ⚠️
Performance: No data ❌

→ Confidence: 52% ⚠️ PARTIAL
→ Verdict: Mix of real and placeholder data
→ Issues: MISSING_ERROR_LOG, NO_FILES_SCANNED, DB_NOT_TESTED, MISSING_PERFORMANCE
```

### **Scenario 3: Complete Mock**
```
Project: 0 files ❌
Error log: Not found ❌
Security: Not executed ❌
Database: Not tested ❌
Performance: Not executed ❌

→ Confidence: 5% 🚫 COMPLETE_MOCK
→ Verdict: No real scans executed
→ Action: Verify project path and run scan again
```

---

## 🚀 Future Enhancements

### **Advanced Detection**
- [ ] ML-based pattern recognition for mock detection
- [ ] Historical data comparison (is this consistent with past scans?)
- [ ] Cross-reference multiple data sources for validation
- [ ] Detect "generated" vs "real" code patterns

### **User Feedback**
- [ ] "Flag this as real" button if user knows data is authentic
- [ ] "Explain why this is flagged" detailed breakdown
- [ ] Confidence threshold configuration (strictness slider)

### **Integration Expansion**
- [ ] Mock detection in screenshot analysis
- [ ] Authenticity checks in Clinic treatments
- [ ] Doctor diagnosis confidence scoring
- [ ] Nurse treatment validation

---

## 📚 References

**Related Protocols:**
- `ACCOUNTABILITY_PROTOCOL.md` - Root cause investigation requirements
- `TESTING_ORDER.md` - Test execution sequence
- `COLLABORATIVE_REPORT_TODO.md` - Multi-agent reporting system

**Implementation Files:**
- `websocket-server/mock-detector.js` - Core detection logic
- `websocket-server/comprehensive-scan-command.js` - Integration point
- `websocket-server/markdown-report-generator.js` - Report generation

---

**Last Updated:** October 16, 2025  
**Status:** Active & Enforced  
**Maintained By:** Scout94 Core Team
