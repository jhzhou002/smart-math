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
-- 简单题目
('已知集合$A = \\{x | x^2 - 3x + 2 = 0\\}$，求集合$A$的元素个数。', '必修1-1.1', '简单', '2', '解方程$x^2 - 3x + 2 = 0$，分解因式得$(x-1)(x-2) = 0$，所以$x = 1$或$x = 2$，因此集合$A = \\{1, 2\\}$，元素个数为2。', '["集合", "一元二次方程"]', 'DeepSeek-R1'),
('在$\\triangle ABC$中，$a = 3$，$b = 4$，$C = 90°$，求$c$的值。', '必修1-3.1', '简单', '5', '由勾股定理：$c^2 = a^2 + b^2 = 3^2 + 4^2 = 9 + 16 = 25$，所以$c = 5$。', '["解三角形", "勾股定理"]', 'Gemini'),
('计算$\\log_2 8$的值。', '必修1-2.3', '简单', '3', '因为$2^3 = 8$，所以$\\log_2 8 = 3$。', '["对数函数"]', 'DeepSeek-R1'),
('求$\\sin 30°$的值。', '必修1-3.2', '简单', '0.5', '根据特殊角三角函数值，$\\sin 30° = \\frac{1}{2} = 0.5$。', '["三角函数"]', 'Gemini'),
('解不等式$x + 3 > 5$。', '必修1-1.3', '简单', 'x > 2', '移项得$x > 5 - 3$，即$x > 2$。', '["不等式"]', 'DeepSeek-R1'),

-- 中等题目  
('函数$f(x) = x^2 - 2x + 1$的最小值为？', '必修1-2.2', '中等', '0', '配方法：$f(x) = x^2 - 2x + 1 = (x-1)^2$，当$x = 1$时取得最小值0。', '["二次函数", "配方法"]', 'Qwen-Math'),
('已知数列$\\{a_n\\}$的首项$a_1 = 1$，且$a_{n+1} = 2a_n + 1$，求$a_3$。', '必修2-1.1', '中等', '7', '$a_2 = 2a_1 + 1 = 2 \\times 1 + 1 = 3$，$a_3 = 2a_2 + 1 = 2 \\times 3 + 1 = 7$。', '["数列"]', 'Qwen-Math'),
('求函数$f(x) = x^3 - 3x + 2$在$x = 1$处的导数。', '必修2-2.1', '中等', '0', '$f\'(x) = 3x^2 - 3$，所以$f\'(1) = 3 \\times 1^2 - 3 = 0$。', '["导数"]', 'Qwen-Math'),
('在平面直角坐标系中，求直线$2x + 3y - 6 = 0$的斜率。', '必修2-3.1', '中等', '-2/3', '将直线方程化为斜截式：$y = -\\frac{2}{3}x + 2$，斜率为$-\\frac{2}{3}$。', '["直线方程"]', 'Gemini'),
('一个袋子里有3个红球和2个蓝球，随机取出2个球，求取出的2个球颜色相同的概率。', '必修2-4.1', '中等', '0.4', '总的取法：$C_5^2 = 10$种。颜色相同的取法：$C_3^2 + C_2^2 = 3 + 1 = 4$种。概率为$\\frac{4}{10} = 0.4$。', '["概率"]', 'Kimi'),

-- 困难题目
('已知函数$f(x) = ax^3 + bx^2 + cx + d$在$x = -1$和$x = 1$处都取得极值，且$f(0) = 1$，$f(1) = 0$，求$a$的值。', '选修-1.1', '困难', '1', '由题意$f\'(-1) = f\'(1) = 0$且$f(0) = 1$，$f(1) = 0$。$f\'(x) = 3ax^2 + 2bx + c$，解方程组可得$a = 1$。', '["导数", "函数极值"]', 'DeepSeek-R1'),
('椭圆$\\frac{x^2}{9} + \\frac{y^2}{4} = 1$上一点$P$到两焦点的距离之和为多少？', '选修-2.1', '困难', '6', '椭圆的标准方程中$a^2 = 9$，所以$a = 3$。根据椭圆定义，椭圆上任一点到两焦点距离之和等于$2a = 6$。', '["椭圆", "圆锥曲线"]', 'Gemini'),
('设复数$z = 1 + i$，求$z^4$的值。', '选修-3.1', '困难', '-4', '$z^2 = (1+i)^2 = 1 + 2i - 1 = 2i$，$z^4 = (z^2)^2 = (2i)^2 = 4i^2 = -4$。', '["复数"]', 'DeepSeek-R1'),
('求$\\lim_{x \\to 0} \\frac{\\sin x}{x}$的值。', '选修-4.1', '困难', '1', '这是重要极限，$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$。', '["极限"]', 'Qwen-Math'),
('用数学归纳法证明：对于任意正整数$n$，都有$1 + 2 + 3 + ... + n = \\frac{n(n+1)}{2}$。', '选修-5.1', '困难', '证明略', '基础步骤：$n=1$时等式成立。归纳步骤：假设$n=k$时成立，证明$n=k+1$时也成立。', '["数学归纳法"]', 'DeepSeek-R1');