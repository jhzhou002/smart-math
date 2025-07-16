const mysql = require('mysql2/promise');
const config = require('../../config/config');

// 数据库连接池
const pool = mysql.createPool({
  ...config.DB_CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  reconnect: true
});

// 数据库连接测试
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 执行查询
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 事务执行
async function transaction(queries) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [result] = await connection.execute(sql, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 初始化数据库
async function initDatabase() {
  try {
    // 读取schema.sql并执行
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await query(statement);
        }
      }
      console.log('✅ 数据库表初始化完成');
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  initDatabase
};