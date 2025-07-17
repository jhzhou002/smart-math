<template>
  <div class="practice">
    <!-- 练习配置 -->
    <div v-if="!sessionStarted" class="practice-config">
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <el-icon><Edit /></el-icon>
            <span>开始练习</span>
          </div>
        </template>
        
        <el-form :model="config" :rules="rules" ref="configForm" label-width="100px">
          <el-form-item label="难度等级" prop="difficulty">
            <el-select v-model="config.difficulty" placeholder="选择难度">
              <el-option label="简单" value="简单"></el-option>
              <el-option label="中等" value="中等"></el-option>
              <el-option label="困难" value="困难"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="题目数量" prop="questionCount">
            <el-input-number 
              v-model="config.questionCount" 
              :min="1" 
              :max="50" 
              :step="1"
            ></el-input-number>
          </el-form-item>
          
          <el-form-item label="知识点">
            <el-select 
              v-model="config.knowledgePoints" 
              multiple 
              placeholder="选择知识点（可选）"
              style="width: 100%"
            >
              <el-option 
                v-for="point in knowledgePoints" 
                :key="point" 
                :label="point" 
                :value="point"
              ></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="startSession" :loading="loading">
              开始练习
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 练习界面 -->
    <div v-else class="practice-session">
      <!-- 进度条 -->
      <div class="progress-section">
        <el-card>
          <div class="progress-content">
            <div class="progress-info">
              <span>进度: {{ currentIndex + 1 }} / {{ totalQuestions }}</span>
              <span>得分: {{ score }}</span>
              <span>正确率: {{ accuracy }}%</span>
            </div>
            <el-progress 
              :percentage="progress" 
              :color="progressColor"
              :stroke-width="8"
            ></el-progress>
          </div>
        </el-card>
      </div>

      <!-- 题目展示 -->
      <div class="question-section">
        <el-card class="question-card">
          <template #header>
            <div class="question-header">
              <div class="question-meta">
                <el-tag type="info">{{ currentQuestion.source }}</el-tag>
                <el-tag :type="getDifficultyType(currentQuestion.difficulty)">
                  {{ currentQuestion.difficulty }}
                </el-tag>
              </div>
              <div class="question-number">
                第 {{ currentIndex + 1 }} 题
              </div>
            </div>
          </template>
          
          <div class="question-content">
            <div class="question-text" v-html="renderMath(currentQuestion.content)"></div>
          </div>
          
          <!-- 答案输入 -->
          <div class="answer-section">
            <el-form @submit.prevent="submitAnswer">
              <el-form-item>
                <el-input
                  v-model="userAnswer"
                  placeholder="请输入答案..."
                  size="large"
                  :disabled="answered"
                  @keyup.enter="submitAnswer"
                >
                  <template #append>
                    <el-button 
                      type="primary" 
                      @click="submitAnswer"
                      :disabled="!userAnswer.trim() || answered"
                      :loading="submitting"
                    >
                      提交
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
            
            <!-- 答案反馈 -->
            <div v-if="showFeedback" class="feedback-section">
              <el-alert
                :title="feedbackTitle"
                :type="feedbackType"
                :description="feedbackDescription"
                show-icon
                :closable="false"
              />
              
              <div class="solution-section" v-if="currentQuestion.solution">
                <h4>解题步骤：</h4>
                <div class="solution-content" v-html="renderMath(currentQuestion.solution)"></div>
              </div>
              
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  @click="nextQuestion"
                  :disabled="!answered"
                >
                  下一题
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 练习完成 -->
      <div v-if="practiceFinished" class="finish-section">
        <el-card class="finish-card">
          <div class="finish-content">
            <h2>🎉 练习完成！</h2>
            <div class="final-stats">
              <div class="stat-item">
                <div class="stat-value">{{ totalQuestions }}</div>
                <div class="stat-label">总题数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ correctAnswers }}</div>
                <div class="stat-label">正确数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ accuracy }}%</div>
                <div class="stat-label">准确率</div>
              </div>
            </div>
            <div class="finish-actions">
              <el-button type="primary" @click="restartPractice">
                重新练习
              </el-button>
              <el-button @click="$router.push('/stats')">
                查看统计
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import katex from 'katex'
import api from '../services/api'

