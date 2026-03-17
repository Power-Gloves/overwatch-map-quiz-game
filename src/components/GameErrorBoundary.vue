<template>
  <div v-if="hasError" class="error-boundary">
    <VueBitsProfileCard class="error-card">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">游戏出现错误</h2>
        <p class="error-message">{{ errorMessage }}</p>
        
        <div class="error-actions">
          <button class="btn btn-primary" @click="handleRestart">
            重新开始游戏
          </button>
          <button class="btn btn-secondary" @click="handleReload">
            刷新页面
          </button>
        </div>
        
        <details v-if="isDev" class="error-details">
          <summary>错误详情（开发模式）</summary>
          <pre class="error-stack">{{ errorStack }}</pre>
        </details>
      </div>
    </VueBitsProfileCard>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue'
import VueBitsProfileCard from '@/component/VueBitsProfileCard/VueBitsProfileCardSimple.vue'
import { StorageService } from '@/services/StorageService'

interface Props {
  onRestart?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  onRestart: () => {}
})

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')

const isDev = computed(() => process.env.NODE_ENV === 'development')

// 捕获子组件错误
onErrorCaptured((error: Error, instance, info) => {
  console.error('GameErrorBoundary 捕获到错误:', error)
  
  hasError.value = true
  errorMessage.value = getErrorMessage(error)
  errorStack.value = error.stack || ''
  
  // 记录错误日志
  logError(error, info)
  
  return false // 阻止错误继续传播
})

const getErrorMessage = (error: Error): string => {
  if (error.message.includes('网络')) {
    return '网络连接出现问题，请检查网络后重试'
  }
  if (error.message.includes('存储') || error.message.includes('storage')) {
    return '数据存储出现问题，请清理浏览器缓存后重试'
  }
  if (error.message.includes('题库') || error.message.includes('question')) {
    return '题库加载失败，请重新开始游戏'
  }
  return '游戏运行出现异常，请重新开始'
}
const logError = (error: Error, info: string) => {
  try {
    const storageService = StorageService.getInstance()
    storageService.saveErrorLog({
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'component_error' as any,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      extra: {
        componentInfo: info,
        errorName: error.name
      }
    })
  } catch (logError) {
    console.error('记录错误日志失败:', logError)
  }
}

const handleRestart = () => {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
  props.onRestart()
}

const handleReload = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-boundary {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
}

.error-card {
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.error-content {
  padding: 32px 24px;
  text-align: center;
  color: white;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #ff4757;
}

.error-message {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 24px;
  color: #b3b3b3;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #f4433c 0%, #ff6b35 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(244, 67, 60, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.error-details {
  text-align: left;
  margin-top: 16px;
}

.error-details summary {
  cursor: pointer;
  color: #7a7e83;
  font-size: 14px;
  margin-bottom: 8px;
}

.error-stack {
  background: rgba(0, 0, 0, 0.5);
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #ff9c00;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>