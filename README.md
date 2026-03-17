# 守望先锋地图识别小游戏

一个基于 uni-app + Vue 3 + TypeScript 的地图识别小游戏，支持微信小程序、H5 和 App 多端运行。

## 功能特色

- 🎮 **NFT风格卡片设计** - 毛玻璃态效果、渐变边框、3D动画
- 📱 **流畅滑卡交互** - Tinder风格左右滑动，精细动画反馈  
- 🎯 **智能题库系统** - 随机出题、答案选项随机化
- 📊 **详细统计分析** - 总体正确率、单地图准确率、历史记录
- 💾 **数据持久化** - 本地存储游戏数据和统计信息
- 🚀 **性能优化** - 图片预加载、缓存策略、懒加载
- 📱 **响应式设计** - 适配各种屏幕尺寸和设备

## 技术栈

- **框架**: uni-app + Vue 3 + TypeScript
- **状态管理**: Pinia
- **样式**: SCSS + 原生CSS动画
- **测试**: Vitest + fast-check (属性测试)
- **构建**: Vite
- **平台**: 微信小程序、H5、App

## 项目结构

```
├── src/
│   ├── components/          # Vue组件
│   ├── composables/         # 组合式函数
│   ├── services/           # 业务服务类
│   ├── stores/             # Pinia状态管理
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   ├── assets/             # 静态资源
│   └── test/               # 测试配置
├── pages/                  # 页面文件
├── static/                 # 静态资源
└── 地图视频/               # 地图截图资源
```

## 开发指南

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
# H5端
npm run dev:h5

# 微信小程序端
npm run dev:mp-weixin

# App端
npm run dev:app-plus
```

### 构建打包

```bash
# H5端
npm run build:h5

# 微信小程序端
npm run build:mp-weixin

# App端
npm run build:app-plus
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 测试UI界面
npm run test:ui
```

## 游戏玩法

1. **开始游戏** - 点击开始按钮进入游戏
2. **识别地图** - 查看地图截图，从选项中选择正确的地图名称
3. **滑动操作** - 左滑表示选择错误答案，右滑表示选择正确答案
4. **查看统计** - 游戏结束后查看详细的统计数据和历史记录

## 开发进度

- [x] 项目初始化和基础设置
- [ ] 核心类型和数据结构定义
- [ ] 题库管理服务实现
- [ ] 数据持久化服务实现
- [ ] 图片缓存服务实现
- [ ] 滑动手势Hook实现
- [ ] 游戏状态管理Hook实现
- [ ] 核心组件开发
- [ ] UI样式和动画优化
- [ ] 性能优化和PWA支持
- [ ] 测试和部署

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 致谢

- 守望先锋游戏素材来源于暴雪娱乐
- 感谢 uni-app 团队提供的优秀跨端框架
- 感谢所有贡献者的支持