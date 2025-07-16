<template>
  <div id="app">
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <el-icon class="logo-icon"><Edit /></el-icon>
            <span class="logo-text">智能数学刷题平台</span>
          </div>
          <el-menu
            :default-active="$route.path"
            class="nav-menu"
            mode="horizontal"
            router
          >
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              首页
            </el-menu-item>
            <el-menu-item index="/practice">
              <el-icon><EditPen /></el-icon>
              开始练习
            </el-menu-item>
            <el-menu-item index="/knowledge">
              <el-icon><Reading /></el-icon>
              知识点
            </el-menu-item>
            <el-menu-item index="/stats">
              <el-icon><DataAnalysis /></el-icon>
              统计分析
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <!-- 主体内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>

      <!-- 底部 -->
      <el-footer class="footer">
        <div class="footer-content">
          <p>&copy; 2024 智能数学刷题平台 - 让数学学习更智能</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.logo-icon {
  margin-right: 8px;
  font-size: 24px;
}

.logo-text {
  margin-left: 8px;
}

.nav-menu {
  background: transparent;
  border: none;
}

.nav-menu .el-menu-item {
  color: rgba(255,255,255,0.8);
  border-bottom: 2px solid transparent;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-menu-item.is-active {
  color: white;
  border-bottom-color: white;
  background: rgba(255,255,255,0.1);
}

.main-content {
  min-height: calc(100vh - 120px);
  padding: 20px;
  background: #f5f7fa;
}

.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 20px 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer p {
  margin: 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  
  .logo {
    margin-bottom: 10px;
  }
  
  .nav-menu {
    width: 100%;
    justify-content: center;
  }
  
  .main-content {
    padding: 10px;
  }
}
</style>