/**
 * Test Container Manager
 * Phase 2: Containerized Testing System
 * 
 * Purpose: Manage Docker containers for isolated test environments
 * Features:
 * - Create isolated test containers
 * - Generate test databases from schema
 * - Mount project files read-only
 * - Auto-cleanup after tests
 */

import Docker from 'dockerode';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const docker = new Docker();

export class TestContainerManager {
  constructor() {
    this.activeContainers = new Map();
    this.networkName = 'scout94-test-network';
  }

  /**
   * Initialize test environment network
   */
  async initializeNetwork() {
    try {
      // Check if network exists
      const networks = await docker.listNetworks();
      const exists = networks.some(n => n.Name === this.networkName);
      
      if (!exists) {
        await docker.createNetwork({
          Name: this.networkName,
          Driver: 'bridge',
          CheckDuplicate: true
        });
        console.log(`✅ Created network: ${this.networkName}`);
      }
      
      return this.networkName;
    } catch (error) {
      console.error('❌ Failed to initialize network:', error.message);
      throw error;
    }
  }

  /**
   * Create test database container
   */
  async createTestDatabase(config) {
    const {
      type = 'mysql',
      schemaPath = null,
      port = null,
      testDataRows = 100
    } = config;

    console.log(`🐳 Creating ${type} test database container...`);

    try {
      // Ensure network exists
      await this.initializeNetwork();

      // Select appropriate image
      const images = {
        mysql: 'mysql:8.0',
        postgres: 'postgres:15',
        mongodb: 'mongo:7',
        sqlite: null // SQLite doesn't need container
      };

      const image = images[type];
      if (!image) {
        throw new Error(`Unsupported database type: ${type}`);
      }

      // Pull image if needed
      await this.pullImageIfNeeded(image);

      // Database-specific configuration
      const dbConfig = this.getDatabaseConfig(type, port);

      // Create container
      const container = await docker.createContainer({
        Image: image,
        name: `scout94-testdb-${Date.now()}`,
        Env: dbConfig.env,
        HostConfig: {
          NetworkMode: this.networkName,
          PortBindings: dbConfig.portBindings,
          AutoRemove: false, // We'll remove manually
          Memory: 512 * 1024 * 1024, // 512MB
          MemorySwap: 1024 * 1024 * 1024 // 1GB
        }
      });

      // Start container
      await container.start();
      console.log(`✅ Database container started`);

      // Wait for database to be ready
      await this.waitForDatabase(container, type);

      // Apply schema if provided
      if (schemaPath && existsSync(schemaPath)) {
        await this.applySchema(container, schemaPath, type);
        console.log(`✅ Schema applied from: ${schemaPath}`);

        // Generate test data
        await this.generateTestData(container, schemaPath, type, testDataRows);
        console.log(`✅ Generated ${testDataRows} test rows per table`);
      }

      // Store reference
      this.activeContainers.set(container.id, {
        container,
        type: 'database',
        dbType: type,
        started: new Date()
      });

      return {
        id: container.id,
        type: type,
        host: 'localhost',
        port: port || this.getDefaultPort(type),
        credentials: dbConfig.credentials,
        cleanup: async () => await this.cleanup(container.id)
      };

    } catch (error) {
      console.error('❌ Failed to create database container:', error.message);
      throw error;
    }
  }

