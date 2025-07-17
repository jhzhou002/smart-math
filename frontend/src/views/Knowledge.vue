<template>
  <div class="knowledge">
    <div class="knowledge-header">
      <h1>📚 知识点管理</h1>
      <p>高中数学知识点体系与AI题目生成</p>
    </div>

    <!-- 知识点分类 -->
    <div class="knowledge-categories">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane 
          v-for="(category, grade) in knowledgePoints" 
          :key="grade"
          :label="grade" 
          :name="grade"
        >
          <div class="category-content">
            <el-row :gutter="20">
              <el-col 
                :span="8" 
                v-for="(point, index) in category" 
                :key="index"
                class="knowledge-item"
              >
                <el-card 
                  class="knowledge-card"
                  :body-style="{ padding: '20px' }"
                  shadow="hover"
                >
                  <div class="card-content">
                    <div class="point-name">{{ point }}</div>
                    <div class="point-actions">
                      <el-button 
                        type="primary" 
                        size="small"
                        @click="practicePoint(point)"
                      >
                        开始练习
                      </el-button>
                      <el-button 
                        type="success" 
                        size="small"
                        @click="generateQuestions(point)"
                        :loading="generating[point]"
                      >
                        生成题目
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 题目生成器 -->
    <div class="question-generator">
      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><Magic /></el-icon>
            <span>AI题目生成器</span>
          </div>
        </template>
        
        <el-form :model="generateForm" :rules="generateRules" ref="generateForm" :inline="true">
          <el-form-item label="知识点" prop="topic">
            <el-select 
              v-model="generateForm.topic" 
              placeholder="选择知识点"
              style="width: 200px"
            >
              <el-option 
                v-for="point in allKnowledgePoints" 
                :key="point" 
                :label="point" 
                :value="point"
              ></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="难度" prop="difficulty">
            <el-select 
              v-model="generateForm.difficulty" 
              placeholder="选择难度"
              style="width: 120px"
            >
              <el-option label="简单" value="简单"></el-option>
              <el-option label="中等" value="中等"></el-option>
              <el-option label="困难" value="困难"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="数量" prop="count">
            <el-input-number 
              v-model="generateForm.count" 
              :min="1" 
              :max="10"
              style="width: 120px"
            ></el-input-number>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleGenerate"
              :loading="isGenerating"
            >
              生成题目
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 生成结果 -->
    <div v-if="generatedQuestions.length > 0" class="generated-questions">
      <el-card>
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>生成的题目 ({{ generatedQuestions.length }}道)</span>
            <el-tag :type="confidenceType">置信度: {{ confidence }}%</el-tag>
          </div>
        </template>
        
        <div class="questions-list">
          <div 
            v-for="(question, index) in generatedQuestions" 
            :key="index"
            class="question-item"
          >
            <el-card class="question-preview">
              <div class="question-header">
                <span class="question-number">第 {{ index + 1 }} 题</span>
                <div class="question-tags">
                  <el-tag 
                    v-for="point in question.knowledge_points" 
                    :key="point"
                    size="small"
                    type="info"
                  >
                    {{ point }}
                  </el-tag>
                </div>
              </div>
              
              <div class="question-content">
                <div class="content-section">
                  <strong>题目：</strong>
                  <div v-html="renderMath(question.content)"></div>
                </div>
                
                <div class="content-section">
                  <strong>答案：</strong>
                  <span class="answer">{{ question.answer }}</span>
                </div>
                
                <div class="content-section">
                  <strong>解析：</strong>
                  <div v-html="renderMath(question.solution)"></div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import katex from 'katex'
import api from '../services/api'
import { reactive } from 'vue'

