# 守望先锋地图识别游戏 - 项目上下文文档

## 项目概述

这是一个基于Vue 3 + TypeScript + uni-app的守望先锋地图识别游戏，玩家需要根据地图截图识别正确的地图名称。

### 技术栈
- **前端框架**: Vue 3 + TypeScript
- **跨平台**: uni-app
- **UI组件**: VueBits组件库 (卡片效果)
- **样式**: SCSS + 守望先锋UI风格
- **音频**: Web Audio API
- **构建工具**: Vite

## 项目结构

```
├── src/
│   ├── assets/           # 静态资源
│   │   ├── data/         # 地图数据JSON
│   │   ├── images/       # 图片资源
│   │   └── sounds/       # 音频文件
│   ├── components/       # Vue组件
│   ├── composables/      # Vue组合式API
│   ├── services/         # 业务服务
│   ├── types/           # TypeScript类型定义
│   └── styles/          # 样式文件
├── static/              # 静态地图截图
├── pages/               # uni-app页面
└── tools/               # 开发工具脚本
```

## 核心功能

### 1. 游戏模式
- **练习模式** (10题): 显示完整地图名称，适合新手
- **挑战模式** (20题): 智能文本模糊，需达到70%正确率通关
- **无尽模式**: 无限题目，追求连续答对记录

### 2. 智能文本模糊系统
**实现位置**: `App.vue` 中的 `getDisplayText()` 方法

```javascript
// 根据文字长度智能模糊
const getDisplayText = (text: string, gameMode: GameMode) => {
  // 只在挑战模式启用
  if (gameMode !== 'challenge') return { text, hasBlur: false }
  
  // 智能模糊策略
  const length = text.length
  let hideCount = 1
  if (length >= 6) hideCount = Math.floor(length / 2) - 1
  else if (length >= 4) hideCount = 2
  
  // 保留首尾，中间模糊
  const start = Math.floor((length - hideCount) / 2)
  const end = start + hideCount
  
  return {
    beforeText: text.substring(0, start),
    blurText: text.substring(start, end),
    afterText: text.substring(end),
    hasBlur: true
  }
}
```

**模糊策略**:
- 2-3个字: 模糊中间1个字
- 4-5个字: 模糊中间2个字  
- 6个字以上: 模糊中间一半字符
- 使用CSS `filter: blur(4px)` 实现真实模糊效果

### 3. 音频系统
**实现位置**: `src/services/AudioService.ts`

**功能**:
- 背景音乐: `bgm.mp3` (首页和模式选择页面)
- 按钮音效: `confirm.wav` (所有按钮点击)
- 音量控制: 独立的背景音乐和音效音量
- 本地存储: 自动保存音量设置
- 防抖机制: 300ms防止重复触发

### 4. UI设计风格
**主题**: 守望先锋绿色主题 (`#B5FA23`)

**特色**:
- 方形无圆角设计
- 多层阴影系统
- 发光边框效果
- 倾斜文字效果 (`transform: skew(-8deg)`)
- 电光边框动画 (ElectricBorder组件)

### 5. 游戏状态管理
**实现位置**: `src/composables/useGameState.ts`

**状态**:
```typescript
enum GameMode {
  ENDLESS = 'endless',
  CHALLENGE = 'challenge', 
  PRACTICE = 'practice'
}

interface GameState {
  status: 'idle' | 'mode_select' | 'playing' | 'finished' | 'error'
  mode: GameMode
  currentQuestion: Question | null
  nextQuestion: Question | null
  totalAnswered: number
  correctCount: number
  accuracy: number
  // ... 其他状态
}
```

## 开发历程记录

### 已完成功能

#### 1. 音频控制面板 (查询72-80)
- 创建 `AudioControlPanel.vue` 组件
- 实现背景音乐和音效独立控制
- 紧凑单行布局，符合守望先锋UI风格
- 修复定位问题，使用内联样式确保正确显示

#### 2. 音频系统重构 (查询81-82)
- 简化音效系统，只保留2个音效文件
- 移除不必要的音效类型和调试日志
- 添加300ms防抖机制
- 实现本地存储功能

#### 3. 背景音乐优化 (查询83)
- 修复页面切换时音乐中断问题
- 优化 `playMusic` 方法，避免重复播放
- 实现无缝背景音乐播放

#### 4. 首页布局调整 (查询84-86)
- 将"地图识别挑战"文字移到logo下方
- 修改HTML结构为垂直布局
- 优化间距设置

