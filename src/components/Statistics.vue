<template>
  <div class="statistics-container">
    <!-- 标题区域 -->
    <div class="header-section">
      <span class="title">游戏统计</span>
      <span class="subtitle">查看你的游戏表现</span>
    </div>
    
    <!-- 本次会话统计 -->
    <div class="session-stats nft-card">
      <div class="section-header">
        <span class="section-title">本次游戏</span>
        <div class="session-badge" :class="sessionBadgeClass">
          <span class="badge-text">{{ sessionBadgeText }}</span>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">{{ statistics.totalQuestions }}</span>
          <span class="stat-label">总题数</span>
        </div>
        
        <div class="stat-card">
          <span class="stat-number correct">{{ statistics.correctAnswers }}</span>
          <span class="stat-label">正确</span>
        </div>
        
        <div class="stat-card">
          <span class="stat-number incorrect">{{ statistics.totalQuestions - statistics.correctAnswers }}</span>
          <span class="stat-label">错误</span>
        </div>
        
        <div class="stat-card">
          <span class="stat-number accuracy" :class="accuracyClass">{{ formattedAccuracy }}%</span>
          <span class="stat-label">正确率</span>
        </div>
      </div>
      
      <div class="session-details">
        <div class="detail-item">
          <span class="detail-label">平均用时</span>
          <span class="detail-value">{{ formattedAverageTime }}s</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-label">游戏时长</span>
          <span class="detail-value">{{ formattedDuration }}</span>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="btn btn-primary" @click="handleRestart">
        <span class="btn-text">再来一局</span>
      </button>
      
      <button class="btn btn-outline" @click="handleExit">
        <span class="btn-text">返回首页</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

/**
 * 组件Props
 */
interface Props {
  /** 游戏会话统计 */
  statistics: any
  /** 是否显示分享功能 */
  showShare?: boolean
  /** 是否显示动画 */
  animated?: boolean
}

/**
 * 组件Emits
 */
interface Emits {
  (e: 'restart'): void
  (e: 'exit'): void
  (e: 'share', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  showShare: true,
  animated: true
})

const emit = defineEmits<Emits>()

// 组件状态
const isVisible = ref(false)

/**
 * 格式化正确率
 */
const formattedAccuracy = computed(() => {
  return props.statistics.overallAccuracy?.toFixed(1) || '0.0'
})

/**
 * 正确率样式类
 */
const accuracyClass = computed(() => {
  const accuracy = props.statistics.overallAccuracy || 0
  if (accuracy >= 80) return 'excellent'
  if (accuracy >= 60) return 'good'
  if (accuracy >= 40) return 'fair'
  return 'poor'
})

/**
 * 会话徽章样式类
 */
const sessionBadgeClass = computed(() => {
  const accuracy = props.statistics.overallAccuracy || 0
  if (accuracy >= 90) return 'perfect'
  if (accuracy >= 80) return 'excellent'
  if (accuracy >= 60) return 'good'
  return 'normal'
})

/**
 * 会话徽章文本
 */
const sessionBadgeText = computed(() => {
  const accuracy = props.statistics.overallAccuracy || 0
  if (accuracy >= 90) return '完美'
  if (accuracy >= 80) return '优秀'
  if (accuracy >= 60) return '良好'
  return '继续努力'
})

/**
 * 格式化平均用时
 */
const formattedAverageTime = computed(() => {
  return ((props.statistics.averageTimePerQuestion || 0) / 1000).toFixed(1)
})

/**
 * 格式化游戏时长
 */
