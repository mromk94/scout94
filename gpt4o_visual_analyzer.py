#!/Users/mac/CascadeProjects/scout94/.venv/bin/python3
"""
GPT-4o Visual Analyzer
Uses GPT-4o Vision API to analyze screenshots like a human
"""

import os
import sys
import json
import base64
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

class GPT4oVisualAnalyzer:
    def __init__(self, project_path):
        self.project_path = Path(project_path)
        
        # Load API key
        load_dotenv('/Users/mac/CascadeProjects/scout94/.env')
        api_key = os.getenv('OPENAI_API_KEY')
        
        if not api_key:
            raise Exception("OPENAI_API_KEY not found in .env")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o"
        
    def encode_image(self, image_path):
        """Encode image to base64"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def analyze_screenshot(self, screenshot_path, page_name, context=""):
        """Analyze a screenshot with GPT-4o Vision"""
        print(f"\n🤖 AI analyzing: {page_name}...")
        
        # Encode image
        base64_image = self.encode_image(screenshot_path)
        
        # Construct prompt
        prompt = f"""You are an expert UX/UI reviewer analyzing a webpage screenshot.

Page: {page_name}
Context: {context}

Please analyze this screenshot and provide:

1. **Visual Quality** (1-10):
   - Layout & spacing
   - Color scheme
   - Typography
   - Image quality
   
2. **UX Issues** (Critical/High/Medium/Low):
   - Navigation clarity
   - Call-to-action visibility
   - Form usability
   - Error handling
   - Mobile responsiveness indicators
   
3. **Design Flaws**:
   - Overlapping elements
   - Poor contrast
   - Inconsistent styling
   - Broken layouts
   
4. **Accessibility Concerns**:
   - Text readability
   - Button sizes
   - Color contrast
   - Visual hierarchy

5. **Recommendations** (top 3 priorities)

Format your response as JSON:
{{
  "visual_quality_score": 8,
  "ux_issues": [
    {{"severity": "high", "issue": "Login button hard to find", "location": "top right"}}
  ],
  "design_flaws": ["text overlapping image", "poor color contrast"],
  "accessibility": {{"score": 7, "issues": ["small text size"]}},
  "recommendations": ["Make CTA more prominent", "Improve contrast", "Fix spacing"],
  "overall_impression": "Professional but needs UX improvements",
  "human_verdict": "Would a first-time user be confused? Yes/No and why"
}}