export default {
  name: 'Knowledge',
  data() {
    return {
      activeTab: '高一',
      knowledgePoints: {
        '高一': [
          '集合与逻辑', '函数性质', '二次函数', '幂函数', '指数函数', '对数函数',
          '三角函数', '三角恒等变换', '解三角形', '平面向量', '基本不等式'
        ],
        '高二': [
          '数列', '等差数列', '等比数列', '导数概念', '导数运算', '导数应用',
          '概率基础', '统计基础', '立体几何', '空间向量', '空间角度'
        ],
        '高三': [
          '解析几何', '直线与圆', '椭圆', '双曲线', '抛物线', '圆锥曲线',
          '函数综合', '导数综合', '复数', '排列组合', '二项式定理'
        ]
      },
      generating: reactive({}),
      
      // 题目生成
      generateForm: {
        topic: '',
        difficulty: '中等',
        count: 3
      },
      generateRules: {
        topic: [
          { required: true, message: '请选择知识点', trigger: 'change' }
        ]
      },
      isGenerating: false,
      generatedQuestions: [],
      confidence: 0,
      usedModel: ''
    }
  },
  computed: {
    allKnowledgePoints() {
      return Object.values(this.knowledgePoints).flat()
    },
    confidenceType() {
      if (this.confidence >= 95) return 'success'
      if (this.confidence >= 90) return 'warning'
      return 'danger'
    }
  },
  methods: {
    practicePoint(point) {
      this.$router.push({
        path: '/practice',
        query: { knowledge_point: point }
      })
    },
    
    async generateQuestions(point) {
      this.generating[point] = true
      
      try {
        const response = await api.generateQuestions({
          topic: point,
          difficulty: '中等',
          count: 2
        })
        
        this.$message.success(`成功生成 ${response.data.saved_count} 道题目`)
        
        // 显示生成的题目
        this.generatedQuestions = response.data.questions
        this.confidence = Math.round(response.data.confidence * 100)
        this.usedModel = response.data.model_used
        
      } catch (error) {
        this.$message.error('生成题目失败：' + error.message)
      } finally {
        this.generating[point] = false
      }
    },
    
    async handleGenerate() {
      this.$refs.generateForm.validate(async (valid) => {
        if (valid) {
          this.isGenerating = true
          
          try {
            const response = await api.generateQuestions({
              topic: this.generateForm.topic,
              difficulty: this.generateForm.difficulty,
              count: this.generateForm.count
            })
            
            this.generatedQuestions = response.data.questions
            this.confidence = Math.round(response.data.confidence * 100)
            this.usedModel = response.data.model_used
            
            this.$message.success(`成功生成 ${response.data.saved_count} 道题目`)
            
          } catch (error) {
            this.$message.error('生成题目失败：' + error.message)
          } finally {
            this.isGenerating = false
          }
        }
      })
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
.knowledge {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.knowledge-header {
  text-align: center;
  margin-bottom: 40px;
}

.knowledge-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.knowledge-header p {
  font-size: 1.1rem;
  color: #666;
}

.knowledge-categories {
  margin-bottom: 40px;
}

.category-content {
  padding: 20px 0;
}

.knowledge-item {
  margin-bottom: 20px;
}

.knowledge-card {
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.knowledge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.card-content {
  text-align: center;
}

.point-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.point-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.question-generator {
  margin-bottom: 40px;
}

.generated-questions {
  margin-bottom: 40px;
}

.questions-list {
  max-height: 600px;
  overflow-y: auto;
}

.question-item {
  margin-bottom: 20px;
}

.question-preview {
  border-radius: 8px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.question-number {
  font-weight: 600;
  color: #2c3e50;
}

.question-tags {
  display: flex;
  gap: 4px;
}

.content-section {
  margin-bottom: 12px;
  line-height: 1.6;
}

.content-section strong {
  color: #2c3e50;
}

.answer {
  font-weight: 600;
  color: #67c23a;
  background: #f0f9ff;
  padding: 4px 8px;
  border-radius: 4px;
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
  .knowledge-header h1 {
    font-size: 2rem;
  }
  
  .point-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .question-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>