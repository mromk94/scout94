import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Code, Terminal, CheckCircle, XCircle, AlertCircle, ChevronRight, FileCode, FolderOpen, Search, ChevronDown, File } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';

// Register languages
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('jsx', javascript);
SyntaxHighlighter.registerLanguage('css', css);

export default function IDEPane({ isRunning, messages, projectPath }) {
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(null);
  const [markdownFilePath, setMarkdownFilePath] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [fileContents, setFileContents] = useState({});
  
  // Listen for file display messages from WebSocket
  useEffect(() => {
    if (!messages) return;
    
    const fileDisplayMsg = messages.find(m => m.type === 'file_display');
    if (fileDisplayMsg && fileDisplayMsg.filePath) {
      loadMarkdownFile(fileDisplayMsg.filePath);
    }
  }, [messages]);
  
  const loadMarkdownFile = async (filePath) => {
    try {
      const content = await invoke('read_file_content', { filePath });
      setMarkdownContent(content);
      setMarkdownFilePath(filePath);
      
      // Add markdown file as a new tab
      const tabId = 'analysis_report';
      const newTab = {
        id: tabId,
        path: filePath,
        name: 'ANALYSIS-REPORT.md',
        language: 'markdown',
        isMarkdown: true
      };
      
      setOpenTabs(prev => {
        const exists = prev.find(t => t.id === tabId);
        if (exists) return prev;
        return [...prev, newTab];
      });
      setActiveTabId(tabId);
    } catch (error) {
      console.error('Failed to load markdown file:', error);
    }
  };
  
  const openFileInTab = (filePath, fileName, language) => {
    const tabId = filePath.replace(/[^a-zA-Z0-9]/g, '_');
    const newTab = {
      id: tabId,
      path: filePath,
      name: fileName,
      language: language || 'text'
    };
    
    setOpenTabs(prev => {
      const exists = prev.find(t => t.id === tabId);
      if (exists) {
        setActiveTabId(tabId);
        return prev;
      }
      return [...prev, newTab];
    });
    setActiveTabId(tabId);
  };
  
  const closeTab = (tabId, e) => {
    e?.stopPropagation();
    setOpenTabs(prev => {
      const filtered = prev.filter(t => t.id !== tabId);
      // If closing active tab, switch to last tab
      if (activeTabId === tabId && filtered.length > 0) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };
  
  const getActiveTab = () => {
    return openTabs.find(t => t.id === activeTabId);
  };

  // Load real file tree from project directory
  useEffect(() => {  
    loadFileTree();
  }, [projectPath]);
  
  const loadFileTree = async () => {
    if (!projectPath) return;
    
    setIsLoadingTree(true);
    try {
      const tree = await invoke('read_directory_tree', { 
        directoryPath: projectPath,
        maxDepth: 4 
      });
      
      // Convert from Rust format to component format
      const convertedTree = tree.map(node => convertNode(node));
      setFileTree(convertedTree);
      
      // Auto-expand first level folders
      const topLevelFolders = tree
        .filter(node => node.is_directory)
        .map(node => node.path);
      setExpandedFolders(topLevelFolders);
    } catch (error) {
      console.error('Failed to load file tree:', error);
      setFileTree([]);
    } finally {
      setIsLoadingTree(false);
    }
  };
  
  const convertNode = (node) => {
    return {
      type: node.is_directory ? 'folder' : 'file',
      name: node.name,
      path: node.path,
      language: node.language || 'text',
      children: node.children ? node.children.map(child => convertNode(child)) : undefined
    };
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) =>
      prev.includes(folderPath) ? prev.filter((f) => f !== folderPath) : [...prev, folderPath]
    );
  };
  
  const loadFileContent = async (filePath) => {
    // Check cache first
    if (fileContents[filePath]) {
      return fileContents[filePath];
    }
    
    try {
      const content = await invoke('read_file_content', { filePath });
      setFileContents(prev => ({ ...prev, [filePath]: content }));
      return content;
    } catch (error) {
      console.error('Failed to load file:', error);
      return `// Error loading file: ${error}`;
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.php')) return '🐘';
    if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) return '⚛️';
    if (fileName.endsWith('.css')) return '🎨';
    if (fileName.endsWith('.md')) return '📝';
    if (fileName.endsWith('.json')) return '⚙️';
    return '📄';
  };

  const renderFileTree = (items, depth = 0) => {
    if (!items || items.length === 0) return null;
    
    return items.map((item, index) => (
      <div key={item.path || index}>
        {item.type === 'folder' ? (
          <>
            <div
              onClick={() => toggleFolder(item.path)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer group"
              style={{ paddingLeft: `${depth * 12 + 12}px` }}
            >
              {expandedFolders.includes(item.path) ? (
                <ChevronDown className="w-4 h-4 text-blue-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-blue-400" />
              )}
              <FolderOpen className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">{item.name}</span>
              {item.children && (
                <span className="text-xs text-gray-500 ml-auto">{item.children.length}</span>
              )}
            </div>
            {expandedFolders.includes(item.path) && item.children && (
              <div>{renderFileTree(item.children, depth + 1)}</div>
            )}
          </>
        ) : (
          <div
            onClick={async () => {
              const content = await loadFileContent(item.path);
              openFileInTab(item.path, item.name, item.language);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer group ${
              openTabs.some(tab => tab.path === item.path && tab.id === activeTabId)
                ? 'bg-blue-600/30 border-l-2 border-blue-500'
                : 'hover:bg-white/5'
            }`}
            style={{ paddingLeft: `${depth * 12 + 28}px` }}
          >
            <span className="text-lg">{getFileIcon(item.name)}</span>
            <span className="text-sm truncate">{item.name}</span>
          </div>
        )}
      </div>
    ));
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="h-full flex overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* File Explorer Sidebar */}
      <div
        className="bg-slate-900/80 border-r border-slate-700 flex flex-col flex-shrink-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="px-4 py-3 border-b border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">📁 EXPLORER</span>
            <button
              onClick={loadFileTree}
              className="p-1 hover:bg-white/10 rounded transition"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          {projectPath && (
            <div className="text-xs text-gray-400 truncate" title={projectPath}>
              {projectPath.split('/').pop()}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingTree ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : fileTree.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              No files found<br/>
              <span className="text-xs">Select a project to explore</span>
            </div>
          ) : (
            renderFileTree(fileTree)
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="w-1 hover:w-2 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-all"
        onMouseDown={handleMouseDown}
      />

      {/* Code Editor */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
        {/* Tab Bar */}
        <div className="flex items-center gap-1 bg-black/30 border-b border-white/10 px-2 py-1 flex-shrink-0 overflow-x-auto">
          {openTabs.map((tab) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-4 py-2 text-sm flex items-center gap-2 rounded-t-md cursor-pointer group min-w-[120px] max-w-[200px] ${
                activeTabId === tab.id
                  ? 'bg-[#1e1e1e] text-white'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg flex-shrink-0">{getFileIcon(tab.name)}</span>
              <span className="truncate flex-1">{tab.name}</span>
              {openTabs.length > 1 && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded p-0.5 transition"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Code Content with Syntax Highlighting */}
        <div className="flex-1 overflow-auto">
          <CodePreview 
            tab={getActiveTab()} 
            isRunning={isRunning} 
            markdownContent={activeTabId === 'analysis_report' ? markdownContent : null}
            fileContents={fileContents}
          />
        </div>
      </div>
    </div>
  );
}

function CodePreview({ tab, isRunning, markdownContent, fileContents }) {
  if (!tab) return <div className="flex items-center justify-center h-full text-gray-400">No file selected</div>;
  
  const fileName = tab.name;
  const fileContent = tab.path ? fileContents[tab.path] : null;
  
  // If we have markdown content, render it
  if (markdownContent) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="h-full overflow-auto p-8 bg-[#1e1e1e]"
      >
        <div className="max-w-4xl mx-auto prose prose-invert prose-slate">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={atomOneDark}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              table({children}) {
                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-slate-700">
                      {children}
                    </table>
                  </div>
                );
              },
              th({children}) {
                return (
                  <th className="border border-slate-700 px-4 py-2 bg-slate-800 text-left font-semibold">
                    {children}
                  </th>
                );
              },
              td({children}) {
                return (
                  <td className="border border-slate-700 px-4 py-2">
                    {children}
                  </td>
                );
              }
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </motion.div>
    );
  }
  
  const codeExamples = {
    'test_routing.php': {
      code: `<?php
// Scout94 - Routing Test
echo "🔍 Testing all routes...\\n\\n";

$routes = [
    '/' => 'Home',
    '/login' => 'Login',
    '/register' => 'Register',
    '/dashboard' => 'Dashboard',
    '/invest' => 'Invest'
];

foreach ($routes as $path => $name) {
    $response = testRoute($path);
    echo $response['status'] === 200 
        ? "✅ $name ($path) - PASSED\\n"
        : "❌ $name ($path) - FAILED\\n";
}`,
      language: 'php',
    },
    'test_install_db.php': {
      code: `<?php
// Scout94 - Database Installation Test
echo "📊 Testing database installation...\\n\\n";

// Test database connection
try {
    $pdo = new PDO('mysql:host=localhost;dbname=test', 'root', '');
    echo "✅ Database connection: PASSED\\n";
} catch (PDOException $e) {
    echo "❌ Database connection: FAILED\\n";
    exit(1);
}

// Test tables
$tables = ['users', 'investments', 'transactions'];
foreach ($tables as $table) {
    $result = $pdo->query("SHOW TABLES LIKE '$table'")->fetch();
    echo $result ? "✅ Table $table: EXISTS\\n" : "❌ Table $table: MISSING\\n";
}`,
      language: 'php',
    },
    'test_user_journey_visitor.php': {
      code: `<?php
// Scout94 - Visitor Journey Test
echo "👥 Testing visitor user journey...\\n\\n";

$steps = [
    'Visit homepage' => '/',
    'View investment page' => '/invest',
    'Navigate to register' => '/register',
    'Submit registration' => '/auth/register'
];

foreach ($steps as $step => $path) {
    echo "Testing: $step...\\n";
    $response = testUserAction($path);
    echo $response['success'] ? "✅ $step: PASSED\\n" : "❌ $step: FAILED\\n";
}`,
      language: 'php',
    },
    'index.php': {
      code: `<?php
require_once 'config.php';

// Main application entry point
session_start();

// Load router
require_once 'router.php';

// Initialize application
$app = new Application();
$app->run();`,
      language: 'php',
    },
    'config.php': {
      code: `<?php
// Application Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'viz_venture');
define('DB_USER', 'root');
define('DB_PASS', '');

define('BASE_URL', 'http://localhost');
define('DEBUG_MODE', true);

// Error reporting
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}`,
      language: 'php',
    },
    'Header.jsx': {
      code: `import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600">
      <nav className="container mx-auto px-4 py-4">
        <Link to="/" className="text-2xl font-bold text-white">
          Viz Venture Group
        </Link>
      </nav>
    </header>
  );
}`,
      language: 'jsx',
    },
    'Footer.jsx': {
      code: `import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-400">
          © 2025 Viz Venture Group. All rights reserved.
        </p>
      </div>
    </footer>
  );
}`,
      language: 'jsx',
    },
    'Dashboard.jsx': {
      code: `import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [investments, setInvestments] = useState([]);
  
  useEffect(() => {
    fetch('/api/investments')
      .then(res => res.json())
      .then(data => setInvestments(data));
  }, []);

  return (
    <div className="dashboard">
      <h1>My Investments</h1>
      <div>
        {/* Investment list will appear here */}
        <p>Total Investments: {investments.length}</p>
      </div>
    </div>
  );
}`,
      language: 'jsx',
    },
    'main.css': {
      code: `/* Main Styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(to bottom, #1e293b, #0f172a);
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.investment-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}`,
      language: 'css',
    },
    'README.md': {
      code: `# Viz Venture Group

Investment platform for modern investors.

## Features
- User registration and authentication
- Investment portfolio tracking
- Real-time market data
- Secure transactions

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`

## Testing
Run Scout94 tests:
\`\`\`bash
php test_routing.php
php test_user_journey_visitor.php
\`\`\``,
      language: 'markdown',
    },
    'package.json': {
      code: `{
  "name": "viz-venture-group",
  "version": "1.0.0",
  "description": "Investment Platform",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "php tests/test_routing.php"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}`,
      language: 'javascript',
    },
  };

  const example = codeExamples[fileName] || {
    code: `// ${fileName}\n\n// File content will be loaded here...\n// This is a preview of the file structure.\n\n// Click "Run Tests" to execute Scout94 tests\n// and see real output in the chat!`,
    language: 'javascript',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-full">
      {isRunning && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs rounded-full z-10"
        >
          ● TESTING
        </motion.div>
      )}
      <SyntaxHighlighter
        language={example.language}
        style={atomOneDark}
        showLineNumbers
        wrapLines
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          background: '#1e1e1e',
          fontSize: '14px',
          lineHeight: '1.6',
          height: '100%',
        }}
        lineNumberStyle={{
          minWidth: '3em',
          paddingRight: '1em',
          color: '#6b7280',
          userSelect: 'none',
        }}
      >
        {example.code}
      </SyntaxHighlighter>
    </motion.div>
  );
}
