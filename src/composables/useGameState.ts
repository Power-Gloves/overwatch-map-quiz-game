/**
 * 游戏状态管理Hook
 * 使用useReducer管理游戏状态，集成题库和存储服务
 */

import { ref, computed, reactive, readonly } from 'vue'
import type { 
  GameState, 
  Question, 
  AnswerResult, 
  GameSession,
  MapData,
  GameMode
} from '@/types'
import { GameStatus, GameMode as GameModeEnum } from '@/types'
import { QuestionPool } from '@/services/QuestionPool'
import { StorageService } from '@/services/StorageService'

/**
 * 游戏动作类型
 */
type GameAction = 
  | { type: 'SHOW_MODE_SELECT' }
  | { type: 'START_GAME'; payload: { mapData: MapData[]; mode: GameMode; targetQuestions?: number } }
  | { type: 'LOAD_QUESTION'; payload: { question: Question } }
  | { type: 'ANSWER_QUESTION'; payload: { userAnswer: string; isCorrect: boolean; timeSpent: number } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'EXIT_GAME' }
  | { type: 'SET_ERROR'; payload: { error: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }

/**
 * 游戏状态Reducer
 */
function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SHOW_MODE_SELECT':
      return {
        ...state,
        status: GameStatus.MODE_SELECT,
        error: null
      }
    
    case 'START_GAME':
      const { mapData, mode, targetQuestions } = action.payload
      return {
        ...state,
        status: GameStatus.LOADING,
        mode,
        totalAnswered: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracy: 0,
        answerHistory: [],
        startTime: Date.now(),
        endTime: null,
        error: null,
        challenge: mode === GameModeEnum.CHALLENGE ? {
          targetQuestions: targetQuestions || 20,
          passAccuracy: 70, // 70%通关
          isPassed: false
        } : undefined
      }
    
    case 'LOAD_QUESTION':
      return {
        ...state,
        status: GameStatus.PLAYING,
        currentQuestion: action.payload.question,
        error: null
      }
    
    case 'ANSWER_QUESTION':
      const { userAnswer, isCorrect, timeSpent } = action.payload
      const newAnswerResult: AnswerResult = {
        isCorrect,
        userAnswer,
        correctAnswer: state.currentQuestion?.correctAnswer || '',
        mapName: state.currentQuestion?.mapData.name || '',
        timeSpent,
        timestamp: Date.now()
      }
      
      const newTotalAnswered = state.totalAnswered + 1
      const newCorrectCount = state.correctCount + (isCorrect ? 1 : 0)
      const newIncorrectCount = state.incorrectCount + (isCorrect ? 0 : 1)
      
      return {
        ...state,
        totalAnswered: newTotalAnswered,
        correctCount: newCorrectCount,
        incorrectCount: newIncorrectCount,
        accuracy: (newCorrectCount / newTotalAnswered) * 100,
        answerHistory: [...state.answerHistory, newAnswerResult]
      }
    
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: state.nextQuestion,
        nextQuestion: null
      }
    
    case 'FINISH_GAME':
      const newState = {
        ...state,
        status: GameStatus.FINISHED,
        endTime: Date.now(),
        currentQuestion: null,
        nextQuestion: null
      }
      
      // 检查挑战模式通关条件
      if (state.mode === GameModeEnum.CHALLENGE && state.challenge) {
        newState.challenge = {
          ...state.challenge,
          isPassed: state.accuracy >= state.challenge.passAccuracy
        }
      }
      
      return newState
    
    case 'RESTART_GAME':
      return {
        ...state,
        status: GameStatus.IDLE,
        currentQuestion: null,
        nextQuestion: null,
        totalAnswered: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracy: 0,
        answerHistory: [],
        startTime: null,
        endTime: null,
        error: null,
        challenge: undefined
      }
    
    case 'EXIT_GAME':
      return {
        ...state,
        status: GameStatus.IDLE,
        currentQuestion: null,
        nextQuestion: null,
        error: null
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        status: GameStatus.ERROR,
        error: action.payload.error
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        status: action.payload.loading ? GameStatus.LOADING : state.status
      }
    
    default:
      return state
  }
}

/**
 * 初始游戏状态
 */
const initialGameState: GameState = {
  status: GameStatus.IDLE,
  mode: GameModeEnum.ENDLESS, // 默认无尽模式
  currentQuestion: null,
  nextQuestion: null,
  totalAnswered: 0,
  correctCount: 0,
  incorrectCount: 0,
  accuracy: 0,
  answerHistory: [],
  startTime: null,
  endTime: null,
  error: null
}

/**
 * 游戏状态管理Hook
 */
