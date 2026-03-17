<template>
  <view class="progress-bar-container">
    <!-- 统计信息 -->
    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-label">已答题</text>
        <text class="stat-value">{{ totalAnswered }}</text>
      </view>
      
      <view class="stat-item">
        <text class="stat-label">正确</text>
        <text class="stat-value correct">{{ correctCount }}</text>
      </view>
      
      <view class="stat-item">
        <text class="stat-label">错误</text>
        <text class="stat-value incorrect">{{ incorrectCount }}</text>
      </view>
      
      <view class="stat-item">
        <text class="stat-label">正确率</text>
        <text class="stat-value accuracy" :class="accuracyClass">
          {{ formattedAccuracy }}%
        </text>
      </view>
    </view>
    
    <!-- 进度条 -->
    <view class="progress-container">
      <view class="progress-track">
        <!-- 正确答案进度 -->
        <view 
          class="progress-fill correct-fill"
          :style="{ width: correctPercentage + '%' }"
        >
          <view class="progress-glow"></view>
        </view>
        
        <!-- 错误答案进度 -->
        <view 
          class="progress-fill incorrect-fill"
          :style="{ 
            width: incorrectPercentage + '%',
            left: correctPercentage + '%'
          }"
        >
          <view class="progress-glow"></view>
        </view>
      </view>
      
      <!-- 进度标记 -->
      <view class="progress-markers">
        <view 
          v-for="(marker, index) in progressMarkers" 
          :key="index"
          class="marker"
          :class="marker.type"
          :style="{ left: marker.position + '%' }"
        >
          <view class="marker-dot"></view>
          <text class="marker-label">{{ marker.label }}</text>
        </view>
      </view>
    </view>
    
    <!-- 详细信息（可折叠） -->
    <view v-if="showDetails" class="details-section">
      <view class="detail-row">
        <text class="detail-label">平均用时</text>
        <text class="detail-value">{{ averageTime }}s</text>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">最快答题</text>
        <text class="detail-value">{{ fastestTime }}s</text>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">连续正确</text>
        <text class="detail-value">{{ currentStreak }}</text>
      </view>
      
      <view class="detail-row">
        <text class="detail-label">最佳连击</text>
        <text class="detail-value">{{ bestStreak }}</text>
      </view>
    </view>
    
    <!-- 展开/收起按钮 -->
    <view class="toggle-details" @click="toggleDetails">
      <text class="toggle-text">{{ showDetails ? '收起' : '详情' }}</text>
      <text class="toggle-icon" :class="{ rotated: showDetails }">▼</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

/**
 * 组件Props
 */
interface Props {
  /** 总答题数 */
  totalAnswered: number
  /** 正确答案数 */
  correctCount: number
  /** 错误答案数 */
  incorrectCount: number
  /** 答题时间数组（毫秒） */
  answerTimes?: number[]
  /** 当前连续正确数 */
  currentStreak?: number
  /** 最佳连续正确数 */
  bestStreak?: number
  /** 是否显示动画 */
  animated?: boolean
  /** 进度条高度 */
  height?: number
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 目标题数（用于显示总进度） */
  targetCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  answerTimes: () => [],
  currentStreak: 0,
  bestStreak: 0,
  animated: true,
  height: 8,
  showPercentage: true,
  targetCount: 0
})

// 组件状态
const showDetails = ref(false)
const animatedCorrectCount = ref(0)
const animatedIncorrectCount = ref(0)
const animatedAccuracy = ref(0)

/**
 * 计算正确率
 */
const accuracy = computed(() => {
  if (props.totalAnswered === 0) return 0
  return (props.correctCount / props.totalAnswered) * 100
})

/**
 * 格式化正确率显示
 */
const formattedAccuracy = computed(() => {
  return props.animated ? animatedAccuracy.value.toFixed(1) : accuracy.value.toFixed(1)
})

/**
 * 正确率样式类
 */
const accuracyClass = computed(() => {
  const acc = accuracy.value
  if (acc >= 80) return 'excellent'
  if (acc >= 60) return 'good'
  if (acc >= 40) return 'fair'
  return 'poor'
})

