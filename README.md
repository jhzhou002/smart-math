# 智能数学刷题平台

基于AI的高中数学个性化练习系统，支持多模型题目生成、智能评估和学习进度跟踪。

## 🎯 项目特色

- **AI驱动题目生成**：集成DeepSeek、通义千问、Kimi、Gemini等多个AI模型
- **智能难度匹配**：根据学习情况自动调整题目难度
- **知识点精准定位**：覆盖高中数学完整知识体系
- **实时学习反馈**：提供详细解析和学习建议
- **现代化界面**：响应式设计，支持LaTeX数学公式渲染

## 🏗️ 技术架构

### 前端
- **Vue 3** + **Vite** + **Element Plus**
- **KaTeX** 数学公式渲染
- **Axios** HTTP客户端
- **Vue Router** 路由管理

### 后端
- **Node.js** + **Express**
- **MySQL** 数据库
- **JWT** 身份验证
- **Helmet** 安全防护
- **Rate Limiting** 请求限制

### AI集成
- **DeepSeek R1** - 通用数学推理
- **通义千问-Math** - 函数与代数
- **Kimi** - 概率统计
- **Gemini** - 几何问题

## 📋 系统要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- 内存 >= 2GB

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd smart-math
```

### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install
```

### 3. 环境配置
```bash
# 复制环境变量文件
cp backend/.env.example backend/.env

# 根据实际情况修改配置
vim backend/.env
```

### 4. 数据库初始化
```bash
# 连接MySQL并创建数据库
mysql -u root -p
CREATE DATABASE smart_math DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入数据结构
mysql -u root -p smart_math < database/schema.sql
```

### 5. 启动服务

#### 开发模式
```bash
# 同时启动前后端服务
npm run dev

# 或分别启动
npm run dev:backend  # 后端: http://localhost:3000
npm run dev:frontend # 前端: http://localhost:5173
```

#### 生产模式
```bash
# 构建前端
npm run build

# 启动后端服务
npm start
```

## 📊 数据库结构

### 主要表结构
- `questions` - 题目表
- `sessions` - 练习会话表
- `user_answers` - 用户答题记录
- `knowledge_mastery` - 知识点掌握度

### 示例数据
系统预置了高中数学各个知识点的示例题目，包括：
- 集合与逻辑
- 函数与方程
- 三角函数
- 数列与导数
- 立体几何
- 解析几何
- 概率统计

## 🔧 API接口

### 题目相关
- `GET /api/questions` - 获取题目列表
- `GET /api/questions/:id` - 获取单个题目
- `GET /api/questions/random/:count` - 获取随机题目
- `POST /api/questions/:id/verify` - 验证答案

### 会话相关
- `POST /api/sessions` - 创建练习会话
- `GET /api/sessions/:id` - 获取会话信息
- `POST /api/sessions/:id/next` - 获取下一题
- `GET /api/sessions/:id/stats` - 获取会话统计

### AI相关
- `POST /api/ai/generate` - 生成题目
- `GET /api/ai/knowledge-points` - 获取知识点列表

## 🎨 界面预览

### 主页
- 平台介绍和统计展示
- 知识点分类浏览
- 快速开始入口

### 练习页面
- 题目展示与数学公式渲染
- 实时答题反馈
- 进度跟踪和统计

### 知识点管理
- 分级知识点体系
- AI题目生成工具
- 生成结果预览

### 学习统计
- 个人学习数据分析
- 知识点掌握度可视化
- 个性化学习建议

## 🛡️ 安全措施

### 输入验证
- 数学符号白名单校验
- SQL参数化查询
- XSS防护

### API保护
- Rate Limiting 请求限制
- CORS 跨域配置
- Helmet 安全头部

### 数据保护
- 敏感配置环境变量存储
- API密钥安全管理
- 数据库连接池

## 📈 性能优化

### 前端优化
- 代码分割和懒加载
- 组件按需导入
- 静态资源压缩

### 后端优化
- 数据库索引优化
- 连接池配置
- 请求缓存策略

### AI调用优化
- 模型负载均衡
- 结果缓存机制
- 异步处理队列

## 🔄 开发规范

### Git工作流
```bash
# 功能开发
git checkout -b feature/new-feature
git commit -m "feat: 添加新功能"
git push origin feature/new-feature

# 创建Pull Request
```

### 代码规范
- ESLint + Prettier 代码格式化
- 组件化开发
- TypeScript 类型安全（可选）

### 测试
```bash
# 单元测试
npm test

# 集成测试
npm run test:integration

# 端到端测试
npm run test:e2e
```

## 📝 部署指南

### Docker部署
```bash
# 构建镜像
docker build -t smart-math .

# 运行容器
docker run -p 3000:3000 smart-math
```

### 传统部署
```bash
# 服务器环境准备
# 安装Node.js、MySQL、Nginx

# 应用部署
git clone <repo>
npm install
npm run build
pm2 start ecosystem.config.js
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 邮箱：support@smartmath.com
- 文档：[开发文档](./高中数学自动刷题平台开发文档.md)
- 反馈：[Issues](https://github.com/your-repo/issues)

---

© 2024 智能数学刷题平台 - 让数学学习更智能