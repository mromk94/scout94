# Scout94 Testing Scripts

> 🛡️ **ACCOUNTABILITY PROTOCOL ENFORCED**  
> All actions in this ecosystem are gated by mandatory accountability checks.  
> See `websocket-server/ACCOUNTABILITY_PROTOCOL.md` and `accountability-enforcer.js`  
> **NO action proceeds without root cause investigation.**

This directory contains all automated testing scripts used by the Scout94 scanning protocol.

**Location:** `/Users/mac/CascadeProjects/scout94/` (shared across all projects)

## 📁 Directory Structure

```
/Users/mac/CascadeProjects/
├── scout94/                              ← Testing scripts (shared)
│   ├── README.md                         # This file
│   ├── test_install_db.php               # Database injection validation ✅
│   ├── test_routing.php                  # Route validation (404 detection) ✅
│   ├── test_user_journey_visitor.php     # Visitor user journey ✅
│   ├── test_user_journey_user.php        # Registered user journey ✅
│   ├── test_user_journey_admin.php       # Admin user journey ✅
│   ├── test_cors.php                     # CORS configuration check (TODO)
│   ├── test_production_assets.php        # Asset verification (TODO)
│   ├── run_all_tests.php                 # Execute all tests ✅
│   ├── run_with_audit.php                # Run with LLM auditor + auto-retry
│   ├── run_with_clinic.php               # ✨ **NEW!** Self-healing mode with clinic
│   ├── scout94_health_monitor.php        # Health scoring system
│   ├── scout94_doctor.php                # Diagnostic module
│   ├── scout94_risk_assessor.php         # Safety validation
│   └── scout94_clinic.php                # Treatment orchestrator
├── Viz Venture Group/                    ← Your project
├── TonSuiMining/                         ← Legacy project
└── [other projects]
```

## 🔍 Scripts Overview

### **test_install_db.php**
**Purpose:** Validates that the install flow properly creates database tables

**What it tests:**
- MySQL connection
- Database creation
- SQL schema parsing
- All queries execute successfully
- All critical tables created
- Admin user creation works

**Usage:**
```bash
php scout94/test_install_db.php
```

**Expected Output:**
```
✅ 45 queries executed
✅ 17 tables created
✅ Admin user creation works
✅ Install flow: WORKING
```

---

### **test_routing.php** (Future)
**Purpose:** Validates routing configuration to prevent 404 errors

**What it will test:**
- Root index.html exists
- Root index.html is production version (not dev)
- .htaccess routes configured correctly
- admin.php serves correct paths
- All route paths actually exist

---

### **test_cors.php** (Future)
**Purpose:** Validates CORS configuration for production

**What it will test:**
- CORS allows production domain
- No hardcoded localhost-only configs
- Credentials enabled properly
- Headers configured correctly

---

### **test_production_assets.php** (Future)
**Purpose:** Validates all production assets exist and are correct

**What it will test:**
- dist/ folder exists and has content
- All referenced assets exist
- CSS and JS bundles present
- Images and fonts included
- No dev-only references

---

### **test_user_journey_visitor.php** ✅
**Purpose:** Tests the visitor (public user) journey through the site

**What it tests:**
- Homepage loads
- Can view investment plans
- Info pages accessible
- Registration works
- Contact form available

**Simulates:** First-time visitor exploring and deciding to register

---

### **test_user_journey_user.php** ✅
**Purpose:** Tests the registered user journey

**What it tests:**
- Login works
- Dashboard accessible
- Can check balance
- Can create investment
- Can view investments
- Can request withdrawal
- Transaction history available
- KYC submission works
- Profile updates work
- Logout works

**Simulates:** Active user performing all key actions

---

### **test_user_journey_admin.php** ✅
**Purpose:** Tests the admin journey managing the platform

**What it tests:**
- Admin login works
- Admin panel accessible
- Can view statistics
- Can manage users
- Can adjust balances
- Can approve/reject transactions
- Can review KYC
- Can manage investment plans
- Can generate withdrawal PINs
- Can manage other admins

**Simulates:** Admin performing all management tasks

---

### **run_all_tests.php** (Future)
**Purpose:** Runs all Scout94 tests in sequence

**Usage:**
```bash
php scout94/run_all_tests.php
```

---

## 🔍 AUDITOR - Independent Quality Control

**NEW:** Scout94 now includes an independent LLM auditor!

### **What the Auditor Does:**

1. **Reviews Scout94 test results** with fresh eyes
2. **Scores testing quality** 1-10 on:
   - Completeness (did we test the right things?)
   - Methodology (are tests well-designed?)
   - Coverage (are critical paths covered?)
3. **Identifies gaps** in testing
4. **Provides recommendations** for improvement
5. **Auto-retries** Scout94 if score < 5

### **Supported LLMs:**