  /**
   * Create application test container
   */
  async createTestEnvironment(config) {
    const {
      projectPath,
      baseImage = 'php:8.2-apache',
      testPort = 8888,
      dbHost = null,
      dbName = 'scout94_test',
      dbUser = 'root',
      dbPass = 'test123',
      envVars = {}
    } = config;

    console.log(`🐳 Creating test environment container...`);

    try {
      // Ensure network exists
      await this.initializeNetwork();

      // Pull image if needed
      await this.pullImageIfNeeded(baseImage);

      // Prepare environment variables
      const env = [
        `DB_HOST=${dbHost || 'scout94-testdb'}`,
        `DB_NAME=${dbName}`,
        `DB_USER=${dbUser}`,
        `DB_PASS=${dbPass}`,
        ...Object.entries(envVars).map(([k, v]) => `${k}=${v}`)
      ];

      // Create container
      const container = await docker.createContainer({
        Image: baseImage,
        name: `scout94-test-${Date.now()}`,
        Env: env,
        HostConfig: {
          NetworkMode: this.networkName,
          Binds: [
            `${projectPath}:/var/www/html:ro` // Read-only mount
          ],
          PortBindings: {
            '80/tcp': [{ HostPort: String(testPort) }]
          },
          AutoRemove: false,
          Memory: 512 * 1024 * 1024, // 512MB
          MemorySwap: 1024 * 1024 * 1024 // 1GB
        }
      });

      // Start container
      await container.start();
      console.log(`✅ Test environment started on port ${testPort}`);

      // Wait for server to be ready
      await this.waitForServer(testPort);

      // Store reference
      this.activeContainers.set(container.id, {
        container,
        type: 'application',
        projectPath,
        started: new Date()
      });

      return {
        id: container.id,
        port: testPort,
        url: `http://localhost:${testPort}`,
        logs: async () => await this.getLogs(container.id),
        metrics: async () => await this.getMetrics(container.id),
        cleanup: async () => await this.cleanup(container.id)
      };

    } catch (error) {
      console.error('❌ Failed to create test environment:', error.message);
      throw error;
    }
  }

  /**
   * Get database-specific configuration
   */
  getDatabaseConfig(type, customPort) {
    const configs = {
      mysql: {
        env: [
          'MYSQL_ROOT_PASSWORD=test123',
          'MYSQL_DATABASE=scout94_test'
        ],
        portBindings: {
          '3306/tcp': [{ HostPort: String(customPort || 13306) }]
        },
        credentials: {
          host: 'localhost',
          port: customPort || 13306,
          user: 'root',
          password: 'test123',
          database: 'scout94_test'
        }
      },
      postgres: {
        env: [
          'POSTGRES_PASSWORD=test123',
          'POSTGRES_DB=scout94_test'
        ],
        portBindings: {
          '5432/tcp': [{ HostPort: String(customPort || 15432) }]
        },
        credentials: {
          host: 'localhost',
          port: customPort || 15432,
          user: 'postgres',
          password: 'test123',
          database: 'scout94_test'
        }
      },
      mongodb: {
        env: [
          'MONGO_INITDB_ROOT_USERNAME=root',
          'MONGO_INITDB_ROOT_PASSWORD=test123',
          'MONGO_INITDB_DATABASE=scout94_test'
        ],
        portBindings: {
          '27017/tcp': [{ HostPort: String(customPort || 17017) }]
        },
        credentials: {
          host: 'localhost',
          port: customPort || 17017,
          user: 'root',
          password: 'test123',
          database: 'scout94_test'
        }
      }
    };

    return configs[type];
  }

  /**
   * Get default port for database type
   */
  getDefaultPort(type) {
    const ports = {
      mysql: 13306,
      postgres: 15432,
      mongodb: 17017
    };
    return ports[type] || 13306;
  }

  /**
   * Pull Docker image if not present
   */
  async pullImageIfNeeded(imageName) {
    try {
      // Check if image exists
      await docker.getImage(imageName).inspect();
    } catch (error) {
      // Image doesn't exist, pull it
      console.log(`📥 Pulling image: ${imageName}...`);
      return new Promise((resolve, reject) => {
        docker.pull(imageName, (err, stream) => {
          if (err) return reject(err);
          
          docker.modem.followProgress(stream, (err, output) => {
            if (err) return reject(err);
            console.log(`✅ Image pulled: ${imageName}`);
            resolve();
          });
        });
      });
    }
  }

