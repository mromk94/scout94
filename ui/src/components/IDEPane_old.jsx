import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCode, FolderOpen, Search, ChevronRight, ChevronDown } from 'lucide-react';

export default function IDEPane({ isRunning }) {
  const [expandedFolders, setExpandedFolders] = useState(['src', 'tests']);
  const [selectedFile, setSelectedFile] = useState('tests/test_routing.php');

  const fileTree = [
    { type: 'folder', name: 'src', children: [
      { type: 'file', name: 'index.php', language: 'php' },
      { type: 'file', name: 'config.php', language: 'php' },
      { type: 'folder', name: 'components', children: [
        { type: 'file', name: 'Header.jsx', language: 'jsx' },
        { type: 'file', name: 'Footer.jsx', language: 'jsx' },
      ]},
    ]},
    { type: 'folder', name: 'tests', children: [
      { type: 'file', name: 'test_routing.php', language: 'php' },
      { type: 'file', name: 'test_install_db.php', language: 'php' },
      { type: 'file', name: 'test_user_journey_visitor.php', language: 'php' },
    ]},
    { type: 'file', name: 'README.md', language: 'markdown' },
  ];

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev =>
      prev.includes(folderName)
        ? prev.filter(f => f !== folderName)
        : [...prev, folderName]
    );
  };

  const renderFileTree = (items, depth = 0) => {
    return items.map((item, index) => (
      <div key={index}>
        {item.type === 'folder' ? (
          <>
            <div
              onClick={() => toggleFolder(item.name)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer"
              style={{ paddingLeft: `${depth * 12 + 12}px` }}
            >
              {expandedFolders.includes(item.name) ? (
                <ChevronDown className="w-4 h-4 text-blue-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-blue-400" />
              )}
              <FolderOpen className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{item.name}</span>
            </div>
            {expandedFolders.includes(item.name) && item.children && (
              <div>{renderFileTree(item.children, depth + 1)}</div>
            )}
          </>
        ) : (
          <div
            onClick={() => setSelectedFile(item.name)}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer ${
              selectedFile === item.name ? 'bg-blue-600/30 border-l-2 border-blue-500' : 'hover:bg-white/5'
            }`}
            style={{ paddingLeft: `${depth * 12 + 28}px` }}
          >
            <FileCode className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{item.name}</span>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex">
      {/* File Explorer Sidebar */}
      <div className="w-64 bg-black/20 border-r border-white/10 flex flex-col">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <span className="font-semibold text-sm">EXPLORER</span>
          <Search className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderFileTree(fileTree)}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e]">
        {/* Tab Bar */}
        <div className="flex items-center gap-1 bg-black/30 border-b border-white/10 px-2 py-1">
          <div className="px-4 py-2 bg-[#1e1e1e] text-sm flex items-center gap-2 rounded-t-md">
            <FileCode className="w-4 h-4" />
            {selectedFile}
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 overflow-auto font-mono text-sm">
          <CodePreview fileName={selectedFile} isRunning={isRunning} />
        </div>
      </div>
    </div>
  );
}

function CodePreview({ fileName, isRunning }) {
  const codeExamples = {
    'test_routing.php': `<?php
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
    'Header.jsx': `import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600">
      <nav className="container mx-auto px-4 py-4">
        <Link to="/" className="text-2xl font-bold">
          Viz Venture Group
        </Link>
      </nav>
    </header>
  );
}`
  };

  const code = codeExamples[fileName] || '// File content...';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      {isRunning && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-0 right-0 px-3 py-1 bg-green-500 text-white text-xs rounded-bl-lg"
        >
          ● TESTING
        </motion.div>
      )}
      <pre className="text-gray-300">
        <code>{code}</code>
      </pre>
    </motion.div>
  );
}
