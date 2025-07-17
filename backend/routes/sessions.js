const express = require('express');
const router = express.Router();
const { query } = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// 创建练习会话
router.post('/', async (req, res) => {
  try {
    const { user_id, question_count = 10, difficulty, knowledge_points } = req.body;
    
    // 生成会话ID
    const session_id = uuidv4();
    
    // 构建SQL查询
    let sql = 'SELECT id FROM questions';
    const params = [];
    
    // 只使用难度筛选，暂时不使用知识点筛选避免SQL错误
    if (difficulty) {
      sql += ' WHERE difficulty = ?';
      params.push(difficulty);
    }
    
    sql += ' ORDER BY RAND() LIMIT ?';
    params.push(parseInt(question_count));
    
    console.log('执行SQL:', sql);
    console.log('参数:', params);
    
    // 先检查表是否存在
    try {
      await query('SELECT 1 FROM questions LIMIT 1');
    } catch (tableError) {
      console.error('questions表不存在或无法访问:', tableError.message);
      return res.status(500).json({ 
        success: false, 
        error: '数据库未初始化，请运行: npm run dev:migrate' 
      });
    }
    
    const questions = await query(sql, params);
    
    if (questions.length === 0) {
      return res.status(400).json({ success: false, error: '没有符合条件的题目' });
    }
    
    const question_ids = questions.map(q => q.id);
    
    // 创建会话
    await query(
      'INSERT INTO sessions (session_id, user_id, questions, total_questions) VALUES (?, ?, ?, ?)',
      [session_id, user_id || null, JSON.stringify(question_ids), question_ids.length]
    );
    
    res.json({
      success: true,
      data: {
        session_id,
        total_questions: question_ids.length,
        first_question_id: question_ids[0]
      }
    });
  } catch (error) {
    console.error('创建会话错误:', error);
    res.status(500).json({ success: false, error: '创建会话失败' });
  }
});

// 获取会话信息
router.get('/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const sessions = await query('SELECT * FROM sessions WHERE session_id = ?', [session_id]);
    
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, error: '会话不存在' });
    }
    
    const session = sessions[0];
    const question_ids = JSON.parse(session.questions);
    
    // 获取当前题目
    const current_question_id = question_ids[session.current_index];
    let current_question = null;
    
    if (current_question_id) {
      const questions = await query('SELECT * FROM questions WHERE id = ?', [current_question_id]);
      current_question = questions[0];
    }
    
    res.json({
      success: true,
      data: {
        session_id: session.session_id,
        current_index: session.current_index,
        total_questions: session.total_questions,
        score: session.score,
        correct_answers: session.correct_answers,
        current_question,
        progress: ((session.current_index + 1) / session.total_questions * 100).toFixed(1)
      }
    });
  } catch (error) {
    console.error('获取会话错误:', error);
    res.status(500).json({ success: false, error: '获取会话失败' });
  }
});

// 下一题
router.post('/:session_id/next', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const sessions = await query('SELECT * FROM sessions WHERE session_id = ?', [session_id]);
    
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, error: '会话不存在' });
    }
    
    const session = sessions[0];
    const question_ids = JSON.parse(session.questions);
    
    if (session.current_index >= question_ids.length - 1) {
      return res.json({
        success: true,
        data: { finished: true, message: '练习完成' }
      });
    }
    
    // 更新当前题目索引
    const new_index = session.current_index + 1;
    await query(
      'UPDATE sessions SET current_index = ? WHERE session_id = ?',
      [new_index, session_id]
    );
    
    // 获取下一题
    const next_question_id = question_ids[new_index];
    const questions = await query('SELECT * FROM questions WHERE id = ?', [next_question_id]);
    
    res.json({
      success: true,
      data: {
        current_index: new_index,
        current_question: questions[0],
        progress: ((new_index + 1) / question_ids.length * 100).toFixed(1)
      }
    });
  } catch (error) {
    console.error('下一题错误:', error);
    res.status(500).json({ success: false, error: '获取下一题失败' });
  }
});

// 获取会话统计
router.get('/:session_id/stats', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    // 获取答题记录
    const answers = await query(
      'SELECT * FROM user_answers WHERE session_id = ? ORDER BY created_at',
      [session_id]
    );
    
    const total_answered = answers.length;
    const correct_count = answers.filter(a => a.is_correct).length;
    const accuracy = total_answered > 0 ? (correct_count / total_answered * 100).toFixed(1) : 0;
    
    // 按知识点统计
    const knowledge_stats = {};
    for (const answer of answers) {
      const questions = await query(
        'SELECT knowledge_points FROM questions WHERE id = ?',
        [answer.question_id]
      );
      
      if (questions.length > 0) {
        const kps = JSON.parse(questions[0].knowledge_points);
        kps.forEach(kp => {
          if (!knowledge_stats[kp]) {
            knowledge_stats[kp] = { total: 0, correct: 0 };
          }
          knowledge_stats[kp].total++;
          if (answer.is_correct) {
            knowledge_stats[kp].correct++;
          }
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        total_answered,
        correct_count,
        accuracy: parseFloat(accuracy),
        knowledge_stats
      }
    });
  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({ success: false, error: '获取统计失败' });
  }
});

module.exports = router;