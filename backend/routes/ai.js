const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../../config/config');
const { query } = require('../models/database');

// AI模型配置
const AI_ENDPOINTS = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  qwen: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  kimi: 'https://api.moonshot.cn/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
};

// 调用AI模型
async function callAIModel(model, prompt, topic) {
  try {
    const apiKey = config.AI_KEYS[model];
    if (!apiKey) {
      throw new Error(`模型 ${model} 的API密钥未配置`);
    }

    let response;
    
    switch (model) {
      case 'deepseek':
        response = await axios.post(AI_ENDPOINTS.deepseek, {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位专业的高中数学老师，需要生成规范的数学题目。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data.choices[0].message.content;
        
      case 'qwen':
        response = await axios.post(AI_ENDPOINTS.qwen, {
          model: 'qwen-max',
          input: {
            prompt: prompt
          },
          parameters: {
            temperature: 0.7
          }
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data.output.text;
        
      case 'kimi':
        response = await axios.post(AI_ENDPOINTS.kimi, {
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: '你是一位专业的高中数学老师，需要生成规范的数学题目。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data.choices[0].message.content;
        
      case 'gemini':
        response = await axios.post(`${AI_ENDPOINTS.gemini}?key=${apiKey}`, {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return response.data.candidates[0].content.parts[0].text;
        
      default:
        throw new Error(`不支持的模型: ${model}`);
    }
  } catch (error) {
    console.error(`调用 ${model} 模型错误:`, error.message);
    throw error;
  }
}

// 生成题目
router.post('/generate', async (req, res) => {
  try {
    const { topic, difficulty = '中等', count = 1 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ success: false, error: '请提供题目主题' });
    }
    
    // 选择模型
    const model = config.GENERATION_RULES.topic_model_mapping[topic] || 
                 config.GENERATION_RULES.default_model;
    
    const prompt = `请生成${count}道关于"${topic}"的高中数学题目，难度为${difficulty}。
    
要求：
1. 每道题目包含完整的题目描述（支持LaTeX数学公式）
2. 提供标准答案
3. 提供详细的解题步骤
4. 标注相关知识点
5. 格式为JSON数组，每个题目包含：content（题目内容）、answer（答案）、solution（解题步骤）、knowledge_points（知识点数组）

示例格式：
[{
  "content": "已知函数$f(x) = x^2 - 2x + 1$，求$f(x)$的最小值。",
  "answer": "0",
  "solution": "配方得$f(x) = (x-1)^2$，当$x=1$时取得最小值0。",
  "knowledge_points": ["二次函数", "配方法"]
}]`;
    
    const result = await callAIModel(model, prompt, topic);
    
    // 解析AI响应
    let questions;
    try {
      // 尝试提取JSON部分
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI响应');
      }
    } catch (parseError) {
      console.error('解析AI响应错误:', parseError);
      return res.status(500).json({ success: false, error: '题目生成格式错误' });
    }
    
    // 校验生成的题目
    const verifier = model === 'gemini' ? 'deepseek' : 'gemini';
    const verificationPrompt = `请验证以下数学题目的正确性，给出置信度分数(0-1)：
${JSON.stringify(questions, null, 2)}

请返回JSON格式：{"score": 0.95, "feedback": "题目正确"}`;
    
    const verification = await callAIModel(verifier, verificationPrompt, topic);
    
    let confidence = 0;
    try {
      const verifyResult = JSON.parse(verification.match(/\{[\s\S]*\}/)[0]);
      confidence = verifyResult.score || 0;
    } catch (error) {
      console.warn('验证结果解析失败，使用默认置信度');
      confidence = 0.9;
    }
    
    // 保存到数据库
    const savedQuestions = [];
    for (const question of questions) {
      if (confidence >= config.GENERATION_RULES.min_confidence) {
        try {
          await query(
            'INSERT INTO questions (content, difficulty, answer, solution, knowledge_points, ai_signature) VALUES (?, ?, ?, ?, ?, ?)',
            [
              question.content,
              difficulty,
              question.answer,
              question.solution,
              JSON.stringify(question.knowledge_points),
              `${model}+${verifier}`
            ]
          );
          savedQuestions.push(question);
        } catch (dbError) {
          console.error('保存题目到数据库错误:', dbError);
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        questions: savedQuestions,
        model_used: model,
        confidence,
        saved_count: savedQuestions.length
      }
    });
    
  } catch (error) {
    console.error('生成题目错误:', error);
    res.status(500).json({ success: false, error: '题目生成失败' });
  }
});

// 获取支持的知识点
router.get('/knowledge-points', (req, res) => {
  const knowledgePoints = {
    '高一': [
      '集合与逻辑', '函数性质', '二次函数', '幂函数', '指数函数', '对数函数',
      '三角函数', '三角恒等变换', '解三角形', '平面向量', '不等式'
    ],
    '高二': [
      '数列', '导数', '概率', '统计', '立体几何', '空间向量'
    ],
    '高三': [
      '解析几何', '圆锥曲线', '函数综合', '导数应用', '数学归纳法',
      '复数', '排列组合', '二项式定理'
    ]
  };
  
  res.json({ success: true, data: knowledgePoints });
});

module.exports = router;