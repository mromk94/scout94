import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function useScout94() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentProject, setCurrentProject] = useState('/Users/mac/CascadeProjects/Viz Venture Group');

  const runTest = useCallback(async (testType) => {
    setIsRunning(true);
    
    try {
      console.log(`🚀 Running ${testType} test on ${currentProject}`);
      
      const result = await invoke('run_scout94_test', {
        projectPath: currentProject,
        testType: testType
      });

      console.log('✅ Test result:', result);
      return result;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return {
        success: false,
        output: '',
        error: error.toString()
      };
    } finally {
      setIsRunning(false);
    }
  }, [currentProject]);

  const selectProject = useCallback(async () => {
    try {
      const path = await invoke('select_project_folder');
      setCurrentProject(path);
      return path;
    } catch (error) {
      console.error('Failed to select project:', error);
      return null;
    }
  }, []);

  const getScreenshots = useCallback(async () => {
    try {
      const screenshots = await invoke('list_screenshots', {
        projectPath: currentProject
      });
      return screenshots;
    } catch (error) {
      console.error('Failed to list screenshots:', error);
      return [];
    }
  }, [currentProject]);

  const readScreenshot = useCallback(async (path) => {
    try {
      const data = await invoke('read_screenshot', {
        screenshotPath: path
      });
      return data;
    } catch (error) {
      console.error('Failed to read screenshot:', error);
      return null;
    }
  }, []);

  return {
    isRunning,
    currentProject,
    runTest,
    selectProject,
    getScreenshots,
    readScreenshot,
  };
}
