/**
 * Schema Parser
 * Phase 2: Containerized Testing System
 * 
 * Purpose: Parse database schema files to understand structure
 * Supports: MySQL, PostgreSQL, SQLite schemas
 */

import { readFileSync } from 'fs';

export class SchemaParser {
  /**
   * Parse schema file based on type
   */
  parseSchema(schemaPath, type = 'mysql') {
    const content = readFileSync(schemaPath, 'utf-8');
    
    switch (type.toLowerCase()) {
      case 'mysql':
      case 'mariadb':
        return this.parseMySQLSchema(content);
      case 'postgres':
      case 'postgresql':
        return this.parsePostgreSQLSchema(content);
      case 'sqlite':
        return this.parseSQLiteSchema(content);
      default:
        throw new Error(`Unsupported schema type: ${type}`);
    }
  }

  /**
   * Parse MySQL/MariaDB schema
   */
  parseMySQLSchema(sql) {
    const tables = [];
    
    // Extract CREATE TABLE statements
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s*\(([\s\S]*?)\)(?:\s*ENGINE\s*=\s*\w+)?(?:\s*DEFAULT\s+CHARSET\s*=\s*\w+)?;/gi;
    let match;
    
    while ((match = tableRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const tableBody = match[2];
      
      const table = {
        name: tableName,
        columns: this.parseColumns(tableBody, 'mysql'),
        primaryKey: this.parsePrimaryKey(tableBody),
        foreignKeys: this.parseForeignKeys(tableBody),
        indexes: this.parseIndexes(tableBody),
        constraints: this.parseConstraints(tableBody)
      };
      
      tables.push(table);
    }
    
    return {
      type: 'mysql',
      tables,
      relationships: this.buildRelationships(tables)
    };
  }

  /**
   * Parse PostgreSQL schema
   */
  parsePostgreSQLSchema(sql) {
    const tables = [];
    
    // PostgreSQL CREATE TABLE syntax
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\);/gi;
    let match;
    
    while ((match = tableRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const tableBody = match[2];
      
      const table = {
        name: tableName,
        columns: this.parseColumns(tableBody, 'postgres'),
        primaryKey: this.parsePrimaryKey(tableBody),
        foreignKeys: this.parseForeignKeys(tableBody),
        indexes: this.parseIndexes(tableBody),
        constraints: this.parseConstraints(tableBody)
      };
      
      tables.push(table);
    }
    
    return {
      type: 'postgres',
      tables,
      relationships: this.buildRelationships(tables)
    };
  }

  /**
   * Parse SQLite schema
   */
  parseSQLiteSchema(sql) {
    // Similar to MySQL but with SQLite-specific syntax
    return this.parseMySQLSchema(sql); // Simplified for now
  }

  /**
   * Parse columns from table body
   */
  parseColumns(tableBody, dbType) {
    const columns = [];
    const lines = tableBody.split(',').map(l => l.trim());
    
    for (const line of lines) {
      // Skip constraint lines
      if (/^(PRIMARY|FOREIGN|UNIQUE|INDEX|KEY|CONSTRAINT)/i.test(line)) {
        continue;
      }
      
      // Parse column definition
      const columnMatch = line.match(/^[`"]?(\w+)[`"]?\s+(\w+)(\([^)]+\))?(.*)$/i);
      if (columnMatch) {
        const [, name, type, size, modifiers] = columnMatch;
        
        const column = {
          name,
          type: type.toUpperCase(),
          size: size ? size.replace(/[()]/g, '') : null,
          nullable: !/NOT\s+NULL/i.test(modifiers),
          autoIncrement: /AUTO_INCREMENT/i.test(modifiers),
          default: this.extractDefault(modifiers),
          unique: /UNIQUE/i.test(modifiers),
          unsigned: /UNSIGNED/i.test(modifiers),
          dataType: this.inferDataType(type, size)
        };
        
        columns.push(column);
      }
    }
    
    return columns;
  }

  /**
   * Parse primary key
   */
  parsePrimaryKey(tableBody) {
    const pkMatch = tableBody.match(/PRIMARY\s+KEY\s*\(\s*[`"]?(\w+)[`"]?\s*\)/i);
    return pkMatch ? pkMatch[1] : null;
  }

  /**
   * Parse foreign keys
   */
  parseForeignKeys(tableBody) {
    const foreignKeys = [];
    const fkRegex = /FOREIGN\s+KEY\s*\(\s*[`"]?(\w+)[`"]?\s*\)\s*REFERENCES\s+[`"]?(\w+)[`"]?\s*\(\s*[`"]?(\w+)[`"]?\s*\)/gi;
    let match;
    
    while ((match = fkRegex.exec(tableBody)) !== null) {
      foreignKeys.push({
        column: match[1],
        referencedTable: match[2],
        referencedColumn: match[3]
      });
    }
    
    return foreignKeys;
  }

  /**
   * Parse indexes
   */
  parseIndexes(tableBody) {
    const indexes = [];
    const indexRegex = /(?:INDEX|KEY)\s+[`"]?(\w+)[`"]?\s*\(\s*[`"]?(\w+)[`"]?\s*\)/gi;
    let match;
    
    while ((match = indexRegex.exec(tableBody)) !== null) {
      indexes.push({
        name: match[1],
        column: match[2]
      });
    }
    
    return indexes;
  }

  /**
   * Parse constraints
   */
  parseConstraints(tableBody) {
    const constraints = [];
    
    // Check constraints
    const checkRegex = /CHECK\s*\(([^)]+)\)/gi;
    let match;
    
    while ((match = checkRegex.exec(tableBody)) !== null) {
      constraints.push({
        type: 'CHECK',
        definition: match[1]
      });
    }
    
    return constraints;
  }

  /**
   * Extract default value
   */
  extractDefault(modifiers) {
    const defaultMatch = modifiers.match(/DEFAULT\s+('([^']*)'|"([^"]*)"|(\S+))/i);
    if (!defaultMatch) return null;
    
    return defaultMatch[2] || defaultMatch[3] || defaultMatch[4];
  }

  /**
   * Infer data type category
   */
  inferDataType(type, size) {
    const typeUpper = type.toUpperCase();
    
    // Integer types
    if (['INT', 'INTEGER', 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'BIGINT'].includes(typeUpper)) {
      return 'integer';
    }
    
    // String types
    if (['VARCHAR', 'CHAR', 'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT'].includes(typeUpper)) {
      return 'string';
    }
    
    // Date/Time types
    if (['DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR'].includes(typeUpper)) {
      return 'datetime';
    }
    
    // Decimal types
    if (['DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL'].includes(typeUpper)) {
      return 'decimal';
    }
    
    // Boolean
    if (['BOOLEAN', 'BOOL', 'BIT'].includes(typeUpper)) {
      return 'boolean';
    }
    
    // Binary/Blob
    if (['BLOB', 'BINARY', 'VARBINARY'].includes(typeUpper)) {
      return 'binary';
    }
    
    // JSON
    if (typeUpper === 'JSON') {
      return 'json';
    }
    
    // Enum/Set
    if (['ENUM', 'SET'].includes(typeUpper)) {
      return 'enum';
    }
    
    return 'string'; // Default fallback
  }

  /**
   * Build relationships between tables
   */
  buildRelationships(tables) {
    const relationships = [];
    
    for (const table of tables) {
      for (const fk of table.foreignKeys) {
        relationships.push({
          fromTable: table.name,
          fromColumn: fk.column,
          toTable: fk.referencedTable,
          toColumn: fk.referencedColumn,
          type: 'foreign_key'
        });
      }
    }
    
    return relationships;
  }

  /**
   * Analyze schema complexity
   */
  analyzeComplexity(schema) {
    return {
      tableCount: schema.tables.length,
      columnCount: schema.tables.reduce((sum, t) => sum + t.columns.length, 0),
      relationshipCount: schema.relationships.length,
      complexity: this.calculateComplexity(schema)
    };
  }

  /**
   * Calculate overall schema complexity
   */
  calculateComplexity(schema) {
    const tables = schema.tables.length;
    const relationships = schema.relationships.length;
    const avgColumns = schema.tables.reduce((sum, t) => sum + t.columns.length, 0) / tables;
    
    // Simple complexity score
    const score = (tables * 1) + (relationships * 2) + (avgColumns * 0.5);
    
    if (score < 20) return 'SIMPLE';
    if (score < 50) return 'MODERATE';
    if (score < 100) return 'COMPLEX';
    return 'VERY_COMPLEX';
  }

  /**
   * Get table by name
   */
  getTable(schema, tableName) {
    return schema.tables.find(t => t.name === tableName);
  }

  /**
   * Get related tables
   */
  getRelatedTables(schema, tableName) {
    const related = new Set();
    
    for (const rel of schema.relationships) {
      if (rel.fromTable === tableName) {
        related.add(rel.toTable);
      }
      if (rel.toTable === tableName) {
        related.add(rel.fromTable);
      }
    }
    
    return Array.from(related);
  }
}

export default new SchemaParser();
