<template>
  <view 
    ref="containerRef"
    class="swipe-gesture-container"
    :class="{ 
      'is-swiping': isSwiping,
      'can-swipe': !disabled 
    }"
    :style="containerStyle"
  >
    <slot 
      :is-swiping="isSwiping"
      :direction="direction"
      :progress="swipeProgress"
      :delta-x="deltaX"
      :delta-y="deltaY"
    />
    
    <!-- 滑动指示器 -->
    <view v-if="showIndicators && !disabled" class="swipe-indicators">
      <view 
        class="indicator left"
        :class="{ active: direction === 'left' }"
        :style="{ opacity: direction === 'left' ? swipeProgress : 0 }"
      >
        <slot name="left-indicator">
          <text class="indicator-icon">←</text>
          <text class="indicator-text">{{ leftText }}</text>
        </slot>
      </view>
      
      <view 
        class="indicator right"
        :class="{ active: direction === 'right' }"
        :style="{ opacity: direction === 'right' ? swipeProgress : 0 }"
      >
        <slot name="right-indicator">
          <text class="indicator-icon">→</text>
          <text class="indicator-text">{{ rightText }}</text>
        </slot>
      </view>
    </view>
    
    <!-- 滑动轨迹可视化（调试模式） -->
    <view v-if="showDebug && isSwiping" class="debug-overlay">
      <text class="debug-info">
        方向: {{ direction || '无' }}
        距离: {{ Math.round(swipeDistance) }}px
        进度: {{ Math.round(swipeProgress * 100) }}%
        速度: {{ Math.round(swipeVelocity * 100) / 100 }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useSwipe } from '@/composables/useSwipe'
import type { SwipeDirection, SwipeGestureData } from '@/types'

/**
 * 组件Props
 */
interface Props {
  /** 是否禁用滑动 */
  disabled?: boolean
  /** 滑动阈值 */
  threshold?: number
  /** 速度阈值 */
  velocityThreshold?: number
  /** 是否显示滑动指示器 */
  showIndicators?: boolean
  /** 左滑指示文本 */
  leftText?: string
  /** 右滑指示文本 */
  rightText?: string
  /** 是否启用回弹动画 */
  enableSpring?: boolean
  /** 回弹强度 */
  springStrength?: number
  /** 是否显示调试信息 */
  showDebug?: boolean
  /** 是否阻止默认行为 */
  preventDefault?: boolean
  /** 最大滑动距离 */
  maxDistance?: number
}

/**
 * 组件Emits
 */
interface Emits {
  (e: 'swipe-start', data: SwipeGestureData): void
  (e: 'swipe-move', data: SwipeGestureData): void
  (e: 'swipe-end', data: SwipeGestureData): void
  (e: 'swipe', direction: SwipeDirection, data: SwipeGestureData): void
  (e: 'swipe-left', data: SwipeGestureData): void
  (e: 'swipe-right', data: SwipeGestureData): void
  (e: 'swipe-up', data: SwipeGestureData): void
  (e: 'swipe-down', data: SwipeGestureData): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  threshold: 50,
  velocityThreshold: 0.5,
  showIndicators: true,
  leftText: '左滑',
  rightText: '右滑',
  enableSpring: true,
  springStrength: 0.8,
  showDebug: false,
  preventDefault: true,
  maxDistance: 200
})

const emit = defineEmits<Emits>()

// 组件引用
const containerRef = ref<HTMLElement>()

// 滑动状态
const swipeTransform = ref({ x: 0, y: 0, rotation: 0, scale: 1 })
const swipeDistance = ref(0)
const swipeVelocity = ref(0)
const swipeProgress = ref(0)

// 使用滑动Hook
const {
  isSwiping,
  direction,
  deltaX,
  deltaY,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  onSwipe
} = useSwipe(containerRef, {
  threshold: props.threshold,
  velocityThreshold: props.velocityThreshold,
  preventDefault: props.preventDefault,
  enableMouse: true
})

/**
 * 计算容器样式
 */
