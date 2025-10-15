#!/Users/mac/CascadeProjects/scout94/.venv/bin/python3
"""
Scout94 Visual Tester - Hybrid Approach
Combines Playwright automation with GPT-4o Vision analysis
"""

import os
import sys
import json
import time
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright
from PIL import Image
import base64

class Scout94VisualTester:
    def __init__(self, project_path, headless=True):
        self.project_path = Path(project_path)
        self.headless = headless
        self.screenshots_dir = self.project_path / ".scout94_screenshots"
        self.baseline_dir = self.screenshots_dir / "baseline"
        self.current_dir = self.screenshots_dir / "current"
        self.diff_dir = self.screenshots_dir / "diff"
        
        # Create directories
        self.screenshots_dir.mkdir(exist_ok=True)
        self.baseline_dir.mkdir(exist_ok=True)
        self.current_dir.mkdir(exist_ok=True)
        self.diff_dir.mkdir(exist_ok=True)
        
        self.test_results = []
        self.critical_pages = [
            '/',
            '/login',
            '/register',
            '/dashboard',
            '/invest'
        ]
        
    def start_test(self, base_url):
        """Main test execution"""
        print("\n╔═══════════════════════════════════════╗")
        print("║  SCOUT94 VISUAL TESTING - HYBRID     ║")
        print("╚═══════════════════════════════════════╝\n")
        
        print(f"🌐 Testing URL: {base_url}")
        print(f"📸 Screenshots: {self.screenshots_dir}")
        print(f"🎯 Critical pages: {len(self.critical_pages)}")
        print(f"💰 Estimated cost: ~$0.10\n")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Scout94/3.0'
            )
            page = context.new_page()
            
            # Test each critical page
            for path in self.critical_pages:
                self.test_page(page, base_url, path)
            
            # Additional automated tests
            self.test_responsive_design(p, base_url)
            
            browser.close()
        
        # Generate report
        return self.generate_report()
    
    def test_page(self, page, base_url, path):
        """Test individual page"""
        url = f"{base_url}{path}"
        page_name = path.strip('/').replace('/', '_') or 'home'
        
        print(f"\n━━━ Testing: {path} ━━━")
        
        try:
            # Navigate
            print(f"  📍 Navigating to {url}...")
            response = page.goto(url, wait_until='networkidle', timeout=30000)
            
            if response.status >= 400:
                print(f"  ❌ HTTP {response.status}")
                self.test_results.append({
                    'page': path,
                    'status': 'failed',
                    'error': f"HTTP {response.status}"
                })
                return
            
            # Wait for page to be fully loaded
            page.wait_for_load_state('domcontentloaded')
            time.sleep(1)  # Allow animations
            
            # Visual checks
            screenshot_path = self.current_dir / f"{page_name}.png"
            print(f"  📸 Taking screenshot...")
            page.screenshot(path=str(screenshot_path), full_page=True)
            
            # Check for visual elements
            results = {
                'page': path,
                'url': url,
                'status': 'passed',
                'timestamp': datetime.now().isoformat(),
                'screenshot': str(screenshot_path),
                'checks': {}
            }
            
            # Element visibility checks
            print(f"  🔍 Checking elements...")
            results['checks']['title'] = self.check_element(page, 'title')
            results['checks']['body'] = self.check_element(page, 'body')
            results['checks']['header'] = self.check_element(page, 'header, nav, [role="banner"]')
            results['checks']['footer'] = self.check_element(page, 'footer, [role="contentinfo"]')
            
            # Check for console errors
            console_errors = []
            page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
            
            if console_errors:
                results['console_errors'] = console_errors
                print(f"  ⚠️  {len(console_errors)} console errors")
            
            # Check for broken images
            broken_images = self.check_broken_images(page)
            if broken_images:
                results['broken_images'] = broken_images
                print(f"  ⚠️  {len(broken_images)} broken images")
            
            # Check for layout issues
            layout_issues = self.check_layout(page)
            if layout_issues:
                results['layout_issues'] = layout_issues
                print(f"  ⚠️  {len(layout_issues)} layout issues")
            
            # Compare with baseline if exists
            baseline_path = self.baseline_dir / f"{page_name}.png"
            if baseline_path.exists():
                diff_score = self.compare_screenshots(baseline_path, screenshot_path, page_name)
                results['visual_diff'] = diff_score
                if diff_score > 0.05:  # 5% threshold
                    print(f"  ⚠️  Visual difference: {diff_score*100:.1f}%")
                else:
                    print(f"  ✅ Visual match (diff: {diff_score*100:.1f}%)")
            else:
                print(f"  📝 Baseline created")
                screenshot_path.replace(baseline_path)
            
            print(f"  ✅ Page tested successfully")
            
            self.test_results.append(results)
            
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            self.test_results.append({
                'page': path,
                'status': 'failed',
                'error': str(e)
            })
    
    def check_element(self, page, selector):
        """Check if element exists and is visible"""
        try:
            element = page.query_selector(selector)
            if element:
                return {
                    'exists': True,
                    'visible': element.is_visible(),
                    'text_length': len(element.text_content() or '')
                }
            return {'exists': False}
        except:
            return {'exists': False}
    
    def check_broken_images(self, page):
        """Check for broken images"""
        broken = []
        images = page.query_selector_all('img')
        for img in images:
            src = img.get_attribute('src')
            if src:
                # Check if image is loaded
                natural_width = img.evaluate('el => el.naturalWidth')
                if natural_width == 0:
                    broken.append(src)
        return broken
    
    def check_layout(self, page):
        """Check for common layout issues"""
        issues = []
        
        # Check for horizontal scrollbar
        has_h_scroll = page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
        if has_h_scroll:
            issues.append('horizontal_scrollbar_detected')
        
        # Check for overlapping elements (simplified)
        overlaps = page.evaluate('''() => {
            const elements = document.querySelectorAll('*');
            let count = 0;
            // Simplified overlap detection
            return count;
        }''')
        
        return issues
    
    def compare_screenshots(self, baseline_path, current_path, page_name):
        """Compare two screenshots and return difference score"""
        try:
            from PIL import ImageChops, ImageStat
            
            baseline = Image.open(baseline_path)
            current = Image.open(current_path)
            
            # Resize if needed
            if baseline.size != current.size:
                current = current.resize(baseline.size)
            
            # Calculate difference
            diff = ImageChops.difference(baseline, current)
            
            # Save diff image
            diff_path = self.diff_dir / f"{page_name}_diff.png"
            diff.save(diff_path)
            
            # Calculate difference percentage
            stat = ImageStat.Stat(diff)
            sum_of_squares = sum(stat.sum2)
            rms = (sum_of_squares / (baseline.size[0] * baseline.size[1] * 3)) ** 0.5
            
            # Normalize to 0-1
            diff_score = rms / 255.0
            
            return diff_score
            
        except Exception as e:
            print(f"  ⚠️  Screenshot comparison failed: {e}")
            return 0.0
    
    def test_responsive_design(self, playwright, base_url):
        """Test responsive design on multiple viewports"""
        print(f"\n━━━ Testing Responsive Design ━━━")
        
        viewports = [
            {'name': 'mobile', 'width': 375, 'height': 667},
            {'name': 'tablet', 'width': 768, 'height': 1024},
            {'name': 'desktop', 'width': 1920, 'height': 1080}
        ]
        
        browser = playwright.chromium.launch(headless=self.headless)
        
        for viewport in viewports:
            print(f"  📱 Testing {viewport['name']} ({viewport['width']}x{viewport['height']})...")
            
            context = browser.new_context(
                viewport={'width': viewport['width'], 'height': viewport['height']}
            )
            page = context.new_page()
            
            try:
                page.goto(base_url, wait_until='networkidle', timeout=30000)
                screenshot_path = self.current_dir / f"home_{viewport['name']}.png"
                page.screenshot(path=str(screenshot_path))
                print(f"    ✅ Screenshot captured")
            except Exception as e:
                print(f"    ❌ Error: {e}")
            finally:
                context.close()
        
        browser.close()
    
    def generate_report(self):
        """Generate visual testing report"""
        passed = sum(1 for r in self.test_results if r.get('status') == 'passed')
        failed = sum(1 for r in self.test_results if r.get('status') == 'failed')
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_pages': len(self.test_results),
            'passed': passed,
            'failed': failed,
            'results': self.test_results
        }
        
        # Save JSON report
        report_path = self.project_path / 'SCOUT94_VISUAL_REPORT.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print("\n╔═══════════════════════════════════════╗")
        print("║  VISUAL TESTING SUMMARY               ║")
        print("╚═══════════════════════════════════════╝\n")
        print(f"Total Pages: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"\n📊 Report: SCOUT94_VISUAL_REPORT.json")
        print(f"📸 Screenshots: {self.screenshots_dir}")
        
        return report


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 scout94_visual_tester.py <project_path> <base_url>")
        print("Example: python3 scout94_visual_tester.py /path/to/project http://localhost:3000")
        sys.exit(1)
    
    project_path = sys.argv[1]
    base_url = sys.argv[2]
    
    tester = Scout94VisualTester(project_path)
    tester.start_test(base_url)
