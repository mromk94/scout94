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

export default function IDEPane({ isRunning, messages }) {
  const [expandedFolders, setExpandedFolders] = useState(['src', 'tests']);
  const [selectedFile, setSelectedFile] = useState('tests/test_routing.php');
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(null);
  const [markdownFilePath, setMarkdownFilePath] = useState(null);
  
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
      setSelectedFile('ANALYSIS-REPORT.md'); // Switch to markdown view
    } catch (error) {
      console.error('Failed to load markdown file:', error);
    }
  };

  const fileTree = [
    {
      type: 'folder',
      name: 'src',
      children: [
        { type: 'file', name: 'index.php', language: 'php' },
        { type: 'file', name: 'config.php', language: 'php' },
        {
          type: 'folder',
          name: 'components',
          children: [
            { type: 'file', name: 'Header.jsx', language: 'jsx' },
            { type: 'file', name: 'Footer.jsx', language: 'jsx' },
            { type: 'file', name: 'Dashboard.jsx', language: 'jsx' },
          ],
        },
        {
          type: 'folder',
          name: 'styles',
          children: [
            { type: 'file', name: 'main.css', language: 'css' },
            { type: 'file', name: 'components.css', language: 'css' },
          ],
        },
      ],
    },
    {
      type: 'folder',
      name: 'tests',
      children: [
        { type: 'file', name: 'test_routing.php', language: 'php' },
        { type: 'file', name: 'test_install_db.php', language: 'php' },
        { type: 'file', name: 'test_user_journey_visitor.php', language: 'php' },
        { type: 'file', name: 'test_user_journey_user.php', language: 'php' },
      ],
    },
    { type: 'file', name: 'README.md', language: 'markdown' },
    { type: 'file', name: 'package.json', language: 'javascript' },
  ];

  const toggleFolder = (folderName) => {
    setExpandedFolders((prev) =>
      prev.includes(folderName) ? prev.filter((f) => f !== folderName) : [...prev, folderName]
    );
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
    return items.map((item, index) => (
      <div key={index}>
        {item.type === 'folder' ? (
          <>
            <div
              onClick={() => toggleFolder(item.name)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer group"
              style={{ paddingLeft: `${depth * 12 + 12}px` }}
            >
              {expandedFolders.includes(item.name) ? (
                <ChevronDown className="w-4 h-4 text-blue-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-blue-400" />
              )}
              <FolderOpen className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            {expandedFolders.includes(item.name) && item.children && (
              <div>{renderFileTree(item.children, depth + 1)}</div>
            )}
          </>
        ) : (
          <div
            onClick={() => setSelectedFile(item.name)}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer group ${
              selectedFile === item.name
                ? 'bg-blue-600/30 border-l-2 border-blue-500'
                : 'hover:bg-white/5'
            }`}
            style={{ paddingLeft: `${depth * 12 + 28}px` }}
          >
            <span className="text-lg">{getFileIcon(item.name)}</span>
            <span className="text-sm">{item.name}</span>
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
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <span className="font-semibold text-sm">📁 EXPLORER</span>
          <Search className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
        </div>
        <div className="flex-1 overflow-y-auto">{renderFileTree(fileTree)}</div>
      </div>

      {/* Resize Handle */}
      <div
        className="w-1 hover:w-2 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-all"
        onMouseDown={handleMouseDown}
      />

      {/* Code Editor */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
        {/* Tab Bar */}
        <div className="flex items-center gap-1 bg-black/30 border-b border-white/10 px-2 py-1 flex-shrink-0">
          <div className="px-4 py-2 bg-[#1e1e1e] text-sm flex items-center gap-2 rounded-t-md">
            <span className="text-lg">{getFileIcon(selectedFile)}</span>
            <span>{selectedFile}</span>
          </div>
        </div>

        {/* Code Content with Syntax Highlighting */}
        <div className="flex-1 overflow-auto">
          <CodePreview 
            fileName={selectedFile} 
            isRunning={isRunning} 
            markdownContent={markdownContent}
          />
        </div>
      </div>
    </div>
  );
}

function CodePreview({ fileName, isRunning, markdownContent }) {
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