const containerStyle = computed(() => {
  if (props.disabled) {
    return {}
  }
  
  const { x, y, rotation, scale } = swipeTransform.value
  const maxX = Math.min(Math.abs(x), props.maxDistance)
  const opacity = props.enableSpring ? 1 - (maxX / props.maxDistance) * 0.3 : 1
  
  return {
    transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`,
    opacity,
    transition: isSwiping.value ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
})

/**
 * 设置滑动开始回调
 */
onSwipeStart((data) => {
  if (props.disabled) return
  
  emit('swipe-start', data)
})

/**
 * 设置滑动移动回调
 */
onSwipeMove((data) => {
  if (props.disabled) return
  
  updateSwipeTransform(data)
  emit('swipe-move', data)
})

/**
 * 设置滑动结束回调
 */
onSwipeEnd((data) => {
  if (props.disabled) return
  
  // 如果没有触发滑动，执行回弹动画
  if (!direction.value && props.enableSpring) {
    springBack()
  }
  
  emit('swipe-end', data)
})

/**
 * 设置滑动回调
 */
onSwipe((swipeDirection, data) => {
  if (props.disabled) return
  
  // 执行滑动动画
  animateSwipeExit(swipeDirection, data)
  
  // 触发事件
  emit('swipe', swipeDirection, data)
  
  // 触发方向特定事件
  switch (swipeDirection) {
    case 'left':
      emit('swipe-left', data)
      break
    case 'right':
      emit('swipe-right', data)
      break
    case 'up':
      emit('swipe-up', data)
      break
    case 'down':
      emit('swipe-down', data)
      break
  }
})

/**
 * 更新滑动变换
 */
const updateSwipeTransform = (data: SwipeGestureData) => {
  const { direction: swipeDir, distance } = data
  
  // 限制最大滑动距离
  const clampedDistance = Math.min(distance, props.maxDistance)
  
  // 计算进度
  swipeProgress.value = Math.min(clampedDistance / props.threshold, 1)
  swipeDistance.value = distance
  swipeVelocity.value = data.velocity
  
  // 根据方向更新变换
  if (swipeDir === 'left' || swipeDir === 'right') {
    const x = swipeDir === 'right' ? clampedDistance : -clampedDistance
    const rotation = x * 0.1 // 轻微旋转效果
    const scale = 1 - (clampedDistance / props.maxDistance) * 0.1
    
    swipeTransform.value = {
      x: x * 0.8, // 减少移动距离，增加阻尼感
      y: 0,
      rotation,
      scale: Math.max(0.8, scale)
    }
  } else if (swipeDir === 'up' || swipeDir === 'down') {
    const y = swipeDir === 'down' ? clampedDistance : -clampedDistance
    const scale = 1 - (clampedDistance / props.maxDistance) * 0.05
    
    swipeTransform.value = {
      x: 0,
      y: y * 0.5,
      rotation: 0,
      scale: Math.max(0.9, scale)
    }
  }
}

/**
 * 滑动退出动画
 */
const animateSwipeExit = (swipeDirection: SwipeDirection, data: SwipeGestureData) => {
  const exitDistance = props.maxDistance * 2
  
  switch (swipeDirection) {
    case 'left':
      swipeTransform.value = {
        x: -exitDistance,
        y: -20,
        rotation: -15,
        scale: 0.8
      }
      break
    case 'right':
      swipeTransform.value = {
        x: exitDistance,
        y: -20,
        rotation: 15,
        scale: 0.8
      }
      break
    case 'up':
      swipeTransform.value = {
        x: 0,
        y: -exitDistance,
        rotation: 0,
        scale: 0.8
      }
      break
    case 'down':
      swipeTransform.value = {
        x: 0,
        y: exitDistance,
        rotation: 0,
        scale: 0.8
      }
      break
  }
  
  // 动画完成后重置
  setTimeout(() => {
    resetTransform()
  }, 300)
}

/**
 * 回弹动画
 */
const springBack = () => {
  if (!props.enableSpring) {
    resetTransform()
    return
  }
  
  // 创建回弹效果
  const startTransform = { ...swipeTransform.value }
  const duration = 300
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用弹性缓动函数
    const easeOutElastic = (t: number): number => {
      const c4 = (2 * Math.PI) / 3
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    }
    
    const easedProgress = easeOutElastic(progress)
    
    swipeTransform.value = {
      x: startTransform.x * (1 - easedProgress),
      y: startTransform.y * (1 - easedProgress),
      rotation: startTransform.rotation * (1 - easedProgress),
      scale: startTransform.scale + (1 - startTransform.scale) * easedProgress
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      resetTransform()
    }
  }
  
  requestAnimationFrame(animate)
}

/**
 * 重置变换
 */
const resetTransform = () => {
  swipeTransform.value = { x: 0, y: 0, rotation: 0, scale: 1 }
  swipeProgress.value = 0
  swipeDistance.value = 0
  swipeVelocity.value = 0
}

/**
 * 手动触发滑动（用于测试或程序控制）
 */
const triggerSwipe = (swipeDirection: SwipeDirection, distance: number = props.threshold + 10) => {
  const data: SwipeGestureData = {
    direction: swipeDirection,
    distance,
    velocity: distance / 200,
    duration: 200,
    startPosition: { x: 0, y: 0 },
    endPosition: 
      swipeDirection === 'left' ? { x: -distance, y: 0 } :
      swipeDirection === 'right' ? { x: distance, y: 0 } :
      swipeDirection === 'up' ? { x: 0, y: -distance } :
      { x: 0, y: distance }
  }
  
  animateSwipeExit(swipeDirection, data)
  emit('swipe', swipeDirection, data)
}

/**
 * 重置组件状态
 */
const reset = () => {
  resetTransform()
}

// 监听禁用状态变化
watch(() => props.disabled, (disabled) => {
  if (disabled) {
    resetTransform()
  }
})

// 暴露方法给父组件
defineExpose({
  triggerSwipe,
  reset,
  isSwiping,
  direction,
  progress: swipeProgress
})
</script>

<style lang="scss" scoped>
.swipe-gesture-container {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: none;
  
  &.can-swipe {
    cursor: grab;
    
    &.is-swiping {
      cursor: grabbing;
    }
  }
  
  &:not(.can-swipe) {
    pointer-events: none;
  }
}

.swipe-indicators {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 $spacing-xl;
  pointer-events: none;
  z-index: 10;
  
  .indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
    
    &.active {
      transform: scale(1);
    }
    
    .indicator-icon {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: $spacing-xs;
    }
    
    .indicator-text {
      font-size: $font-size-sm;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    &.left {
      color: #ff6b6b;
      text-shadow: 0 2px 8px rgba(255, 107, 107, 0.5);
    }
    
    &.right {
      color: #51cf66;
      text-shadow: 0 2px 8px rgba(81, 207, 102, 0.5);
    }
  }
}

.debug-overlay {
  position: absolute;
  top: $spacing-md;
  left: $spacing-md;
  right: $spacing-md;
  background: rgba(0, 0, 0, 0.8);
  color: $ow-light;
  padding: $spacing-sm;
  border-radius: $border-radius-sm;
  font-family: monospace;
  font-size: $font-size-xs;
  z-index: 20;
  
  .debug-info {
    white-space: pre-line;
    line-height: 1.4;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .swipe-indicators {
    padding: 0 $spacing-lg;
    
    .indicator {
      .indicator-icon {
        font-size: 24px;
      }
      
      .indicator-text {
        font-size: $font-size-xs;
      }
    }
  }
}

// 无障碍支持
@media (prefers-reduced-motion: reduce) {
  .swipe-gesture-container {
    transition: none !important;
  }
  
  .indicator {
    transition: none !important;
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .indicator {
    &.left {
      color: #ff0000;
    }
    
    &.right {
      color: #00ff00;
    }
  }
  
  .debug-overlay {
    background: #000000;
    border: 1px solid #ffffff;
  }
}
</style>