- ✅ **OpenAI GPT-4** (recommended)
- ✅ **Google Gemini**
- ✅ **Mock mode** (for testing without API key)

### **Setup:**

```bash
# 1. Copy the example env file
cp .env.example .env

# 2. Add your API key (choose ONE)
# For OpenAI:
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# For Gemini:
echo "GEMINI_API_KEY=your-key-here" > .env
```

### **Usage:**

```bash
# Run Scout94 WITH auditor
php run_with_audit.php "/Users/mac/CascadeProjects/Viz Venture Group"
```

### **How It Works:**

```
1. Run Scout94 tests → Generate results
2. Send results to LLM auditor → Get independent review
3. Check audit score:
   - Score ≥ 5 → ✅ Approved! Generate report
   - Score < 5 → 🔄 Re-run Scout94 with recommendations
4. Maximum 3 retries (4 total attempts)
5. Smart exit if stuck (same score 2x)
6. Always delivers report (success or failure)
```

### **Infinite Loop Prevention:**

✅ **Hard Limit:** Max 4 attempts (initial + 3 retries)  
✅ **Stuck Detection:** Exits early if score unchanged  
✅ **Score Tracking:** Monitors improvement trends  
✅ **Always Delivers:** Report generated even on failure  

See `RETRY_LOGIC.md` for detailed explanation.

---

## 🏥 **SCOUT94 CLINIC - SELF-HEALING MODE**

### **What Is It?**

The Clinic is a self-healing system that diagnoses and treats Scout94 when it fails audits. It's like having a doctor for your testing system!

### **How It Works:**

```
Scout94 Fails → Clinic Admits → Doctor Diagnoses → 
Generate Treatments → Risk Assessment → Apply Safe Fixes → 
Health Check → Retry Scout94 → Pass! ✅
```

### **Quick Start:**

```bash
# Run# Scout94 

**An Intelligent AI-Powered Testing Suite with Holistic Analysis, Collaborative Reporting & 7 Specialized Agents**

Scout94 is a professional Tauri desktop application that brings together cutting-edge AI agents, real-time testing, intelligent code analysis, and collaborative reporting. Built with a philosophy of understanding before acting, Scout94 analyzes your entire project holistically, traces root causes, and provides actionable insights through real-time multi-agent collaboration.

**Latest Updates (October 16, 2025):**
- ✅ Full collaborative reporting system with live IDE updates
- ✅ Rich markdown chat with syntax highlighting, tables, and code blocks
- ✅ Proper agent attribution (Doctor, Nurse, Auditor all have distinct profiles)
- ✅ Real-time report synchronization across all agents
- ✅ Smart summary generation (concise for high scores, detailed for diagnostics)

---

## Core Philosophy

Scout94 is built on key principles that guide every decision:

- **Holistic Approach**: Understand the entire system before analyzing issues
- **Root Cause Analysis**: Fix underlying problems, not just symptoms
- **Intelligent Decision-Making**: Never take lazy shortcuts or delete without understanding
- **Duplicate Intelligence**: Analyze both versions before making decisions
- **Graceful Operations**: Clean startups, shutdowns, and no resource leaks

### **Audit Output:**

```
╔═══════════════════════════════════════╗
║    SCOUT94 AUDITOR - QUALITY CHECK    ║
╚═══════════════════════════════════════╝

🔍 Auditor: Independent verification by GPT-4
📊 Analyzing Scout94 test results...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 AUDIT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL SCORE: 🟢 8/10

Completeness: 8/10
Methodology:  9/10
Coverage:     7/10

VERDICT: ✅ PASS

REASONING:
The testing is comprehensive and covers all critical user 
journeys. The methodology is sound, using real-world user 
scenarios. However, there is room for improvement in 
security and edge case testing.

✅ STRENGTHS:
   • Comprehensive user journey testing
   • Tests all three user personas
   • Validates critical paths
   • Good routing validation

💡 RECOMMENDATIONS:
   • Add security penetration testing
   • Test email flows
   • Add load/performance testing
   • Implement rate limiting
   • Use a WAF for added security

See `RETRY_LOGIC.md` for detailed explanation.

---

##  When Scout94 Runs

When you trigger **Scout94** or **Scout94 2**, Cascade will:

1. **Automatically run these scripts** from this directory
2. **Report results** in real-time
3. **Send to LLM auditor** for independent review
4. **Auto-retry if score < 5** with auditor recommendations
5. **Fix issues** found immediately
6. **Generate audited report** (only scores ≥5 delivered)

---

##  Adding New Tests

To add a new test to Scout94:

1. Create script in `scout94/` directory
2. Follow the naming convention: `test_[feature].php`
3. Include clear output (✅/❌ indicators)
4. Return exit code 0 for success, 1 for failure
5. Update this README
6. Update Scout94 memory to include the new test

---

##  Notes

