-- 高中数学自动刷题平台数据库结构

-- 题目表
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,                    -- 题目内容（含MathJax公式）
  source VARCHAR(50),                       -- 来源（如"必修1-2.3"）
  difficulty ENUM('简单','中等','困难') NOT NULL,
  answer VARCHAR(255) NOT NULL,             -- 标准答案
  solution TEXT,                            -- 解析步骤
  knowledge_points JSON,                    -- 关联知识点["集合","函数"]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ai_signature VARCHAR(100),                -- 生成模型签名（如DeepSeek-R1+Gemini）
  INDEX idx_difficulty (difficulty),
  INDEX idx_source (source),
  INDEX idx_created_at (created_at)
);

-- 用户会话表
CREATE TABLE IF NOT EXISTS sessions (
  session_id CHAR(36) PRIMARY KEY,
  user_id INT,
  questions JSON,                           -- 题目ID序列[1024,2048,...]
  current_index INT DEFAULT 0,
  score INT DEFAULT 0,                      -- 当前得分
  total_questions INT DEFAULT 0,            -- 总题目数
  correct_answers INT DEFAULT 0,            -- 正确答案数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- 用户答题记录表
CREATE TABLE IF NOT EXISTS user_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id CHAR(36),
  question_id INT,
  user_answer VARCHAR(255),
  is_correct BOOLEAN DEFAULT FALSE,
  time_spent INT DEFAULT 0,                 -- 答题用时(秒)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  INDEX idx_session_id (session_id),
  INDEX idx_question_id (question_id)
);

-- 知识点掌握度表
CREATE TABLE IF NOT EXISTS knowledge_mastery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  knowledge_point VARCHAR(100),
  mastery_level DECIMAL(3,2) DEFAULT 0.00,  -- 掌握度 0.00-1.00
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  last_practiced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_knowledge (user_id, knowledge_point),
  INDEX idx_user_id (user_id),
  INDEX idx_knowledge_point (knowledge_point)
);

-- 插入示例数据
INSERT INTO questions (content, source, difficulty, answer, solution, knowledge_points, ai_signature) VALUES
('已知集合$A = \\{x | x^2 - 3x + 2 = 0\\}$，求集合$A$的元素个数。', '必修1-1.1', '简单', '2', '解方程$x^2 - 3x + 2 = 0$，分解因式得$(x-1)(x-2) = 0$，所以$x = 1$或$x = 2$，因此集合$A = \\{1, 2\\}$，元素个数为2。', '["集合", "一元二次方程"]', 'DeepSeek-R1'),
('函数$f(x) = x^2 - 2x + 1$的最小值为？', '必修1-2.2', '中等', '0', '配方法：$f(x) = x^2 - 2x + 1 = (x-1)^2$，当$x = 1$时取得最小值0。', '["二次函数", "配方法"]', 'Qwen-Math'),
('在$\\triangle ABC$中，$a = 3$，$b = 4$，$C = 90°$，求$c$的值。', '必修1-3.1', '简单', '5', '由勾股定理：$c^2 = a^2 + b^2 = 3^2 + 4^2 = 9 + 16 = 25$，所以$c = 5$。', '["解三角形", "勾股定理"]', 'Gemini');