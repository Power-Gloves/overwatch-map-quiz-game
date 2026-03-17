/**
 * 图片缓存服务
 * 负责图片的预加载、缓存管理和LRU策略
 */

import type { CacheItem, CacheConfig } from '@/types'
import { DEFAULT_CACHE_CONFIG, STORAGE_KEYS } from '@/types'

/**
 * 图片缓存类
 */
export class ImageCache {
  private static instance: ImageCache
  private cache: Map<string, CacheItem> = new Map()
  private config: CacheConfig
  private currentSize: number = 0
  private dbName: string = 'ow_map_quiz_cache'
  private dbVersion: number = 1
  private db: IDBDatabase | null = null
  
  /**
   * 获取单例实例
   */
  public static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache()
    }
    return ImageCache.instance
  }
  
  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
    this.initIndexedDB()
    this.loadCacheIndex()
  }
  
  /**
   * 初始化IndexedDB
   */
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        console.warn('IndexedDB不可用，将使用内存缓存')
        resolve()
        return
      }
      
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => {
        console.error('IndexedDB初始化失败:', request.error)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // 创建图片缓存对象存储
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'url' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false })
        }
      }
    })
  }
  
  /**
   * 从本地存储加载缓存索引
   */
  private loadCacheIndex(): void {
    try {
      const indexData = localStorage.getItem(STORAGE_KEYS.CACHE_INDEX)
      if (indexData) {
        const cacheIndex = JSON.parse(indexData) as Array<{
          url: string
          timestamp: number
          lastAccessed: number
          size: number
          accessCount: number
        }>
        
        // 重建内存缓存索引
        for (const item of cacheIndex) {
          this.cache.set(item.url, {
            url: item.url,
            blob: null as any, // Blob数据从IndexedDB加载
            timestamp: item.timestamp,
            lastAccessed: item.lastAccessed,
            size: item.size,
            accessCount: item.accessCount
          })
          this.currentSize += item.size
        }
      }
    } catch (error) {
      console.error('加载缓存索引失败:', error)
    }
  }
  
  /**
   * 保存缓存索引到本地存储
   */
  private saveCacheIndex(): void {
    try {
      const cacheIndex = Array.from(this.cache.entries()).map(([url, item]) => ({
        url,
        timestamp: item.timestamp,
        lastAccessed: item.lastAccessed,
        size: item.size,
        accessCount: item.accessCount
      }))
      
      localStorage.setItem(STORAGE_KEYS.CACHE_INDEX, JSON.stringify(cacheIndex))
    } catch (error) {
      console.error('保存缓存索引失败:', error)
    }
  }
  
  /**
   * 预加载图片
   * @param urls 图片URL数组
   * @returns Promise<void>
   */
  public async preload(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.loadImage(url))
    
    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('批量预加载图片失败:', error)
    }
  }
  
  /**
   * 加载单张图片
   * @param url 图片URL
   * @returns Promise<Blob>
   */
  private async loadImage(url: string): Promise<Blob> {
    // 检查缓存
    const cached = await this.get(url)
    if (cached) {
      return cached
    }
    
    try {
      // 下载图片
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      
      // 存储到缓存
      await this.set(url, blob)
      
      return blob
    } catch (error) {
      console.error(`加载图片失败: ${url}`, error)
      throw error
    }
  }
  
  /**
   * 从缓存获取图片
   * @param url 图片URL
   * @returns Promise<Blob | null>
   */
  public async get(url: string): Promise<Blob | null> {
    // 检查内存缓存
    const cacheItem = this.cache.get(url)
    if (!cacheItem) {
      return null
    }
    
    // 检查是否过期
    if (this.isExpired(cacheItem)) {
      await this.remove(url)
      return null
    }
    
    // 更新访问统计
    cacheItem.lastAccessed = Date.now()
    cacheItem.accessCount += 1
    
    // 如果Blob数据在内存中，直接返回
    if (cacheItem.blob) {
      return cacheItem.blob
    }
    
    // 从IndexedDB加载Blob数据
    try {
      const blob = await this.getFromIndexedDB(url)
      if (blob) {
        cacheItem.blob = blob
        return blob
      }
    } catch (error) {
      console.error(`从IndexedDB获取图片失败: ${url}`, error)
    }
    
    // 缓存项存在但数据丢失，清除该项
    await this.remove(url)
    return null
  }
  
  /**
   * 存储图片到缓存
   * @param url 图片URL
   * @param blob 图片Blob数据
   */
  private async set(url: string, blob: Blob): Promise<void> {
    const now = Date.now()
    const size = blob.size
    
    // 检查是否需要清理空间
    await this.ensureSpace(size)
    
    const cacheItem: CacheItem = {
      url,
      blob,
      timestamp: now,
      lastAccessed: now,
      accessCount: 1,
      size
    }
    
    try {
      // 存储到IndexedDB
      await this.setToIndexedDB(cacheItem)
      
      // 更新内存缓存
      this.cache.set(url, cacheItem)
      this.currentSize += size
      
      // 保存缓存索引
      this.saveCacheIndex()
      
    } catch (error) {
      console.error(`存储图片到缓存失败: ${url}`, error)
      throw error
    }
  }
  
  /**
   * 从IndexedDB获取图片
   */
  private async getFromIndexedDB(url: string): Promise<Blob | null> {
    if (!this.db) {
      return null
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['images'], 'readonly')
      const store = transaction.objectStore('images')
      const request = store.get(url)
      
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.blob : null)
      }
      
      request.onerror = () => {
        reject(request.error)
      }
    })
  }
  
  /**
   * 存储图片到IndexedDB
   */
  private async setToIndexedDB(cacheItem: CacheItem): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB不可用')
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['images'], 'readwrite')
      const store = transaction.objectStore('images')
      const request = store.put(cacheItem)
      
      request.onsuccess = () => {
        resolve()
      }
      
      request.onerror = () => {
        reject(request.error)
      }
    })
  }
  
  /**
   * 确保有足够的缓存空间
   * @param requiredSize 需要的空间大小
   */
  private async ensureSpace(requiredSize: number): Promise<void> {
    // 检查是否超出大小限制
    while (this.currentSize + requiredSize > this.config.maxSize || 
           this.cache.size >= this.config.maxItems) {
      
      if (this.config.enableLRU) {
        await this.evictLRU()
      } else {
        await this.evictOldest()
      }
      
      // 防止无限循环
      if (this.cache.size === 0) {
        break
      }
    }
  }
  
  /**
   * LRU策略淘汰缓存项
   */
  private async evictLRU(): Promise<void> {
    let lruUrl = ''
    let lruTime = Date.now()
    
    for (const [url, item] of this.cache.entries()) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed
        lruUrl = url
      }
    }
    
    if (lruUrl) {
      await this.remove(lruUrl)
    }
  }
  
  /**
   * 按时间淘汰最旧的缓存项
   */
  private async evictOldest(): Promise<void> {
    let oldestUrl = ''
    let oldestTime = Date.now()
    
    for (const [url, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestUrl = url
      }
    }
    
    if (oldestUrl) {
      await this.remove(oldestUrl)
    }
  }
  
  /**
   * 移除缓存项
   * @param url 图片URL
   */
  private async remove(url: string): Promise<void> {
    const cacheItem = this.cache.get(url)
    if (!cacheItem) {
      return
    }
    
    try {
      // 从IndexedDB删除
      if (this.db) {
        await new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction(['images'], 'readwrite')
          const store = transaction.objectStore('images')
          const request = store.delete(url)
          
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      }
      
      // 从内存缓存删除
      this.cache.delete(url)
      this.currentSize -= cacheItem.size
      
      // 保存缓存索引
      this.saveCacheIndex()
      
    } catch (error) {
      console.error(`删除缓存项失败: ${url}`, error)
    }
  }
  
  /**
   * 检查缓存项是否过期
   */
  private isExpired(cacheItem: CacheItem): boolean {
    const now = Date.now()
    return (now - cacheItem.timestamp) > this.config.expireTime
  }
  
  /**
   * 清除所有缓存
   */
  public async clear(): Promise<void> {
    try {
      // 清除IndexedDB
      if (this.db) {
        await new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction(['images'], 'readwrite')
          const store = transaction.objectStore('images')
          const request = store.clear()
          
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      }
      
      // 清除内存缓存
      this.cache.clear()
      this.currentSize = 0
      
      // 清除缓存索引
      localStorage.removeItem(STORAGE_KEYS.CACHE_INDEX)
      
    } catch (error) {
      console.error('清除缓存失败:', error)
      throw error
    }
  }
  
  /**
   * 获取缓存大小信息
   */
  public getCacheSize(): {
    currentSize: number
    maxSize: number
    itemCount: number
    maxItems: number
    usage: number
  } {
    return {
      currentSize: this.currentSize,
      maxSize: this.config.maxSize,
      itemCount: this.cache.size,
      maxItems: this.config.maxItems,
      usage: this.currentSize / this.config.maxSize
    }
  }
  
  /**
   * 获取缓存统计信息
   */
  public getStats(): {
    totalItems: number
    totalSize: number
    averageSize: number
    hitRate: number
    oldestItem: number
    newestItem: number
  } {
    const items = Array.from(this.cache.values())
    
    if (items.length === 0) {
      return {
        totalItems: 0,
        totalSize: 0,
        averageSize: 0,
        hitRate: 0,
        oldestItem: 0,
        newestItem: 0
      }
    }
    
    const totalAccess = items.reduce((sum, item) => sum + item.accessCount, 0)
    const totalSize = items.reduce((sum, item) => sum + item.size, 0)
    const timestamps = items.map(item => item.timestamp)
    
    return {
      totalItems: items.length,
      totalSize,
      averageSize: totalSize / items.length,
      hitRate: totalAccess / items.length,
      oldestItem: Math.min(...timestamps),
      newestItem: Math.max(...timestamps)
    }
  }
  
  /**
   * 清理过期缓存
   */
  public async cleanupExpired(): Promise<number> {
    const expiredUrls: string[] = []
    
    for (const [url, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expiredUrls.push(url)
      }
    }
    
    for (const url of expiredUrls) {
      await this.remove(url)
    }
    
    return expiredUrls.length
  }
  
  /**
   * 预热缓存（预加载常用图片）
   * @param urls 要预加载的图片URL数组
   * @param priority 优先级（高优先级的图片优先加载）
   */
  public async warmup(urls: string[], priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    const batchSize = priority === 'high' ? 5 : priority === 'normal' ? 3 : 1
    
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      await this.preload(batch)
      
      // 低优先级时添加延迟，避免阻塞主线程
      if (priority === 'low') {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }
  
  /**
   * 获取图片的Object URL（用于显示）
   * @param url 图片URL
   * @returns Promise<string | null>
   */
  public async getObjectURL(url: string): Promise<string | null> {
    const blob = await this.get(url)
    if (blob) {
      return URL.createObjectURL(blob)
    }
    return null
  }
  
  /**
   * 释放Object URL
   * @param objectURL Object URL
   */
  public revokeObjectURL(objectURL: string): void {
    URL.revokeObjectURL(objectURL)
  }
}