/**
 * 正确答案百分比
 */
const correctPercentage = computed(() => {
  if (props.totalAnswered === 0) return 0
  return (props.correctCount / props.totalAnswered) * 100
})

/**
 * 错误答案百分比
 */
const incorrectPercentage = computed(() => {
  if (props.totalAnswered === 0) return 0
  return (props.incorrectCount / props.totalAnswered) * 100
})

/**
 * 平均答题时间
 */
const averageTime = computed(() => {
  if (props.answerTimes.length === 0) return 0
  const total = props.answerTimes.reduce((sum, time) => sum + time, 0)
  return (total / props.answerTimes.length / 1000).toFixed(1)
})

/**
 * 最快答题时间
 */
const fastestTime = computed(() => {
  if (props.answerTimes.length === 0) return 0
  const fastest = Math.min(...props.answerTimes)
  return (fastest / 1000).toFixed(1)
})

/**
 * 进度标记点
 */
const progressMarkers = computed(() => {
  const markers = []
  
  // 添加25%、50%、75%、100%标记
  const milestones = [25, 50, 75, 100]
  
  for (const milestone of milestones) {
    if (props.targetCount > 0) {
      const targetQuestions = (props.targetCount * milestone) / 100
      if (props.totalAnswered >= targetQuestions) {
        markers.push({
          position: milestone,
          type: 'milestone',
          label: `${milestone}%`
        })
      }
    }
  }
  
  return markers
})

/**
 * 切换详情显示
 */
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

/**
 * 数字动画
 */
const animateNumber = (
  from: number, 
  to: number, 
  duration: number = 1000,
  callback: (value: number) => void
) => {
  if (!props.animated) {
    callback(to)
    return
  }
  
  const startTime = Date.now()
  const difference = to - from
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用缓动函数
    const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4)
    const easedProgress = easeOutQuart(progress)
    
    const currentValue = from + (difference * easedProgress)
    callback(currentValue)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

/**
 * 监听数据变化，触发动画
 */
watch(() => props.correctCount, (newValue, oldValue) => {
  animateNumber(oldValue || 0, newValue, 800, (value) => {
    animatedCorrectCount.value = Math.round(value)
  })
})

watch(() => props.incorrectCount, (newValue, oldValue) => {
  animateNumber(oldValue || 0, newValue, 800, (value) => {
    animatedIncorrectCount.value = Math.round(value)
  })
})

watch(() => accuracy.value, (newValue, oldValue) => {
  animateNumber(oldValue || 0, newValue, 1000, (value) => {
    animatedAccuracy.value = value
  })
})

// 组件挂载时初始化动画值
onMounted(() => {
  if (props.animated) {
    animatedCorrectCount.value = 0
    animatedIncorrectCount.value = 0
    animatedAccuracy.value = 0
    
    // 延迟启动动画
    setTimeout(() => {
      animateNumber(0, props.correctCount, 800, (value) => {
        animatedCorrectCount.value = Math.round(value)
      })
      
      animateNumber(0, props.incorrectCount, 800, (value) => {
        animatedIncorrectCount.value = Math.round(value)
      })
      
      animateNumber(0, accuracy.value, 1000, (value) => {
        animatedAccuracy.value = value
      })
    }, 300)
  } else {
    animatedCorrectCount.value = props.correctCount
    animatedIncorrectCount.value = props.incorrectCount
    animatedAccuracy.value = accuracy.value
  }
})
</script>

<style lang="scss" scoped>
.progress-bar-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  margin: $spacing-md 0;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  gap: $spacing-md;
  
  .stat-item {
    flex: 1;
    text-align: center;
    
    .stat-label {
      display: block;
      font-size: $font-size-xs;
      color: $ow-gray-light;
      margin-bottom: $spacing-xs;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      display: block;
      font-size: $font-size-lg;
      font-weight: 700;
      color: $ow-light;
      
      &.correct {
        color: #51cf66;
      }
      
      &.incorrect {
        color: #ff6b6b;
      }
      
      &.accuracy {
        &.excellent {
          color: #51cf66;
        }
        
        &.good {
          color: #69db7c;
        }
        
        &.fair {
          color: #ffd43b;
        }
        
        &.poor {
          color: #ff6b6b;
        }
      }
    }
  }
}

