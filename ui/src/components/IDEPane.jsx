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
    
    // Listen for live file content updates (collaborative reporting)
    const fileUpdateMsg = messages.find(m => m.type === 'file_content_updated');
    if (fileUpdateMsg) {
      const { filePath, content, updatedBy, region } = fileUpdateMsg;
      
      // If this file is currently open, update it
      if (markdownFilePath === filePath) {
        console.log(`📝 Live update from ${updatedBy} (${region} region)`);
        setMarkdownContent(content);
        
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-blue-600/90 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right';
        toast.innerHTML = `📝 Report updated by <strong>${updatedBy}</strong>`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transition = 'opacity 0.3s';
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      }
      
      // Update file contents cache if file is in tabs
      if (fileContents[filePath]) {
        setFileContents(prev => ({
          ...prev,
          [filePath]: content
        }));
      }
    }
  }, [messages, markdownFilePath, fileContents]);
  
  // Listen for auto-open file events from comprehensive scan
  useEffect(() => {
    const handleAutoOpenFile = (event) => {
      const { filePath } = event.detail;
      console.log('🎯 Auto-opening comprehensive report:', filePath);
      loadMarkdownFile(filePath);
    };
    
    window.addEventListener('scout94-open-file', handleAutoOpenFile);
    return () => window.removeEventListener('scout94-open-file', handleAutoOpenFile);
  }, []);
  
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
              // Open tab first for immediate feedback
              openFileInTab(item.path, item.name, item.language);
              // Then load content in background
              await loadFileContent(item.path);
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

        {/* File Path Breadcrumb Display */}
        {getActiveTab() && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900/80 to-slate-800/60 border-b border-blue-500/20 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="flex items-center gap-1.5 min-w-0 text-xs overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {getActiveTab().path.split('/').filter(p => p).map((part, idx, arr) => (
                  <React.Fragment key={idx}>
                    <span className={idx === arr.length - 1 
                      ? "text-blue-300 font-medium px-2 py-1 bg-blue-500/10 rounded whitespace-nowrap" 
                      : "text-gray-400 hover:text-gray-200 transition whitespace-nowrap"
                    }>
                      {part}
                    </span>
                    {idx < arr.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
              <span className="px-2 py-0.5 bg-slate-700/50 rounded">
                {getActiveTab().language}
              </span>
            </div>
          </div>
        )}

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
        <div className="max-w-5xl mx-auto prose prose-lg prose-invert prose-slate"
          style={{
            fontSize: '16px',
            lineHeight: '1.8'
          }}
        >
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
                    wrapLines={true}
                    wrapLongLines={true}
                    customStyle={{
                      fontSize: '15px',
                      lineHeight: '1.7',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      margin: '1rem 0'
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={`${className} px-1.5 py-0.5 bg-slate-800 rounded text-sm`} {...props}>
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
  
  // Show loading state if content isn't loaded yet or is empty
  if (!fileContent || fileContent.trim() === '') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        {!fileContent ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <div>Loading {fileName}...</div>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">📄</div>
            <div className="text-lg">Empty File</div>
            <div className="text-sm text-gray-500 mt-2">{fileName} has no content</div>
          </>
        )}
      </div>
    );
  }

  // Determine language for syntax highlighting
  const language = tab.language || 
    (fileName.endsWith('.php') ? 'php' 
    : fileName.endsWith('.jsx') || fileName.endsWith('.js') ? 'javascript'
    : fileName.endsWith('.css') ? 'css'
    : fileName.endsWith('.json') ? 'json'
    : fileName.endsWith('.py') ? 'python'
    : fileName.endsWith('.rs') ? 'rust'
    : fileName.endsWith('.tsx') ? 'typescript'
    : fileName.endsWith('.html') ? 'html'
    : fileName.endsWith('.sql') ? 'sql'
    : fileName.endsWith('.sh') ? 'bash'
    : 'text');

  // Detect if file is minified (long lines, no formatting)
  const isMinified = fileContent.split('\n').length < 5 && fileContent.length > 500;

  return (
    <>
      {isMinified && (
        <div className="bg-amber-900/30 border-b border-amber-600/50 px-4 py-2 flex items-center gap-3 text-sm">
          <span className="text-amber-400 text-lg">⚠️</span>
          <div className="flex-1">
            <div className="text-amber-200 font-medium">Minified/Bundled File</div>
            <div className="text-amber-400/70 text-xs">
              This file appears to be from build artifacts (dist/assets). Consider opening the source file for better readability.
              <span className="text-gray-500 ml-2">
                {fileContent.split('\n').length} lines • {(fileContent.length / 1024).toFixed(1)}KB
              </span>
            </div>
          </div>
        </div>
      )}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="h-full w-full overflow-auto"
        style={{ position: 'relative' }}
      >
        <SyntaxHighlighter
          language={language}
          style={atomOneDark}
          showLineNumbers={true}
          wrapLines={true}
          wrapLongLines={true}
          customStyle={{
            margin: 0,
            padding: '1.5rem 1.5rem 1.5rem 0',
            minHeight: '100%',
            fontSize: '14px',
            lineHeight: '1.8',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            background: '#1e1e1e'
          }}
          lineNumberContainerStyle={{
            float: 'left',
            paddingRight: '0',
            backgroundColor: '#0f1419',
            borderRight: '2px solid #374151'
          }}
          lineNumberStyle={{
            minWidth: '4em',
            paddingRight: '1.5em',
            paddingLeft: '1em',
            color: '#9ca3af',
            backgroundColor: '#0f1419',
            userSelect: 'none',
            textAlign: 'right',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}
          codeTagProps={{
            style: {
              paddingLeft: '1.5em',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }
          }}
          PreTag="div"
        >
          {fileContent}
        </SyntaxHighlighter>
      </motion.div>
    </>
  );
}
