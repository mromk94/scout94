/**
 * Test Data Generator
 * Phase 2: Containerized Testing System
 * 
 * Purpose: Generate realistic test data based on schema
 * Uses: Faker.js for realistic data generation
 */

import { faker } from '@faker-js/faker';
import { SchemaParser } from './schema-parser.js';

export class TestDataGenerator {
  constructor() {
    this.schemaParser = new SchemaParser();
  }

  /**
   * Generate test data for all tables in schema
   */
  async generateForSchema(schemaPath, dbType, rowsPerTable = 100) {
    const schema = this.schemaParser.parseSchema(schemaPath, dbType);
    const data = {};
    
    console.log(`🎲 Generating test data for ${schema.tables.length} tables...`);
    
    // Sort tables by dependencies (tables with no FKs first)
    const sortedTables = this.sortTablesByDependencies(schema.tables);
    
    // Generate data for each table
    for (const table of sortedTables) {
      console.log(`  📋 Generating ${rowsPerTable} rows for ${table.name}...`);
      data[table.name] = this.generateTableData(table, rowsPerTable, data);
    }
    
    return {
      schema,
      data,
      stats: this.calculateStats(data)
    };
  }

  /**
   * Sort tables by dependencies
   */
  sortTablesByDependencies(tables) {
    const sorted = [];
    const remaining = [...tables];
    const processed = new Set();
    
    while (remaining.length > 0) {
      let found = false;
      
      for (let i = 0; i < remaining.length; i++) {
        const table = remaining[i];
        
        // Check if all foreign key dependencies are already processed
        const depsProcessed = table.foreignKeys.every(fk => 
          processed.has(fk.referencedTable) || fk.referencedTable === table.name
        );
        
        if (depsProcessed) {
          sorted.push(table);
          processed.add(table.name);
          remaining.splice(i, 1);
          found = true;
          break;
        }
      }
      
      // Prevent infinite loop if circular dependencies
      if (!found) {
        sorted.push(...remaining);
        break;
      }
    }
    
    return sorted;
  }

  /**
   * Generate data for a single table
   */
  generateTableData(table, rowCount, existingData) {
    const rows = [];
    
    for (let i = 0; i < rowCount; i++) {
      const row = {};
      
      for (const column of table.columns) {
        row[column.name] = this.generateColumnValue(column, i, table, existingData);
      }
      
      rows.push(row);
    }
    
    return rows;
  }

  /**
   * Generate value for a single column
   */
  generateColumnValue(column, rowIndex, table, existingData) {
    // Handle primary key
    if (column.name === table.primaryKey) {
      return column.autoIncrement ? rowIndex + 1 : this.generatePrimaryKey(column);
    }
    
    // Handle foreign keys
    const foreignKey = table.foreignKeys.find(fk => fk.column === column.name);
    if (foreignKey) {
      return this.generateForeignKeyValue(foreignKey, existingData);
    }
    
    // Handle NULL
    if (column.nullable && Math.random() < 0.1) {
      return null;
    }
    
    // Generate based on column name (intelligent inference)
    const value = this.generateByColumnName(column.name, column.dataType);
    if (value !== null) return value;
    
    // Generate based on data type
    return this.generateByDataType(column);
  }

  /**
   * Generate primary key value
   */
  generatePrimaryKey(column) {
    switch (column.dataType) {
      case 'integer':
        return faker.number.int({ min: 1, max: 1000000 });
      case 'string':
        return faker.string.uuid();
      default:
        return faker.number.int({ min: 1, max: 1000000 });
    }
  }

  /**
   * Generate foreign key value
   */
  generateForeignKeyValue(foreignKey, existingData) {
    const referencedTable = existingData[foreignKey.referencedTable];
    
    if (!referencedTable || referencedTable.length === 0) {
      // If referenced table doesn't have data yet, generate a plausible value
      return faker.number.int({ min: 1, max: 100 });
    }
    
    // Pick a random row from referenced table
    const randomRow = faker.helpers.arrayElement(referencedTable);
    return randomRow[foreignKey.referencedColumn];
  }

