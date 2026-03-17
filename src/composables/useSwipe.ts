/**
 * 滑动手势Hook - uni-app版本
 * 处理触摸事件，识别滑动方向和距离
 */

import { ref, reactive, Ref } from 'vue'
import { SwipeDirection } from '@/types'
import type { SwipeGestureData } from '@/types'

/**
 * 滑动配置选项
 */
export interface SwipeOptions {
  /** 滑动阈值（像素） */
  threshold?: number
  /** 速度阈值 */
  velocityThreshold?: number
  /** 是否阻止默认行为 */
  preventDefault?: boolean
}

/**
 * 滑动状态
 */
interface SwipeState {
  /** 是否正在滑动 */
  isSwiping: boolean
  /** 滑动开始位置 */
  startX: number
  startY: number
  /** 当前位置 */
  currentX: number
  currentY: number
  /** 滑动开始时间 */
  startTime: number
  /** 滑动距离 */
  deltaX: number
  deltaY: number
  /** 滑动方向 */
  direction: SwipeDirection | null
}

/**
 * 滑动手势Hook
 */
export function useSwipe(
  target?: Ref<any> | any,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    velocityThreshold = 0.5,
    preventDefault = true
  } = options
  
  // 滑动状态
  const state = reactive<SwipeState>({
    isSwiping: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    deltaX: 0,
    deltaY: 0,
    direction: null
  })
  
  // 事件回调
  const swipeCallbacks = {
    onSwipeStart: null as ((data: SwipeGestureData) => void) | null,
    onSwipeMove: null as ((data: SwipeGestureData) => void) | null,
    onSwipeEnd: null as ((data: SwipeGestureData) => void) | null,
    onSwipe: null as ((direction: SwipeDirection, data: SwipeGestureData) => void) | null
  }
  
  /**
   * 获取触摸点坐标
   */
  const getEventCoordinates = (event: any): { x: number; y: number } => {
    if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0]
      return { x: touch.clientX, y: touch.clientY }
    }
    if (event.changedTouches && event.changedTouches.length > 0) {
      const touch = event.changedTouches[0]
      return { x: touch.clientX, y: touch.clientY }
    }
    return { x: event.clientX || 0, y: event.clientY || 0 }
  }
  
  /**
   * 计算滑动方向
   */
  const calculateDirection = (deltaX: number, deltaY: number): SwipeDirection | null => {
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    
    // 判断是否达到阈值
    if (Math.max(absDeltaX, absDeltaY) < threshold) {
      return null
    }
    
    // 判断主要滑动方向
    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? SwipeDirection.RIGHT : SwipeDirection.LEFT
    } else {
      return deltaY > 0 ? SwipeDirection.DOWN : SwipeDirection.UP
    }
  }
  
  /**
   * 计算滑动速度
   */
  const calculateVelocity = (distance: number, time: number): number => {
    return time > 0 ? distance / time : 0
  }
  
  /**
   * 创建滑动数据对象
   */
  const createSwipeData = (): SwipeGestureData => {
    const distance = Math.sqrt(state.deltaX ** 2 + state.deltaY ** 2)
    const duration = Date.now() - state.startTime
    const velocity = calculateVelocity(distance, duration)
    
    return {
      direction: state.direction!,
      distance,
      velocity,
      duration,
      startPosition: { x: state.startX, y: state.startY },
      endPosition: { x: state.currentX, y: state.currentY }
    }
  }
  
  /**
   * 处理滑动开始
   */
  const handleStart = (event: any) => {
    if (preventDefault) {
      event.preventDefault && event.preventDefault()
    }
    
    const { x, y } = getEventCoordinates(event)
    
    state.isSwiping = true
    state.startX = x
    state.startY = y
    state.currentX = x
    state.currentY = y
    state.startTime = Date.now()
    state.deltaX = 0
    state.deltaY = 0
    state.direction = null
    
    // 触发开始回调
    if (swipeCallbacks.onSwipeStart) {
      const data = createSwipeData()
      swipeCallbacks.onSwipeStart(data)
    }
  }
  
  /**
   * 处理滑动移动
   */
  const handleMove = (event: any) => {
    if (!state.isSwiping) return
    
    if (preventDefault) {
      event.preventDefault && event.preventDefault()
    }
    
    const { x, y } = getEventCoordinates(event)
    
    state.currentX = x
    state.currentY = y
    state.deltaX = x - state.startX
    state.deltaY = y - state.startY
    state.direction = calculateDirection(state.deltaX, state.deltaY)
    
    // 触发移动回调
    if (swipeCallbacks.onSwipeMove) {
      const data = createSwipeData()
      swipeCallbacks.onSwipeMove(data)
    }
  }
  
  /**
   * 处理滑动结束
   */
  const handleEnd = (event: any) => {
    if (!state.isSwiping) return
    
    if (preventDefault) {
      event.preventDefault && event.preventDefault()
    }
    
    const { x, y } = getEventCoordinates(event)
    
    state.currentX = x
    state.currentY = y
    state.deltaX = x - state.startX
    state.deltaY = y - state.startY
    
    const finalDirection = calculateDirection(state.deltaX, state.deltaY)
    const distance = Math.sqrt(state.deltaX ** 2 + state.deltaY ** 2)
    const duration = Date.now() - state.startTime
    const velocity = calculateVelocity(distance, duration)
    
    // 检查是否满足滑动条件
    const isValidSwipe = finalDirection !== null && 
                        (distance >= threshold || velocity >= velocityThreshold)
    
    if (isValidSwipe) {
      state.direction = finalDirection
      const data = createSwipeData()
      
      // 触发滑动回调
      if (swipeCallbacks.onSwipe) {
        swipeCallbacks.onSwipe(finalDirection!, data)
      }
    }
    
    // 触发结束回调
    if (swipeCallbacks.onSwipeEnd) {
      const data = createSwipeData()
      swipeCallbacks.onSwipeEnd(data)
    }
    
    // 重置状态
    state.isSwiping = false
    state.direction = null
  }
  
  // 返回Hook接口
  return {
    // 状态
    isSwiping: ref(state.isSwiping),
    direction: ref(state.direction),
    deltaX: ref(state.deltaX),
    deltaY: ref(state.deltaY),
    
    // 事件处理器设置
    onSwipeStart: (callback: (data: SwipeGestureData) => void) => {
      swipeCallbacks.onSwipeStart = callback
    },
    onSwipeMove: (callback: (data: SwipeGestureData) => void) => {
      swipeCallbacks.onSwipeMove = callback
    },
    onSwipeEnd: (callback: (data: SwipeGestureData) => void) => {
      swipeCallbacks.onSwipeEnd = callback
    },
    onSwipe: (callback: (direction: SwipeDirection, data: SwipeGestureData) => void) => {
      swipeCallbacks.onSwipe = callback
    },
    
    // 事件处理器（用于模板绑定）
    handleStart,
    handleMove,
    handleEnd,
    
    // 配置信息
    config: {
      threshold,
      velocityThreshold,
      preventDefault
    }
  }
}