#### 5. 模式选择标题颜色 (查询87)
- 将标题颜色改为绿色主题 (`#B5FA23`)
- 统一UI风格配色

#### 6. 计分板重新设计 (查询88-89)
- 采用绿色主题和方形设计
- 水平布局图标+数据组合
- 绿色渐变分隔线和发光进度条
- 修复答题逻辑问题

#### 7. 卡片切换动画修复 (查询90-95)
- 修复答题后卡片切换动画
- 使用Vue响应式系统自动处理UI更新
- 保留答案反馈覆盖层

#### 8. 计分板图标替换 (查询96-97)
- 替换emoji为自定义图片
- 图片位于 `src/assets/images/defenban/`
- 设置30px×30px尺寸

#### 9. ElectricBorder闪电效果 (查询98-99)
- 集成ElectricBorder组件到进度条
- 实现动态闪电边框效果
- 调整层级和混合模式

#### 10. UI细节优化 (查询100-101)
- 调整计分板边距对齐
- 移除音量按钮hover缩放效果

#### 11. Git仓库管理 (查询102-105)
- 创建GitHub仓库
- 更新 `.gitignore` 排除大文件
- 完成Git初始化和推送

#### 12. 守望先锋UI风格升级 (查询106-111)
- 基于ow-ui-reference设计规范
- 实现经典边框样式和多层阴影
- 统一绿色主题配色

#### 13. 答题卡字体优化 (查询112-118)
- 使用 `!important` 强制覆盖样式
- 字体大小: `clamp(14.5px, 3vw, 18px)`
- 解决六个字换行问题

#### 14. 智能文本模糊功能 (查询119-123)
- 实现挑战模式文本模糊
- 根据文字长度智能调整模糊字符数
- 使用CSS模糊效果替代字符替换
- 简化实现逻辑，提高性能

## 重要文件说明

### 核心文件
- `App.vue`: 主应用组件，包含所有游戏逻辑
- `src/composables/useGameState.ts`: 游戏状态管理
- `src/services/AudioService.ts`: 音频服务
- `src/assets/data/maps.json`: 地图数据配置

### 组件文件
- `src/components/AudioControlPanel.vue`: 音频控制面板
- `src/component/ElectricBorder/ElectricBorder.vue`: 闪电边框效果
- `src/component/VueBitsProfileCard/`: VueBits卡片组件

### 资源文件
- `src/assets/sounds/bgm.mp3`: 背景音乐
- `src/assets/sounds/confirm.wav`: 按钮音效
- `src/assets/images/defenban/`: 计分板图标
- `static/maps/`: 地图截图文件夹

## 开发规范

### 代码风格
- 使用TypeScript进行类型安全
- 遵循ESLint配置规范
- 组件命名: PascalCase
- 文件命名: kebab-case
- 默认对话语言: 中文

### UI设计原则
- 守望先锋绿色主题 (`#B5FA23`)
- 方形无圆角设计
- 多层阴影和发光效果
- 响应式设计，适配各种屏幕

### 性能优化
- 使用计算属性缓存复杂计算
- 音频防抖机制避免重复触发
- 图片预加载提升用户体验
- CSS动画优化，支持减少动画偏好

## 待优化项目

### 功能增强
1. 添加更多地图数据
2. 实现用户统计和排行榜
3. 添加更多游戏模式
4. 支持自定义难度设置

### 技术优化
1. 代码分割和懒加载
2. 图片压缩和优化
3. PWA支持
4. 多语言国际化

### UI/UX改进
1. 更丰富的动画效果
2. 触觉反馈支持
3. 无障碍访问优化
4. 深色模式支持

## 部署说明

### 开发环境
```bash
npm install
npm run dev
```

### 生产构建
```bash
npm run build
```

### 依赖管理
- 主要依赖已在 `package.json` 中定义
- VueBits组件库用于卡片效果
- 音频文件需要HTTPS环境才能正常播放

## 故障排除

### 常见问题
1. **音频不播放**: 检查浏览器自动播放策略
2. **样式不生效**: 确认CSS优先级，使用 `!important`
3. **图片加载失败**: 检查路径和文件权限
4. **模糊效果不显示**: 确认浏览器支持CSS `filter` 属性

### 调试技巧
1. 使用浏览器开发者工具检查控制台错误
2. 检查网络请求状态
3. 验证Vue组件状态和props传递
4. 使用Vue DevTools调试组件状态

---

**最后更新**: 2024年12月
**项目状态**: 核心功能完成，可继续开发扩展功能