  /**
   * Generate value based on column name (intelligent inference)
   */
  generateByColumnName(name, dataType) {
    const nameLower = name.toLowerCase();
    
    // Email
    if (nameLower.includes('email')) {
      return faker.internet.email();
    }
    
    // Names
    if (nameLower === 'name' || nameLower === 'fullname' || nameLower === 'full_name') {
      return faker.person.fullName();
    }
    if (nameLower === 'firstname' || nameLower === 'first_name') {
      return faker.person.firstName();
    }
    if (nameLower === 'lastname' || nameLower === 'last_name') {
      return faker.person.lastName();
    }
    if (nameLower === 'username') {
      return faker.internet.userName();
    }
    
    // Contact
    if (nameLower.includes('phone') || nameLower.includes('mobile')) {
      return faker.phone.number();
    }
    if (nameLower.includes('address')) {
      return faker.location.streetAddress();
    }
    if (nameLower.includes('city')) {
      return faker.location.city();
    }
    if (nameLower.includes('state') || nameLower.includes('province')) {
      return faker.location.state();
    }
    if (nameLower.includes('country')) {
      return faker.location.country();
    }
    if (nameLower.includes('zipcode') || nameLower.includes('postal')) {
      return faker.location.zipCode();
    }
    
    // Dates
    if (nameLower.includes('birthday') || nameLower === 'dob') {
      return faker.date.birthdate();
    }
    if (nameLower.includes('created') || nameLower === 'created_at') {
      return faker.date.recent();
    }
    if (nameLower.includes('updated') || nameLower === 'updated_at') {
      return faker.date.recent();
    }
    if (nameLower.includes('date')) {
      return faker.date.recent();
    }
    
    // Financial
    if (nameLower.includes('price') || nameLower.includes('cost')) {
      return faker.commerce.price();
    }
    if (nameLower.includes('amount') || nameLower.includes('balance')) {
      return faker.finance.amount();
    }
    if (nameLower.includes('currency')) {
      return faker.finance.currencyCode();
    }
    if (nameLower.includes('account') && dataType === 'string') {
      return faker.finance.accountNumber();
    }
    
    // Web
    if (nameLower.includes('url') || nameLower === 'website') {
      return faker.internet.url();
    }
    if (nameLower.includes('ip')) {
      return faker.internet.ip();
    }
    if (nameLower.includes('domain')) {
      return faker.internet.domainName();
    }
    
    // Content
    if (nameLower === 'title') {
      return faker.lorem.sentence();
    }
    if (nameLower.includes('description') || nameLower.includes('content')) {
      return faker.lorem.paragraph();
    }
    if (nameLower.includes('comment')) {
      return faker.lorem.sentences();
    }
    
    // Status/Type
    if (nameLower === 'status') {
      return faker.helpers.arrayElement(['active', 'inactive', 'pending', 'completed']);
    }
    if (nameLower === 'type') {
      return faker.helpers.arrayElement(['type1', 'type2', 'type3']);
    }
    
    // Company
    if (nameLower.includes('company')) {
      return faker.company.name();
    }
    if (nameLower.includes('job') || nameLower.includes('position')) {
      return faker.person.jobTitle();
    }
    
    // Product
    if (nameLower.includes('product')) {
      return faker.commerce.productName();
    }
    if (nameLower.includes('category')) {
      return faker.commerce.department();
    }
    
    // Images
    if (nameLower.includes('avatar') || nameLower.includes('image')) {
      return faker.image.avatar();
    }
    
    // Password (hashed)
    if (nameLower.includes('password') || nameLower.includes('hash')) {
      return faker.internet.password({ length: 60, memorable: false, pattern: /[a-zA-Z0-9$]/ });
    }
    
    // Token
    if (nameLower.includes('token') || nameLower.includes('key')) {
      return faker.string.alphanumeric(32);
    }
    
    return null; // No pattern matched
  }

  /**
   * Generate value based on data type
   */
  generateByDataType(column) {
    switch (column.dataType) {
      case 'integer':
        const max = column.unsigned ? 4294967295 : 2147483647;
        const min = column.unsigned ? 0 : -2147483648;
        return faker.number.int({ min, max: Math.min(max, 1000000) });
      
      case 'string':
        const maxLength = parseInt(column.size) || 255;
        if (maxLength <= 10) {
          return faker.string.alphanumeric(Math.min(maxLength, 10));
        } else if (maxLength <= 50) {
          return faker.lorem.word();
        } else if (maxLength <= 255) {
          return faker.lorem.sentence();
        } else {
          return faker.lorem.paragraphs();
        }
      
      case 'datetime':
        return faker.date.recent();
      
      case 'decimal':
        return parseFloat(faker.finance.amount());
      
      case 'boolean':
        return faker.datatype.boolean();
      
      case 'json':
        return JSON.stringify({
          key1: faker.lorem.word(),
          key2: faker.number.int(),
          key3: faker.datatype.boolean()
        });
      
      case 'enum':
        return `option${faker.number.int({ min: 1, max: 5 })}`;
      
      default:
        return faker.lorem.word();
    }
  }

  /**
   * Calculate statistics
   */
  calculateStats(data) {
    const stats = {
      totalTables: Object.keys(data).length,
      totalRows: 0,
      tablesStats: {}
    };
    
    for (const [tableName, rows] of Object.entries(data)) {
      stats.totalRows += rows.length;
      stats.tablesStats[tableName] = {
        rowCount: rows.length,
        columnCount: rows.length > 0 ? Object.keys(rows[0]).length : 0
      };
    }
    
    return stats;
  }

  /**
   * Generate SQL INSERT statements
   */
  generateInsertStatements(tableName, rows, dbType = 'mysql') {
    if (rows.length === 0) return '';
    
    const columns = Object.keys(rows[0]);
    const statements = [];
    
    for (const row of rows) {
      const values = columns.map(col => {
        const value = row[col];
        
        if (value === null) return 'NULL';
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value ? '1' : '0';
        if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
        
        // Escape string values
        const escaped = String(value).replace(/'/g, "''");
        return `'${escaped}'`;
      });
      
      const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
      statements.push(sql);
    }
    
    return statements.join('\n');
  }
}

export default new TestDataGenerator();
