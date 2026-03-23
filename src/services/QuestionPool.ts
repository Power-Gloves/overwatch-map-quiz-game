/**
 * 题库管理服务
 * 负责管理地图数据、生成题目、随机化答案选项
 */

import type { 
  MapData, 
  Question, 
  Screenshot 
} from '@/types'

/**
 * 题库管理类
 */
export class QuestionPool {
  private maps: MapData[] = []
  private usedQuestions: Set<string> = new Set()
  private questionHistory: Question[] = []
  
  /**
   * 构造函数
   * @param mapData 地图数据配置
   */
  constructor(mapData: MapData[] = []) {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    
    // 给所有截图URL加上base前缀（适配GitHub Pages等子路径部署）
    this.maps = mapData.map(map => ({
      ...map,
      screenshots: map.screenshots.map(s => ({
        ...s,
        url: s.url.startsWith('/') ? `${base}${s.url}` : s.url
      }))
    }))
    
    this.validateMapData()
  }
  
  /**
   * 验证地图数据的完整性
   */
  private validateMapData(): void {
    if (this.maps.length === 0) {
      throw new Error('地图数据不能为空')
    }
    
    for (const map of this.maps) {
      if (!map.id || !map.name || !map.screenshots) {
        throw new Error(`地图数据不完整: ${map.id || '未知地图'}`)
      }
      
      if (map.screenshots.length < 10) {
        console.warn(`地图 ${map.name} 的截图数量过少 (建议至少10张): ${map.screenshots.length}张`)
      } else if (map.screenshots.length > 50) {
        console.warn(`地图 ${map.name} 的截图数量过多 (建议不超过50张): ${map.screenshots.length}张`)
      }
      
      // 验证截图数据完整性
      for (const screenshot of map.screenshots) {
        if (!screenshot.filename || !screenshot.url) {
          throw new Error(`地图 ${map.name} 的截图数据不完整`)
        }
      }
    }
  }
  
  /**
   * 获取下一个题目
   * @returns 随机生成的题目
   */
  public getNextQuestion(): Question {
    if (this.maps.length === 0) {
      throw new Error('没有可用的地图数据')
    }
    
    // 随机选择地图
    const randomMap = this.getRandomMap()
    
    // 随机选择该地图的一张截图
    const randomScreenshot = this.getRandomScreenshot(randomMap)
    
    // 生成题目ID
    const questionId = this.generateQuestionId(randomMap, randomScreenshot)
    
    // 生成错误答案选项
    const wrongAnswers = this.generateWrongAnswers(randomMap.name)
    
    // 随机化所有答案选项
    const allOptions = this.shuffleAnswers(randomMap.name, wrongAnswers)
    
    const question: Question = {
      id: questionId,
      screenshot: randomScreenshot,
      correctAnswer: randomMap.name,
      wrongAnswers,
      allOptions,
      mapData: randomMap
    }
    
    // 记录已使用的题目
    this.usedQuestions.add(questionId)
    this.questionHistory.push(question)
    
    return question
  }
  
  /**
   * 批量获取题目
   * @param count 题目数量
   * @returns 题目数组
   */
  public getQuestions(count: number): Question[] {
    if (count <= 0) {
      throw new Error('题目数量必须大于0')
    }
    
    const questions: Question[] = []
    
    for (let i = 0; i < count; i++) {
      try {
        const question = this.getNextQuestion()
        questions.push(question)
      } catch (error) {
        console.warn(`生成第 ${i + 1} 个题目时出错:`, error)
        break
      }
    }
    
    return questions
  }
  
  /**
   * 重置题库状态
   */
  public reset(): void {
    this.usedQuestions.clear()
    this.questionHistory = []
  }
  
  /**
   * 获取所有地图名称
   * @returns 地图名称数组
   */
  public getAllMapNames(): string[] {
    return this.maps.map(map => map.name)
  }
  