export function useGameState() {
  // 状态管理
  const state = reactive<GameState>({ ...initialGameState })
  
  // 服务实例
  let questionPool: QuestionPool | null = null
  const storageService = StorageService.getInstance()
  
  // 当前题目开始时间（用于计算答题时间）
  const questionStartTime = ref<number>(0)
  
  /**
   * 状态派发器
   */
  const dispatch = (action: GameAction) => {
    const newState = gameStateReducer(state, action)
    Object.assign(state, newState)
  }
  
  /**
   * 计算属性
   */
  const isPlaying = computed(() => state.status === GameStatus.PLAYING)
  const isFinished = computed(() => state.status === GameStatus.FINISHED)
  const isLoading = computed(() => state.status === GameStatus.LOADING)
  const hasError = computed(() => state.status === GameStatus.ERROR)
  const canAnswer = computed(() => isPlaying.value && state.currentQuestion !== null)
  
  /**
   * 显示模式选择页面
   */
  const showModeSelect = () => {
    dispatch({ type: 'SHOW_MODE_SELECT' })
  }
  
  /**
   * 开始游戏
   */
  const startGame = async (mapData: MapData[], mode: GameMode = GameModeEnum.ENDLESS, targetQuestions?: number) => {
    try {
      dispatch({ type: 'START_GAME', payload: { mapData, mode, targetQuestions } })
      
      // 初始化题库
      questionPool = new QuestionPool(mapData)
      
      // 加载第一个题目
      await loadNextQuestion()
      
    } catch (error) {
      console.error('开始游戏失败:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: '游戏初始化失败，请重试' } 
      })
    }
  }
  
  /**
   * 预加载图片到浏览器缓存
   */
  const preloadImage = (url: string) => {
    const img = new Image()
    img.src = url
  }

  /**
   * 加载下一个题目
   */
  const loadNextQuestion = async () => {
    try {
      if (!questionPool) {
        throw new Error('题库未初始化')
      }
      
      const question = questionPool.getNextQuestion()
      dispatch({ type: 'LOAD_QUESTION', payload: { question } })
      
      // 记录题目开始时间
      questionStartTime.value = Date.now()
      
      // 预加载下一个题目及其图片
      try {
        const nextQuestion = questionPool.getNextQuestion()
        state.nextQuestion = nextQuestion
        
        // 主动预加载下一题的图片到浏览器缓存
        if (nextQuestion?.screenshot?.url) {
          preloadImage(nextQuestion.screenshot.url)
        }
      } catch (error) {
        // 没有更多题目了，这是正常情况
      }
      
    } catch (error) {
      console.error('加载题目失败:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: '加载题目失败，请重试' } 
      })
    }
  }
  
  /**
   * 检查游戏结束条件
   */
  const checkGameFinishCondition = (): boolean => {
    // 挑战模式：达到目标题目数
    if (state.mode === GameModeEnum.CHALLENGE && state.challenge) {
      return state.totalAnswered >= state.challenge.targetQuestions
    }
    
    // 练习模式：达到10题
    if (state.mode === GameModeEnum.PRACTICE) {
      return state.totalAnswered >= 10
    }
    
    // 无尽模式：没有更多题目时结束（实际上应该很少发生）
    if (state.mode === GameModeEnum.ENDLESS) {
      return !state.nextQuestion && (!questionPool || !questionPool.hasMoreQuestions())
    }
    
    return false
  }
  
  /**
   * 回答题目
   */
  const answerQuestion = async (userAnswer: string) => {
    if (!canAnswer.value || !state.currentQuestion) {
      return
    }
    
    try {
      const currentQuestion = state.currentQuestion
      const isCorrect = userAnswer === currentQuestion.correctAnswer
      const timeSpent = Date.now() - questionStartTime.value
      
      // 更新游戏状态
      dispatch({ 
        type: 'ANSWER_QUESTION', 
        payload: { userAnswer, isCorrect, timeSpent } 
      })
      
      // 保存当前会话到本地存储
      await saveCurrentSession()
      
      // 检查游戏结束条件
      const shouldFinish = checkGameFinishCondition()
      
      if (shouldFinish) {
        // 游戏结束
        finishGame()
      } else {
        // 继续下一题
        dispatch({ type: 'NEXT_QUESTION' })
        if (!state.currentQuestion) {
          loadNextQuestion()
        }
      }
      
    } catch (error) {
      console.error('回答题目失败:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: '提交答案失败，请重试' } 
      })
    }
  }
  
  /**
   * 结束游戏
   */
  const finishGame = async () => {
    try {
      dispatch({ type: 'FINISH_GAME' })
      
      // 创建游戏会话记录
      const session = createGameSession()
      
      // 更新统计数据
      storageService.updateStatistics(session)
      
      // 清除当前会话
      storageService.clearCurrentSession()
      
    } catch (error) {
      console.error('结束游戏失败:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { error: '保存游戏记录失败' } 
      })
    }
  }
  
  /**
   * 重新开始游戏
   */
  const restartGame = () => {
    dispatch({ type: 'RESTART_GAME' })
    
    // 重置题库
    if (questionPool) {
      questionPool.reset()
    }
    
    // 清除当前会话
    storageService.clearCurrentSession()
  }
  
  /**
   * 退出游戏
   */
  const exitGame = () => {
    // 必须在 dispatch 之前检查状态，因为 dispatch 会将状态改为 IDLE
    const shouldSave = state.status === GameStatus.PLAYING && state.totalAnswered > 0
    
    dispatch({ type: 'EXIT_GAME' })
    
    // 如果游戏进行中，保存当前会话
    if (shouldSave) {
      saveCurrentSession()
    }
  }
  
  /**
   * 暂停游戏
   */
  const pauseGame = () => {
    if (state.status === GameStatus.PLAYING) {
      state.status = GameStatus.PAUSED
      saveCurrentSession()
    }
  }
  
  /**
   * 恢复游戏
   */
  const resumeGame = () => {
    if (state.status === GameStatus.PAUSED) {
      state.status = GameStatus.PLAYING
      questionStartTime.value = Date.now() // 重置题目开始时间
    }
  }
  
  /**
   * 创建游戏会话记录
   */
  const createGameSession = (): GameSession => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    const baseSession: GameSession = {
      id: sessionId,
      mode: state.mode,
      startTime: state.startTime || Date.now(),
      endTime: state.endTime || Date.now(),
      totalQuestions: state.totalAnswered,
      correctAnswers: state.correctCount,
      accuracy: state.accuracy,
      averageTime: state.answerHistory.length > 0 
        ? state.answerHistory.reduce((sum: number, answer: AnswerResult) => sum + answer.timeSpent, 0) / state.answerHistory.length
        : 0,
      answers: [...state.answerHistory]
    }
    
    // 添加挑战模式结果
    if (state.mode === GameModeEnum.CHALLENGE && state.challenge) {
      baseSession.challengeResult = {
        isPassed: state.challenge.isPassed,
        passAccuracy: state.challenge.passAccuracy,
        stars: calculateChallengeStars(state.accuracy)
      }
    }
    
    return baseSession
  }
  
  /**
   * 计算挑战模式星级
   */
  const calculateChallengeStars = (accuracy: number): number => {
    if (accuracy >= 90) return 3  // 三星：90%+
    if (accuracy >= 80) return 2  // 二星：80%+
    if (accuracy >= 70) return 1  // 一星：70%+
    return 0 // 未通关
  }
  
  /**
   * 保存当前会话
   */
  const saveCurrentSession = async () => {
    try {
      const session = createGameSession()
      storageService.saveSession(session)
    } catch (error) {
      console.error('保存会话失败:', error)
    }
  }
  
  /**
   * 恢复会话
   */
  const restoreSession = async (): Promise<boolean> => {
    try {
      const session = storageService.loadCurrentSession()
      if (!session) {
        return false
      }
      
      // 恢复游戏状态
      Object.assign(state, {
        status: GameStatus.PAUSED,
        totalAnswered: session.totalQuestions,
        correctCount: session.correctAnswers,
        incorrectCount: session.totalQuestions - session.correctAnswers,
        accuracy: session.accuracy,
        answerHistory: session.answers,
        startTime: session.startTime,
        endTime: null
      })
      
      return true
    } catch (error) {
      console.error('恢复会话失败:', error)
      return false
    }
  }
  
  /**
   * 获取游戏统计
   */
  const getGameStats = () => {
    return {
      currentSession: {
        totalAnswered: state.totalAnswered,
        correctCount: state.correctCount,
        incorrectCount: state.incorrectCount,
        accuracy: state.accuracy,
        duration: state.startTime ? Date.now() - state.startTime : 0
      },
      questionPool: questionPool ? questionPool.getStats() : null
    }
  }
  
  /**
   * 清除错误
   */
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }
  
  /**
   * 获取当前题目的提示（开发模式）
   */
  const getHint = () => {
    // 在开发环境下提供提示信息
    if (state.currentQuestion) {
      return {
        correctAnswer: state.currentQuestion.correctAnswer,
        mapType: state.currentQuestion.mapData.type,
        allOptions: state.currentQuestion.allOptions
      }
    }
    return null
  }
  
  // 返回Hook接口
  return {
    // 状态
    state: readonly(state),
    isPlaying,
    isFinished,
    isLoading,
    hasError,
    canAnswer,
    
    // 动作
    startGame,
    showModeSelect,
    answerQuestion,
    restartGame,
    exitGame,
    pauseGame,
    resumeGame,
    clearError,
    
    // 工具方法
    getGameStats,
    restoreSession,
    getHint,
    
    // 内部方法（用于测试）
    _internal: {
      dispatch,
      loadNextQuestion,
      finishGame,
      createGameSession,
      saveCurrentSession
    }
  }
}