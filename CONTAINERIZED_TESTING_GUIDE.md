# 🐳 Containerized Testing Guide - Phase 2 Complete

**Feature:** Isolated Docker test environments with auto-generated databases  
**Status:** ✅ Production Ready  
**Version:** 1.2.0-phase2

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [How It Works](#how-it-works)
6. [Troubleshooting](#troubleshooting)
7. [Examples](#examples)

---

## Overview

Scout94's containerized testing feature allows you to:

- ✅ **Isolated Environments** - Run tests in clean Docker containers
- ✅ **Auto-Generated Databases** - Create test databases from your schema
- ✅ **Realistic Data** - Generate 10-1000 rows per table with Faker.js
- ✅ **Multiple Database Types** - MySQL, PostgreSQL, MongoDB, SQLite
- ✅ **Auto-Cleanup** - Containers removed after tests (configurable)
- ✅ **Zero Configuration** - Works with your existing project

**Benefits:**
- No pollution of your development database
- Test with realistic data every time
- Reproducible test environments
- Parallel testing without conflicts

---

## Prerequisites

### Required:
- **Docker Desktop** installed and running
  - Mac: [Download](https://www.docker.com/products/docker-desktop)
  - Linux: `sudo apt-get install docker-ce`
  - Windows: [Download](https://www.docker.com/products/docker-desktop)
  
### Recommended:
- **4GB+ RAM** (8GB recommended)
- **2GB+ free disk space** for Docker images
- **Multi-core CPU** for better performance

### Verify Installation:
```bash
docker --version
docker ps
```

---

## Quick Start

### 1. Enable Containerized Testing

Open Scout94 → **Settings** → **Test Environment**

Toggle ON: **"Enable Containerized Testing"**

### 2. Configure Database (Optional)

If you want auto-generated test database:

1. Toggle ON: **"Auto-Generate Test Database"**
2. Set **Database Schema Path**: `/path/to/your/schema.sql`
3. Select **Database Type**: MySQL / PostgreSQL / MongoDB
4. Set **Test Data Rows**: 100 (10-1000)

### 3. Run Comprehensive Scan

```bash
scout94 scan --comprehensive
```

Or click **"Run Comprehensive Scan"** in Scout94 UI

---

## Configuration

All settings available in: **Settings → Test Environment**

### Base Configuration

| Setting | Options | Default | Description |
|---------|---------|---------|-------------|
| **Enable Containerized Testing** | On/Off | Off | Master toggle |
| **Base Container Image** | PHP 8.2, Node 20, Python 3.11 | PHP 8.2 | Runtime environment |
| **Test Container Port** | 8000-9999 | 8888 | Port for test environment |

### Database Configuration

| Setting | Options | Default | Description |
|---------|---------|---------|-------------|
| **Auto-Generate Test Database** | On/Off | Off | Create DB from schema |
| **Database Schema Path** | File path | - | Path to schema.sql |
| **Database Type** | MySQL, PostgreSQL, MongoDB, SQLite | MySQL | DB system |
| **Database Port** | 10000-20000 | 13306 | Port for test database |
| **Test Data Rows** | 10-1000 | 100 | Rows per table |

### Resource Limits

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| **Memory Limit** | 256-2048 MB | 512 MB | Container memory |
| **CPU Shares** | 512-2048 | 1024 | CPU priority |

### Cleanup Options

| Setting | Options | Default | Description |
|---------|---------|---------|-------------|
| **Auto-Cleanup Containers** | On/Off | On | Remove containers after tests |
| **Keep Logs on Failure** | On/Off | On | Preserve logs if tests fail |

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│   Scout94 Comprehensive Scan            │
└──────────────┬──────────────────────────┘
               │
               ├─ Phase 1: Project Analysis
               ├─ Phase 2: Root Cause Tracing
               │
               ├─ Phase 2.5: Containerized Testing
               │  │
               │  ├─ 1. Check Docker Status
               │  ├─ 2. Parse Schema File
               │  ├─ 3. Generate Test Data (Faker.js)
               │  ├─ 4. Create Database Container
               │  ├─ 5. Create App Container
               │  ├─ 6. Run Tests
               │  └─ 7. Cleanup
               │
               ├─ Phase 3: Mock Detection
               └─ Phase 4: Report Generation
```

### Data Generation Intelligence

Scout94 uses **Faker.js** with intelligent column name detection:

**Detected Patterns:**
- `email` → faker.internet.email()
- `phone` → faker.phone.number()
- `address` → faker.location.streetAddress()
- `city` → faker.location.city()
- `price` → faker.commerce.price()
- `company` → faker.company.name()
- `firstname` → faker.person.firstName()
- `created_at` → faker.date.recent()
- And 40+ more patterns!

**Foreign Keys:**
- Automatically maintains referential integrity
- Tables created in dependency order
- Valid references between tables

---

## Troubleshooting

### Docker Not Found

**Error:** `Docker is not installed on your system`

**Solution:**
1. Install Docker Desktop from docker.com
2. Launch Docker Desktop
3. Wait for Docker to start (whale icon in system tray)
4. Run scan again

---

### Docker Not Running

**Error:** `Docker daemon is not running`

**Solution:**
1. Launch Docker Desktop
2. Wait for "Docker Desktop is running" message
3. Verify: `docker ps`
4. Run scan again

---

### Schema File Not Found

**Error:** `Schema file not found: /path/to/schema.sql`

**Solution:**
1. Check file path in settings
2. Use absolute path (e.g., `/Users/name/project/schema.sql`)
3. Verify file exists: `ls -la /path/to/schema.sql`

---

### Port Already in Use

**Error:** `Port 8888 is already in use`

**Solution:**
1. Change port in settings (e.g., 8889)
2. Or stop the conflicting service
3. Check with: `lsof -i :8888`

---

### Memory Limit Exceeded

**Error:** `Container failed to start - memory limit`

**Solution:**
1. Increase memory limit in settings (e.g., 1024 MB)
2. Or reduce test data rows
3. Check Docker resource limits in Docker Desktop settings

---

## Examples

### Example 1: Simple E-commerce Schema

**File:** `examples/example-schema.sql` (included with Scout94)

**Tables:** users, products, orders, order_items, reviews, sessions

**Run:**
```bash
1. Settings → Test Environment → Auto-Generate Test Database: ON
2. Database Schema Path: /path/to/scout94/examples/example-schema.sql
3. Database Type: MySQL
4. Test Data Rows: 100
5. Run Comprehensive Scan
```

**Result:**
- MySQL container with 6 tables
- 600 total test rows (100 per table)
- Realistic emails, names, addresses
- Valid foreign key relationships

---

### Example 2: Custom PostgreSQL Schema

**Your Schema:** `my-project/database/schema.sql`

**Configuration:**
```
Database Type: PostgreSQL
Schema Path: /Users/me/my-project/database/schema.sql
Port: 15432
Test Data Rows: 500
```

**Result:**
- PostgreSQL 15 container
- Custom schema applied
- 500 rows per table
- Port 15432 accessible

---

### Example 3: Node.js Application

**Configuration:**
```
Base Image: Node 20
Port: 8888
Database: MongoDB
```

**Result:**
- Node.js 20 runtime
- MongoDB test database
- Application accessible at http://localhost:8888

---

## Advanced Usage

### Access Test Database Directly

While container is running (Auto-Cleanup: OFF):

```bash
# MySQL
mysql -h 127.0.0.1 -P 13306 -u root -ptest123 scout94_test

# PostgreSQL
psql -h 127.0.0.1 -p 15432 -U postgres scout94_test

# MongoDB
mongo --host 127.0.0.1 --port 17017 -u root -p test123
```

### Inspect Container Logs

```bash
docker ps  # Find container ID
docker logs <container-id>
```

### Keep Containers Running

Set **Auto-Cleanup: OFF** in settings to inspect after tests.

Cleanup manually:
```bash
docker ps -a | grep scout94
docker rm -f <container-id>
```

---

## Performance Tips

1. **Reduce Test Data**: Start with 50 rows, increase if needed
2. **Increase Memory**: For large schemas, use 1024MB+ memory
3. **Use SSD**: Docker performs better on SSD storage
4. **Close Other Apps**: Free up resources during testing

---

## FAQ

**Q: Do I need Docker for every test?**  
A: No, only when containerized testing is enabled. Regular tests work without Docker.

**Q: Can I use my existing database?**  
A: Yes, disable auto-generate DB and configure connection manually.

**Q: How long does setup take?**  
A: First time: 2-5 minutes (image download). Subsequent: 30-60 seconds.

**Q: Are containers secure?**  
A: Yes, containers are isolated and removed after tests. No data persists.

**Q: Can I test multiple projects simultaneously?**  
A: Yes, each project gets unique containers on different ports.

---

## Support

**Documentation:** `/path/to/scout94/CONTAINERIZED_TESTING_GUIDE.md`  
**Example Schema:** `/path/to/scout94/examples/example-schema.sql`  
**Issues:** GitHub Issues or project maintainer

---

**Phase 2 Complete!** 🎉

Ready to run isolated, reproducible tests with auto-generated databases.

**Next:** Phase 3 - Agent Optimization & Parallel Execution
