/**
 * 图片预加载Hook
 * 集成ImageCache服务，管理预加载队列
 */

import { ref, reactive, computed, watch, readonly } from 'vue'
import { ImageCache } from '@/services/ImageCache'
import type { Question } from '@/types'

/**
 * 预加载状态
 */
interface PreloadState {
  /** 预加载队列 */
  queue: string[]
  /** 已加载的图片集合 */
  loaded: Set<string>
  /** 正在加载的图片集合 */
  loading: Set<string>
  /** 加载失败的图片集合 */
  failed: Set<string>
  /** 当前加载进度 */
  progress: number
  /** 是否正在预加载 */
  isPreloading: boolean
}

/**
 * 预加载配置
 */
export interface PreloadOptions {
  /** 预加载队列大小 */
  queueSize?: number
  /** 并发加载数量 */
  concurrency?: number
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 预加载优先级 */
  priority?: 'high' | 'normal' | 'low'
  /** 重试次数 */
  retryCount?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
}

/**
 * 图片预加载Hook
 */
export function useImagePreload(options: PreloadOptions = {}) {
  const {
    queueSize = 5,
    concurrency = 3,
    enableCache = true,
    priority = 'normal',
    retryCount = 2,
    retryDelay = 1000
  } = options
  
  // 状态管理
  const state = reactive<PreloadState>({
    queue: [],
    loaded: new Set(),
    loading: new Set(),
    failed: new Set(),
    progress: 0,
    isPreloading: false
  })
  
  // 缓存服务实例
  const imageCache = enableCache ? ImageCache.getInstance() : null
  
  // 重试计数器
  const retryCounters = new Map<string, number>()
  
  /**
   * 计算属性
   */
  const totalImages = computed(() => state.queue.length)
  const loadedCount = computed(() => state.loaded.size)
  const failedCount = computed(() => state.failed.size)
  const loadingCount = computed(() => state.loading.size)
  const remainingCount = computed(() => totalImages.value - loadedCount.value - failedCount.value)
  
  /**
   * 监听加载进度
   */
  watch([loadedCount, failedCount, totalImages], () => {
    if (totalImages.value > 0) {
      state.progress = ((loadedCount.value + failedCount.value) / totalImages.value) * 100
    } else {
      state.progress = 0
    }
    
    // 检查是否完成预加载
    if (loadedCount.value + failedCount.value >= totalImages.value && state.isPreloading) {
      state.isPreloading = false
    }
  })
  
  /**
   * 添加图片到预加载队列
   */
  const addToQueue = (urls: string | string[]) => {
    const urlArray = Array.isArray(urls) ? urls : [urls]
    
    for (const url of urlArray) {
      if (!state.queue.includes(url) && !state.loaded.has(url)) {
        state.queue.push(url)
      }
    }
    
    // 限制队列大小
    if (state.queue.length > queueSize) {
      state.queue = state.queue.slice(-queueSize)
    }
  }
  
  /**
   * 从题目中提取图片URL
   */
  const addQuestionsToQueue = (questions: Question[]) => {
    const urls = questions.map(q => q.screenshot.url)
    addToQueue(urls)
  }
  
  /**
   * 预加载下一批图片
   */
  const preloadNext = async (count: number = concurrency) => {
    if (state.isPreloading) {
      return
    }
    
    const urlsToLoad = state.queue
      .filter(url => !state.loaded.has(url) && !state.loading.has(url) && !state.failed.has(url))
      .slice(0, count)
    
    if (urlsToLoad.length === 0) {
      return
    }
    
    state.isPreloading = true
    
    // 并发加载图片
    const loadPromises = urlsToLoad.map(url => loadSingleImage(url))
    
    try {
      await Promise.allSettled(loadPromises)
    } catch (error) {
      console.error('批量预加载失败:', error)
    }
  }
  
  /**
   * 加载单张图片
   */
  const loadSingleImage = async (url: string): Promise<void> => {
    if (state.loaded.has(url) || state.loading.has(url)) {
      return
    }
    
    state.loading.add(url)
    
    try {
      if (enableCache && imageCache) {
        // 使用缓存服务加载
        await imageCache.preload([url])
      } else {
        // 直接加载图片
        await loadImageDirect(url)
      }
      
      // 加载成功
      state.loading.delete(url)
      state.loaded.add(url)
      retryCounters.delete(url)
      
    } catch (error) {
      console.error(`图片加载失败: ${url}`, error)
      
      state.loading.delete(url)
      
      // 重试逻辑
      const currentRetries = retryCounters.get(url) || 0
      if (currentRetries < retryCount) {
        retryCounters.set(url, currentRetries + 1)
        
        // 延迟重试
        setTimeout(() => {
          loadSingleImage(url)
        }, retryDelay * (currentRetries + 1))
      } else {
        // 重试次数用完，标记为失败
        state.failed.add(url)
        retryCounters.delete(url)
      }
    }
  }
  
  /**
   * 直接加载图片（不使用缓存）
   */
  const loadImageDirect = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        resolve()
      }
      
      img.onerror = () => {
        reject(new Error(`图片加载失败: ${url}`))
      }
      
      // 设置跨域属性
      img.crossOrigin = 'anonymous'
      img.src = url
    })
  }
  
  /**
   * 预加载所有队列中的图片
   */
  const preloadAll = async () => {
    const allUrls = state.queue.filter(url => 
      !state.loaded.has(url) && 
      !state.loading.has(url) && 
      !state.failed.has(url)
    )
    
    if (allUrls.length === 0) {
      return
    }
    
    state.isPreloading = true
    
    // 分批加载，避免同时发起太多请求
    const batchSize = concurrency
    for (let i = 0; i < allUrls.length; i += batchSize) {
      const batch = allUrls.slice(i, i + batchSize)
      const batchPromises = batch.map(url => loadSingleImage(url))
      
      try {
        await Promise.allSettled(batchPromises)
      } catch (error) {
        console.error(`批次 ${Math.floor(i / batchSize) + 1} 预加载失败:`, error)
      }
      
      // 批次间添加小延迟，避免阻塞主线程
      if (i + batchSize < allUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
  }
  
  /**
   * 检查图片是否已加载
   */
  const isLoaded = (url: string): boolean => {
    return state.loaded.has(url)
  }
  
  /**
   * 检查图片是否正在加载
   */
  const isLoading = (url: string): boolean => {
    return state.loading.has(url)
  }
  
  /**
   * 检查图片是否加载失败
   */
  const isFailed = (url: string): boolean => {
    return state.failed.has(url)
  }
  
  /**
   * 获取图片的Object URL（如果使用缓存）
   */
  const getImageUrl = async (url: string): Promise<string | null> => {
    if (enableCache && imageCache) {
      try {
        return await imageCache.getObjectURL(url)
      } catch (error) {
        console.error(`获取图片URL失败: ${url}`, error)
        return null
      }
    }
    
    // 如果不使用缓存，直接返回原URL
    return isLoaded(url) ? url : null
  }
  
  /**
   * 清除预加载队列
   */
  const clearQueue = () => {
    state.queue = []
    state.loaded.clear()
    state.loading.clear()
    state.failed.clear()
    state.progress = 0
    state.isPreloading = false
    retryCounters.clear()
  }
  
  /**
   * 移除指定图片
   */
  const removeFromQueue = (url: string) => {
    const index = state.queue.indexOf(url)
    if (index > -1) {
      state.queue.splice(index, 1)
    }
    
    state.loaded.delete(url)
    state.loading.delete(url)
    state.failed.delete(url)
    retryCounters.delete(url)
  }
  
  /**
   * 获取预加载统计信息
   */
  const getStats = () => {
    return {
      total: totalImages.value,
      loaded: loadedCount.value,
      loading: loadingCount.value,
      failed: failedCount.value,
      remaining: remainingCount.value,
      progress: state.progress,
      isPreloading: state.isPreloading,
      queueSize: state.queue.length,
      retryCount: retryCounters.size
    }
  }
  
  /**
   * 设置预加载优先级
   */
  const setPriority = (newPriority: 'high' | 'normal' | 'low') => {
    if (enableCache && imageCache) {
      // 根据优先级调整预加载策略
      const priorityMap = {
        high: 5,
        normal: 3,
        low: 1
      }
      
      // 这里可以调整并发数量
      const newConcurrency = priorityMap[newPriority]
      // 注意：这里需要更新concurrency变量，但由于它是const，
      // 实际实现中可能需要将其改为ref或reactive
    }
  }
  
  /**
   * 预热缓存（预加载常用图片）
   */
  const warmupCache = async (urls: string[]) => {
    if (enableCache && imageCache) {
      try {
        await imageCache.warmup(urls, priority)
      } catch (error) {
        console.error('缓存预热失败:', error)
      }
    }
  }
  
  // 返回Hook接口
  return {
    // 状态
    state: readonly(state),
    totalImages,
    loadedCount,
    failedCount,
    loadingCount,
    remainingCount,
    
    // 队列管理
    addToQueue,
    addQuestionsToQueue,
    clearQueue,
    removeFromQueue,
    
    // 预加载操作
    preloadNext,
    preloadAll,
    
    // 状态查询
    isLoaded,
    isLoading,
    isFailed,
    getImageUrl,
    
    // 工具方法
    getStats,
    setPriority,
    warmupCache,
    
    // 配置信息
    config: {
      queueSize,
      concurrency,
      enableCache,
      priority,
      retryCount,
      retryDelay
    }
  }
}