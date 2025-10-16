import { useState, useEffect } from 'react';
import { FolderOpen, Check, X, AlertCircle } from 'lucide-react';

export default function ProjectSelector({ currentProject, onProjectChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);
  const [selectedPath, setSelectedPath] = useState(currentProject);

  useEffect(() => {
    loadRecentProjects();
  }, []);

  const loadRecentProjects = () => {
    const stored = localStorage.getItem('scout94_recent_projects');
    if (stored) {
      setRecentProjects(JSON.parse(stored));
    }
  };

  const saveRecentProject = (path) => {
    let recent = [...recentProjects];
    recent = recent.filter(p => p !== path); // Remove if exists
    recent.unshift(path); // Add to front
    recent = recent.slice(0, 5); // Keep only 5
    setRecentProjects(recent);
    localStorage.setItem('scout94_recent_projects', JSON.stringify(recent));
  };

  const handleApply = () => {
    if (selectedPath && selectedPath !== currentProject) {
      saveRecentProject(selectedPath);
      onProjectChange(selectedPath);
      setIsOpen(false);
    }
  };

  const selectRecent = (path) => {
    setSelectedPath(path);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-semibold text-sm transition shadow-lg"
      >
        <FolderOpen className="w-4 h-4" />
        <span className="hidden md:inline">Change Project</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-6 h-6" />
              <h2 className="text-xl font-bold">Select Project Directory</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Project Directory Path
            </label>
            <input
              type="text"
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-purple-500"
              placeholder="/Users/mac/CascadeProjects/YourProject"
            />
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Enter the full absolute path to your project directory
            </p>
          </div>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Recent Projects
              </label>
              <div className="space-y-2">
                {recentProjects.map((path, index) => (
                  <button
                    key={index}
                    onClick={() => selectRecent(path)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      selectedPath === path
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono truncate">{path}</span>
                      {selectedPath === path && (
                        <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Paths */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Quick Paths
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedPath('/Users/mac/CascadeProjects/Viz Venture Group')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-left text-xs transition"
              >
                📁 Viz Venture Group
              </button>
              <button
                onClick={() => setSelectedPath('/Users/mac/CascadeProjects/scout94')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-left text-xs transition"
              >
                🚀 Scout94 Project
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              💡 <strong>Tip:</strong> Enter the full path to your project root directory. 
              Scout94 will analyze all files, logs, and configurations within it.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedPath || selectedPath === currentProject}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
