/**
 * 守望先锋地图识别游戏 - 核心类型定义
 */

// ============= 基础数据类型 =============

/**
 * 地图截图数据
 */
export interface Screenshot {
  /** 截图文件名 */
  filename: string
  /** 截图URL路径 */
  url: string
  /** 截图描述（可选） */
  description?: string
}

/**
 * 地图数据
 */
export interface MapData {
  /** 地图ID */
  id: string
  /** 地图中文名称 */
  name: string
  /** 地图英文名称 */
  nameEn: string
  /** 地图类型 */
  type: MapType
  /** 地图截图列表 */
  screenshots: Screenshot[]
  /** 地图描述（可选） */
  description?: string
}

/**
 * 地图类型枚举
 */
export enum MapType {
  ESCORT = 'escort',           // 护送
  ASSAULT = 'assault',         // 攻击
  HYBRID = 'hybrid',           // 混合
  CONTROL = 'control',         // 控制
  PUSH = 'push',              // 推进
  DEATHMATCH = 'deathmatch'   // 死斗
}

// ============= 游戏逻辑类型 =============

/**
 * 游戏题目
 */
export interface Question {
  /** 题目ID */
  id: string
  /** 地图截图 */
  screenshot: Screenshot
  /** 正确答案（地图名称） */
  correctAnswer: string
  /** 错误答案选项 */
  wrongAnswers: string[]
  /** 所有答案选项（随机排序） */
  allOptions: string[]
  /** 地图数据引用 */
  mapData: MapData
}

/**
 * 滑动方向
 */
export enum SwipeDirection {
  LEFT = 'left',   // 左滑（错误答案）
  RIGHT = 'right', // 右滑（正确答案）
  UP = 'up',       // 上滑
  DOWN = 'down'    // 下滑
}

/**
 * 游戏模式
 */
export enum GameMode {
  ENDLESS = 'endless',     // 无尽模式
  CHALLENGE = 'challenge', // 挑战模式（20题）
  PRACTICE = 'practice'    // 练习模式（10题）
}

/**
 * 游戏状态
 */
export enum GameStatus {
  IDLE = 'idle',           // 空闲状态（首页）
  MODE_SELECT = 'mode_select', // 模式选择页面
  LOADING = 'loading',     // 加载中
  PLAYING = 'playing',     // 游戏中
  PAUSED = 'paused',       // 暂停
  FINISHED = 'finished',   // 游戏结束
  ERROR = 'error'          // 错误状态
}

/**
 * 答案结果
 */
export interface AnswerResult {
  /** 是否正确 */
  isCorrect: boolean
  /** 用户选择的答案 */
  userAnswer: string
  /** 正确答案 */
  correctAnswer: string
  /** 地图名称 */
  mapName: string
  /** 答题时间（毫秒） */
  timeSpent: number
  /** 答题时间戳 */
  timestamp: number
}

/**
 * 游戏状态数据
 */
export interface GameState {
  /** 游戏状态 */
  status: GameStatus
  /** 游戏模式 */
  mode: GameMode
  /** 当前题目 */
  currentQuestion: Question | null
  /** 下一题目（预加载） */
  nextQuestion: Question | null
  /** 已回答题目数 */
  totalAnswered: number
  /** 正确答案数 */
  correctCount: number
  /** 错误答案数 */
  incorrectCount: number
  /** 当前正确率 */
  accuracy: number
  /** 答题历史 */
  answerHistory: AnswerResult[]
  /** 游戏开始时间 */
  startTime: number | null
  /** 游戏结束时间 */
  endTime: number | null
  /** 错误信息 */
  error: string | null
  /** 挑战模式相关 */
  challenge?: {
    /** 目标题目数 */
    targetQuestions: number
    /** 通关条件（正确率） */
    passAccuracy: number
    /** 是否通关 */
    isPassed: boolean
  }
}

// ============= 统计数据类型 =============

/**
 * 单次游戏会话统计
 */
export interface GameSession {
  /** 会话ID */
  id: string
  /** 游戏模式 */
  mode: GameMode
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 总题目数 */
  totalQuestions: number
  /** 正确答案数 */
  correctAnswers: number
  /** 正确率 */
  accuracy: number
  /** 平均答题时间（毫秒） */
  averageTime: number
  /** 答题详情 */
  answers: AnswerResult[]
  /** 挑战模式结果 */
  challengeResult?: {
    /** 是否通关 */
    isPassed: boolean
    /** 通关条件 */
    passAccuracy: number
    /** 获得星级（1-3星） */
    stars: number
  }
}

/**
 * 地图统计数据
 */
export interface MapStatistics {
  /** 地图名称 */
  mapName: string
  /** 出现次数 */
  totalAppearances: number
  /** 正确次数 */
  correctAnswers: number
  /** 正确率 */
  accuracy: number
  /** 平均答题时间 */
  averageTime: number
  /** 最后答题时间 */
  lastAnswered: number
}

/**
 * 总体统计数据
 */