- **DO NOT** commit these scripts to production packages
- Scripts are for **local development and pre-deployment validation only**
- All scripts should be **non-destructive** (create test databases, not modify production)
- Scripts should **clean up after themselves** (drop test databases)

---

## 🤝 COLLABORATIVE REPORTING SYSTEM (October 16, 2025)

Scout94 now features a revolutionary **multi-agent collaborative reporting** system where each AI agent contributes their own analysis to a shared markdown report in real-time.

### **✨ Key Features**

**Individual Agent Identities**
- ✅ Each agent posts with their **own chat profile** and emoji
- ✅ Doctor 🩺, Nurse 💉, Auditor 📊, Scout94 🚀 all have distinct bubbles
- ✅ No more "borrowing" scout94's profile
- ✅ Rich markdown support in chat (headers, code blocks, tables, images)

**Concurrent Write Protection**
- ✅ **Lock manager** with FIFO queue prevents file corruption
- ✅ Agents wait their turn if report is being edited
- ✅ Timeout protection (60s auto-release)
- ✅ Atomic file writes (temp file + rename)

**Live IDE Updates**
- ✅ Report grows **in real-time** as agents write
- ✅ Toast notifications when agents update
- ✅ No manual refresh needed
- ✅ Smooth, responsive display

**Region-Based Organization**
- ✅ **SCOUT94 region**: Functional test results
- ✅ **CLINIC region**: Doctor diagnosis + Nurse treatments
- ✅ **AUDITOR region**: LLM evaluation + verdict
- ✅ HTML comment markers (invisible in rendered markdown)

### **How It Works**

```
1. User clicks "Run All Tests"
   ↓
2. Report initialized with 3 region markers
   → IDE auto-opens report
   
3. Scout94 🚀 runs functional tests
   → Posts progress to chat with scout94 profile
   → Writes summary to SCOUT94 region
   → IDE updates live ✨
   → Toast: "📝 Report updated by scout94"
   
4. Auditor 📊 evaluates with LLM
   → Posts analysis to chat with auditor profile
   → Writes summary to AUDITOR region (queued if needed)
   → IDE updates live ✨
   
5. IF FAILING → Clinic intervenes:
   
   Doctor 🩺 diagnoses issues
   → Posts diagnosis to chat with doctor profile
   → Health assessment shown
   
   Nurse 💉 applies treatments
   → Posts treatments to chat with nurse profile
   → Writes clinic summary to CLINIC region
   → IDE updates live ✨
   
6. Retry tests → Loop back to step 3

7. FINAL: All 3 regions filled
   → Report status: ✅ COMPLETE
   → Comprehensive collaborative analysis ready
```

### **Report Structure**

Each report contains three collaborative sections:

```markdown
# 🧪 SCOUT94 - COLLABORATIVE ANALYSIS REPORT

**Project:** Your Project Name
**Status:** 🔄 IN PROGRESS → ✅ COMPLETE

---

<!-- REGION:SCOUT94 -->
## 🚀 PHASE 1: FUNCTIONAL VALIDATION (Scout94)

### 🚀 Scout94 Functional Analysis
**Test Execution:** Run #1
**Duration:** 45s
**Timestamp:** 4:15 PM

#### Test Results Summary
| Test Suite | Status | Details |
|------------|--------|---------|
| Routing | ✅ PASS | All routes valid |
| Database | ✅ PASS | Schema injection successful |
...

<!-- END:SCOUT94 -->

---

<!-- REGION:CLINIC -->
## 🏥 PHASE 2: CLINIC INTERVENTION (Doctor & Nurse)

### 🏥 Clinic Intervention

#### 🩺 Doctor's Diagnosis
**Health Assessment:** 35/100 (POOR)
**Primary Issues:**
1. **CRITICAL** - Authentication bypass
...

#### 💉 Nurse's Treatment Log
**Treatments Applied:** 2/2
**Health Progression:** 35 → 72 (+37)
...

<!-- END:CLINIC -->

---

<!-- REGION:AUDITOR -->
## 📊 PHASE 3: AUDIT VALIDATION (Auditor)

### 📊 Auditor Evaluation
**LLM Model:** Gemini 1.5 Pro
**Final Score:** 7/10

#### Scoring Breakdown
| Criterion | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Test Completeness | 8/10 | 25% | 2.0 |
...

**Verdict:** ✅ APPROVED FOR PRODUCTION

<!-- END:AUDITOR -->
```

### **Rich Chat Messages**

Agents can now post **rich markdown content** in chat:

**Supported Elements:**
- ✅ **Headers** (H1, H2, H3)
- ✅ **Code blocks** with syntax highlighting
- ✅ **Inline code** with monospace font
- ✅ **Tables** with responsive scrolling
- ✅ **Lists** (ordered and unordered)
- ✅ **Blockquotes** with blue accent
- ✅ **Images** (auto-sized, responsive)
- ✅ **Links** (opens in new tab)
- ✅ **Bold** and *italic* text