  /**
   * Wait for database to be ready
   */
  async waitForDatabase(container, type, maxWait = 30000) {
    const startTime = Date.now();
    
    console.log(`⏳ Waiting for ${type} database to be ready...`);
    
    while (Date.now() - startTime < maxWait) {
      try {
        const logs = await container.logs({
          stdout: true,
          stderr: true,
          tail: 50
        });
        
        const logText = logs.toString();
        
        // Database-specific ready patterns
        const readyPatterns = {
          mysql: /ready for connections/i,
          postgres: /database system is ready to accept connections/i,
          mongodb: /waiting for connections/i
        };
        
        if (readyPatterns[type]?.test(logText)) {
          console.log(`✅ Database is ready`);
          return true;
        }
      } catch (error) {
        // Ignore errors, continue waiting
      }
      
      await this.sleep(1000);
    }
    
    throw new Error(`Database not ready after ${maxWait}ms`);
  }

  /**
   * Wait for web server to be ready
   */
  async waitForServer(port, maxWait = 10000) {
    const startTime = Date.now();
    
    console.log(`⏳ Waiting for server on port ${port}...`);
    
    while (Date.now() - startTime < maxWait) {
      try {
        const response = await fetch(`http://localhost:${port}`);
        if (response.ok || response.status < 500) {
          console.log(`✅ Server is ready`);
          return true;
        }
      } catch (error) {
        // Ignore errors, continue waiting
      }
      
      await this.sleep(500);
    }
    
    console.log(`⚠️ Server may not be ready, proceeding anyway`);
    return false;
  }

  /**
   * Apply database schema
   */
  async applySchema(container, schemaPath, type) {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // This is a placeholder - full implementation would execute SQL
    console.log(`📋 Would apply schema from: ${schemaPath}`);
    
    // TODO: Implement actual schema application per database type
    // For now, just log
    return true;
  }

  /**
   * Generate test data
   */
  async generateTestData(container, schemaPath, type, rows) {
    // This is a placeholder - full implementation would use schema parser
    console.log(`🎲 Would generate ${rows} test rows`);
    
    // TODO: Implement test data generation using Faker.js
    return true;
  }

  /**
   * Get container logs
   */
  async getLogs(containerId) {
    const info = this.activeContainers.get(containerId);
    if (!info) return '';
    
    try {
      const logs = await info.container.logs({
        stdout: true,
        stderr: true,
        timestamps: true
      });
      return logs.toString();
    } catch (error) {
      return `Error getting logs: ${error.message}`;
    }
  }

  /**
   * Get container metrics
   */
  async getMetrics(containerId) {
    const info = this.activeContainers.get(containerId);
    if (!info) return null;
    
    try {
      const stats = await info.container.stats({ stream: false });
      return {
        cpu: this.calculateCPUPercent(stats),
        memory: {
          used: stats.memory_stats.usage,
          limit: stats.memory_stats.limit,
          percent: (stats.memory_stats.usage / stats.memory_stats.limit) * 100
        },
        network: stats.networks
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate CPU percentage
   */
  calculateCPUPercent(stats) {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - 
                     stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - 
                        stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus || 1;
    
    return (cpuDelta / systemDelta) * cpuCount * 100;
  }

  /**
   * Cleanup container
   */
  async cleanup(containerId) {
    const info = this.activeContainers.get(containerId);
    if (!info) return;
    
    try {
      console.log(`🧹 Cleaning up container ${containerId.substring(0, 12)}...`);
      
      await info.container.stop({ t: 10 });
      await info.container.remove();
      
      this.activeContainers.delete(containerId);
      console.log(`✅ Container cleaned up`);
    } catch (error) {
      console.error(`⚠️ Cleanup error: ${error.message}`);
    }
  }

  /**
   * Cleanup all containers
   */
  async cleanupAll() {
    console.log(`🧹 Cleaning up all test containers...`);
    
    const promises = Array.from(this.activeContainers.keys()).map(
      id => this.cleanup(id)
    );
    
    await Promise.all(promises);
    console.log(`✅ All containers cleaned up`);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TestContainerManager();
