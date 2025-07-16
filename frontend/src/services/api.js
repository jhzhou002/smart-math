import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          throw new Error(data.error || '请求参数错误')
        case 404:
          throw new Error(data.error || '资源不存在')
        case 429:
          throw new Error('请求过于频繁，请稍后再试')
        case 500:
          throw new Error(data.error || '服务器内部错误')
        default:
          throw new Error(data.error || '请求失败')
      }
    } else if (error.request) {
      throw new Error('网络连接失败')
    } else {
      throw new Error('请求配置错误')
    }
  }
)

export default {
  // 题目相关
  getQuestions(params) {
    return api.get('/questions', { params })
  },
  
  getQuestion(id) {
    return api.get(`/questions/${id}`)
  },
  
  getRandomQuestions(count, params) {
    return api.get(`/questions/random/${count}`, { params })
  },
  
  verifyAnswer(questionId, data) {
    return api.post(`/questions/${questionId}/verify`, data)
  },
  
  // 会话相关
  createSession(data) {
    return api.post('/sessions', data)
  },
  
  getSession(sessionId) {
    return api.get(`/sessions/${sessionId}`)
  },
  
  nextQuestion(sessionId) {
    return api.post(`/sessions/${sessionId}/next`)
  },
  
  getSessionStats(sessionId) {
    return api.get(`/sessions/${sessionId}/stats`)
  },
  
  // AI 相关
  generateQuestions(data) {
    return api.post('/ai/generate', data)
  },
  
  getKnowledgePoints() {
    return api.get('/ai/knowledge-points')
  },
  
  // 健康检查
  healthCheck() {
    return api.get('/health')
  }
}