const formattedDuration = computed(() => {
  const duration = props.statistics.totalPlayTime || 0
  const minutes = Math.floor(duration / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

/**
 * 处理重新开始
 */
const handleRestart = () => {
  emit('restart')
}

/**
 * 处理退出
 */
const handleExit = () => {
  emit('exit')
}

// 组件挂载时触发入场动画
onMounted(() => {
  if (props.animated) {
    setTimeout(() => {
      isVisible.value = true
    }, 100)
  } else {
    isVisible.value = true
  }
})
</script>
<style lang="scss" scoped>
.statistics-container {
  padding: $spacing-lg;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
}

.header-section {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  .title {
    display: block;
    font-size: $font-size-xxl;
    font-weight: 700;
    color: $ow-primary;
    margin-bottom: $spacing-sm;
  }
  
  .subtitle {
    display: block;
    font-size: $font-size-md;
    color: $ow-gray-light;
  }
}

.session-stats {
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    
    .section-title {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $ow-light;
    }
    
    .session-badge {
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      font-weight: 600;
      text-transform: uppercase;
      
      &.perfect {
        background: linear-gradient(135deg, #51cf66, #69db7c);
        color: $ow-darker;
      }
      
      &.excellent {
        background: linear-gradient(135deg, $ow-secondary, #ffd93d);
        color: $ow-darker;
      }
      
      &.good {
        background: linear-gradient(135deg, $ow-accent, #74c0fc);
        color: $ow-darker;
      }
      
      &.normal {
        background: rgba(255, 255, 255, 0.1);
        color: $ow-light;
      }
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    
    .stat-card {
      text-align: center;
      padding: $spacing-md;
      background: rgba(255, 255, 255, 0.05);
      border-radius: $border-radius-md;
      
      .stat-number {
        display: block;
        font-size: $font-size-xl;
        font-weight: 700;
        margin-bottom: $spacing-xs;
        
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
      
      .stat-label {
        font-size: $font-size-sm;
        color: $ow-gray-light;
      }
    }
  }
  
  .session-details {
    display: flex;
    justify-content: space-around;
    padding-top: $spacing-md;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    .detail-item {
      text-align: center;
      
      .detail-label {
        display: block;
        font-size: $font-size-sm;
        color: $ow-gray-light;
        margin-bottom: $spacing-xs;
      }
      
      .detail-value {
        font-size: $font-size-md;
        font-weight: 600;
        color: $ow-light;
      }
    }
  }
}

.overall-stats {
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  
  .section-header {
    text-align: center;
    margin-bottom: $spacing-lg;
    
    .section-title {
      display: block;
      font-size: $font-size-lg;
      font-weight: 600;
      color: $ow-light;
      margin-bottom: $spacing-xs;
    }
    
    .section-subtitle {
      font-size: $font-size-sm;
      color: $ow-gray-light;
    }
  }
  
  .overall-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
    
    .overall-item {
      text-align: center;
      padding: $spacing-lg;
      background: rgba(255, 255, 255, 0.05);
      border-radius: $border-radius-md;
      
      .overall-number {
        display: block;
        font-size: $font-size-xl;
        font-weight: 700;
        color: $ow-accent;
        margin-bottom: $spacing-xs;
      }
      
      .overall-label {
        font-size: $font-size-sm;
        color: $ow-gray-light;
      }
    }
  }
}

.map-stats {
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  
  .section-header {
    text-align: center;
    margin-bottom: $spacing-lg;
    
    .section-title {
      display: block;
      font-size: $font-size-lg;
      font-weight: 600;
      color: $ow-light;
      margin-bottom: $spacing-xs;
    }
    
    .section-subtitle {
      font-size: $font-size-sm;
      color: $ow-gray-light;
    }
  }
  
  .map-list {
    .map-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-md;
      margin-bottom: $spacing-sm;
      background: rgba(255, 255, 255, 0.05);
      border-radius: $border-radius-md;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .map-info {
        .map-name {
          display: block;
          font-size: $font-size-md;
          font-weight: 500;
          color: $ow-light;
          margin-bottom: $spacing-xs;
        }
        
        .map-count {
          font-size: $font-size-sm;
          color: $ow-gray-light;
        }
      }
      
      .map-accuracy {
        display: flex;
   
<style lang="scss" scoped>
.statistics-container {
  padding: $spacing-lg;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
}

.header-section {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  .title {
    display: block;
    font-size: $font-size-xxl;
    font-weight: 700;
    color: $ow-primary;
    margin-bottom: $spacing-sm;
  }
  
  .subtitle {
    display: block;
    font-size: $font-size-md;
    color: $ow-gray-light;
  }
}

.session-stats {
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    
    .section-title {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $ow-light;
    }
    
    .session-badge {
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      font-weight: 600;
      text-transform: uppercase;
      
      &.perfect {
        background: linear-gradient(135deg, #51cf66, #69db7c);
        color: $ow-darker;
      }
      
      &.excellent {
        background: linear-gradient(135deg, $ow-secondary, #ffd93d);
        color: $ow-darker;
      }
      
      &.good {
        background: linear-gradient(135deg, $ow-accent, #74c0fc);
        color: $ow-darker;
      }
      
      &.normal {
        background: rgba(255, 255, 255, 0.1);
        color: $ow-light;
      }
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    
    .stat-card {
      text-align: center;
      padding: $spacing-md;
      background: rgba(255, 255, 255, 0.05);
      border-radius: $border-radius-md;
      
      .stat-number {
        display: block;
        font-size: $font-size-xl;
        font-weight: 700;
        margin-bottom: $spacing-xs;
        
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
      
      .stat-label {
        font-size: $font-size-sm;
        color: $ow-gray-light;
      }
    }
  }
}
.action-buttons {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  
  .btn {
    flex: 1;
    padding: $spacing-lg;
    font-size: $font-size-md;
    font-weight: 600;
  }
}

.share-section {
  text-align: center;
  
  .btn {
    min-width: 200px;
    padding: $spacing-md $spacing-xl;
  }
}

// 动画定义
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .statistics-container {
    padding: $spacing-md;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-sm;
  }
  
  .overall-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>