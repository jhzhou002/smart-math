const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 开始数据库迁移...');
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: config.DB_CONFIG.host,
      user: config.DB_CONFIG.user,
      password: config.DB_CONFIG.password,
      port: config.DB_CONFIG.port,
      charset: config.DB_CONFIG.charset,
      timezone: config.DB_CONFIG.timezone
    });
    
    console.log('✅ 数据库连接成功');
    
    // 创建数据库（如果不存在）
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.DB_CONFIG.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 数据库 ${config.DB_CONFIG.database} 已创建`);
    
    // 关闭连接并重新连接到指定数据库
    await connection.end();
    
    connection = await mysql.createConnection({
      host: config.DB_CONFIG.host,
      user: config.DB_CONFIG.user,
      password: config.DB_CONFIG.password,
      database: config.DB_CONFIG.database,
      port: config.DB_CONFIG.port,
      charset: config.DB_CONFIG.charset,
      timezone: config.DB_CONFIG.timezone
    });
    
    console.log(`✅ 已连接到数据库 ${config.DB_CONFIG.database}`);
    
    // 读取并执行schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // 分割SQL语句（按分号分割，但排除INSERT语句中的分号）
    const statements = [];
    let currentStatement = '';
    let inInsert = false;
    let parenLevel = 0;
    
    for (const line of schema.split('\n')) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toUpperCase().startsWith('INSERT')) {
        inInsert = true;
      }
      
      if (inInsert) {
        parenLevel += (line.match(/\(/g) || []).length;
        parenLevel -= (line.match(/\)/g) || []).length;
      }
      
      currentStatement += line + '\n';
      
      if (trimmedLine.endsWith(';')) {
        if (!inInsert || parenLevel <= 0) {
          statements.push(currentStatement.trim());
          currentStatement = '';
          inInsert = false;
          parenLevel = 0;
        }
      }
    }
    
    // 执行每个SQL语句
    for (const statement of statements) {
      if (statement && !statement.startsWith('--') && statement !== '') {
        try {
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            console.log(`📝 创建表: ${statement.match(/CREATE TABLE\s+(\w+)/i)?.[1] || 'unknown'}`);
          } else if (statement.toUpperCase().includes('INSERT')) {
            console.log('📊 插入示例数据...');
          }
          
          await connection.execute(statement);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('⚠️  表已存在，跳过创建');
          } else if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️  数据已存在，跳过插入');
          } else {
            console.error('❌ SQL执行错误:', error.message);
            console.error('SQL语句:', statement.substring(0, 100) + '...');
          }
        }
      }
    }
    
    // 验证表结构
    const tables = await connection.execute('SHOW TABLES');
    console.log('📋 数据库表:', tables[0].map(row => Object.values(row)[0]));
    
    // 检查数据
    const questionCount = await connection.execute('SELECT COUNT(*) as count FROM questions');
    console.log(`📊 题目数量: ${questionCount[0][0].count}`);
    
    console.log('✅ 数据库迁移完成！');
    
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };