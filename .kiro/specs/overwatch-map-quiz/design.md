# 设计文档

## 概述

守望先锋地图识别小游戏是一款基于 uni-app 框架的跨平台移动端应用，主要面向微信小程序平台。应用采用 NFT 数字藏品风格的高级卡片设计，结合 Tinder 风格的滑卡交互，为玩家提供沉浸式的地图识别答题体验。

核心特色：
- **NFT 风格卡片**：采用毛玻璃态（Glassmorphism）、渐变边框、3D 效果的高级视觉设计
- **流畅滑卡交互**：Tinder 风格的左右滑动，配合精细的动画反馈
- **跨平台兼容**：基于 uni-app，可同时发布到微信小程序、H5、App
- **高性能优化**：图片预加载、缓存策略、60fps 流畅动画

技术选型理由：
- **uni-app + Vue 3**：跨平台开发，代码复用率高，微信小程序原生性能
- **TypeScript**：类型安全，更好的开发体验和代码维护性
- **CSS3 高级特效**：backdrop-filter、transform3d、渐变动画实现 NFT 卡片效果
- **小程序存储 API**：本地数据持久化，支持离线游戏
- **云开发（可选）**：图片 CDN、数据库、云函数支持

## 架构

### 整体架构

应用采用分层架构设计，基于 uni-app + Vue 3 技术栈：

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│   (Vue 3 Components + CSS3 动画)    │
├─────────────────────────────────────┤
│      Business Logic Layer           │
│  (Pinia Store + Composables)        │
├─────────────────────────────────────┤
│      Data Access Layer              │
│  (Question Pool + Storage Service)  │
├─────────────────────────────────────┤
│      Data Layer                     │
│  (uni.storage + 图片缓存)           │
└─────────────────────────────────────┘
```

### 技术栈

- **前端框架**: uni-app + Vue 3 + TypeScript
- **状态管理**: Pinia (Vue 3 官方推荐)
- **样式方案**: SCSS + CSS3 高级特效
- **动画库**: CSS3 Transitions + Transform + uni-app 动画 API
- **构建工具**: HBuilderX 或 Vite (uni-app 官方支持)
- **图片优化**: WebP 格式 + 响应式图片 + 懒加载
- **本地存储**: uni.storage (统计数据) + 图片缓存策略
- **部署平台**: 微信小程序 (主要) + H5 + App (可选)

### 目录结构

```
src/
├── pages/              # 页面文件
│   ├── index/         # 首页
│   ├── game/          # 游戏页面
│   └── stats/         # 统计页面
├── components/         # Vue 组件
│   ├── QuizCard/      # NFT 风格题目卡片
│   ├── SwipeGesture/  # 滑动手势组件
│   ├── ProgressBar/   # 进度条组件
│   └── UI/            # 通用 UI 组件
├── composables/        # Vue 3 Composables
│   ├── useSwipe.ts    # 滑动手势逻辑
│   ├── useGameState.ts # 游戏状态管理
│   └── useImageCache.ts # 图片缓存管理
├── stores/            # Pinia 状态管理
│   ├── game.ts        # 游戏状态 Store
│   └── user.ts        # 用户数据 Store
├── services/          # 业务逻辑服务
│   ├── QuestionPool.ts # 题库管理
│   ├── StorageService.ts # 数据持久化
│   └── ImageCache.ts  # 图片缓存
├── data/              # 静态数据
│   ├── maps.json      # 地图数据
│   └── questions.json # 题目数据
├── types/             # TypeScript 类型定义
│   └── index.ts
├── utils/             # 工具函数
│   └── helpers.ts
├── styles/            # 全局样式
│   ├── variables.scss # SCSS 变量
│   ├── mixins.scss    # SCSS 混入
│   └── nft-card.scss  # NFT 卡片样式
└── App.vue            # 应用入口
```

## NFT 风格卡片设计

### 视觉设计理念

参考 vue-bits profile card 和高端 NFT 数字藏品的视觉效果，卡片设计采用以下核心元素：

#### 1. 毛玻璃态效果 (Glassmorphism)
```scss
.nft-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

#### 2. 渐变边框和光泽效果
```scss
.nft-card::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 2px;
  background: linear-gradient(
    135deg,
    #ff6b35,
    #f7931e,
    #ffd700,
    #00d4ff,
    #9b59b6
  );
  border-radius: inherit;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}
```

#### 3. 全息彩虹效果
```scss
.nft-card-holographic {
  position: relative;
  overflow: hidden;
}

.nft-card-holographic::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  animation: holographic-shine 3s infinite;
}

@keyframes holographic-shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}
```

#### 4. 3D 变换和悬浮效果
```scss
.nft-card {
  transform-style: preserve-3d;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nft-card:hover {
  transform: 
    translateY(-10px) 
    rotateX(5deg) 
    rotateY(5deg) 
    scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 255, 255, 0.1);
}
```

### 卡片布局结构

```vue
<template>
  <div class="quiz-card-container">
    <!-- 背景装饰 -->
    <div class="card-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
    </div>
    
    <!-- 主卡片 -->
    <div class="nft-card quiz-card" :class="cardClasses">
      <!-- 卡片头部 -->
      <div class="card-header">
        <div class="card-title">守望先锋地图识别</div>
        <div class="card-number">#{{ questionNumber }}</div>
      </div>
      
      <!-- 地图截图区域 -->
      <div class="card-image-container">
        <image 
          :src="question.screenshotUrl" 
          class="map-screenshot"
          mode="aspectFill"
          @load="onImageLoad"
          @error="onImageError"
        />
        <div class="image-overlay"></div>
      </div>
      
      <!-- 答案选项区域 -->
      <div class="card-content">
        <div class="answer-label">这是哪张地图？</div>
        <div class="answer-option">{{ question.displayedAnswer }}</div>
      </div>
      
      <!-- 滑动提示 -->
      <div class="swipe-hints">
        <div class="hint-left">
          <icon type="close" color="#ff4757" />
          <text>错误</text>
        </div>
        <div class="hint-right">
          <icon type="success" color="#2ed573" />
          <text>正确</text>
        </div>
      </div>
      
      <!-- 全息光泽层 -->
      <div class="holographic-layer"></div>
    </div>
  </div>
</template>
```

### 滑动交互动画

#### 1. 拖拽跟随效果
```scss
.quiz-card.dragging {
  transform: 
    translateX(var(--drag-x)) 
    translateY(var(--drag-y))
    rotate(calc(var(--drag-x) * 0.1deg))
    scale(0.95);
  transition: none;
}
```

#### 2. 方向指示效果
```scss
.quiz-card.swipe-left {
  border-color: #ff4757;
  box-shadow: 0 0 30px rgba(255, 71, 87, 0.5);
}

.quiz-card.swipe-right {
  border-color: #2ed573;
  box-shadow: 0 0 30px rgba(46, 213, 115, 0.5);
}
```

#### 3. 卡片消失动画
```scss
@keyframes card-exit-left {
  to {
    transform: translateX(-120vw) rotate(-30deg);
    opacity: 0;
  }
}

@keyframes card-exit-right {
  to {
    transform: translateX(120vw) rotate(30deg);
    opacity: 0;
  }
}
```

### 性能优化策略

#### 1. GPU 加速
```scss
.nft-card {
  will-change: transform, opacity;
  transform: translateZ(0); /* 强制 GPU 加速 */
}
```

#### 2. 动画优化
- 使用 `transform` 和 `opacity` 进行动画（避免重排重绘）
- 合理使用 `will-change` 属性
- 动画结束后移除 `will-change`

#### 3. 图片优化
- WebP 格式优先，PNG 降级
- 响应式图片尺寸
- 懒加载和预加载策略

### 核心组件 (Vue 3 + TypeScript)

#### 1. App.vue - 应用根组件
应用的根组件，负责整体布局和路由管理。

```typescript
<script setup lang="ts">
interface AppState {
  currentPage: 'home' | 'game' | 'stats';
  isLoading: boolean;
}

// 主要职责：
// - 页面路由管理
// - 全局状态初始化
// - 错误边界处理
</script>
```

#### 2. QuizCard.vue - NFT 风格题目卡片
显示题目卡片，包含地图截图和答案选项。

```typescript
<script setup lang="ts">
interface QuizCardProps {
  question: Question;
  isActive: boolean;
  zIndex: number;
}

interface QuizCardEmits {
  (e: 'swipe', direction: SwipeDirection, isCorrect: boolean): void;
  (e: 'imageLoad'): void;
  (e: 'imageError'): void;
}

interface Question {
  id: string;
  mapName: string;
  screenshotUrl: string;
  displayedAnswer: string;
  isCorrectAnswer: boolean;
}

// 主要职责：
// - 渲染 NFT 风格卡片
// - 显示地图截图和答案选项
// - 集成滑动手势
// - 提供视觉反馈和动画
</script>
```

