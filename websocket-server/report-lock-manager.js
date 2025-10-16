/**
 * Report Lock Manager
 * Handles concurrent access to report files with queuing system
 */

export class ReportLockManager {
  constructor() {
    this.locks = new Map(); // reportPath -> { owner, queue, timestamp }
    this.lockTimeout = 60000; // 60 seconds max lock duration
  }

  /**
   * Request lock for editing a report
   * @param {string} reportPath - Path to report file
   * @param {string} agentId - Agent requesting lock
   * @param {number} timeout - Max wait time in ms
   * @returns {Promise<boolean>} - Resolves when lock acquired
   */
  async acquireLock(reportPath, agentId, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const lock = this.locks.get(reportPath);

      // If no lock exists, grant immediately
      if (!lock) {
        this.locks.set(reportPath, {
          owner: agentId,
          queue: [],
          timestamp: Date.now(),
          granted: Date.now()
        });

        console.log(`🔒 Lock GRANTED to ${agentId} for ${reportPath}`);
        
        // Set auto-release timeout
        this.scheduleAutoRelease(reportPath, agentId);
        
        resolve(true);
        return;
      }

      // Lock exists - add to queue
      console.log(`⏳ ${agentId} added to queue for ${reportPath} (current owner: ${lock.owner})`);
      
      const queueEntry = {
        agentId,
        resolve,
        reject,
        timestamp: Date.now()
      };

      lock.queue.push(queueEntry);

      // Set timeout for this queue entry
      setTimeout(() => {
        const currentLock = this.locks.get(reportPath);
        if (currentLock && currentLock.queue.includes(queueEntry)) {
          // Remove from queue
          currentLock.queue = currentLock.queue.filter(e => e !== queueEntry);
          reject(new Error(`Lock acquisition timeout for ${agentId} after ${timeout}ms`));
        }
      }, timeout);
    });
  }

  /**
   * Release lock and grant to next agent in queue
   * @param {string} reportPath - Path to report file
   * @param {string} agentId - Agent releasing lock
   */
  releaseLock(reportPath, agentId) {
    const lock = this.locks.get(reportPath);

    if (!lock) {
      console.warn(`⚠️  No lock found for ${reportPath}`);
      return;
    }

    if (lock.owner !== agentId) {
      console.warn(`⚠️  ${agentId} trying to release lock owned by ${lock.owner}`);
      return;
    }

    const lockDuration = Date.now() - lock.granted;
    console.log(`🔓 Lock RELEASED by ${agentId} for ${reportPath} (held for ${lockDuration}ms)`);

    // Grant lock to next agent in queue
    if (lock.queue.length > 0) {
      const next = lock.queue.shift();
      
      this.locks.set(reportPath, {
        owner: next.agentId,
        queue: lock.queue,
        timestamp: Date.now(),
        granted: Date.now()
      });

      console.log(`🔒 Lock GRANTED to ${next.agentId} from queue`);
      
      // Schedule auto-release for new owner
      this.scheduleAutoRelease(reportPath, next.agentId);
      
      next.resolve(true);
    } else {
      // No one waiting, remove lock entirely
      this.locks.delete(reportPath);
      console.log(`✅ Lock removed for ${reportPath} (no queue)`);
    }
  }

  /**
   * Schedule automatic lock release if agent doesn't release in time
   * @param {string} reportPath - Path to report file
   * @param {string} agentId - Agent that owns lock
   */
  scheduleAutoRelease(reportPath, agentId) {
    setTimeout(() => {
      const lock = this.locks.get(reportPath);
      if (lock && lock.owner === agentId) {
        console.warn(`⏰ AUTO-RELEASE: ${agentId} held lock too long, forcing release`);
        this.forceRelease(reportPath);
      }
    }, this.lockTimeout);
  }

  /**
   * Get current lock owner
   * @param {string} reportPath - Path to report file
   * @returns {string|null} - Agent ID or null if no lock
   */
  getLockOwner(reportPath) {
    const lock = this.locks.get(reportPath);
    return lock ? lock.owner : null;
  }

  /**
   * Get queue status
   * @param {string} reportPath - Path to report file
   * @returns {Array} - Queue of waiting agents
   */
  getQueue(reportPath) {
    const lock = this.locks.get(reportPath);
    return lock ? lock.queue.map(e => e.agentId) : [];
  }

  /**
   * Force release lock (use with caution)
   * @param {string} reportPath - Path to report file
   */
  forceRelease(reportPath) {
    const lock = this.locks.get(reportPath);
    if (!lock) return;

    console.log(`💥 FORCE RELEASE for ${reportPath} (was owned by ${lock.owner})`);
    
    // Grant to next in queue or remove
    if (lock.queue.length > 0) {
      const next = lock.queue.shift();
      this.locks.set(reportPath, {
        owner: next.agentId,
        queue: lock.queue,
        timestamp: Date.now(),
        granted: Date.now()
      });
      this.scheduleAutoRelease(reportPath, next.agentId);
      next.resolve(true);
    } else {
      this.locks.delete(reportPath);
    }
  }

  /**
   * Check if report is locked
   * @param {string} reportPath - Path to report file
   * @returns {boolean}
   */
  isLocked(reportPath) {
    return this.locks.has(reportPath);
  }

  /**
   * Get lock status for debugging
   * @returns {Object} - All active locks
   */
  getStatus() {
    const status = {};
    for (const [path, lock] of this.locks.entries()) {
      status[path] = {
        owner: lock.owner,
        queueLength: lock.queue.length,
        waiting: lock.queue.map(e => e.agentId),
        heldFor: Date.now() - lock.granted
      };
    }
    return status;
  }
}

export default ReportLockManager;
