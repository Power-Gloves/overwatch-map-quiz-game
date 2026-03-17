/**
 * 数据持久化服务
 * 负责游戏数据的本地存储和读取
 */

import type { 
  Statistics, 
  GameSession, 
  AppSettings, 
  ErrorLog,
  MapStatistics,
  AnswerResult
} from '@/types'
import { STORAGE_KEYS, DEFAULT_CONFIG } from '@/types'

/**
 * 存储服务类
 */
export class StorageService {
  private static instance: StorageService
  
  /**
   * 获取单例实例
   */
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }
  
  private constructor() {
    // 私有构造函数，确保单例模式
  }
  
  // ============= 统计数据相关 =============
  
  /**
   * 保存统计数据
   * @param statistics 统计数据
   */
  public saveStatistics(statistics: Statistics): void {
    try {
      // 检查存储空间
      this.checkStorageSpace()
      
      const data = JSON.stringify(statistics)
      
      // 检查数据大小
      if (data.length > 1024 * 1024) { // 1MB限制
        console.warn('统计数据过大，尝试压缩')
        // 可以在这里实现数据压缩逻辑
      }
      
      localStorage.setItem(STORAGE_KEYS.STATISTICS, data)
    } catch (error) {
      console.error('保存统计数据失败:', error)
      this.handleStorageError('saveStatistics', error)
      
      // 尝试清理旧数据后重试
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanupOldData()
        try {
          localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(statistics))
        } catch (retryError) {
          throw new Error('存储空间不足，请清理浏览器缓存')
        }
      } else {
        throw new Error('保存统计数据失败')
      }
    }
  }
  
  /**
   * 加载统计数据
   * @returns 统计数据或默认值
   */
  public loadStatistics(): Statistics {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATISTICS)
      if (data) {
        const statistics = JSON.parse(data) as Statistics
        return this.validateAndMigrateStatistics(statistics)
      }
      return this.getDefaultStatistics()
    } catch (error) {
      console.error('加载统计数据失败:', error)
      this.handleStorageError('loadStatistics', error)
      return this.getDefaultStatistics()
    }
  }
  
  /**
   * 更新统计数据
   * @param session 游戏会话数据
   */
  public updateStatistics(session: GameSession): void {
    const statistics = this.loadStatistics()
    
    // 更新基础统计
    statistics.totalGames += 1
    statistics.totalQuestions += session.totalQuestions
    statistics.totalCorrect += session.correctAnswers
    statistics.overallAccuracy = statistics.totalQuestions > 0 
      ? (statistics.totalCorrect / statistics.totalQuestions) * 100 
      : 0
    
    // 更新最佳记录
    if (session.accuracy > statistics.bestAccuracy) {
      statistics.bestAccuracy = session.accuracy
    }
    
    // 更新连续正确记录
    this.updateStreakStats(statistics, session)
    
    // 更新游戏时间
    const sessionDuration = session.endTime - session.startTime
    statistics.totalPlayTime += sessionDuration
    statistics.averageTimePerQuestion = statistics.totalQuestions > 0
      ? statistics.totalPlayTime / statistics.totalQuestions
      : 0
    
    // 更新地图统计
    this.updateMapStatistics(statistics, session)
    
    // 更新模式统计
    this.updateModeStatistics(statistics, session)
    
    // 更新会话历史
    statistics.recentSessions.unshift(session)
    if (statistics.recentSessions.length > 50) {
      statistics.recentSessions = statistics.recentSessions.slice(0, 50)
    }
    
    // 更新时间戳
    statistics.lastPlayTime = session.endTime
    if (statistics.firstPlayTime === 0) {
      statistics.firstPlayTime = session.startTime
    }
    
    this.saveStatistics(statistics)
  }
  
  /**
   * 更新连续正确记录
   */
  private updateStreakStats(statistics: Statistics, session: GameSession): void {
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0
    
    // 计算本次会话的连续正确数
    for (const answer of session.answers) {
      if (answer.isCorrect) {
        tempStreak++
        maxStreak = Math.max(maxStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }
    
    // 更新最佳连续记录
    statistics.bestStreak = Math.max(statistics.bestStreak, maxStreak)
    
    // 更新当前连续记录（需要考虑历史数据）
    if (session.answers.length > 0) {
      const lastAnswer = session.answers[session.answers.length - 1]
      if (lastAnswer.isCorrect) {
        statistics.currentStreak += 1
      } else {
        statistics.currentStreak = 0
      }
    }
  }
  
  /**
   * 更新地图统计数据
   */
  private updateMapStatistics(statistics: Statistics, session: GameSession): void {
    for (const answer of session.answers) {
      const mapName = answer.mapName
      
      if (!statistics.mapStats[mapName]) {
        statistics.mapStats[mapName] = {
          mapName,
          totalAppearances: 0,
          correctAnswers: 0,
          accuracy: 0,
          averageTime: 0,
          lastAnswered: 0
        }
      }
      
      const mapStat = statistics.mapStats[mapName]
      mapStat.totalAppearances += 1
      
      if (answer.isCorrect) {
        mapStat.correctAnswers += 1
      }
      
      mapStat.accuracy = (mapStat.correctAnswers / mapStat.totalAppearances) * 100
      
      // 更新平均时间（移动平均）
      mapStat.averageTime = (mapStat.averageTime * (mapStat.totalAppearances - 1) + answer.timeSpent) / mapStat.totalAppearances
      
      mapStat.lastAnswered = answer.timestamp
    }
  }
  
  /**
   * 更新模式统计数据
   */
  private updateModeStatistics(statistics: Statistics, session: GameSession): void {
    if (session.mode === 'endless') {
      const endlessStats = statistics.modeStats.endless
      endlessStats.totalGames += 1
      
      // 更新最高分（连续正确数）
      if (session.correctAnswers > endlessStats.highScore) {
        endlessStats.highScore = session.correctAnswers
      }
      
      // 更新平均分
      endlessStats.averageScore = (endlessStats.averageScore * (endlessStats.totalGames - 1) + session.correctAnswers) / endlessStats.totalGames
      
    } else if (session.mode === 'challenge') {
      const challengeStats = statistics.modeStats.challenge
      challengeStats.totalGames += 1
      
      // 检查是否通关
      if (session.challengeResult?.isPassed) {
        challengeStats.passedGames += 1
        
        // 检查是否三星通关
        if (session.challengeResult.stars === 3) {
          challengeStats.perfectGames += 1
        }
      }
      
      // 更新通关率
      challengeStats.passRate = (challengeStats.passedGames / challengeStats.totalGames) * 100
      
    } else if (session.mode === 'practice') {
      const practiceStats = statistics.modeStats.practice
      practiceStats.totalGames += 1
      
      // 更新最佳正确率
      if (session.accuracy > practiceStats.bestAccuracy) {
        practiceStats.bestAccuracy = session.accuracy
      }
      
      // 更新平均正确率
      practiceStats.averageAccuracy = (practiceStats.averageAccuracy * (practiceStats.totalGames - 1) + session.accuracy) / practiceStats.totalGames
    }
  }
  
  // ============= 会话数据相关 =============
  
  /**
   * 保存游戏会话
   * @param session 游戏会话数据
   */
  public saveSession(session: GameSession): void {
    try {
      const data = JSON.stringify(session)
      localStorage.setItem(STORAGE_KEYS.GAME_SESSION, data)
    } catch (error) {
      console.error('保存游戏会话失败:', error)
      this.handleStorageError('saveSession', error)
      throw new Error('保存游戏会话失败')
    }
  }
  
  /**
   * 加载当前游戏会话
   * @returns 游戏会话数据或null
   */
  public loadCurrentSession(): GameSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_SESSION)
      if (data) {
        return JSON.parse(data) as GameSession
      }
      return null
    } catch (error) {
      console.error('加载游戏会话失败:', error)
      this.handleStorageError('loadCurrentSession', error)
      return null
    }
  }
  
  /**
   * 清除当前游戏会话
   */
  public clearCurrentSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAME_SESSION)
    } catch (error) {
      console.error('清除游戏会话失败:', error)
      this.handleStorageError('clearCurrentSession', error)
    }
  }
  
  /**
   * 获取历史会话
   * @param limit 返回数量限制
   * @returns 历史会话数组
   */
  public getHistory(limit: number = 20): GameSession[] {
    const statistics = this.loadStatistics()
    return statistics.recentSessions.slice(0, limit)
  }
  
  // ============= 设置数据相关 =============
  
  /**
   * 保存应用设置
   * @param settings 应用设置
   */
  public saveSettings(settings: AppSettings): void {
    try {
      const data = JSON.stringify(settings)
      localStorage.setItem(STORAGE_KEYS.SETTINGS, data)
    } catch (error) {
      console.error('保存设置失败:', error)
      this.handleStorageError('saveSettings', error)
      throw new Error('保存设置失败')
    }
  }
  
  /**
   * 加载应用设置
   * @returns 应用设置或默认值
   */
  public loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (data) {
        const settings = JSON.parse(data) as AppSettings
        return this.validateAndMigrateSettings(settings)
      }
      return this.getDefaultSettings()
    } catch (error) {
      console.error('加载设置失败:', error)
      this.handleStorageError('loadSettings', error)
      return this.getDefaultSettings()
    }
  }
  
  // ============= 错误日志相关 =============
  
  /**
   * 保存错误日志
   * @param errorLog 错误日志
   */
  public saveErrorLog(errorLog: ErrorLog): void {
    try {
      const logs = this.loadErrorLogs()
      logs.unshift(errorLog)
      
      // 只保留最近100条错误日志
      if (logs.length > 100) {
        logs.splice(100)
      }
      
      const data = JSON.stringify(logs)
      localStorage.setItem(STORAGE_KEYS.ERROR_LOGS, data)
    } catch (error) {
      console.error('保存错误日志失败:', error)
      // 错误日志保存失败时不抛出异常，避免循环错误
    }
  }
  
  /**
   * 加载错误日志
   * @returns 错误日志数组
   */
  public loadErrorLogs(): ErrorLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ERROR_LOGS)
      if (data) {
        return JSON.parse(data) as ErrorLog[]
      }
      return []
    } catch (error) {
      console.error('加载错误日志失败:', error)
      return []
    }
  }
  
  // ============= 数据管理相关 =============
  
  /**
   * 清除所有数据
   */
  public clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.STATISTICS)
      localStorage.removeItem(STORAGE_KEYS.SETTINGS)
      localStorage.removeItem(STORAGE_KEYS.GAME_SESSION)
      localStorage.removeItem(STORAGE_KEYS.ERROR_LOGS)
      localStorage.removeItem(STORAGE_KEYS.CACHE_INDEX)
    } catch (error) {
      console.error('清除所有数据失败:', error)
      this.handleStorageError('clearAll', error)
      throw new Error('清除数据失败')
    }
  }
  
  /**
   * 获取存储使用情况
   */
  public getStorageInfo(): Promise<{
    currentSize: number
    limitSize: number
    keys: string[]
  }> {
    return new Promise((resolve) => {
      try {
        const keys = Object.keys(localStorage)
        let currentSize = 0
        
        // 计算当前使用的存储大小（近似值）
        keys.forEach(key => {
          const value = localStorage.getItem(key)
          if (value) {
            currentSize += key.length + value.length
          }
        })
        
        // Web Storage 通常限制为 5-10MB，这里使用 5MB 作为估计
        const limitSize = 5 * 1024 * 1024 // 5MB
        
        resolve({
          currentSize: currentSize * 2, // 字符串按UTF-16计算，每字符2字节
          limitSize,
          keys
        })
      } catch (error) {
        console.error('获取存储信息失败:', error)
        resolve({
          currentSize: 0,
          limitSize: 5 * 1024 * 1024,
          keys: []
        })
      }
    })
  }
  
  /**
   * 导出数据（用于备份）
   */
  public exportData(): {
    statistics: Statistics
    settings: AppSettings
    timestamp: number
    version: string
  } {
    return {
      statistics: this.loadStatistics(),
      settings: this.loadSettings(),
      timestamp: Date.now(),
      version: '1.0.0'
    }
  }
  
  /**
   * 导入数据（用于恢复）
   * @param data 导入的数据
   */
  public importData(data: {
    statistics?: Statistics
    settings?: AppSettings
    timestamp: number
    version: string
  }): void {
    try {
      if (data.statistics) {
        this.saveStatistics(data.statistics)
      }
      if (data.settings) {
        this.saveSettings(data.settings)
      }
    } catch (error) {
      console.error('导入数据失败:', error)
      throw new Error('导入数据失败')
    }
  }
  
  // ============= 私有辅助方法 =============
  
  /**
   * 获取默认统计数据
   */
  private getDefaultStatistics(): Statistics {
    return {
      totalGames: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      bestAccuracy: 0,
      bestStreak: 0,
      currentStreak: 0,
      totalPlayTime: 0,
      averageTimePerQuestion: 0,
      mapStats: {},
      recentSessions: [],
      firstPlayTime: 0,
      lastPlayTime: 0,
      modeStats: {
        endless: {
          totalGames: 0,
          highScore: 0,
          averageScore: 0
        },
        challenge: {
          totalGames: 0,
          passedGames: 0,
          passRate: 0,
          perfectGames: 0
        },
        practice: {
          totalGames: 0,
          averageAccuracy: 0,
          bestAccuracy: 0
        }
      }
    }
  }
  
  /**
   * 获取默认应用设置
   */
  private getDefaultSettings(): AppSettings {
    return {
      gameConfig: { ...DEFAULT_CONFIG },
      theme: 'dark',
      language: 'zh-CN',
      isFirstLaunch: true,
      version: '1.0.0'
    }
  }
  
  /**
   * 验证和迁移统计数据
   */
  private validateAndMigrateStatistics(statistics: Statistics): Statistics {
    const defaultStats = this.getDefaultStatistics()
    
    // 确保所有必需字段存在
    return {
      ...defaultStats,
      ...statistics,
      mapStats: statistics.mapStats || {},
      recentSessions: statistics.recentSessions || []
    }
  }
  
  /**
   * 验证和迁移设置数据
   */
  private validateAndMigrateSettings(settings: AppSettings): AppSettings {
    const defaultSettings = this.getDefaultSettings()
    
    return {
      ...defaultSettings,
      ...settings,
      gameConfig: {
        ...defaultSettings.gameConfig,
        ...settings.gameConfig
      }
    }
  }
  
  /**
   * 处理存储错误
   */
  private handleStorageError(operation: string, error: any): void {
    const errorLog: ErrorLog = {
      id: `storage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'storage_error' as any,
      message: `存储操作失败: ${operation}`,
      stack: error?.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent || 'unknown',
      url: window.location?.href || 'unknown',
      extra: {
        operation,
        error: error?.message || error,
        storageAvailable: this.isStorageAvailable()
      }
    }
    
    // 尝试保存错误日志（但不抛出异常）
    try {
      this.saveErrorLog(errorLog)
    } catch (logError) {
      console.error('保存错误日志失败:', logError)
    }
  }
  
  /**
   * 检查存储空间
   */
  private checkStorageSpace(): void {
    try {
      const testKey = '__storage_test__'
      const testData = 'x'.repeat(1024) // 1KB测试数据
      localStorage.setItem(testKey, testData)
      localStorage.removeItem(testKey)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('存储空间不足')
      }
      throw error
    }
  }
  
  /**
   * 清理旧数据
   */
  private cleanupOldData(): void {
    try {
      // 清理错误日志（只保留最近20条）
      const logs = this.loadErrorLogs()
      if (logs.length > 20) {
        const recentLogs = logs.slice(0, 20)
        localStorage.setItem(STORAGE_KEYS.ERROR_LOGS, JSON.stringify(recentLogs))
      }
      
      // 清理旧的会话数据
      const statistics = this.loadStatistics()
      if (statistics.recentSessions.length > 20) {
        statistics.recentSessions = statistics.recentSessions.slice(0, 20)
        this.saveStatistics(statistics)
      }
    } catch (error) {
      console.error('清理旧数据失败:', error)
    }
  }
  
  /**
   * 检查存储是否可用
   */
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }
}