#### 3. SwipeGesture.vue - 滑动手势组件
处理卡片滑动交互的高阶组件。

```typescript
<script setup lang="ts">
interface SwipeGestureProps {
  threshold?: number; // 滑动阈值，默认100px
  disabled?: boolean;
}

interface SwipeGestureEmits {
  (e: 'swipeStart'): void;
  (e: 'swipeMove', offset: { x: number; y: number }): void;
  (e: 'swipeEnd', direction: SwipeDirection | null): void;
}

// 主要职责：
// - 监听触摸事件
// - 计算滑动距离和方向
// - 触发滑动动画
// - 判断是否达到确认阈值
</script>
```

#### 4. ProgressBar.vue - 进度条组件
显示答题进度和统计信息。

```typescript
<script setup lang="ts">
interface ProgressBarProps {
  totalAnswered: number;
  correctCount: number;
  incorrectCount: number;
  showDetails?: boolean;
}

// 主要职责：
// - 显示已回答题目数
// - 显示正确率
// - 提供视觉进度指示
// - 动画数字变化效果
</script>
```

#### 5. Statistics.vue - 统计信息组件
显示详细的统计数据和游戏结果。

```typescript
<script setup lang="ts">
interface StatisticsProps {
  statistics: Statistics;
}

interface StatisticsEmits {
  (e: 'restart'): void;
  (e: 'exit'): void;
}

interface Statistics {
  session: SessionStats;
  overall: OverallStats;
  mapAccuracy: Record<string, MapStatistics>;
}

// 主要职责：
// - 显示会话统计
// - 显示历史统计
// - 显示每个地图的准确率
// - 提供重新开始和退出选项
</script>
```

### Composables (Vue 3 组合式 API)

#### 1. useSwipe - 滑动手势逻辑
```typescript
interface UseSwipeOptions {
  threshold?: number;
  onSwipeStart?: () => void;
  onSwipeMove?: (offset: { x: number; y: number }) => void;
  onSwipeEnd?: (direction: SwipeDirection | null) => void;
}

interface UseSwipeReturn {
  // 触摸事件处理器
  touchStart: (e: TouchEvent) => void;
  touchMove: (e: TouchEvent) => void;
  touchEnd: (e: TouchEvent) => void;
  
  // 滑动状态
  isDragging: Ref<boolean>;
  offset: Ref<{ x: number; y: number }>;
  direction: Ref<SwipeDirection | null>;
}

function useSwipe(options: UseSwipeOptions): UseSwipeReturn;
```

#### 2. useGameState - 游戏状态管理
```typescript
interface UseGameStateReturn {
  // 状态
  currentQuestion: Ref<Question | null>;
  nextQuestion: Ref<Question | null>;
  gameStatus: Ref<GameStatus>;
  statistics: Ref<Statistics>;
  
  // 方法
  startGame: () => Promise<void>;
  answerQuestion: (isCorrect: boolean) => Promise<void>;
  restartGame: () => Promise<void>;
  exitGame: () => void;
}

function useGameState(): UseGameStateReturn;
```

#### 3. useImageCache - 图片缓存管理
```typescript
interface UseImageCacheOptions {
  preloadCount?: number; // 预加载数量，默认5
  cacheSize?: number; // 缓存大小限制
}

interface UseImageCacheReturn {
  // 状态
  loadedImages: Ref<Set<string>>;
  isLoading: Ref<boolean>;
  cacheSize: Ref<number>;
  
  // 方法
  preloadImages: (urls: string[]) => Promise<void>;
  clearCache: () => Promise<void>;
  getCachedImage: (url: string) => Promise<string | null>;
}

function useImageCache(options?: UseImageCacheOptions): UseImageCacheReturn;
```

### 服务层接口

#### 1. QuestionPool Service
管理题库和题目生成。

