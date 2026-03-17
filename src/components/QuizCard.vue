<template>
  <div 
    class="quiz-card nft-card"
    :class="{ 
      'is-swiping': isSwiping,
      'is-loading': isImageLoading,
      'swipe-left': swipeDirection === 'left',
      'swipe-right': swipeDirection === 'right'
    }"
    :style="cardStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
  >
    <!-- 加载状态 -->
    <div v-if="isImageLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>
    
    <!-- 卡片内容 -->
    <div v-else class="card-content">
      <!-- 地图截图 -->
      <div class="image-container">
        <img 
          :src="imageUrl" 
          class="map-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        
        <!-- 图片遮罩渐变 -->
        <div class="image-overlay"></div>
        
        <!-- 滑动提示 -->
        <div class="swipe-hints">
          <div class="hint-left">
            <span class="hint-icon">✕</span>
            <span class="hint-text">错误</span>
          </div>
          <div class="hint-right">
            <span class="hint-icon">✓</span>
            <span class="hint-text">正确</span>
          </div>
        </div>
      </div>
      
      <!-- 答案选项 -->
      <div class="options-container">
        <div class="question-text">
          这是哪个地图？
        </div>
        
        <div class="options-grid">
          <div 
            v-for="(option, index) in question.allOptions" 
            :key="index"
            class="option-item"
            :class="{ 'is-correct': option === question.correctAnswer }"
            @click="handleOptionClick(option)"
          >
            <span class="option-text">{{ option }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 答案反馈 -->
    <div 
      v-if="showFeedback" 
      class="feedback-overlay"
      :class="{ 'correct': lastAnswerCorrect, 'incorrect': !lastAnswerCorrect }"
    >
      <div class="feedback-content">
        <span class="feedback-icon">{{ lastAnswerCorrect ? '✓' : '✕' }}</span>
        <span class="feedback-text">{{ lastAnswerCorrect ? '正确！' : '错误！' }}</span>
        <span class="feedback-answer">正确答案：{{ question.correctAnswer }}</span>
      </div>
    </div>
    
    <!-- NFT光效 -->
    <div class="nft-glow" :class="{ active: isHovered }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useSwipe } from '@/composables/useSwipe'
import type { Question, SwipeDirection } from '@/types'

/**
 * 组件Props
 */
interface Props {
  /** 题目数据 */
  question: Question
  /** 是否禁用交互 */
  disabled?: boolean
  /** 是否显示答案（调试模式） */
  showAnswer?: boolean
}

/**
 * 组件Emits
 */
interface Emits {
  (e: 'swipe', direction: SwipeDirection, answer: string): void
  (e: 'answer', answer: string): void
  (e: 'imageLoad'): void
  (e: 'imageError', error: any): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showAnswer: false
})

const emit = defineEmits<Emits>()

// 组件状态
const cardRef = ref<HTMLElement>()
const isImageLoading = ref(true)
const imageUrl = ref('')
const showFeedback = ref(false)
const lastAnswerCorrect = ref(false)
const isHovered = ref(false)

// 滑动状态
const swipeDirection = ref<SwipeDirection | null>(null)
const cardTransform = ref({ x: 0, y: 0, rotation: 0, scale: 1 })

// 使用滑动Hook
const {
  isSwiping,
  onSwipe,
  onSwipeMove,
  onSwipeEnd
} = useSwipe(cardRef, {
  threshold: 80,
  velocityThreshold: 0.3,
  preventDefault: true
})

/**
 * 计算卡片样式
 */
