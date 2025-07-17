#!/bin/bash

echo "🚀 开始安装智能数学刷题平台依赖..."

# 设置npm镜像源
echo "📦 设置npm镜像源..."
npm config set registry https://registry.npmmirror.com

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install concurrently --save-dev

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install express@4.18.2 mysql2@3.6.0 cors@2.8.5 dotenv@16.3.1 jsonwebtoken@9.0.2 bcryptjs@2.4.3 axios@1.5.0 helmet@7.0.0 express-rate-limit@6.10.0 uuid@9.0.0 --save
npm install nodemon@3.0.1 --save-dev

# 安装前端依赖
echo "📦 安装前端依赖..."
cd ../frontend
npm install vue@3.3.4 vue-router@4.2.4 element-plus@2.3.8 axios@1.5.0 katex@0.16.8 --save --legacy-peer-deps
npm install "@element-plus/icons-vue@2.1.0" --save --legacy-peer-deps
npm install vite@4.4.9 "@vitejs/plugin-vue@4.3.1" --save-dev --legacy-peer-deps

echo "✅ 依赖安装完成！"
echo "🔧 运行 npm run dev 启动开发服务器"