```typescript
interface QuestionPoolConfig {
  maps: MapData[];
  randomSeed?: number;
}

interface MapData {
  id: string;
  name: string;
  nameEn: string;
  type: 'assault' | 'escort' | 'hybrid' | 'control' | 'push';
  screenshots: Screenshot[]; // 截图数组
}

interface Screenshot {
  id: string;
  url: string;
  description?: string;
}

class QuestionPool {
  constructor(config: QuestionPoolConfig);
  
  // 获取下一个随机题目
  getNextQuestion(): Question;
  
  // 获取多个题目（用于预加载）
  getQuestions(count: number): Question[];
  
  // 重置题库（避免短期内重复）
  reset(): void;
  
  // 获取所有地图名称
  getAllMapNames(): string[];
}
```

#### 2. StorageService (uni-app 适配)
处理数据持久化，使用 uni.storage API。

```typescript
interface StorageData {
  statistics: Statistics;
  history: GameSession[];
  settings: UserSettings;
}

interface GameSession {
  id: string;
  timestamp: number;
  totalAnswered: number;
  correctCount: number;
  accuracy: number;
}

interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'auto' | 'light' | 'dark';
}

class StorageService {
  // 保存统计数据 (使用 uni.setStorageSync)
  saveStatistics(statistics: Statistics): Promise<void>;
  
  // 加载统计数据 (使用 uni.getStorageSync)
  loadStatistics(): Promise<Statistics>;
  
  // 保存游戏会话
  saveSession(session: GameSession): Promise<void>;
  
  // 获取历史会话
  getHistory(limit?: number): Promise<GameSession[]>;
  
  // 清除所有数据 (使用 uni.clearStorageSync)
  clearAll(): Promise<void>;
  
  // 保存用户设置
  saveSettings(settings: UserSettings): Promise<void>;
  
  // 加载用户设置
  loadSettings(): Promise<UserSettings>;
}
```

#### 3. ImageCache Service (uni-app 适配)
管理图片缓存，使用小程序文件系统。

```typescript
interface ImageCacheOptions {
  maxCacheSize?: number; // 最大缓存大小（MB）
  cacheStrategy?: 'lru' | 'fifo'; // 缓存策略
}

class ImageCache {
  constructor(options?: ImageCacheOptions);
  
  // 预加载图片 (使用 uni.downloadFile)
  preload(urls: string[]): Promise<void>;
  
  // 获取缓存的图片路径
  get(url: string): Promise<string | null>;
  
  // 清除缓存 (使用 uni.removeSavedFile)
  clear(): Promise<void>;
  
  // 获取缓存大小 (使用 uni.getSavedFileList)
  getCacheSize(): Promise<number>;
}
```

### Pinia Store 状态管理

#### 1. Game Store
```typescript
interface GameState {
  status: GameStatus;
  currentQuestion: Question | null;
  nextQuestion: Question | null;
  questionQueue: Question[];
  statistics: Statistics;
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    status: 'idle',
    currentQuestion: null,
    nextQuestion: null,
    questionQueue: [],
    statistics: createDefaultStatistics()
  }),
  
  actions: {
    async startGame() { /* ... */ },
    async answerQuestion(isCorrect: boolean) { /* ... */ },
    async restartGame() { /* ... */ },
    exitGame() { /* ... */ }
  },
  
  getters: {
    accuracy: (state) => {
      const { correctCount, totalAnswered } = state.statistics.session;
      return totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
    }
  }
});
```

#### 2. User Store
```typescript
interface UserState {
  settings: UserSettings;
  history: GameSession[];
  preferences: {
    cardStyle: 'nft' | 'classic';
    animationSpeed: 'slow' | 'normal' | 'fast';
  };
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    settings: createDefaultSettings(),
    history: [],
    preferences: {
      cardStyle: 'nft',
      animationSpeed: 'normal'
    }
  }),
  
  actions: {
    async loadUserData() { /* ... */ },
    async saveUserData() { /* ... */ },
    updateSettings(settings: Partial<UserSettings>) { /* ... */ }
  }
});
```

## 微信小程序适配

### 平台特性支持

#### 1. 小程序生命周期
```typescript
// App.vue
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('App Launch');
  // 初始化应用数据
  initializeApp();
});

onShow(() => {
  console.log('App Show');
  // 恢复游戏状态
  resumeGame();
});

onHide(() => {
  console.log('App Hide');
  // 保存游戏状态
  saveGameState();
});
</script>
```

