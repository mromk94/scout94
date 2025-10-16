/**
 * Holistic Project Analyzer
 * Phase 1: Understand the entire project before analyzing issues
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, extname, relative } from 'path';

/**
 * Phase 1: Build Project Understanding
 * - Map entire architecture
 * - Identify patterns and frameworks
 * - Understand dependencies
 * - Map data flow
 */
export function buildProjectMap(projectPath) {
  console.log('🔍 Phase 1: Building holistic project understanding...');
  
  const projectMap = {
    structure: {},
    patterns: [],
    frameworks: [],
    dependencies: {},
    entryPoints: [],
    dataFlow: [],
    architecture: null
  };
  
  // 1. Identify Architecture Pattern
  projectMap.architecture = detectArchitecture(projectPath);
  console.log(`   ✓ Architecture: ${projectMap.architecture}`);
  
  // 2. Map Directory Structure
  projectMap.structure = mapStructure(projectPath);
  console.log(`   ✓ Mapped ${Object.keys(projectMap.structure).length} directories`);
  
  // 3. Identify Frameworks and Libraries
  projectMap.frameworks = detectFrameworks(projectPath);
  console.log(`   ✓ Detected frameworks: ${projectMap.frameworks.join(', ')}`);
  
  // 4. Map Dependencies
  projectMap.dependencies = mapDependencies(projectPath);
  console.log(`   ✓ Mapped ${Object.keys(projectMap.dependencies).length} dependencies`);
  
  // 5. Find Entry Points
  projectMap.entryPoints = findEntryPoints(projectPath);
  console.log(`   ✓ Found ${projectMap.entryPoints.length} entry points`);
  
  // 6. Map Data Flow
  projectMap.dataFlow = traceDataFlow(projectPath, projectMap.structure);
  console.log(`   ✓ Traced ${projectMap.dataFlow.length} data flows`);
  
  return projectMap;
}

/**
 * Detect Architecture Pattern (MVC, Microservices, Layered, etc.)
 */
function detectArchitecture(projectPath) {
  const indicators = {
    mvc: ['controllers', 'models', 'views'],
    layered: ['api', 'business', 'data'],
    microservices: ['services', 'gateway'],
    monolithic: true // default
  };
  
  const dirs = readdirSync(projectPath).filter(d => {
    try {
      return statSync(join(projectPath, d)).isDirectory();
    } catch (e) {
      return false;
    }
  });
  
  // Check for MVC
  const hasMVC = indicators.mvc.every(dir => dirs.includes(dir));
  if (hasMVC) return 'MVC (Model-View-Controller)';
  
  // Check for Layered
  const hasLayered = indicators.layered.every(dir => dirs.includes(dir));
  if (hasLayered) return 'Layered Architecture';
  
  // Check for Microservices
  const hasMicroservices = dirs.includes('services') && dirs.length > 5;
  if (hasMicroservices) return 'Microservices';
  
  return 'Monolithic';
}

/**
 * Map Directory Structure with File Counts
 */
function mapStructure(projectPath, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return {};
  
  const structure = {};
  
  try {
    const items = readdirSync(projectPath);
    
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules' || item === 'vendor') continue;
      
      const fullPath = join(projectPath, item);
      try {
        const stats = statSync(fullPath);
        
        if (stats.isDirectory()) {
          structure[item] = {
            type: 'directory',
            children: mapStructure(fullPath, depth + 1, maxDepth),
            fileCount: countFiles(fullPath)
          };
        } else {
          structure[item] = {
            type: 'file',
            extension: extname(item),
            size: stats.size
          };
        }
      } catch (e) {
        // Skip inaccessible files
      }
    }
  } catch (e) {
    console.error(`Error mapping ${projectPath}:`, e.message);
  }
  
  return structure;
}

function countFiles(dir) {
  let count = 0;
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      try {
        const stats = statSync(fullPath);
        if (stats.isFile()) count++;
        else if (stats.isDirectory() && !item.startsWith('.')) {
          count += countFiles(fullPath);
        }
      } catch (e) {}
    }
  } catch (e) {}
  return count;
}