.progress-container {
  position: relative;
  margin-bottom: $spacing-md;
  
  .progress-track {
    position: relative;
    width: 100%;
    height: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
  }
  
  .progress-fill {
    position: absolute;
    top: 0;
    height: 100%;
    border-radius: 6px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    
    .progress-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 6px;
      opacity: 0.6;
      animation: pulse 2s ease-in-out infinite;
    }
    
    &.correct-fill {
      background: linear-gradient(90deg, #51cf66, #69db7c);
      
      .progress-glow {
        background: linear-gradient(90deg, #51cf66, #69db7c);
        box-shadow: 0 0 20px rgba(81, 207, 102, 0.5);
      }
    }
    
    &.incorrect-fill {
      background: linear-gradient(90deg, #ff6b6b, #ff8787);
      
      .progress-glow {
        background: linear-gradient(90deg, #ff6b6b, #ff8787);
        box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
      }
    }
  }
  
  .progress-markers {
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    height: 28px;
    pointer-events: none;
    
    .marker {
      position: absolute;
      transform: translateX(-50%);
      
      .marker-dot {
        width: 8px;
        height: 8px;
        background: $ow-accent;
        border-radius: 50%;
        margin: 0 auto 4px;
        box-shadow: 0 2px 4px rgba(0, 212, 255, 0.5);
      }
      
      .marker-label {
        font-size: $font-size-xs;
        color: $ow-accent;
        text-align: center;
        display: block;
        font-weight: 600;
      }
      
      &.milestone {
        .marker-dot {
          background: $ow-secondary;
          box-shadow: 0 2px 4px rgba(255, 156, 0, 0.5);
        }
        
        .marker-label {
          color: $ow-secondary;
        }
      }
    }
  }
}

.details-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: $spacing-md;
  margin-top: $spacing-md;
  animation: slideDown 0.3s ease;
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-sm;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .detail-label {
      font-size: $font-size-sm;
      color: $ow-gray-light;
    }
    
    .detail-value {
      font-size: $font-size-sm;
      font-weight: 600;
      color: $ow-light;
    }
  }
}

.toggle-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: $spacing-sm;
  margin-top: $spacing-sm;
  cursor: pointer;
  border-radius: $border-radius-md;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .toggle-text {
    font-size: $font-size-sm;
    color: $ow-accent;
    font-weight: 500;
  }
  
  .toggle-icon {
    font-size: $font-size-xs;
    color: $ow-accent;
    transition: transform 0.3s ease;
    
    &.rotated {
      transform: rotate(180deg);
    }
  }
}

// 动画定义
@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .progress-bar-container {
    padding: $spacing-md;
  }
  
  .stats-row {
    gap: $spacing-sm;
    
    .stat-item {
      .stat-label {
        font-size: 10px;
      }
      
      .stat-value {
        font-size: $font-size-md;
      }
    }
  }
  
  .progress-container {
    .progress-track {
      height: 8px;
    }
    
    .progress-markers {
      .marker {
        .marker-dot {
          width: 6px;
          height: 6px;
        }
        
        .marker-label {
          font-size: 10px;
        }
      }
    }
  }
}

// 无障碍支持
@media (prefers-reduced-motion: reduce) {
  .progress-fill,
  .toggle-icon {
    transition: none !important;
  }
  
  .progress-glow {
    animation: none !important;
  }
  
  .details-section {
    animation: none !important;
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .progress-bar-container {
    border: 2px solid $ow-light;
    background: $ow-darker;
  }
  
  .stat-value {
    &.correct {
      color: #00ff00;
    }
    
    &.incorrect {
      color: #ff0000;
    }
  }
  
  .progress-fill {
    &.correct-fill {
      background: #00ff00;
    }
    
    &.incorrect-fill {
      background: #ff0000;
    }
  }
}
</style>