#### 2. 页面配置
```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "守望先锋地图识别",
        "navigationBarBackgroundColor": "#1a1a2e",
        "navigationBarTextStyle": "white",
        "backgroundColor": "#0f0f23"
      }
    }
  ],
  "globalStyle": {
    "navigationStyle": "default",
    "backgroundColor": "#0f0f23"
  }
}
```

#### 3. 权限配置
```json
// manifest.json
{
  "mp-weixin": {
    "appid": "",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "minified": true
    },
    "permission": {
      "scope.writePhotosAlbum": {
        "desc": "保存游戏截图到相册"
      }
    }
  }
}
```

### 性能优化策略

#### 1. 分包加载
```json
// pages.json
{
  "subPackages": [
    {
      "root": "pages/game",
      "pages": [
        "index"
      ]
    },
    {
      "root": "pages/stats", 
      "pages": [
        "index"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages/game"]
    }
  }
}
```

#### 2. 图片优化
```typescript
// 图片懒加载和预加载
const useImageOptimization = () => {
  const preloadImages = async (urls: string[]) => {
    const tasks = urls.map(url => {
      return new Promise((resolve, reject) => {
        uni.downloadFile({
          url,
          success: (res) => {
            if (res.statusCode === 200) {
              // 保存到本地
              uni.saveFile({
                tempFilePath: res.tempFilePath,
                success: resolve,
                fail: reject
              });
            }
          },
          fail: reject
        });
      });
    });
    
    await Promise.allSettled(tasks);
  };
  
  return { preloadImages };
};
```

#### 3. 内存管理
```typescript
// 内存监控和清理
const useMemoryManagement = () => {
  const checkMemory = () => {
    const performance = uni.getPerformance();
    if (performance.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
      // 清理缓存
      clearImageCache();
      // 强制垃圾回收
      if (typeof wx !== 'undefined' && wx.triggerGC) {
        wx.triggerGC();
      }
    }
  };
  
  return { checkMemory };
};
```

### 小程序 API 集成

#### 1. 分享功能
```typescript
// 分享到微信
const shareGame = () => {
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    href: 'https://your-game-url.com',
    title: '我在守望先锋地图识别中答对了 X 题！',
    summary: '快来挑战你的地图知识吧！',
    imageUrl: '/static/share-image.jpg'
  });
};
```

#### 2. 振动反馈
```typescript
// 触觉反馈
const useHapticFeedback = () => {
  const lightImpact = () => {
    uni.vibrateShort({ type: 'light' });
  };
  
  const mediumImpact = () => {
    uni.vibrateShort({ type: 'medium' });
  };
  
  const heavyImpact = () => {
    uni.vibrateShort({ type: 'heavy' });
  };
  
  return { lightImpact, mediumImpact, heavyImpact };
};
```

#### 3. 音效支持
```typescript
// 音效管理
const useAudioManager = () => {
  const audioContext = uni.createInnerAudioContext();
  
  const playSound = (soundType: 'correct' | 'incorrect' | 'swipe') => {
    audioContext.src = `/static/sounds/${soundType}.mp3`;
    audioContext.play();
  };
  
  const setVolume = (volume: number) => {
    audioContext.volume = volume;
  };
  
  return { playSound, setVolume };
};
```

### Question (题目)
```typescript
interface Question {
  id: string;                    // 唯一标识符
  mapName: string;               // 正确的地图名称
  screenshotUrl: string;         // 地图截图URL
  displayedAnswer: string;       // 显示的答案选项
  isCorrectAnswer: boolean;      // 显示的答案是否正确
}
```

### Statistics (统计数据)
```typescript
interface Statistics {
  // 当前会话统计
  session: {
    totalAnswered: number;       // 已回答题目数
    correctCount: number;        // 正确数量
    incorrectCount: number;      // 错误数量
    accuracy: number;            // 正确率 (0-100)
    startTime: number;           // 会话开始时间
  };
  
  // 历史总计统计
  overall: {
    totalAnswered: number;       // 总回答题目数
    correctCount: number;        // 总正确数量
    accuracy: number;            // 总体正确率
  };
  
  // 每个地图的统计
  mapAccuracy: Record<string, MapStatistics>;
}

interface MapStatistics {
  mapName: string;               // 地图名称
  totalQuestions: number;        // 该地图的总题目数
  correctAnswers: number;        // 正确回答数
  accuracy: number;              // 该地图的正确率
}
```