Be honest and critical. Focus on real user experience."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=2000,
                temperature=0.3
            )
            
            analysis_text = response.choices[0].message.content
            
            # Try to parse JSON from response
            try:
                # Extract JSON if wrapped in markdown
                if '```json' in analysis_text:
                    json_str = analysis_text.split('```json')[1].split('```')[0].strip()
                else:
                    json_str = analysis_text
                
                analysis = json.loads(json_str)
                
                # Add metadata
                analysis['page'] = page_name
                analysis['cost_estimate'] = 0.007  # Approximate
                analysis['model'] = self.model
                
                print(f"  ✅ AI analysis complete")
                print(f"  📊 Visual Quality: {analysis.get('visual_quality_score', 'N/A')}/10")
                print(f"  ⚠️  Issues found: {len(analysis.get('ux_issues', []))}")
                
                return analysis
                
            except json.JSONDecodeError:
                # Fallback: return raw text
                return {
                    'page': page_name,
                    'raw_analysis': analysis_text,
                    'parse_error': True
                }
            
        except Exception as e:
            print(f"  ❌ AI analysis failed: {e}")
            return {
                'page': page_name,
                'error': str(e)
            }
    
    def analyze_critical_pages(self, screenshots_dir, pages):
        """Analyze multiple critical pages"""
        print("\n╔═══════════════════════════════════════╗")
        print("║  GPT-4O VISUAL ANALYSIS               ║")
        print("╚═══════════════════════════════════════╝\n")
        
        print(f"🎯 Analyzing {len(pages)} critical pages...")
        print(f"💰 Estimated cost: ~${len(pages) * 0.007:.2f}\n")
        
        analyses = []
        
        for page_info in pages:
            page_name = page_info['name']
            screenshot_path = screenshots_dir / f"{page_name}.png"
            
            if not screenshot_path.exists():
                print(f"⚠️  Screenshot not found: {page_name}")
                continue
            
            analysis = self.analyze_screenshot(
                screenshot_path,
                page_name,
                context=page_info.get('context', '')
            )
            
            analyses.append(analysis)
        
        return analyses
    
    def compare_pages(self, screenshot1_path, screenshot2_path, purpose):
        """Compare two screenshots (e.g., before/after, mobile/desktop)"""
        print(f"\n🔄 Comparing screenshots: {purpose}")
        
        base64_img1 = self.encode_image(screenshot1_path)
        base64_img2 = self.encode_image(screenshot2_path)
        
        prompt = f"""Compare these two screenshots and identify:

Purpose: {purpose}

1. Visual differences
2. Layout changes
3. Which version is better for UX?
4. Any regressions?

Provide JSON response with your findings."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/png;base64,{base64_img1}"}
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/png;base64,{base64_img2}"}
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"  ❌ Comparison failed: {e}")
            return None
    
    def generate_ai_report(self, analyses, output_path):
        """Generate comprehensive AI analysis report"""
        
        # Calculate aggregates
        total_pages = len(analyses)
        avg_quality = sum(a.get('visual_quality_score', 0) for a in analyses) / total_pages if total_pages > 0 else 0
        total_issues = sum(len(a.get('ux_issues', [])) for a in analyses)
        
        # Critical issues
        critical_issues = []
        for analysis in analyses:
            for issue in analysis.get('ux_issues', []):
                if issue.get('severity') == 'critical' or issue.get('severity') == 'high':
                    critical_issues.append({
                        'page': analysis.get('page'),
                        'issue': issue
                    })
        
        report = {
            'summary': {
                'total_pages_analyzed': total_pages,
                'average_visual_quality': round(avg_quality, 1),
                'total_ux_issues': total_issues,
                'critical_issues': len(critical_issues),
                'estimated_cost': round(total_pages * 0.007, 2)
            },
            'critical_issues': critical_issues,
            'detailed_analyses': analyses,
            'overall_recommendation': self._get_overall_recommendation(avg_quality, total_issues)
        }
        
        # Save report
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print("\n╔═══════════════════════════════════════╗")
        print("║  AI ANALYSIS SUMMARY                  ║")
        print("╚═══════════════════════════════════════╝\n")
        print(f"📊 Pages Analyzed: {total_pages}")
        print(f"⭐ Avg Quality: {avg_quality:.1f}/10")
        print(f"⚠️  Total Issues: {total_issues}")
        print(f"🔴 Critical: {len(critical_issues)}")
        print(f"💰 Cost: ${report['summary']['estimated_cost']}")
        print(f"\n📝 Report: {output_path.name}")
        
        return report
    
    def _get_overall_recommendation(self, avg_quality, total_issues):
        """Generate overall recommendation"""
        if avg_quality >= 8 and total_issues < 5:
            return "✅ Excellent UX - Ready for production"
        elif avg_quality >= 6 and total_issues < 10:
            return "🟡 Good UX - Minor improvements recommended"
        else:
            return "🔴 UX needs improvement - Address critical issues before launch"


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 gpt4o_visual_analyzer.py <project_path>")
        sys.exit(1)
    
    project_path = sys.argv[1]
    analyzer = GPT4oVisualAnalyzer(project_path)
    
    # Example: Analyze critical pages
    screenshots_dir = Path(project_path) / ".scout94_screenshots" / "current"
    
    pages = [
        {'name': 'home', 'context': 'Main landing page'},
        {'name': 'login', 'context': 'User login page'},
        {'name': 'dashboard', 'context': 'User dashboard after login'}
    ]
    
    analyses = analyzer.analyze_critical_pages(screenshots_dir, pages)
    
    # Generate report
    report_path = Path(project_path) / 'SCOUT94_AI_VISUAL_REPORT.json'
    analyzer.generate_ai_report(analyses, report_path)
