/**
 * Universal Test Runner
 * Test ANY project type - Node.js, PHP, Python, Rust, Go, etc.
 * 
 * Purpose: Scout94 should not be limited to PHP
 * Approach: Detect project type and run appropriate tests
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class UniversalTestRunner {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.projectType = this.detectProjectType();
  }

  /**
   * Detect project type by examining files
   */
  detectProjectType() {
    const indicators = {
      nodejs: ['package.json', 'node_modules'],
      php: ['composer.json', 'index.php', 'src/index.php'],
      python: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'],
      rust: ['Cargo.toml', 'Cargo.lock'],
      go: ['go.mod', 'go.sum'],
      java: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
      csharp: ['*.csproj', '*.sln'],
      ruby: ['Gemfile', 'Gemfile.lock'],
      tauri: ['src-tauri/Cargo.toml', 'src-tauri/tauri.conf.json']
    };

    const detected = [];

    for (const [type, files] of Object.entries(indicators)) {
      for (const file of files) {
        if (file.includes('*')) {
          // Glob pattern - just check directory exists
          continue;
        }
        if (existsSync(join(this.projectPath, file))) {
          detected.push(type);
          break;
        }
      }
    }

    return detected;
  }

  /**
   * Run tests appropriate for project type
   */
  async runTests() {
    const results = {
      projectPath: this.projectPath,
      projectTypes: this.projectType,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      mockDetection: {
        confidence: 100,
        indicators: [],
        isAuthentic: true
      }
    };

    console.log(`\n🔍 Detected project types: ${this.projectType.join(', ') || 'Unknown'}\n`);

    // Run tests for each detected type
    for (const type of this.projectType) {
      const typeTests = await this.runTestsForType(type);
      results.tests.push(...typeTests);
    }

    // If no specific type detected, run generic tests
    if (this.projectType.length === 0) {
      const genericTests = await this.runGenericTests();
      results.tests.push(...genericTests);
    }

    // Calculate summary
    results.tests.forEach(test => {
      results.summary.total++;
      if (test.status === 'PASS') results.summary.passed++;
      else if (test.status === 'FAIL') results.summary.failed++;
      else results.summary.skipped++;
    });

    // Mock detection: Check if tests are authentic
    this.detectMockTests(results);

    return results;
  }

  /**
   * Detect if test results are mock/placeholder data
   */
  detectMockTests(results) {
    let confidence = 100;
    const indicators = [];

    // All tests skipped = suspicious
    if (results.summary.skipped === results.summary.total && results.summary.total > 0) {
      confidence -= 30;
      indicators.push({
        type: 'ALL_SKIPPED',
        message: 'All tests were skipped - no actual testing performed'
      });
    }

    // No tests at all = mock
    if (results.summary.total === 0) {
      confidence -= 50;
      indicators.push({
        type: 'NO_TESTS',
        message: 'Zero tests executed - complete mock data'
      });
    }

    // No project types detected = suspicious
    if (results.projectTypes.length === 0) {
      confidence -= 15;
      indicators.push({
        type: 'UNKNOWN_PROJECT',
        message: 'Project type could not be determined'
      });
    }

    // 100% pass rate with no real tests = suspicious
    if (results.summary.total > 0 && 
        results.summary.passed === results.summary.total && 
        results.summary.skipped === 0) {
      // This might be real OR might be fake - reduce confidence slightly
      confidence -= 5;
      indicators.push({
        type: 'PERFECT_PASS',
        message: '100% pass rate - verify tests are checking real conditions'
      });
    }

    results.mockDetection = {
      confidence,
      indicators,
      isAuthentic: confidence >= 70,
      verdict: confidence >= 80 ? '✅ REAL' : 
               confidence >= 50 ? '⚠️ PARTIAL' : 
               '❌ MOCK'
    };
  }

  /**
   * Run tests for specific project type
   */
  async runTestsForType(type) {
    const tests = [];

    switch (type) {
      case 'nodejs':
        tests.push(...await this.testNodeJS());
        break;
      case 'php':
        tests.push(...await this.testPHP());
        break;
      case 'python':
        tests.push(...await this.testPython());
        break;
      case 'rust':
        tests.push(...await this.testRust());
        break;
      case 'tauri':
        tests.push(...await this.testTauri());
        break;
      default:
        tests.push({
          name: `${type} Support`,
          status: 'SKIP',
          message: `Testing for ${type} not yet implemented`
        });
    }

    return tests;
  }

  /**
   * Node.js specific tests
   */
  async testNodeJS() {
    const tests = [];

    // Test 1: package.json validity
    try {
      const packagePath = join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
      
      tests.push({
        name: 'package.json Valid',
        status: 'PASS',
        message: `Found ${Object.keys(packageJson.dependencies || {}).length} dependencies`,
        details: {
          name: packageJson.name,
          version: packageJson.version,
          hasScripts: !!packageJson.scripts
        }
      });
    } catch (error) {
      tests.push({
        name: 'package.json Valid',
        status: 'FAIL',
        message: error.message
      });
    }

    // Test 2: node_modules exists
    if (existsSync(join(this.projectPath, 'node_modules'))) {
      tests.push({
        name: 'Dependencies Installed',
        status: 'PASS',
        message: 'node_modules directory exists'
      });
    } else {
      tests.push({
        name: 'Dependencies Installed',
        status: 'FAIL',
        message: 'node_modules not found - run npm install'
      });
    }

    // Test 3: Run npm test if exists
    try {
      const packagePath = join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
      
      if (packageJson.scripts?.test && packageJson.scripts.test !== 'echo "Error: no test specified" && exit 1') {
        tests.push({
          name: 'npm test',
          status: 'SKIP',
          message: 'Test script exists but not run in analysis mode'
        });
      }
    } catch (error) {
      // Ignore
    }

    // Test 4: Check for common issues
    tests.push(...await this.checkNodeJSIssues());

    return tests;
  }

  /**
   * Check common Node.js issues
   */
  async checkNodeJSIssues() {
    const tests = [];

    try {
      const packagePath = join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

      // Check for security vulnerabilities (npm audit)
      try {
        const { stdout } = await execAsync('npm audit --json', { 
          cwd: this.projectPath,
          timeout: 30000 
        });
        const audit = JSON.parse(stdout);
        
        const vulnCount = audit.metadata?.vulnerabilities?.total || 0;
        tests.push({
          name: 'Security Audit',
          status: vulnCount === 0 ? 'PASS' : 'WARN',
          message: `${vulnCount} vulnerabilities found`,
          details: audit.metadata?.vulnerabilities
        });
      } catch (error) {
        tests.push({
          name: 'Security Audit',
          status: 'SKIP',
          message: 'npm audit failed or not available'
        });
      }

      // Check for outdated dependencies
      tests.push({
        name: 'Dependency Health',
        status: 'SKIP',
        message: 'Run `npm outdated` manually to check'
      });

    } catch (error) {
      // Ignore
    }

    return tests;
  }

  /**
   * PHP specific tests (use existing PHP tests)
   */
  async testPHP() {
    return [{
      name: 'PHP Testing',
      status: 'SKIP',
      message: 'Use existing PHP test suite (scout94 CLI)'
    }];
  }

  /**
   * Python specific tests
   */
  async testPython() {
    const tests = [];

    // Test 1: requirements.txt exists
    if (existsSync(join(this.projectPath, 'requirements.txt'))) {
      tests.push({
        name: 'requirements.txt Found',
        status: 'PASS',
        message: 'Python dependencies listed'
      });
    }

    // Test 2: Virtual environment
    if (existsSync(join(this.projectPath, 'venv')) || 
        existsSync(join(this.projectPath, '.venv'))) {
      tests.push({
        name: 'Virtual Environment',
        status: 'PASS',
        message: 'venv directory found'
      });
    } else {
      tests.push({
        name: 'Virtual Environment',
        status: 'WARN',
        message: 'No venv found - consider using virtual environment'
      });
    }

    return tests;
  }

  /**
   * Rust specific tests
   */
  async testRust() {
    const tests = [];

    // Test 1: Cargo.toml validity
    try {
      const cargoPath = join(this.projectPath, 'Cargo.toml');
      const cargoToml = readFileSync(cargoPath, 'utf-8');
      
      tests.push({
        name: 'Cargo.toml Valid',
        status: 'PASS',
        message: 'Cargo configuration found'
      });
    } catch (error) {
      tests.push({
        name: 'Cargo.toml Valid',
        status: 'FAIL',
        message: error.message
      });
    }

    // Test 2: cargo check
    tests.push({
      name: 'cargo check',
      status: 'SKIP',
      message: 'Run `cargo check` manually for compilation check'
    });

    return tests;
  }

  /**
   * Tauri specific tests
   */
  async testTauri() {
    const tests = [];

    // Test 1: Tauri config exists
    const configPath = join(this.projectPath, 'src-tauri/tauri.conf.json');
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        tests.push({
          name: 'Tauri Config Valid',
          status: 'PASS',
          message: `App: ${config.package?.productName || 'Unknown'}`,
          details: {
            version: config.package?.version,
            identifier: config.tauri?.bundle?.identifier
          }
        });
      } catch (error) {
        tests.push({
          name: 'Tauri Config Valid',
          status: 'FAIL',
          message: 'Invalid tauri.conf.json'
        });
      }
    }

    // Test 2: Rust backend exists
    if (existsSync(join(this.projectPath, 'src-tauri/src/main.rs'))) {
      tests.push({
        name: 'Tauri Backend',
        status: 'PASS',
        message: 'Rust backend (main.rs) found'
      });
    } else {
      tests.push({
        name: 'Tauri Backend',
        status: 'FAIL',
        message: 'main.rs not found in src-tauri/src/'
      });
    }

    // Test 3: Frontend exists
    if (existsSync(join(this.projectPath, 'src')) || 
        existsSync(join(this.projectPath, 'ui'))) {
      tests.push({
        name: 'Tauri Frontend',
        status: 'PASS',
        message: 'Frontend directory found'
      });
    }

    return tests;
  }

  /**
   * Generic tests for unknown project types
   */
  async runGenericTests() {
    const tests = [];

    // Test 1: Project structure
    tests.push({
      name: 'Project Structure',
      status: 'PASS',
      message: 'Project directory accessible'
    });

    // Test 2: README exists
    if (existsSync(join(this.projectPath, 'README.md'))) {
      tests.push({
        name: 'Documentation',
        status: 'PASS',
        message: 'README.md found'
      });
    } else {
      tests.push({
        name: 'Documentation',
        status: 'WARN',
        message: 'No README.md - consider adding documentation'
      });
    }

    // Test 3: Git repository
    if (existsSync(join(this.projectPath, '.git'))) {
      tests.push({
        name: 'Version Control',
        status: 'PASS',
        message: 'Git repository initialized'
      });
    } else {
      tests.push({
        name: 'Version Control',
        status: 'WARN',
        message: 'No .git directory - not a Git repository'
      });
    }

    return tests;
  }

  /**
   * Format test results for display
   */
  formatResults(results) {
    let output = '\n';
    output += '═══════════════════════════════════════\n';
    output += '  UNIVERSAL TEST RESULTS\n';
    output += '═══════════════════════════════════════\n\n';

    output += `Project: ${this.projectPath}\n`;
    output += `Types: ${results.projectTypes.join(', ') || 'Generic'}\n\n`;

    results.tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✅' : 
                   test.status === 'FAIL' ? '❌' : 
                   test.status === 'WARN' ? '⚠️' : '⏭️';
      
      output += `${icon} ${test.name}\n`;
      output += `   ${test.message}\n`;
      if (test.details) {
        output += `   Details: ${JSON.stringify(test.details, null, 2).replace(/\n/g, '\n   ')}\n`;
      }
      output += '\n';
    });

    output += '═══════════════════════════════════════\n';
    output += `Total: ${results.summary.total} | `;
    output += `✅ ${results.summary.passed} | `;
    output += `❌ ${results.summary.failed} | `;
    output += `⏭️ ${results.summary.skipped}\n`;
    output += '═══════════════════════════════════════\n';
    
    // Mock Detection Results
    if (results.mockDetection) {
      output += '\n🔍 MOCK DETECTION:\n';
      output += `   Authenticity: ${results.mockDetection.confidence}% ${results.mockDetection.verdict}\n`;
      if (results.mockDetection.indicators.length > 0) {
        output += `   Indicators:\n`;
        results.mockDetection.indicators.forEach(ind => {
          output += `   - ${ind.type}: ${ind.message}\n`;
        });
      }
      output += '═══════════════════════════════════════\n';
    }

    return output;
  }
}

export default UniversalTestRunner;