### GameState (游戏状态)
```typescript
type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

interface GameState {
  status: GameStatus;            // 游戏状态
  currentQuestion: Question | null; // 当前题目
  questionQueue: Question[];     // 题目队列（用于预加载）
  statistics: Statistics;        // 统计数据
}
```

### MapData (地图数据)
```typescript
interface MapData {
  id: string;                    // 地图唯一标识
  name: string;                  // 地图名称（中文）
  nameEn: string;                // 地图名称（英文）
  type: 'assault' | 'escort' | 'hybrid' | 'control' | 'push'; // 地图类型
  screenshots: Screenshot[];     // 截图数组
}

interface Screenshot {
  id: string;                    // 截图唯一标识
  url: string;                   // 图片URL
  description?: string;          // 截图描述（可选）
}
```

## 正确性属性

*属性是一种特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

在编写正确性属性之前，让我先分析需求中的验收标准，确定哪些可以转化为可测试的属性。


### 属性 1：地图截图数量范围
*对于任意*地图数据，该地图关联的截图数量应该在30到40张之间（包含边界）。
**验证需求：需求 1.2**

### 属性 2：截图数据完整性
*对于任意*题库中的截图，该截图必须有对应的正确地图名称，且地图名称不能为空字符串。
**验证需求：需求 1.3, 1.5**

### 属性 3：题目来源有效性
*对于任意*通过QuestionPool生成的题目，该题目的截图URL和地图名称必须存在于原始题库数据中。
**验证需求：需求 2.1**

### 属性 4：答案选项随机性
*对于任意*足够大的题目样本（如100个题目），正确答案和错误答案的分布应该相对均衡（各占40%-60%之间）。
**验证需求：需求 2.4**

### 属性 5：滑动方向识别
*对于任意*滑动手势，当滑动的水平距离为正值时应识别为右滑，当滑动的水平距离为负值时应识别为左滑。
**验证需求：需求 3.1, 3.2**

### 属性 6：滑动阈值判断
*对于任意*滑动距离，当绝对值超过设定阈值时应确认选择，当绝对值未超过阈值时应取消选择。
**验证需求：需求 3.4, 3.5**

### 属性 7：卡片移除后状态转换
*对于任意*游戏状态，当当前卡片被移除后，系统应该加载下一张题目卡片，且新卡片的ID与被移除卡片的ID不同。
**验证需求：需求 3.7**

### 属性 8：答案判定逻辑
*对于任意*题目和用户选择，当用户选择"正确"（右滑）且题目的isCorrectAnswer为true时判定为答对；当用户选择"正确"且isCorrectAnswer为false时判定为答错；当用户选择"错误"（左滑）且isCorrectAnswer为false时判定为答对；当用户选择"错误"且isCorrectAnswer为true时判定为答错。
**验证需求：需求 4.1**

### 属性 9：统计数据一致性
*对于任意*游戏会话，已回答题目数应该等于正确数加错误数，且正确率应该等于正确数除以已回答题目数（当已回答数大于0时）。
**验证需求：需求 5.1, 5.2, 5.3, 5.4**

### 属性 10：游戏重置完整性
*对于任意*游戏状态，执行重置操作后，所有统计计数器（已回答数、正确数、错误数）应该归零，游戏状态应该回到初始状态。
**验证需求：需求 6.3**

### 属性 11：图片预加载队列
*对于任意*游戏状态，预加载队列中应该包含接下来3到5张题目的图片URL，且这些URL应该是有效的。
**验证需求：需求 8.1**

### 属性 12：图片缓存行为
*对于任意*已加载的图片，当该图片被缓存后，再次请求相同URL应该从缓存中获取，而不是重新加载。
**验证需求：需求 8.5**

### 属性 13：图片加载错误处理
*对于任意*图片加载失败的情况，系统应该返回错误状态，并且不应该导致应用崩溃。
**验证需求：需求 9.1**

### 属性 14：题库加载错误处理
*对于任意*无效的题库数据（如空数据、格式错误），系统应该返回错误状态，并且不应该导致应用崩溃。
**验证需求：需求 9.2**

### 属性 15：通用错误恢复
*对于任意*错误状态，系统应该允许用户执行恢复操作（继续游戏或重新开始），且恢复后系统应该处于有效状态。
**验证需求：需求 9.3, 9.4**