  /**
   * 获取题库统计信息
   */
  public getStats() {
    return {
      totalMaps: this.maps.length,
      totalScreenshots: this.maps.reduce((sum, map) => sum + map.screenshots.length, 0),
      usedQuestions: this.usedQuestions.size,
      questionHistory: this.questionHistory.length,
      averageScreenshotsPerMap: Math.round(
        this.maps.reduce((sum, map) => sum + map.screenshots.length, 0) / this.maps.length
      )
    }
  }
  
  /**
   * 随机选择一个地图
   */
  private getRandomMap(): MapData {
    const randomIndex = Math.floor(Math.random() * this.maps.length)
    return this.maps[randomIndex]
  }
  
  /**
   * 随机选择地图的一张截图
   */
  private getRandomScreenshot(map: MapData): Screenshot {
    if (map.screenshots.length === 0) {
      throw new Error(`地图 ${map.name} 没有可用的截图`)
    }
    
    const randomIndex = Math.floor(Math.random() * map.screenshots.length)
    return map.screenshots[randomIndex]
  }
  
  /**
   * 生成题目ID
   */
  private generateQuestionId(map: MapData, screenshot: Screenshot): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${map.id}_${screenshot.filename}_${timestamp}_${random}`
  }
  
  /**
   * 生成错误答案选项
   * @param correctAnswer 正确答案
   * @returns 错误答案数组
   */
  private generateWrongAnswers(correctAnswer: string): string[] {
    const allMapNames = this.getAllMapNames()
    const wrongAnswers = allMapNames.filter(name => name !== correctAnswer)
    
    if (wrongAnswers.length < 3) {
      throw new Error('可用的错误答案选项不足（至少需要3个）')
    }
    
    // 随机选择3个错误答案
    const shuffled = this.shuffleArray([...wrongAnswers])
    return shuffled.slice(0, 3)
  }
  
  /**
   * 随机化答案选项顺序
   * @param correctAnswer 正确答案
   * @param wrongAnswers 错误答案数组
   * @returns 随机排序的所有答案选项
   */
  private shuffleAnswers(correctAnswer: string, wrongAnswers: string[]): string[] {
    const allAnswers = [correctAnswer, ...wrongAnswers]
    return this.shuffleArray(allAnswers)
  }
  
  /**
   * 数组随机排序（Fisher-Yates算法）
   * @param array 要排序的数组
   * @returns 随机排序后的新数组
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array]
    
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    
    return result
  }
  
  /**
   * 检查是否还有可用的题目组合
   */
  public hasMoreQuestions(): boolean {
    const totalPossibleQuestions = this.maps.reduce(
      (sum, map) => sum + map.screenshots.length, 
      0
    )
    return this.usedQuestions.size < totalPossibleQuestions
  }
  
  /**
   * 获取指定地图的题目
   * @param mapName 地图名称
   * @returns 该地图的随机题目
   */
  public getQuestionByMap(mapName: string): Question {
    const map = this.maps.find(m => m.name === mapName)
    if (!map) {
      throw new Error(`找不到地图: ${mapName}`)
    }
    
    const randomScreenshot = this.getRandomScreenshot(map)
    const questionId = this.generateQuestionId(map, randomScreenshot)
    const wrongAnswers = this.generateWrongAnswers(map.name)
    const allOptions = this.shuffleAnswers(map.name, wrongAnswers)
    
    return {
      id: questionId,
      screenshot: randomScreenshot,
      correctAnswer: map.name,
      wrongAnswers,
      allOptions,
      mapData: map
    }
  }
  
  /**
   * 更新地图数据
   * @param newMapData 新的地图数据
   */
  public updateMapData(newMapData: MapData[]): void {
    this.maps = [...newMapData]
    this.validateMapData()
    this.reset() // 重置状态，因为地图数据已更改
  }
  
  /**
   * 获取题目历史记录
   */
  public getQuestionHistory(): Question[] {
    return [...this.questionHistory]
  }
  
  /**
   * 清除题目历史记录
   */
  public clearHistory(): void {
    this.questionHistory = []
  }
}