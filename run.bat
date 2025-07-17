@echo off
echo 启动智能数学刷题平台...

REM 检查node是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 正在安装依赖...
    call install.bat
)

if not exist "frontend\node_modules" (
    echo 正在安装前端依赖...
    cd frontend
    npm install --legacy-peer-deps
    cd ..
)

if not exist "backend\node_modules" (
    echo 正在安装后端依赖...
    cd backend
    npm install
    cd ..
)

REM 启动开发服务器
echo 启动开发服务器...
npm run dev

pause