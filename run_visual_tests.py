#!/Users/mac/CascadeProjects/scout94/.venv/bin/python3
"""
Scout94 Visual Tests Runner - Hybrid Mode
Orchestrates Playwright testing + GPT-4o analysis
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from scout94_visual_tester import Scout94VisualTester
from gpt4o_visual_analyzer import GPT4oVisualAnalyzer

def run_hybrid_visual_tests(project_path, base_url, use_ai=True):
    """
    Run hybrid visual tests
    1. Playwright automation + screenshots
    2. GPT-4o analysis of critical pages
    """
    
    print("╔═══════════════════════════════════════╗")
    print("║  SCOUT94 HYBRID VISUAL TESTING        ║")
    print("╚═══════════════════════════════════════╝\n")
    
    print(f"🎯 Mode: Hybrid (Playwright + GPT-4o Vision)")
    print(f"📂 Project: {Path(project_path).name}")
    print(f"🌐 URL: {base_url}")
    print(f"💰 Estimated cost: ~$0.10\n")
    
    # Phase 1: Playwright Visual Testing
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("PHASE 1: AUTOMATED VISUAL TESTING")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    
    tester = Scout94VisualTester(project_path, headless=True)
    visual_report = tester.start_test(base_url)
    
    # Phase 2: AI Analysis (if enabled)
    ai_report = None
    if use_ai:
        print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("PHASE 2: AI VISUAL ANALYSIS")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
        
        try:
            analyzer = GPT4oVisualAnalyzer(project_path)
            
            # Analyze only critical pages that passed
            screenshots_dir = Path(project_path) / ".scout94_screenshots" / "current"
            
            critical_pages = [
                {'name': 'home', 'context': 'Main landing page - first impression'},
                {'name': 'login', 'context': 'User login page - security & trust'},
                {'name': 'register', 'context': 'Registration flow - conversion critical'},
                {'name': 'dashboard', 'context': 'User dashboard - main interface'},
                {'name': 'invest', 'context': 'Investment page - revenue critical'}
            ]
            
            # Filter to only existing screenshots
            existing_pages = []
            for page in critical_pages:
                screenshot_path = screenshots_dir / f"{page['name']}.png"
                if screenshot_path.exists():
                    existing_pages.append(page)
            
            if existing_pages:
                analyses = analyzer.analyze_critical_pages(screenshots_dir, existing_pages)
                
                # Generate AI report
                ai_report_path = Path(project_path) / 'SCOUT94_AI_VISUAL_REPORT.json'
                ai_report = analyzer.generate_ai_report(analyses, ai_report_path)
            else:
                print("⚠️  No critical page screenshots found for AI analysis")
                
        except Exception as e:
            print(f"⚠️  AI analysis failed: {e}")
            print("   Continuing with Playwright results only...")
    
    # Phase 3: Generate Combined Report
    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("PHASE 3: GENERATING COMBINED REPORT")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    
    combined_report = generate_combined_report(
        project_path,
        visual_report,
        ai_report
    )
    
    print("\n╔═══════════════════════════════════════╗")
    print("║  HYBRID VISUAL TESTING COMPLETE       ║")
    print("╚═══════════════════════════════════════╝\n")
    
    # Summary
    print("📊 RESULTS:")
    print(f"  Playwright Tests: {visual_report['passed']}/{visual_report['total_pages']} passed")
    
    if ai_report:
        print(f"  AI Quality Score: {ai_report['summary']['average_visual_quality']:.1f}/10")
        print(f"  UX Issues Found: {ai_report['summary']['total_ux_issues']}")
        print(f"  Critical Issues: {ai_report['summary']['critical_issues']}")
        print(f"  Total Cost: ${ai_report['summary']['estimated_cost']}")
    
    print(f"\n📝 REPORTS:")
    print(f"  • SCOUT94_VISUAL_REPORT.json (Playwright)")
    if ai_report:
        print(f"  • SCOUT94_AI_VISUAL_REPORT.json (AI Analysis)")
    print(f"  • SCOUT94_HYBRID_VISUAL_REPORT.md (Combined)")
    
    print(f"\n📸 SCREENSHOTS:")
    screenshots_dir = Path(project_path) / ".scout94_screenshots"
    print(f"  • {screenshots_dir}/current/ (Latest)")
    print(f"  • {screenshots_dir}/baseline/ (Reference)")
    print(f"  • {screenshots_dir}/diff/ (Comparisons)")
    
    # Exit code
    if visual_report['failed'] > 0:
        return 1
    if ai_report and ai_report['summary']['critical_issues'] > 0:
        return 1
    return 0


def generate_combined_report(project_path, visual_report, ai_report):
    """Generate combined markdown report"""
    
    report_path = Path(project_path) / 'SCOUT94_HYBRID_VISUAL_REPORT.md'
    
    with open(report_path, 'w') as f:
        f.write("# 👁️ SCOUT94 HYBRID VISUAL TESTING REPORT\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("---\n\n")
        
        # Playwright Results
        f.write("## 🤖 AUTOMATED VISUAL TESTING (Playwright)\n\n")
        f.write(f"- **Total Pages:** {visual_report['total_pages']}\n")
        f.write(f"- **Passed:** ✅ {visual_report['passed']}\n")
        f.write(f"- **Failed:** ❌ {visual_report['failed']}\n\n")
        
        if visual_report['failed'] > 0:
            f.write("### ❌ Failed Pages\n\n")
            for result in visual_report['results']:
                if result.get('status') == 'failed':
                    f.write(f"- **{result['page']}**: {result.get('error', 'Unknown error')}\n")
            f.write("\n")
        
        # Visual Differences
        f.write("### 📊 Visual Regression Results\n\n")
        for result in visual_report['results']:
            if 'visual_diff' in result:
                diff_pct = result['visual_diff'] * 100
                status = "✅" if diff_pct < 5 else "⚠️"
                f.write(f"- **{result['page']}**: {status} {diff_pct:.1f}% difference\n")
        f.write("\n")
        
        # AI Analysis
        if ai_report:
            f.write("---\n\n")
            f.write("## 🧠 AI VISUAL ANALYSIS (GPT-4o Vision)\n\n")
            f.write(f"- **Average Quality:** {ai_report['summary']['average_visual_quality']:.1f}/10\n")
            f.write(f"- **Total UX Issues:** {ai_report['summary']['total_ux_issues']}\n")
            f.write(f"- **Critical Issues:** {ai_report['summary']['critical_issues']}\n")
            f.write(f"- **Cost:** ${ai_report['summary']['estimated_cost']}\n\n")
            
            # Critical Issues
            if ai_report['critical_issues']:
                f.write("### 🔴 Critical Issues\n\n")
                for item in ai_report['critical_issues']:
                    f.write(f"**{item['page'].upper()}**\n")
                    issue = item['issue']
                    f.write(f"- **Severity:** {issue.get('severity', 'N/A')}\n")
                    f.write(f"- **Issue:** {issue.get('issue', 'N/A')}\n")
                    f.write(f"- **Location:** {issue.get('location', 'N/A')}\n\n")
            
            # Page-by-Page Analysis
            f.write("### 📄 Page-by-Page AI Analysis\n\n")
            for analysis in ai_report['detailed_analyses']:
                if 'parse_error' in analysis or 'error' in analysis:
                    continue
                    
                page = analysis.get('page', 'Unknown')
                f.write(f"#### {page.upper()}\n\n")
                f.write(f"**Visual Quality:** {analysis.get('visual_quality_score', 'N/A')}/10\n\n")
                
                # UX Issues
                ux_issues = analysis.get('ux_issues', [])
                if ux_issues:
                    f.write("**UX Issues:**\n")
                    for issue in ux_issues:
                        severity_emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🔵"}.get(issue.get('severity', 'low'), "⚪")
                        f.write(f"- {severity_emoji} [{issue.get('severity', 'N/A').upper()}] {issue.get('issue', 'N/A')}\n")
                    f.write("\n")
                
                # Recommendations
                recommendations = analysis.get('recommendations', [])
                if recommendations:
                    f.write("**Top Recommendations:**\n")
                    for i, rec in enumerate(recommendations[:3], 1):
                        f.write(f"{i}. {rec}\n")
                    f.write("\n")
                
                f.write("---\n\n")
        
        # Overall Verdict
        f.write("## 🎯 OVERALL VERDICT\n\n")
        
        if visual_report['failed'] == 0 and (not ai_report or ai_report['summary']['critical_issues'] == 0):
            f.write("### ✅ PASSED\n\n")
            f.write("Visual testing passed with no critical issues.\n")
        elif visual_report['failed'] > 0:
            f.write("### ❌ FAILED\n\n")
            f.write(f"**Reason:** {visual_report['failed']} page(s) failed automated testing.\n")
        elif ai_report and ai_report['summary']['critical_issues'] > 0:
            f.write("### ⚠️ NEEDS ATTENTION\n\n")
            f.write(f"**Reason:** {ai_report['summary']['critical_issues']} critical UX issues detected.\n")
        
        if ai_report:
            f.write(f"\n{ai_report.get('overall_recommendation', '')}\n")
    
    return report_path


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 run_visual_tests.py <project_path> <base_url> [--no-ai]")
        print("Example: python3 run_visual_tests.py /path/to/project http://localhost:3000")
        print("\nOptions:")
        print("  --no-ai    Skip GPT-4o analysis (Playwright only, free)")
        sys.exit(1)
    
    project_path = sys.argv[1]
    base_url = sys.argv[2]
    use_ai = '--no-ai' not in sys.argv
    
    exit_code = run_hybrid_visual_tests(project_path, base_url, use_ai)
    sys.exit(exit_code)