/**
 * Detect Frameworks and Libraries
 */
function detectFrameworks(projectPath) {
  const frameworks = [];
  
  // Check package.json for Node/JS projects
  const packageJson = join(projectPath, 'package.json');
  if (existsSync(packageJson)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps.react) frameworks.push('React');
      if (deps.vue) frameworks.push('Vue');
      if (deps.angular) frameworks.push('Angular');
      if (deps.express) frameworks.push('Express');
      if (deps.next) frameworks.push('Next.js');
    } catch (e) {}
  }
  
  // Check composer.json for PHP projects
  const composerJson = join(projectPath, 'composer.json');
  if (existsSync(composerJson)) {
    try {
      const composer = JSON.parse(readFileSync(composerJson, 'utf-8'));
      const deps = composer.require || {};
      
      if (deps['laravel/framework']) frameworks.push('Laravel');
      if (deps['symfony/symfony']) frameworks.push('Symfony');
      if (deps['slim/slim']) frameworks.push('Slim');
    } catch (e) {}
  }
  
  // Check for vanilla PHP patterns
  const dirs = readdirSync(projectPath);
  if (dirs.includes('index.php') && !frameworks.length) {
    frameworks.push('Vanilla PHP');
  }
  
  return frameworks.length ? frameworks : ['Custom'];
}

/**
 * Map File Dependencies
 */
function mapDependencies(projectPath) {
  const dependencies = {};
  
  function scanFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const deps = [];
      
      // PHP requires/includes
      const phpRequires = content.match(/require(_once)?\s*\(?['"](.+?)['"]\)?/g) || [];
      deps.push(...phpRequires.map(r => r.match(/['"](.+?)['"]/)?.[1]).filter(Boolean));
      
      // JS imports
      const jsImports = content.match(/import\s+.+?\s+from\s+['"](.+?)['"]/g) || [];
      deps.push(...jsImports.map(i => i.match(/from\s+['"](.+?)['"]/)?.[1]).filter(Boolean));
      
      return deps;
    } catch (e) {
      return [];
    }
  }
  
  function scanDir(dir, depth = 0) {
    if (depth > 2) return;
    
    try {
      const items = readdirSync(dir);
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules' || item === 'vendor') continue;
        
        const fullPath = join(dir, item);
        try {
          const stats = statSync(fullPath);
          if (stats.isFile() && ['.php', '.js', '.jsx'].includes(extname(item))) {
            const relativePath = relative(projectPath, fullPath);
            dependencies[relativePath] = scanFile(fullPath);
          } else if (stats.isDirectory()) {
            scanDir(fullPath, depth + 1);
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
  
  scanDir(projectPath);
  return dependencies;
}

/**
 * Find Application Entry Points
 */
function findEntryPoints(projectPath) {
  const entryPoints = [];
  
  const commonEntries = [
    'index.php',
    'index.js',
    'app.js',
    'main.js',
    'server.js',
    'public/index.php',
    'src/index.js',
    'src/main.js'
  ];
  
  for (const entry of commonEntries) {
    const fullPath = join(projectPath, entry);
    if (existsSync(fullPath)) {
      entryPoints.push({
        file: entry,
        type: extname(entry).slice(1),
        path: fullPath
      });
    }
  }
  
  return entryPoints;
}

/**
 * Trace Data Flow Through the Application
 */
function traceDataFlow(projectPath, structure) {
  const flows = [];
  
  // Look for common data flow patterns
  const patterns = {
    'Database → API → Frontend': ['database', 'api', 'public'],
    'Form → Controller → Model → Database': ['forms', 'controllers', 'models', 'database'],
    'Request → Middleware → Handler → Response': ['middleware', 'handlers', 'routes']
  };
  
  for (const [flowName, components] of Object.entries(patterns)) {
    const hasAllComponents = components.every(comp => 
      Object.keys(structure).some(key => key.toLowerCase().includes(comp))
    );
    
    if (hasAllComponents) {
      flows.push({
        name: flowName,
        components: components,
        verified: true
      });
    }
  }
  
  return flows;
}

export default {
  buildProjectMap
};
