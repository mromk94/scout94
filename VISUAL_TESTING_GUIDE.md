# 👁️ SCOUT94 VISUAL TESTING GUIDE

## 🎯 **WHAT IS IT?**

Scout94 Visual Testing combines:
1. **Playwright** - Real browser automation & screenshots (FREE)
2. **GPT-4o Vision** - AI analyzes UI/UX like a human (~$0.10/run)

**Result:** Catch visual bugs AND UX issues that humans would encounter!

---

## 🚀 **QUICK START**

### **Step 1: Install Dependencies**
```bash
cd /Users/mac/CascadeProjects/scout94
pip3 install -r requirements.txt
playwright install
```

### **Step 2: Run Visual Tests**
```bash
# Using CLI
scout94 start --mode=visual

# Or directly (if you need to specify URL)
cd /Users/mac/CascadeProjects/scout94
php run_with_visual.php "/path/to/project" "http://localhost:3000"
```

### **Step 3: View Reports**
```bash
# In your project directory
cat SCOUT94_HYBRID_VISUAL_REPORT.md
```

---

## 📊 **WHAT IT TESTS**

### **Automated Checks (Playwright - FREE):**
- ✅ Page loads successfully
- ✅ Elements visible & positioned correctly
- ✅ Images load (no broken images)
- ✅ No console errors
- ✅ No horizontal scrollbar
- ✅ Visual regression (pixel comparison)
- ✅ Responsive design (mobile/tablet/desktop)

### **AI Analysis (GPT-4o - $0.007/page):**
- ✅ UX/UI quality score (1-10)
- ✅ Navigation clarity
- ✅ Call-to-action visibility
- ✅ Form usability
- ✅ Design flaws (overlaps, contrast, spacing)
- ✅ Accessibility issues
- ✅ "Would a first-time user be confused?"
- ✅ Human-like feedback

---

## 💰 **COST BREAKDOWN**

### **What You Pay For:**

| Component | Cost | When |
|-----------|------|------|
| **Playwright** | FREE | Always |
| **Screenshots** | FREE | Always |
| **Visual Comparison** | FREE | Always |
| **GPT-4o Analysis** | ~$0.007/page | Only critical pages (5 pages) |

**Total per run:** ~$0.10 (analyzes 5 critical pages)

**Monthly (20 runs):** ~$2.00

**Scout94 Total Cost:**
- Functional tests: $0.30/month
- Visual tests: $2.00/month
- **Grand Total: $2.30/month** 🎉

---

## 🎯 **CRITICAL PAGES ANALYZED**

By default, AI analyzes these 5 pages:
1. **Homepage** - First impression
2. **Login** - Security & trust
3. **Register** - Conversion critical
4. **Dashboard** - Main interface
5. **Invest/Checkout** - Revenue critical

You can customize this in `run_visual_tests.py`

---

## 📋 **REPORTS GENERATED**

### **1. SCOUT94_VISUAL_REPORT.json**
```json
{
  "total_pages": 5,
  "passed": 5,
  "failed": 0,
  "results": [...]
}
```
**Contains:** Playwright test results, screenshot paths, element checks

### **2. SCOUT94_AI_VISUAL_REPORT.json**
```json
{
  "summary": {
    "average_visual_quality": 8.2,
    "total_ux_issues": 7,
    "critical_issues": 2,
    "estimated_cost": 0.10
  },
  "detailed_analyses": [...]
}
```
**Contains:** AI scores, UX issues, recommendations

### **3. SCOUT94_HYBRID_VISUAL_REPORT.md**
```markdown
# SCOUT94 HYBRID VISUAL TESTING REPORT

## AUTOMATED VISUAL TESTING (Playwright)
- Passed: 5/5 ✅

## AI VISUAL ANALYSIS (GPT-4o Vision)
- Average Quality: 8.2/10
- Critical Issues: 2

### Page-by-Page Analysis
...
```
**Contains:** Combined human-readable report

---

## 📸 **SCREENSHOTS**

All screenshots saved to: `<project>/.scout94_screenshots/`

```
.scout94_screenshots/
├── baseline/      ← Reference screenshots
├── current/       ← Latest screenshots
└── diff/          ← Visual difference images
```

**Baseline vs Current:**
- First run creates baseline
- Subsequent runs compare against baseline
- Shows % difference

---

## 🎯 **USAGE MODES**

### **Mode 1: Full Hybrid (RECOMMENDED)**
```bash
scout94 start --mode=visual
```
- Playwright automation
- AI analysis of critical pages
- Cost: ~$0.10/run

### **Mode 2: Playwright Only (FREE)**
```bash
python3 run_visual_tests.py "/path/to/project" "http://localhost:3000" --no-ai
```
- No AI analysis
- Visual regression only
- Cost: $0

### **Mode 3: Manual AI Analysis**
```bash
# Take screenshots first
python3 scout94_visual_tester.py "/path/to/project" "http://localhost:3000"

# Then analyze specific pages
python3 gpt4o_visual_analyzer.py "/path/to/project"
```
- Fine control
- Analyze specific pages
- Cost: $0.007 per page

---

## 🔧 **CUSTOMIZATION**

### **Change Critical Pages:**

