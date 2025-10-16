/**
 * Docker Checker
 * Phase 2: Containerized Testing
 * 
 * Purpose: Verify Docker is installed and running
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class DockerChecker {
  /**
   * Check if Docker is installed and running
   */
  async checkDocker() {
    try {
      // Check Docker version
      const { stdout } = await execAsync('docker --version');
      const version = stdout.trim();
      
      // Check if Docker daemon is running
      await execAsync('docker ps');
      
      return {
        installed: true,
        running: true,
        version: version,
        ready: true
      };
    } catch (error) {
      // Docker not installed or not running
      if (error.message.includes('command not found') || error.code === 127) {
        return {
          installed: false,
          running: false,
          version: null,
          ready: false,
          error: 'Docker is not installed'
        };
      }
      
      return {
        installed: true,
        running: false,
        version: null,
        ready: false,
        error: 'Docker daemon is not running'
      };
    }
  }

  /**
   * Get installation instructions based on OS
   */
  getInstallInstructions() {
    const platform = process.platform;
    
    const instructions = {
      darwin: {
        title: 'Install Docker Desktop for Mac',
        steps: [
          '1. Download Docker Desktop from https://www.docker.com/products/docker-desktop',
          '2. Install the .dmg file',
          '3. Launch Docker Desktop',
          '4. Wait for Docker to start (whale icon in menu bar)',
          '5. Run this scan again'
        ],
        url: 'https://docs.docker.com/desktop/install/mac-install/'
      },
      linux: {
        title: 'Install Docker on Linux',
        steps: [
          '1. Update package index: sudo apt-get update',
          '2. Install Docker: sudo apt-get install docker-ce docker-ce-cli containerd.io',
          '3. Start Docker: sudo systemctl start docker',
          '4. Enable on boot: sudo systemctl enable docker',
          '5. Run this scan again'
        ],
        url: 'https://docs.docker.com/engine/install/'
      },
      win32: {
        title: 'Install Docker Desktop for Windows',
        steps: [
          '1. Download Docker Desktop from https://www.docker.com/products/docker-desktop',
          '2. Run the installer',
          '3. Restart your computer if prompted',
          '4. Launch Docker Desktop',
          '5. Wait for Docker to start',
          '6. Run this scan again'
        ],
        url: 'https://docs.docker.com/desktop/install/windows-install/'
      }
    };
    
    return instructions[platform] || instructions.linux;
  }

  /**
   * Format error message for user
   */
  formatErrorMessage(checkResult) {
    const instructions = this.getInstallInstructions();
    
    let message = `## ⚠️ Containerized Testing Unavailable\n\n`;
    
    if (!checkResult.installed) {
      message += `**Issue:** Docker is not installed on your system.\n\n`;
      message += `**${instructions.title}:**\n`;
      instructions.steps.forEach(step => {
        message += `${step}\n`;
      });
      message += `\n📚 **Documentation:** ${instructions.url}\n\n`;
    } else if (!checkResult.running) {
      message += `**Issue:** Docker is installed but not running.\n\n`;
      message += `**Quick Fix:**\n`;
      message += `1. Launch Docker Desktop\n`;
      message += `2. Wait for Docker to start\n`;
      message += `3. Run this scan again\n\n`;
    }
    
    message += `**Note:** Containerized testing will be skipped. Regular tests will continue.\n`;
    
    return message;
  }
}

export default new DockerChecker();
