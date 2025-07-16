const express = require('express');
const router = express.Router();
const { query } = require('../models/database');

// 获取题目列表
router.get('/', async (req, res) => {
  try {
    const { difficulty, source, knowledge_point, page = 1, limit = 10 } = req.query;
    
    let sql = 'SELECT * FROM questions WHERE 1=1';
    const params = [];
    
    // 筛选条件
    if (difficulty) {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }
    
    if (source) {
      sql += ' AND source LIKE ?';
      params.push(`%${source}%`);
    }
    
    if (knowledge_point) {
      sql += ' AND JSON_CONTAINS(knowledge_points, ?)';
      params.push(JSON.stringify(knowledge_point));
    }
    
    // 分页
    const offset = (page - 1) * limit;
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const questions = await query(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM questions WHERE 1=1';
    const countParams = [];
    
    if (difficulty) {
      countSql += ' AND difficulty = ?';
      countParams.push(difficulty);
    }
    
    if (source) {
      countSql += ' AND source LIKE ?';
      countParams.push(`%${source}%`);
    }
    
    if (knowledge_point) {
      countSql += ' AND JSON_CONTAINS(knowledge_points, ?)';
      countParams.push(JSON.stringify(knowledge_point));
    }
    
    const [{ total }] = await query(countSql, countParams);
    
    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取题目列表错误:', error);
    res.status(500).json({ success: false, error: '获取题目失败' });
  }
});

// 获取单个题目
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await query('SELECT * FROM questions WHERE id = ?', [id]);
    
    if (questions.length === 0) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }
    
    res.json({ success: true, data: questions[0] });
  } catch (error) {
    console.error('获取题目错误:', error);
    res.status(500).json({ success: false, error: '获取题目失败' });
  }
});

// 随机获取题目
router.get('/random/:count', async (req, res) => {
  try {
    const { count = 1 } = req.params;
    const { difficulty, knowledge_point } = req.query;
    
    let sql = 'SELECT * FROM questions WHERE 1=1';
    const params = [];
    
    if (difficulty) {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }
    
    if (knowledge_point) {
      sql += ' AND JSON_CONTAINS(knowledge_points, ?)';
      params.push(JSON.stringify(knowledge_point));
    }
    
    sql += ' ORDER BY RAND() LIMIT ?';
    params.push(parseInt(count));
    
    const questions = await query(sql, params);
    
    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('获取随机题目错误:', error);
    res.status(500).json({ success: false, error: '获取随机题目失败' });
  }
});

// 验证答案
router.post('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_answer, session_id } = req.body;
    
    if (!user_answer || !session_id) {
      return res.status(400).json({ success: false, error: '缺少必要参数' });
    }
    
    // 获取题目
    const questions = await query('SELECT * FROM questions WHERE id = ?', [id]);
    if (questions.length === 0) {
      return res.status(404).json({ success: false, error: '题目不存在' });
    }
    
    const question = questions[0];
    const is_correct = user_answer.trim() === question.answer.trim();
    
    // 记录答题
    await query(
      'INSERT INTO user_answers (session_id, question_id, user_answer, is_correct) VALUES (?, ?, ?, ?)',
      [session_id, id, user_answer, is_correct]
    );
    
    res.json({
      success: true,
      data: {
        is_correct,
        correct_answer: question.answer,
        solution: question.solution
      }
    });
  } catch (error) {
    console.error('验证答案错误:', error);
    res.status(500).json({ success: false, error: '验证答案失败' });
  }
});

module.exports = router;