export interface Statistics {
  /** 总游戏次数 */
  totalGames: number
  /** 总题目数 */
  totalQuestions: number
  /** 总正确数 */
  totalCorrect: number
  /** 总体正确率 */
  overallAccuracy: number
  /** 最佳正确率 */
  bestAccuracy: number
  /** 最佳连续正确数 */
  bestStreak: number
  /** 当前连续正确数 */
  currentStreak: number
  /** 总游戏时间（毫秒） */
  totalPlayTime: number
  /** 平均每题时间 */
  averageTimePerQuestion: number
  /** 各地图统计 */
  mapStats: Record<string, MapStatistics>
  /** 最近游戏会话 */
  recentSessions: GameSession[]
  /** 首次游戏时间 */
  firstPlayTime: number
  /** 最后游戏时间 */
  lastPlayTime: number
  /** 模式统计 */
  modeStats: {
    /** 无尽模式统计 */
    endless: {
      /** 游戏次数 */
      totalGames: number
      /** 最高分数（连续正确数） */
      highScore: number
      /** 平均分数 */
      averageScore: number
    }
    /** 挑战模式统计 */
    challenge: {
      /** 游戏次数 */
      totalGames: number
      /** 通关次数 */
      passedGames: number
      /** 通关率 */
      passRate: number
      /** 三星通关次数 */
      perfectGames: number
    }
    /** 练习模式统计 */
    practice: {
      /** 游戏次数 */
      totalGames: number
      /** 平均正确率 */
      averageAccuracy: number
      /** 最佳正确率 */
      bestAccuracy: number
    }
  }
}

// ============= UI交互类型 =============

/**
 * 滑动手势数据
 */
export interface SwipeGestureData {
  /** 滑动方向 */
  direction: SwipeDirection
  /** 滑动距离 */
  distance: number
  /** 滑动速度 */
  velocity: number
  /** 滑动持续时间 */
  duration: number
  /** 起始位置 */
  startPosition: { x: number; y: number }
  /** 结束位置 */
  endPosition: { x: number; y: number }
}

/**
 * 卡片动画状态
 */
export interface CardAnimationState {
  /** X轴偏移 */
  x: number
  /** Y轴偏移 */
  y: number
  /** 旋转角度 */
  rotation: number
  /** 透明度 */
  opacity: number
  /** 缩放比例 */
  scale: number
  /** 是否正在动画 */
  isAnimating: boolean
}

// ============= 服务类型 =============

/**
 * 图片缓存项
 */
export interface CacheItem {
  /** 图片URL */
  url: string
  /** 缓存的Blob数据 */
  blob: Blob
  /** 缓存时间 */
  timestamp: number
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccessed: number
  /** 文件大小 */
  size: number
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 最大缓存大小（字节） */
  maxSize: number
  /** 最大缓存项数 */
  maxItems: number
  /** 缓存过期时间（毫秒） */
  expireTime: number
  /** 是否启用LRU策略 */
  enableLRU: boolean
}

// ============= 错误处理类型 =============

/**
 * 错误类型
 */
export enum ErrorType {
  NETWORK_ERROR = 'network_error',
  STORAGE_ERROR = 'storage_error',
  IMAGE_LOAD_ERROR = 'image_load_error',
  QUESTION_POOL_ERROR = 'question_pool_error',
  CACHE_ERROR = 'cache_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * 错误日志
 */
export interface ErrorLog {
  /** 错误ID */
  id: string
  /** 错误类型 */
  type: ErrorType
  /** 错误消息 */
  message: string
  /** 错误堆栈 */
  stack?: string
  /** 发生时间 */
  timestamp: number
  /** 用户代理 */
  userAgent: string
  /** 页面URL */
  url: string
  /** 额外数据 */
  extra?: Record<string, any>
}

// ============= 配置类型 =============

/**
 * 游戏配置
 */
export interface GameConfig {
  /** 滑动阈值（像素） */
  swipeThreshold: number
  /** 滑动速度阈值 */
  swipeVelocityThreshold: number
  /** 卡片动画持续时间 */
  cardAnimationDuration: number
  /** 预加载图片数量 */
  preloadImageCount: number
  /** 是否启用音效 */
  enableSound: boolean
  /** 是否启用触觉反馈 */
  enableHaptic: boolean
  /** 是否启用统计 */
  enableAnalytics: boolean
}

/**
 * 应用设置
 */
export interface AppSettings {
  /** 游戏配置 */
  gameConfig: GameConfig
  /** 主题设置 */
  theme: 'dark' | 'light' | 'auto'
  /** 语言设置 */
  language: 'zh-CN' | 'en-US'
  /** 是否首次启动 */
  isFirstLaunch: boolean
  /** 设置版本 */
  version: string
}

// ============= 工具类型 =============

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 可选字段类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必需字段类型
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 * 事件处理器类型
 */
export type EventHandler<T = void> = (data: T) => void | Promise<void>

/**
 * 异步函数类型
 */
export type AsyncFunction<T = void, R = void> = (data: T) => Promise<R>

// ============= 常量类型 =============

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  STATISTICS: 'ow_map_quiz_statistics',
  SETTINGS: 'ow_map_quiz_settings',
  CACHE_INDEX: 'ow_map_quiz_cache_index',
  ERROR_LOGS: 'ow_map_quiz_error_logs',
  GAME_SESSION: 'ow_map_quiz_current_session'
} as const

/**
 * 默认配置常量
 */
export const DEFAULT_CONFIG: GameConfig = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.5,
  cardAnimationDuration: 300,
  preloadImageCount: 3,
  enableSound: true,
  enableHaptic: true,
  enableAnalytics: true
} as const

/**
 * 缓存默认配置
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  maxItems: 200,
  expireTime: 7 * 24 * 60 * 60 * 1000, // 7天
  enableLRU: true
} as const