**Example:**
```markdown
## 🔍 Analysis Complete

**Findings:**
1. Database schema valid ✅
2. API endpoints tested ✅

### Code Sample
```php
function test() {
    return "success";
}
```

| Metric | Value |
|--------|-------|
| Tests | 45 |
| Passed | 43 |
```

### **Technical Implementation**

**Files:**
- `report-lock-manager.js` - Concurrent access control
- `report-writer.js` - Region-based writing
- `report-helper.php` - Summary generators
- `ChatBubble_old.jsx` - Rich markdown rendering
- `IDEPane.jsx` - Live update handlers
- `server.js` - Signal processing

**See:** `COLLABORATIVE_REPORT_TODO.md` for complete implementation details.

---

## 📋 CHANGELOG

### **October 16, 2025 - Phase 2 Bug Fixes**

**🔧 Critical Fixes:**
- Fixed undefined method `Scout94Clinic::generateTreatment()` - Clinic flow now properly uses internal methods
- Fixed undefined array key `health_status` - Using correct return value keys from clinic
- **Fixed IDE live updates for Auditor** - Added output buffer flush to `writeAgentSummary()`
- Fixed agent attribution - Clinic activities now appear under Doctor 🩺 and Nurse 💉 (not scout94)
- Added `screenshotter` alias to agent profiles for name flexibility

**🎯 Root Causes Addressed:**
1. **Output Buffering:** PHP was buffering `REPORT_WRITE` signals - added explicit `flush()` calls
2. **Missing AGENT_MESSAGE Wrappers:** Clinic was using raw echo - wrapped all output with proper JSON signals
3. **Misunderstood Clinic Flow:** `admitPatient()` is all-in-one method - removed non-existent method calls

**📝 Files Modified:**
- `run_comprehensive_with_agents.php` - Fixed clinic integration
- `php-helpers/report-helper.php` - Added buffer flushing
- `scout94_clinic.php` - Wrapped all output with AGENT_MESSAGE
- `ui/src/components/ChatBubble_old.jsx` - Added screenshotter alias

**📚 Documentation:**
- Created `FIXES_APPLIED_OCT16.md` - Phase 1 fixes (collaborative reporting integration)
- Created `FIXES_APPLIED_OCT16_PHASE2.md` - Phase 2 fixes (bug fixes and root cause analysis)

---

## 🎨 IDE Improvements (October 16, 2025)

Scout94's IDE interface has been enhanced with professional-grade features:

### **Responsive Layout**
- ✅ **Resizable panels**: User can drag to adjust IDE/Chat split width
- ✅ **Resizable file explorer**: Adjustable sidebar width
- ✅ **Line wrapping**: Code adapts to container width changes
- ✅ **Window responsive**: Adapts to any screen size smoothly

### **Professional Code Display**
- ✅ **Prominent line numbering**: Bold, clear gutter with distinct background
- ✅ **Protected line number lane**: Numbers stay in fixed column
- ✅ **Syntax highlighting**: Full language support with proper wrapping
- ✅ **Minified file detection**: Warns when viewing build artifacts

### **Breadcrumb Navigation**
- ✅ **Interactive path display**: Folder › Subfolder › File
- ✅ **File type badges**: Language indicator (php, jsx, css, etc.)
- ✅ **Hover effects**: Visual feedback on path segments
- ✅ **Current file highlight**: Active file shown with blue pill badge

### **Technical Implementation**
- Uses SyntaxHighlighter's native capabilities (no library fighting)
- Grid-based responsive panel layout
- Proper line wrapping with `wrapLines={true}` and `wrapLongLines={true}`
- Sticky line number gutter with visual separator

---

## 🎯 Accountability Protocol

Scout94 now enforces a strict **Root Cause First** methodology across all AI agents.

### **Documentation**
See `websocket-server/ACCOUNTABILITY_PROTOCOL.md` for complete details.

### **Key Principles**
1. **STOP and investigate** before proposing solutions
2. **Root cause analysis** required for every fix
3. **Investigation evidence** must be provided
4. **Holistic context** must be considered
5. **No band-aids** - fix causes, not symptoms

### **Enforcement**
- All agents validate solutions through `DecisionValidator`
- Solutions rejected if accountability checks fail
- Fighting libraries = automatic rejection
- Lazy shortcuts flagged and prevented

### **Example: Line Numbering Fix**
❌ **Wrong**: Try different CSS, force grid layout, fight the library  
✅ **Right**: Investigate → Library has native props → Use `lineNumberContainerStyle` and `wrapLines`

This ensures Scout94 maintains the same high standards across its entire ecosystem.

---

**Part of Scout94 Protocol**  
Last Updated: October 16, 2025