Edit `run_visual_tests.py`:
```python
critical_pages = [
    {'name': 'home', 'context': 'Landing page'},
    {'name': 'pricing', 'context': 'Pricing page'},
    {'name': 'features', 'context': 'Features showcase'},
    # Add your pages...
]
```

### **Change Viewports:**

Edit `scout94_visual_tester.py`:
```python
viewports = [
    {'name': 'mobile', 'width': 375, 'height': 667},
    {'name': 'tablet', 'width': 768, 'height': 1024},
    {'name': '4k', 'width': 3840, 'height': 2160},
]
```

### **Adjust Visual Diff Threshold:**

Edit `scout94_visual_tester.py`:
```python
if diff_score > 0.05:  # 5% threshold (change this)
    print(f"⚠️ Visual difference: {diff_score*100:.1f}%")
```

---

## 🐛 **TROUBLESHOOTING**

### **"Playwright not found"**
```bash
pip3 install playwright
playwright install
```

### **"OPENAI_API_KEY not found"**
```bash
echo "OPENAI_API_KEY=your-key-here" >> /Users/mac/CascadeProjects/scout94/.env
```

### **"Screenshot comparison failed"**
```bash
pip3 install Pillow
```

### **"Page timeout"**
- Increase timeout in `scout94_visual_tester.py`
- Check if localhost is running
- Verify URL is correct

### **"High AI costs"**
- Use `--no-ai` flag for free testing
- Reduce number of critical pages
- Run AI analysis only on staging deploys

---

## 📚 **EXAMPLES**

### **Test Local Development:**
```bash
# Start your dev server first
npm run dev  # or equivalent

# In another terminal
scout94 start --mode=visual
```

### **Test Production:**
```bash
php run_with_visual.php "/path/to/project" "https://yoursite.com"
```

### **CI/CD Integration:**
```yaml
# .github/workflows/visual-tests.yml
- name: Install dependencies
  run: |
    pip3 install -r scout94/requirements.txt
    playwright install

- name: Run visual tests
  run: |
    scout94 start --mode=visual
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### **Test Specific Page:**
```python
# custom_test.py
from scout94_visual_tester import Scout94VisualTester

tester = Scout94VisualTester('/path/to/project')
tester.critical_pages = ['/checkout']  # Only checkout
tester.start_test('http://localhost:3000')
```

---

## 🎯 **BEST PRACTICES**

### **1. Run Visual Tests:**
- ✅ Before every deployment
- ✅ After major UI changes
- ✅ Weekly on production

### **2. Review AI Feedback:**
- ✅ Address critical issues immediately
- ✅ Plan medium issues for next sprint
- ✅ Low issues as nice-to-haves

### **3. Update Baselines:**
```bash
# When you intentionally change UI
rm -rf <project>/.scout94_screenshots/baseline/
scout94 start --mode=visual  # Creates new baseline
```

### **4. Cost Management:**
- ✅ Use `--no-ai` for quick checks
- ✅ Full AI analysis for staging/production
- ✅ Analyze 5-7 critical pages max

---

## 📊 **REAL EXAMPLE OUTPUT**

```
╔═══════════════════════════════════════╗
║  SCOUT94 HYBRID VISUAL TESTING        ║
╚═══════════════════════════════════════╝

🎯 Mode: Hybrid (Playwright + GPT-4o Vision)
📂 Project: Viz Venture Group
🌐 URL: http://localhost:3000
💰 Estimated cost: ~$0.10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: AUTOMATED VISUAL TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━ Testing: / ━━━
  📍 Navigating to http://localhost:3000/...
  📸 Taking screenshot...
  🔍 Checking elements...
  ✅ Visual match (diff: 0.2%)
  ✅ Page tested successfully

━━━ Testing: /login ━━━
  📍 Navigating to http://localhost:3000/login...
  📸 Taking screenshot...
  🔍 Checking elements...
  ⚠️  1 console errors
  ✅ Visual match (diff: 1.3%)
  ✅ Page tested successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: AI VISUAL ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI analyzing: home...
  ✅ AI analysis complete
  📊 Visual Quality: 8/10
  ⚠️  Issues found: 2

🤖 AI analyzing: login...
  ✅ AI analysis complete
  📊 Visual Quality: 7/10
  ⚠️  Issues found: 3

╔═══════════════════════════════════════╗
║  AI ANALYSIS SUMMARY                  ║
╚═══════════════════════════════════════╝

📊 Pages Analyzed: 5
⭐ Avg Quality: 7.8/10
⚠️  Total Issues: 12
🔴 Critical: 2
💰 Cost: $0.10

📝 Report: SCOUT94_AI_VISUAL_REPORT.json
```

---

## 🏆 **WHAT YOU GET**

### **Before Visual Testing:**
- ❌ Manual UI checks
- ❌ Miss visual regressions
- ❌ No UX feedback
- ❌ Slow QA process

### **After Visual Testing:**
- ✅ Automated UI checks
- ✅ Catch regressions instantly
- ✅ AI UX feedback
- ✅ Fast & reliable
- ✅ Human-like analysis
- ✅ $2/month cost

---

**Visual Testing Status:** ✅ **READY TO USE**

**Try it now:**
```bash
scout94 start --mode=visual
```

🎉 **Catch UI bugs before your users do!**