### 属性 16：数据持久化往返一致性
*对于任意*统计数据对象，将其保存到本地存储后再加载，加载得到的数据应该与原始数据等价（所有字段值相同）。
**验证需求：需求 10.1, 10.5**

### 属性 17：累计统计正确性
*对于任意*历史统计数据，总回答题目数应该等于所有会话的回答数之和，总正确数应该等于所有会话的正确数之和。
**验证需求：需求 10.2, 10.3**

### 属性 18：地图统计分类正确性
*对于任意*地图统计数据，每个地图的题目数之和应该等于总题目数，且每个地图的准确率应该在0到100之间。
**验证需求：需求 10.4**

### 属性 19：数据清除完整性
*对于任意*存储状态，执行清除操作后，所有历史数据应该被删除，再次加载应该返回空数据或默认初始值。
**验证需求：需求 10.6**

## 错误处理

### 错误类型

#### 1. 数据加载错误
- **题库加载失败**: 当题库数据文件不存在或格式错误时
  - 处理：显示友好错误提示，提供重试选项
  - 降级：使用内置的最小题库数据

- **图片加载失败**: 当地图截图无法加载时
  - 处理：显示占位图片，提供重试按钮
  - 降级：跳过该题目，加载下一题

#### 2. 存储错误
- **LocalStorage写入失败**: 当存储空间不足或权限被拒绝时
  - 处理：提示用户清理存储空间
  - 降级：仅保留当前会话数据，不持久化

- **IndexedDB操作失败**: 当数据库操作异常时
  - 处理：回退到LocalStorage
  - 降级：禁用图片缓存功能

#### 3. 运行时错误
- **内存不足**: 当设备内存不足导致应用卡顿时
  - 处理：自动清理图片缓存
  - 降级：减少预加载数量

- **意外异常**: 当发生未预期的JavaScript错误时
  - 处理：使用Error Boundary捕获，记录错误日志
  - 降级：显示错误页面，提供重新开始选项

### 错误边界

使用React Error Boundary组件包裹关键模块：

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GameErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  // 捕获组件树中的错误
  // 显示降级UI
  // 提供恢复选项
}
```

### 错误日志

所有错误应该被记录到本地日志系统：

```typescript
interface ErrorLog {
  timestamp: number;
  type: 'data' | 'storage' | 'runtime' | 'network';
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

class ErrorLogger {
  log(error: ErrorLog): void;
  getLogs(limit?: number): ErrorLog[];
  clear(): void;
}
```

## 测试策略

### 双重测试方法

本项目采用单元测试和基于属性的测试相结合的方法，以确保全面的代码覆盖和正确性验证。

#### 单元测试
单元测试用于验证特定示例、边缘情况和错误条件：
- 特定的用户交互场景
- 边界值测试（如空题库、单个题目）
- 错误处理路径
- 组件集成点

#### 基于属性的测试
基于属性的测试用于验证跨所有输入的通用属性：
- 数据完整性约束
- 状态转换规则
- 数学不变量（如统计计算）
- 往返属性（如序列化/反序列化）

两种测试方法是互补的：单元测试捕获具体的错误，基于属性的测试验证通用正确性。

### 测试框架选择

- **单元测试框架**: Vitest（快速、现代、与Vite集成良好）
- **基于属性的测试库**: fast-check（JavaScript/TypeScript的成熟PBT库）
- **React组件测试**: React Testing Library
- **E2E测试**: Playwright（可选，用于关键用户流程）

### 基于属性的测试配置

每个属性测试必须：
- 运行至少100次迭代（由于随机化）
- 使用注释标签引用设计文档中的属性
- 标签格式：`// Feature: overwatch-map-quiz, Property {number}: {property_text}`

示例：
```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('QuestionPool', () => {
  // Feature: overwatch-map-quiz, Property 1: 地图截图数量范围
  it('should ensure all maps have 30-40 screenshots', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.string(),
          name: fc.string(),
          screenshots: fc.array(fc.string(), { minLength: 30, maxLength: 40 })
        }), { minLength: 20, maxLength: 30 }),
        (maps) => {
          const pool = new QuestionPool({ maps });
          return maps.every(map => 
            map.screenshots.length >= 30 && 
            map.screenshots.length <= 40
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 测试覆盖目标

- **核心逻辑**: 100%覆盖（QuestionPool, GameState, StorageService）
- **UI组件**: 80%覆盖（关键交互路径）
- **工具函数**: 100%覆盖
- **整体代码**: 85%以上覆盖

### 测试组织

```
tests/
├── unit/                    # 单元测试
│   ├── services/
│   │   ├── QuestionPool.test.ts
│   │   ├── StorageService.test.ts
│   │   └── ImageCache.test.ts
│   ├── hooks/
│   │   ├── useSwipe.test.ts
│   │   └── useGameState.test.ts
│   └── utils/
│       └── helpers.test.ts
├── property/                # 基于属性的测试
│   ├── question-pool.property.test.ts
│   ├── game-state.property.test.ts
│   ├── statistics.property.test.ts
│   └── storage.property.test.ts
├── integration/             # 集成测试
│   ├── game-flow.test.ts
│   └── data-persistence.test.ts
└── e2e/                     # 端到端测试（可选）
    └── complete-game.spec.ts
```

### 持续集成

- 所有测试在每次提交时自动运行
- 基于属性的测试使用固定的随机种子以确保可重现性
- 测试失败时，fast-check会提供导致失败的最小反例
- 性能测试在独立的CI任务中运行

### 测试数据生成

使用fast-check的生成器创建测试数据：

```typescript
// 地图数据生成器
const mapDataArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  nameEn: fc.string({ minLength: 1 }),
  type: fc.constantFrom('assault', 'escort', 'hybrid', 'control', 'push'),
  screenshots: fc.array(
    fc.record({
      id: fc.uuid(),
      url: fc.webUrl(),
      description: fc.option(fc.string())
    }),
    { minLength: 30, maxLength: 40 }
  )
});

