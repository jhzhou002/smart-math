module.exports = {
  // 数据库配置
  DB_CONFIG: {
    host: '8.153.77.15',
    user: 'connect',
    password: 'Zhjh0704.',
    database: 'smart_math',
    port: 3306,
    charset: 'utf8mb4',
    timezone: '+08:00'
  },
  
  // 模型API密钥
  AI_KEYS: {
    deepseek: 'sk-17269fe512b74407b22f5c926a216bf1',
    qwen: 'sk-829bda5565e04302b9bd5a088f0247c3',
    kimi: 'sk-5WRXcCdiP1HoPDRwpcKnF0Zi5b9th6q12mF50KqBDJrUc62y',
    gemini: 'AIzaSyAjUmhQ3_OQk0khfz3DFUrwVtGlU00Fu7A'
  },
  
  // 生成策略
  GENERATION_RULES: {
    default_model: "deepseek",
    topic_model_mapping: {
      "函数": "qwen",
      "几何": "deepseek", // 改用deepseek替代gemini
      "概率": "kimi",
      "导数": "qwen",
      "数列": "qwen"
    },
    min_confidence: 0.85 // 降低最低校验置信度
  },
  
  // 服务器配置
  SERVER_CONFIG: {
    port: process.env.PORT || 3000,
    jwt_secret: process.env.JWT_SECRET || 'smart-math-secret-key',
    cors_origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  }
};