const cardStyle = computed(() => {
  const { x, y, rotation, scale } = cardTransform.value
  
  return {
    transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`,
    opacity: Math.max(0.3, 1 - Math.abs(x) / 300),
    zIndex: isSwiping.value ? 10 : 1
  }
})

/**
 * 加载图片
 */
const loadImage = async (url: string) => {
  isImageLoading.value = true
  
  try {
    // 验证URL格式
    if (!url || typeof url !== 'string') {
      throw new Error('无效的图片URL')
    }
    
    // 这里可以集成图片缓存服务
    imageUrl.value = url
  } catch (error) {
    console.error('图片加载失败:', error)
    // 使用占位图片
    imageUrl.value = '/static/placeholder-map.jpg'
    emit('imageError', error as Event)
  }
}

/**
 * 监听题目变化，加载新图片
 */
watch(() => props.question, (newQuestion) => {
  if (newQuestion) {
    loadImage(newQuestion.screenshot.url)
  }
}, { immediate: true })

/**
 * 图片加载完成
 */
const handleImageLoad = () => {
  isImageLoading.value = false
  emit('imageLoad')
}

/**
 * 图片加载错误
 */
const handleImageError = (error: any) => {
  console.error('图片加载失败:', error)
  isImageLoading.value = false
  
  // 尝试使用备用图片或占位图
  if (imageUrl.value !== '/static/placeholder-map.jpg') {
    console.log('尝试使用占位图片')
    imageUrl.value = '/static/placeholder-map.jpg'
    return
  }
  
  emit('imageError', error)
}

/**
 * 处理选项点击
 */
const handleOptionClick = (option: string) => {
  if (props.disabled || isSwiping.value) return
  
  emit('answer', option)
  showAnswerFeedback(option === props.question.correctAnswer)
}

/**
 * 显示答案反馈
 */
const showAnswerFeedback = (isCorrect: boolean) => {
  lastAnswerCorrect.value = isCorrect
  showFeedback.value = true
  
  // 1.5秒后隐藏反馈
  setTimeout(() => {
    showFeedback.value = false
  }, 1500)
}

/**
 * 设置滑动回调
 */
onSwipe((direction, data) => {
  if (props.disabled) return
  
  swipeDirection.value = direction
  
  // 根据滑动方向确定答案
  let selectedAnswer = ''
  if (direction === 'right') {
    // 右滑表示选择正确答案
    selectedAnswer = props.question.correctAnswer
  } else if (direction === 'left') {
    // 左滑表示选择错误答案（随机选择一个错误答案）
    const wrongAnswers = props.question.wrongAnswers
    selectedAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)]
  }
  
  if (selectedAnswer) {
    emit('swipe', direction, selectedAnswer)
    emit('answer', selectedAnswer)
    
    // 显示反馈
    showAnswerFeedback(selectedAnswer === props.question.correctAnswer)
    
    // 卡片飞出动画
    animateCardExit(direction)
  }
})

/**
 * 滑动移动时的视觉反馈
 */
onSwipeMove((data) => {
  if (props.disabled) return
  
  const { direction, distance } = data
  const maxDistance = 200
  const progress = Math.min(distance / maxDistance, 1)
  
  // 更新卡片变换
  if (direction === 'left' || direction === 'right') {
    const x = direction === 'right' ? distance : -distance
    cardTransform.value = {
      x: x * 0.8,
      y: 0,
      rotation: x * 0.1,
      scale: 1 - progress * 0.1
    }
    
    swipeDirection.value = direction
  }
})

/**
 * 滑动结束时重置卡片位置
 */
onSwipeEnd(() => {
  if (!swipeDirection.value) {
    // 没有触发滑动，重置卡片位置
    resetCardPosition()
  }
})

/**
 * 卡片退出动画
 */
const animateCardExit = (direction: SwipeDirection) => {
  const exitDistance = direction === 'right' ? 400 : -400
  
  cardTransform.value = {
    x: exitDistance,
    y: -50,
    rotation: exitDistance * 0.2,
    scale: 0.8
  }
  
  // 动画完成后重置
  setTimeout(() => {
    resetCardPosition()
    swipeDirection.value = null
  }, 300)
}

/**
 * 重置卡片位置
 */
const resetCardPosition = () => {
  cardTransform.value = { x: 0, y: 0, rotation: 0, scale: 1 }
}

/**
 * 触摸事件处理（移动端）
 */
const handleTouchStart = (event: any) => {
  if (props.disabled) return
  // 滑动Hook会处理这些事件
}

const handleTouchMove = (event: any) => {
  if (props.disabled) return
  // 滑动Hook会处理这些事件
}

const handleTouchEnd = (event: any) => {
  if (props.disabled) return
  // 滑动Hook会处理这些事件
}

/**
 * 鼠标事件处理（桌面端）
 */
const handleMouseDown = (event: any) => {
  if (props.disabled) return
  isHovered.value = true
}

const handleMouseMove = (event: any) => {
  if (props.disabled) return
  // 滑动Hook会处理这些事件
}

const handleMouseUp = (event: any) => {
  if (props.disabled) return
  isHovered.value = false
}

const handleMouseLeave = (event: any) => {
  isHovered.value = false
}

// 组件挂载时的初始化
onMounted(() => {
  // 可以在这里添加一些初始化逻辑
})

// 组件卸载时的清理
onUnmounted(() => {
  // 清理定时器等
})
</script>

<style lang="scss" scoped>
.quiz-card {
  position: relative;
  width: 320px;
  height: 480px;
  margin: 0 auto;
  cursor: grab;
  user-select: none;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              opacity 0.3s ease;
  
  &.is-swiping {
    cursor: grabbing;
    transition: none;
  }
  
  &.swipe-left {
    .hint-left {
      opacity: 1;
      transform: scale(1.1);
    }
  }
  
  &.swipe-right {
    .hint-right {
      opacity: 1;
      transform: scale(1.1);
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  border-radius: $card-radius;
  z-index: 10;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba($ow-primary, 0.3);
    border-top: 3px solid $ow-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: $spacing-md;
  }
  
  .loading-text {
    color: $ow-light;
    font-size: $font-size-sm;
  }
}

.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: $card-radius;
}

.image-container {
  position: relative;
  flex: 1;
  overflow: hidden;
  
  .map-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    pointer-events: none;
  }
}

.swipe-hints {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  pointer-events: none;
  
  .hint-left,
  .hint-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s ease;
    
    .hint-icon {
      font-size: 32px;
      margin-bottom: $spacing-xs;
    }
    
    .hint-text {
      font-size: $font-size-sm;
      font-weight: 600;
    }
  }
  
  .hint-left {
    color: #ff4757;
    text-shadow: 0 2px 4px rgba(255, 71, 87, 0.5);
  }
  
  .hint-right {
    color: #2ed573;
    text-shadow: 0 2px 4px rgba(46, 213, 115, 0.5);
  }
}

.options-container {
  padding: $spacing-lg;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  
  .question-text {
    text-align: center;
    font-size: $font-size-lg;
    font-weight: 600;
    color: $ow-light;
    margin-bottom: $spacing-md;
  }
  
  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-sm;
    
    .option-item {
      padding: $spacing-sm $spacing-md;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: $border-radius-md;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      .option-text {
        color: $ow-light;
        font-size: $font-size-sm;
        font-weight: 500;
      }
    }
  }
}

.feedback-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  border-radius: $card-radius;
  z-index: 20;
  animation: fadeIn 0.3s ease;
  
  &.correct {
    background: rgba(46, 213, 115, 0.9);
  }
  
  &.incorrect {
    background: rgba(255, 71, 87, 0.9);
  }
  
  .feedback-content {
    text-align: center;
    
    .feedback-icon {
      display: block;
      font-size: 64px;
      margin-bottom: $spacing-md;
      animation: bounceIn 0.5s ease;
    }
    
    .feedback-text {
      display: block;
      font-size: $font-size-xl;
      font-weight: 700;
      color: $ow-light;
      margin-bottom: $spacing-sm;
    }
    
    .feedback-answer {
      display: block;
      font-size: $font-size-md;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.nft-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    $ow-primary, 
    $ow-secondary, 
    $ow-accent, 
    $ow-primary);
  border-radius: $card-radius;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
  animation: nftGlow 3s ease-in-out infinite;
  
  &.active {
    opacity: 0.6;
  }
}

// 动画定义
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes nftGlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .quiz-card {
    width: 280px;
    height: 420px;
  }
  
  .options-container {
    padding: $spacing-md;
    
    .question-text {
      font-size: $font-size-md;
    }
    
    .options-grid {
      gap: $spacing-xs;
      
      .option-item {
        padding: $spacing-xs $spacing-sm;
        
        .option-text {
          font-size: $font-size-xs;
        }
      }
    }
  }
}
</style>