// 题目生成器
const questionArbitrary = fc.record({
  id: fc.uuid(),
  mapName: fc.string({ minLength: 1 }),
  screenshotUrl: fc.webUrl(),
  displayedAnswer: fc.string({ minLength: 1 }),
  isCorrectAnswer: fc.boolean()
});

// 统计数据生成器
const statisticsArbitrary = fc.record({
  session: fc.record({
    totalAnswered: fc.nat(),
    correctCount: fc.nat(),
    incorrectCount: fc.nat(),
    accuracy: fc.float({ min: 0, max: 100 }),
    startTime: fc.date().map(d => d.getTime())
  }),
  overall: fc.record({
    totalAnswered: fc.nat(),
    correctCount: fc.nat(),
    accuracy: fc.float({ min: 0, max: 100 })
  }),
  mapAccuracy: fc.dictionary(
    fc.string(),
    fc.record({
      mapName: fc.string(),
      totalQuestions: fc.nat(),
      correctAnswers: fc.nat(),
      accuracy: fc.float({ min: 0, max: 100 })
    })
  )
});
```

### 关键测试场景

#### 单元测试场景
1. 空题库处理
2. 单个地图、单个截图的边界情况
3. 滑动阈值边界值（恰好等于阈值）
4. 正确率计算（0题、1题、多题）
5. 存储空间不足的错误处理
6. 图片加载失败的重试逻辑

#### 基于属性的测试场景
1. 题库数据完整性（属性1-3）
2. 滑动手势识别（属性5-6）
3. 答案判定逻辑（属性8）
4. 统计数据一致性（属性9）
5. 数据持久化往返（属性16）
6. 累计统计正确性（属性17-18）

#### 集成测试场景
1. 完整的答题流程（开始 → 答题 → 查看统计）
2. 游戏重置流程
3. 数据持久化和恢复流程
4. 错误恢复流程

### 性能测试

虽然性能测试不在单元测试范围内，但应该在独立的性能测试套件中验证：
- 应用初始化时间 < 2秒
- 滑动响应时间 < 16ms
- 图片预加载不阻塞主线程
- 内存使用在合理范围内（< 100MB）

### 测试最佳实践

1. **避免过多单元测试**: 基于属性的测试已经覆盖了大量输入组合，单元测试应该专注于特定示例和边缘情况
2. **使用有意义的测试名称**: 清楚描述测试的场景和预期结果
3. **保持测试独立**: 每个测试应该能够独立运行，不依赖其他测试的状态
4. **使用测试辅助函数**: 创建工厂函数和辅助函数来减少测试代码重复
5. **测试用户行为而非实现细节**: 特别是对于React组件，测试用户可见的行为
6. **为失败的属性测试添加回归测试**: 当fast-check发现反例时，将其添加为单元测试以防止回归
