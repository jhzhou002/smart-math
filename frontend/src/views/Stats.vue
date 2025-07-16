<template>
  <div class="stats">
    <div class="stats-header">
      <h1>📊 学习统计</h1>
      <p>分析你的学习进度和掌握情况</p>
    </div>

    <!-- 总体统计 -->
    <div class="overview-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.totalAnswered }}</div>
                <div class="stat-label">总答题数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon success">
                <el-icon><Select /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.correctAnswers }}</div>
                <div class="stat-label">正确答题</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon warning">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.accuracy }}%</div>
                <div class="stat-label">正确率</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon info">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ overallStats.avgTime }}s</div>
                <div class="stat-label">平均用时</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 知识点掌握度 -->
    <div class="knowledge-mastery">
      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><Reading /></el-icon>
            <span>知识点掌握度</span>
          </div>
        </template>
        
        <div class="mastery-list">
          <div 
            v-for="(mastery, point) in knowledgeMastery" 
            :key="point"
            class="mastery-item"
          >
            <div class="mastery-info">
              <div class="point-name">{{ point }}</div>
              <div class="mastery-details">
                <span>{{ mastery.correct }}/{{ mastery.total }}</span>
                <span class="mastery-percentage">{{ mastery.percentage }}%</span>
              </div>
            </div>
            <div class="mastery-progress">
              <el-progress 
                :percentage="mastery.percentage" 
                :color="getMasteryColor(mastery.percentage)"
                :stroke-width="8"
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 练习历史 -->
    <div class="practice-history">
      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>练习历史</span>
            <el-button type="primary" size="small" @click="loadPracticeHistory">
              刷新
            </el-button>
          </div>
        </template>
        
        <el-table :data="practiceHistory" stripe>
          <el-table-column prop="date" label="日期" width="120">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="total_questions" label="题目数" width="80" />
          <el-table-column prop="correct_answers" label="正确数" width="80" />
          <el-table-column prop="accuracy" label="正确率" width="100">
            <template #default="{ row }">
              <el-tag :type="getAccuracyType(row.accuracy)">
                {{ row.accuracy }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" width="80">
            <template #default="{ row }">
              <el-tag :type="getDifficultyType(row.difficulty)">
                {{ row.difficulty }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="session_id" label="操作" width="120">
            <template #default="{ row }">
              <el-button 
                type="text" 
                size="small"
                @click="viewSessionDetail(row.session_id)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 学习建议 -->
    <div class="study-suggestions">
      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><Lamp /></el-icon>
            <span>学习建议</span>
          </div>
        </template>
        
        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in studySuggestions" 
            :key="index"
            class="suggestion-item"
          >
            <div class="suggestion-icon">
              <el-icon :color="suggestion.color">
                <component :is="suggestion.icon" />
              </el-icon>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">{{ suggestion.title }}</div>
              <div class="suggestion-description">{{ suggestion.description }}</div>
            </div>
            <div class="suggestion-action">
              <el-button 
                :type="suggestion.buttonType" 
                size="small"
                @click="applySuggestion(suggestion)"
              >
                {{ suggestion.buttonText }}
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Stats',
  data() {
    return {
      overallStats: {
        totalAnswered: 0,
        correctAnswers: 0,
        accuracy: 0,
        avgTime: 0
      },
      knowledgeMastery: {},
      practiceHistory: [],
      studySuggestions: []
    }
  },
  mounted() {
    this.loadStats()
    this.loadPracticeHistory()
    this.generateSuggestions()
  },
  methods: {
    async loadStats() {
      try {
        // 模拟数据，实际应该从后端获取
        this.overallStats = {
          totalAnswered: 245,
          correctAnswers: 208,
          accuracy: 85,
          avgTime: 45
        }
        
        this.knowledgeMastery = {
          '函数性质': { correct: 18, total: 22, percentage: 82 },
          '三角函数': { correct: 15, total: 20, percentage: 75 },
          '数列': { correct: 12, total: 15, percentage: 80 },
          '导数': { correct: 8, total: 12, percentage: 67 },
          '立体几何': { correct: 10, total: 18, percentage: 56 },
          '解析几何': { correct: 14, total: 25, percentage: 56 },
          '概率统计': { correct: 16, total: 20, percentage: 80 },
          '复数': { correct: 9, total: 10, percentage: 90 }
        }
        
      } catch (error) {
        this.$message.error('加载统计数据失败')
      }
    },
    
    async loadPracticeHistory() {
      try {
        // 模拟数据
        this.practiceHistory = [
          {
            session_id: 'session-1',
            created_at: '2024-01-15T10:30:00Z',
            total_questions: 10,
            correct_answers: 8,
            accuracy: 80,
            difficulty: '中等'
          },
          {
            session_id: 'session-2',
            created_at: '2024-01-14T14:20:00Z',
            total_questions: 15,
            correct_answers: 12,
            accuracy: 80,
            difficulty: '困难'
          },
          {
            session_id: 'session-3',
            created_at: '2024-01-13T09:15:00Z',
            total_questions: 20,
            correct_answers: 18,
            accuracy: 90,
            difficulty: '简单'
          }
        ]
      } catch (error) {
        this.$message.error('加载练习历史失败')
      }
    },
    
    generateSuggestions() {
      const suggestions = []
      
      // 基于掌握度生成建议
      for (const [point, mastery] of Object.entries(this.knowledgeMastery)) {
        if (mastery.percentage < 70) {
          suggestions.push({
            title: `加强 ${point} 练习`,
            description: `当前掌握度 ${mastery.percentage}%，建议多做相关题目`,
            icon: 'Warning',
            color: '#f56c6c',
            buttonType: 'warning',
            buttonText: '开始练习',
            action: 'practice',
            target: point
          })
        }
      }
      
      // 基于总体表现生成建议
      if (this.overallStats.accuracy < 80) {
        suggestions.push({
          title: '提升解题准确率',
          description: '建议放慢解题速度，仔细审题和计算',
          icon: 'EditPen',
          color: '#e6a23c',
          buttonType: 'warning',
          buttonText: '查看技巧',
          action: 'tips'
        })
      }
      
      if (this.overallStats.avgTime > 60) {
        suggestions.push({
          title: '提高解题速度',
          description: '通过大量练习提高熟练度，掌握解题技巧',
          icon: 'Clock',
          color: '#409eff',
          buttonType: 'primary',
          buttonText: '快速练习',
          action: 'speed_practice'
        })
      }
      
      // 鼓励性建议
      if (this.overallStats.accuracy >= 90) {
        suggestions.push({
          title: '表现优秀！',
          description: '你的数学能力很强，可以尝试更难的题目',
          icon: 'Medal',
          color: '#67c23a',
          buttonType: 'success',
          buttonText: '挑战困难题',
          action: 'challenge'
        })
      }
      
      this.studySuggestions = suggestions
    },
    
    getMasteryColor(percentage) {
      if (percentage >= 90) return '#67c23a'
      if (percentage >= 80) return '#e6a23c'
      if (percentage >= 60) return '#f56c6c'
      return '#909399'
    },
    
    getAccuracyType(accuracy) {
      if (accuracy >= 90) return 'success'
      if (accuracy >= 80) return 'warning'
      return 'danger'
    },
    
    getDifficultyType(difficulty) {
      const types = {
        '简单': 'success',
        '中等': 'warning',
        '困难': 'danger'
      }
      return types[difficulty] || 'info'
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },
    
    viewSessionDetail(sessionId) {
      // 实际应该显示详细的会话统计
      this.$message.info(`查看会话 ${sessionId} 的详细信息`)
    },
    
    applySuggestion(suggestion) {
      switch (suggestion.action) {
        case 'practice':
          this.$router.push({
            path: '/practice',
            query: { knowledge_point: suggestion.target }
          })
          break
        case 'speed_practice':
          this.$router.push({
            path: '/practice',
            query: { mode: 'speed' }
          })
          break
        case 'challenge':
          this.$router.push({
            path: '/practice',
            query: { difficulty: '困难' }
          })
          break
        case 'tips':
          this.$message.info('学习技巧功能开发中...')
          break
        default:
          this.$message.info('功能开发中...')
      }
    }
  }
}
</script>

<style scoped>
.stats {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stats-header {
  text-align: center;
  margin-bottom: 40px;
}

.stats-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.stats-header p {
  font-size: 1.1rem;
  color: #666;
}

.overview-stats {
  margin-bottom: 40px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-icon.success {
  background: #67c23a;
}

.stat-icon.warning {
  background: #e6a23c;
}

.stat-icon.info {
  background: #409eff;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.knowledge-mastery {
  margin-bottom: 40px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.mastery-list {
  max-height: 400px;
  overflow-y: auto;
}

.mastery-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.mastery-info {
  flex: 1;
  margin-right: 20px;
}

.point-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.mastery-details {
  font-size: 0.9rem;
  color: #666;
}

.mastery-percentage {
  margin-left: 8px;
  font-weight: 600;
}

.mastery-progress {
  flex: 2;
}

.practice-history {
  margin-bottom: 40px;
}

.study-suggestions {
  margin-bottom: 40px;
}

.suggestions-list {
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.suggestion-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.suggestion-action {
  margin-left: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-header h1 {
    font-size: 2rem;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .mastery-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .mastery-progress {
    width: 100%;
  }
  
  .suggestion-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}
</style>