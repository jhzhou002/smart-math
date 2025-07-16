<template>
  <div class="home">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <el-card class="welcome-card">
        <div class="welcome-content">
          <h1>🎯 智能数学刷题平台</h1>
          <p class="subtitle">AI驱动的个性化高中数学练习系统</p>
          <div class="features">
            <div class="feature-item">
              <el-icon class="feature-icon"><Edit /></el-icon>
              <span>智能题目生成</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><TrendCharts /></el-icon>
              <span>学习进度跟踪</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><Medal /></el-icon>
              <span>知识点精准定位</span>
            </div>
          </div>
          <el-button 
            type="primary" 
            size="large" 
            @click="$router.push('/practice')"
            class="start-btn"
          >
            开始练习
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 统计展示 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ stats.totalQuestions }}</div>
              <div class="stat-label">题目总数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ stats.knowledgePoints }}</div>
              <div class="stat-label">知识点覆盖</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ stats.aiModels }}</div>
              <div class="stat-label">AI模型</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ stats.avgAccuracy }}%</div>
              <div class="stat-label">平均准确率</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 知识点分类 -->
    <div class="knowledge-section">
      <h2>📚 知识点分类</h2>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(grade, index) in knowledgeData" :key="index">
          <el-card class="knowledge-card">
            <template #header>
              <div class="card-header">
                <span>{{ grade.name }}</span>
                <el-tag>{{ grade.points.length }}个知识点</el-tag>
              </div>
            </template>
            <div class="knowledge-list">
              <el-tag 
                v-for="point in grade.points" 
                :key="point"
                class="knowledge-tag"
                type="info"
              >
                {{ point }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速开始 -->
    <div class="quick-start">
      <el-card>
        <h3>🚀 快速开始</h3>
        <div class="quick-actions">
          <el-button 
            type="primary" 
            plain 
            @click="startPractice('简单')"
            class="quick-btn"
          >
            简单练习
          </el-button>
          <el-button 
            type="warning" 
            plain 
            @click="startPractice('中等')"
            class="quick-btn"
          >
            中等练习
          </el-button>
          <el-button 
            type="danger" 
            plain 
            @click="startPractice('困难')"
            class="quick-btn"
          >
            困难练习
          </el-button>
          <el-button 
            type="success" 
            plain 
            @click="randomPractice"
            class="quick-btn"
          >
            随机练习
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      stats: {
        totalQuestions: 1250,
        knowledgePoints: 45,
        aiModels: 4,
        avgAccuracy: 85
      },
      knowledgeData: [
        {
          name: '高一数学',
          points: ['集合与逻辑', '函数性质', '二次函数', '三角函数', '平面向量', '不等式']
        },
        {
          name: '高二数学',
          points: ['数列', '导数', '概率统计', '立体几何', '空间向量']
        },
        {
          name: '高三数学',
          points: ['解析几何', '圆锥曲线', '函数综合', '复数', '排列组合']
        }
      ]
    }
  },
  methods: {
    startPractice(difficulty) {
      this.$router.push({
        path: '/practice',
        query: { difficulty }
      })
    },
    randomPractice() {
      this.$router.push('/practice')
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-section {
  margin-bottom: 40px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  overflow: hidden;
}

.welcome-content {
  text-align: center;
  padding: 40px;
  color: white;
}

.welcome-content h1 {
  font-size: 3rem;
  margin-bottom: 16px;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 32px;
  opacity: 0.9;
}

.features {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}

.feature-icon {
  font-size: 1.4rem;
}

.start-btn {
  font-size: 1.2rem;
  padding: 16px 32px;
  border-radius: 8px;
  background: white;
  color: #667eea;
  border: none;
  font-weight: 600;
}

.start-btn:hover {
  background: #f0f8ff;
  transform: translateY(-2px);
}

.stats-section {
  margin-bottom: 40px;
}

.stat-card {
  text-align: center;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.stat-item {
  padding: 20px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  color: #666;
}

.knowledge-section {
  margin-bottom: 40px;
}

.knowledge-section h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
  color: #2c3e50;
}

.knowledge-card {
  border-radius: 12px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #2c3e50;
}

.knowledge-list {
  min-height: 120px;
}

.knowledge-tag {
  margin: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.knowledge-tag:hover {
  transform: scale(1.05);
}

.quick-start {
  margin-bottom: 40px;
}

.quick-start h3 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.5rem;
  color: #2c3e50;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-content h1 {
    font-size: 2rem;
  }
  
  .features {
    flex-direction: column;
    gap: 20px;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .quick-btn {
    width: 200px;
  }
}
</style>