export default {
  name: 'Practice',
  data() {
    return {
      sessionStarted: false,
      loading: false,
      submitting: false,
      config: {
        difficulty: '中等',
        questionCount: 10,
        knowledgePoints: []
      },
      rules: {
        difficulty: [
          { required: true, message: '请选择难度', trigger: 'change' }
        ],
        questionCount: [
          { required: true, message: '请输入题目数量', trigger: 'blur' }
        ]
      },
      knowledgePoints: [
        '集合与逻辑', '函数性质', '二次函数', '三角函数', '平面向量',
        '数列', '导数', '概率统计', '立体几何', '解析几何'
      ],
      
      // 练习状态
      sessionId: null,
      currentQuestion: null,
      currentIndex: 0,
      totalQuestions: 0,
      score: 0,
      correctAnswers: 0,
      userAnswer: '',
      answered: false,
      showFeedback: false,
      feedbackTitle: '',
      feedbackType: '',
      feedbackDescription: '',
      practiceFinished: false
    }
  },
  computed: {
    progress() {
      if (this.totalQuestions === 0) return 0
      return Math.round((this.currentIndex + 1) / this.totalQuestions * 100)
    },
    progressColor() {
      if (this.progress < 30) return '#f56c6c'
      if (this.progress < 70) return '#e6a23c'
      return '#67c23a'
    },
    accuracy() {
      if (this.currentIndex === 0) return 0
      return Math.round(this.correctAnswers / (this.currentIndex + 1) * 100)
    }
  },
  mounted() {
    // 检查路由参数
    if (this.$route.query.difficulty) {
      this.config.difficulty = this.$route.query.difficulty
    }
  },
  methods: {
    async startSession() {
      this.$refs.configForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            const response = await api.createSession({
              question_count: this.config.questionCount,
              difficulty: this.config.difficulty,
              knowledge_points: this.config.knowledgePoints
            })
            
            this.sessionId = response.data.session_id
            this.totalQuestions = response.data.total_questions
            this.sessionStarted = true
            
            await this.loadCurrentQuestion()
          } catch (error) {
            this.$message.error('创建练习失败：' + error.message)
          } finally {
            this.loading = false
          }
        }
      })
    },
    
    async loadCurrentQuestion() {
      try {
        const response = await api.getSession(this.sessionId)
        this.currentQuestion = response.data.current_question
        this.currentIndex = response.data.current_index
        this.score = response.data.score
        this.correctAnswers = response.data.correct_answers
        
        // 重置答题状态
        this.userAnswer = ''
        this.answered = false
        this.showFeedback = false
        
        if (!this.currentQuestion) {
          this.practiceFinished = true
        }
      } catch (error) {
        this.$message.error('加载题目失败：' + error.message)
      }
    },
    
    async submitAnswer() {
      if (!this.userAnswer.trim() || this.answered) return
      
      this.submitting = true
      try {
        const response = await api.verifyAnswer(this.currentQuestion.id, {
          user_answer: this.userAnswer,
          session_id: this.sessionId
        })
        
        const { is_correct, correct_answer, solution } = response.data
        
        this.answered = true
        this.showFeedback = true
        
        if (is_correct) {
          this.feedbackTitle = '✅ 回答正确！'
          this.feedbackType = 'success'
          this.feedbackDescription = `答案：${correct_answer}`
          this.correctAnswers++
        } else {
          this.feedbackTitle = '❌ 回答错误'
          this.feedbackType = 'error'
          this.feedbackDescription = `正确答案：${correct_answer}`
        }
        
        // 更新解析
        if (solution) {
          this.currentQuestion.solution = solution
        }
        
      } catch (error) {
        this.$message.error('提交答案失败：' + error.message)
      } finally {
        this.submitting = false
      }
    },
    
    async nextQuestion() {
      try {
        const response = await api.nextQuestion(this.sessionId)
        
        if (response.data.finished) {
          this.practiceFinished = true
          return
        }
        
        this.currentQuestion = response.data.current_question
        this.currentIndex = response.data.current_index
        
        // 重置状态
        this.userAnswer = ''
        this.answered = false
        this.showFeedback = false
        
      } catch (error) {
        this.$message.error('获取下一题失败：' + error.message)
      }
    },
    
    restartPractice() {
      this.sessionStarted = false
      this.practiceFinished = false
      this.currentIndex = 0
      this.score = 0
      this.correctAnswers = 0
    },
    
    getDifficultyType(difficulty) {
      const types = {
        '简单': 'success',
        '中等': 'warning',
        '困难': 'danger'
      }
      return types[difficulty] || 'info'
    },
    
    renderMath(content) {
      if (!content) return ''
      
      try {
        // 处理块级公式 $$...$$
        content = content.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
          try {
            const rendered = katex.renderToString(formula.trim(), {
              displayMode: true,
              throwOnError: false
            })
            return `<div class="math-block">${rendered}</div>`
          } catch (e) {
            return `<div class="math-block">${formula}</div>`
          }
        })
        
        // 处理行内公式 $...$
        content = content.replace(/\$([^$]+)\$/g, (match, formula) => {
          try {
            const rendered = katex.renderToString(formula.trim(), {
              displayMode: false,
              throwOnError: false
            })
            return `<span class="math-inline">${rendered}</span>`
          } catch (e) {
            return `<span class="math-inline">${formula}</span>`
          }
        })
        
        return content
      } catch (error) {
        return content
      }
    }
  }
}
</script>

<style scoped>
.practice {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.config-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-content {
  text-align: center;
}

.progress-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
  font-weight: 600;
  color: #666;
}

.question-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-meta {
  display: flex;
  gap: 8px;
}

.question-number {
  font-weight: 600;
  color: #2c3e50;
}

.question-content {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
}

.answer-section {
  padding: 20px 0;
}

.feedback-section {
  margin-top: 20px;
}

.solution-section {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.solution-section h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.solution-content {
  line-height: 1.6;
  color: #555;
}

.action-buttons {
  margin-top: 16px;
  text-align: center;
}

.finish-card {
  text-align: center;
  border-radius: 12px;
}

.finish-content h2 {
  color: #2c3e50;
  margin-bottom: 24px;
}

.final-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  color: #666;
}

.finish-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 数学公式样式 */
.math-inline {
  font-style: italic;
  color: #d73502;
  font-weight: 500;
}

.math-block {
  display: block;
  text-align: center;
  margin: 16px 0;
  font-style: italic;
  color: #d73502;
  font-weight: 500;
  font-size: 1.1em;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .question-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .final-stats {
    flex-direction: column;
    gap: 20px;
  }
  
  .finish-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>