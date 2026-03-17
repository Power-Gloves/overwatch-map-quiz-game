<template>
  <GameErrorBoundary @restart="handleRestart">
    <div class="game-container">
    <!-- 动态背景 -->
    <div class="animated-bg">
      <div class="bg-gradient"></div>
      <div class="bg-particles"></div>
    </div>

    <!-- 开始页面 -->
    <div v-if="gameState.status === 'idle'" class="start-screen">
      <!-- 右上角音效控制按钮 -->
      <img 
        src="/src/assets/images/icons/audio-control.svg" 
        alt="音效设置" 
        @click="toggleAudioPanel"
        class="control-button control-button-right"
      />
      
      <div class="header">
        <div class="logo-container">
          <img src="/src/assets/images/logos/logo-white.png" alt="OVERWATCH" class="game-logo" />
          <p class="subtitle">地图识别挑战</p>
        </div>
      </div>
      
      <div class="content">
        <VueBitsProfileCard 
          class="stats-preview-card"
          :enable-tilt="true"
          :enable-shine="false"
          :behind-gradient="`radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y), hsla(120,100%,90%,calc(var(--card-opacity)*0.7)) 4%, hsla(120,50%,80%,calc(var(--card-opacity)*0.525)) 10%, hsla(120,25%,70%,calc(var(--card-opacity)*0.35)) 50%, hsla(120,0%,60%,0) 100%), radial-gradient(35% 52% at 55% 20%, #B5FA2389 0%, #073aff00 100%), radial-gradient(100% 100% at 50% 50%, #B5FA23b3 1%, #073aff00 76%), conic-gradient(from 124deg at 50% 50%, #B5FA23b3 0%, #32CD32b3 40%, #32CD32b3 60%, #B5FA23b3 100%)`"
          :inner-gradient="`linear-gradient(145deg, rgba(181, 250, 35, 0.1) 0%, rgba(181, 250, 35, 0.05) 100%)`"
          :icon-url="`/src/assets/images/guiling.png`"
        >
          <div class="stats-preview-content" style="padding: 24px 20px !important; border: 2px solid #B5FA23; border-radius: 16px; background: rgba(181, 250, 35, 0.05);">
            <div class="icon-wrapper">
              <img src="/src/assets/images/logos/带文字logo-white.png" alt="游戏图标" class="ow-icon-logo" />
            </div>
            <p class="preview-text">准备好挑战你的地图知识了吗？</p>
            <p class="stats-text">
              <span class="stat-badge">{{ mapCount }}</span> 个地图 · 
              <span class="stat-badge">{{ totalScreenshots }}</span> 张截图
            </p>
          </div>
        </VueBitsProfileCard>
        
        <div class="actions">
          <!-- 新的START按钮 - 仿照SVG风格 -->
          <div 
            class="start-button-svg" 
            @click="() => { playButtonClick(); showModeSelect(); }" 
            :disabled="isLoading"
            style="margin-top: 60px !important;"
          >
            <svg width="100%" height="60" viewBox="0 0 350 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="350" height="60" fill="#B5FA23" fill-opacity="0.9" rx="4"/>
              <text x="175" y="38" text-anchor="middle" fill="#1D1D1F" font-family="'Orbitron', 'Bank Sans EF CY Compressed', sans-serif" font-size="24" font-weight="700" letter-spacing="2px">START</text>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p class="version">v3.0.0</p>
      </div>
    </div>

    <!-- 模式选择页面 -->
    <div v-else-if="gameState.status === 'mode_select'" class="mode-select-screen">
      <!-- 左上角返回按钮 -->
      <img 
        src="/src/assets/images/icons/back-arrow-left.svg" 
        alt="返回" 
        @click="backToHome"
        class="control-button control-button-left"
        @mouseover="$event.target.style.transform = 'scale(1.1)'"
        @mouseout="$event.target.style.transform = 'scale(1)'"
      />
      
      <!-- 右上角音效控制按钮 -->
      <img 
        src="/src/assets/images/icons/audio-control.svg" 
        alt="音效设置" 
        @click="toggleAudioPanel"
        class="control-button control-button-right"
      />
      
      <div class="header">
        <h1 class="title glow-text ow-title-skew">选择游戏模式</h1>
        <p class="subtitle">每种模式都有独特的挑战体验</p>
      </div>
      
      <div class="content">
        <!-- 新的OW四方形风格模式选择 -->
        <div class="ow-mode-container">
          <div 
            v-for="mode in modeItems" 
            :key="mode.value"
            class="ow-mode-card"
            @click="() => handleModeSelect(mode.value)"
          >
            <!-- 左侧图标区域 -->
            <div class="ow-mode-left">
              <img 
                :src="mode.icon" 
                :alt="mode.title" 
                class="ow-mode-icon"
              />
            </div>
            
            <!-- 中间内容区域 -->
            <div class="ow-mode-center">
              <h3 class="ow-mode-title">{{ mode.title }}</h3>
              <p class="ow-mode-subtitle">{{ mode.subtitle }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 游戏页面 -->
    <GamePage
      v-else-if="gameState.status === 'playing'"
      :game-state="gameState"
      :is-answering="isAnswering"
      :show-answer-feedback="showAnswerFeedback"
      :feedback-data="feedbackData"
      @back="backToModeSelect"
      @toggle-audio="toggleAudioPanel"
      @answer="handleAnswer"
    />

    <!-- 游戏结束页面 -->
    <FinishPage
      v-else-if="gameState.status === 'finished'"
      :game-state="gameState"
      @restart="handleRestart"
    />

    <!-- 错误页面 -->
    <ErrorPage
      v-else-if="gameState.status === 'error'"
      :game-state="gameState"
      @restart="handleRestart"
    />
    
    <!-- 音效控制面板 -->
    <div v-if="showAudioPanel" class="audio-panel-overlay" @click="showAudioPanel = false">
      <div 
        class="audio-panel-positioned" 
        @click.stop
        style="position: fixed !important; top: 70px !important; right: 8px !important; z-index: 2001 !important;"
      >
        <AudioControlPanel @close="showAudioPanel = false" />
      </div>
    </div>
    </div>
  </GameErrorBoundary>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameState } from '@/composables/useGameState'
import { useAudio } from '@/composables/useAudio'
import VueBitsProfileCard from '@/component/VueBitsProfileCard/VueBitsProfileCardSimple.vue'
import GameErrorBoundary from '@/components/GameErrorBoundary.vue'
import AudioControlPanel from '@/components/AudioControlPanel.vue'
import GamePage from '@/pages/GamePage.vue'
import FinishPage from '@/components/FinishPage.vue'
import ErrorPage from '@/components/ErrorPage.vue'
import type { MapData } from '@/types'
import { GameMode } from '@/types'
import mapsData from '@/assets/data/maps.json'

const {
  state: gameState,
  isLoading,
  startGame,
  showModeSelect,
  answerQuestion,
  restartGame
} = useGameState()

// 音效系统
const {
  playButtonClick,
  playMenuMusic,
  stopMusic
} = useAudio()

// 答题状态管理 - 简化版本
const isAnswering = ref(false)
const showAnswerFeedback = ref(false)
const feedbackData = ref<{
  isCorrect: boolean
  selectedOption: string
  correctAnswer: string
} | null>(null)

// 检测设备性能
const isLowPerformanceDevice = ref(false)

// 检测设备性能的函数
const detectDevicePerformance = () => {
  // 检测CPU核心数
  const cores = navigator.hardwareConcurrency || 1
  
  // 检测内存（如果可用）
  const memory = (navigator as any).deviceMemory || 1
  
  // 检测是否为移动设备
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // 低性能设备判断条件
  isLowPerformanceDevice.value = isMobile && (cores <= 2 || memory <= 2)
}

// 音效面板控制
const showAudioPanel = ref(false)

const toggleAudioPanel = () => {
  showAudioPanel.value = !showAudioPanel.value
  playButtonClick()
}

// 简化的文本显示方法 - 缓存结果避免重复计算
const textDisplayCache = new Map<string, any>()

const getDisplayText = (text: string, gameMode: GameMode) => {
  const cacheKey = `${text}-${gameMode}`
  
  if (textDisplayCache.has(cacheKey)) {
    return textDisplayCache.get(cacheKey)
  }
  
  // 只在挑战模式中模糊文字
  if (gameMode !== 'challenge' && gameMode !== GameMode.CHALLENGE) {
    const result = { text, hasBlur: false }
    textDisplayCache.set(cacheKey, result)
    return result
  }
  
  const length = text.length
  if (length <= 2) {
    const result = { text, hasBlur: false }
    textDisplayCache.set(cacheKey, result)
    return result
  }
  
  // 根据长度决定模糊几个字
  let hideCount = 1
  if (length >= 6) hideCount = Math.floor(length / 2) - 1
  else if (length >= 4) hideCount = 2
  
  // 保留首尾，中间模糊
  const start = Math.floor((length - hideCount) / 2)
  const end = start + hideCount
  
  const result = {
    beforeText: text.substring(0, start),
    blurText: text.substring(start, end),
    afterText: text.substring(end),
    hasBlur: true
  }
  
  textDisplayCache.set(cacheKey, result)
  return result
}

const modeItems = computed(() => [
  {
    icon: "/src/assets/images/1.png",
    title: "无尽模式",
    subtitle: "无限题目，追求连续答对的最高记录！",
    spotlightColor: "rgba(79, 70, 229, 0.6)",
    value: 'endless'
  },
  {
    icon: "/src/assets/images/2.png",
    title: "挑战模式", 
    subtitle: "20题挑战，达到70%正确率通关！",
    spotlightColor: "rgba(245, 158, 11, 0.6)",
    value: 'challenge'
  },
  {
    icon: "/src/assets/images/3.png",
    title: "练习模式",
    subtitle: "10题轻松练习，熟悉地图布局！", 
    spotlightColor: "rgba(16, 185, 129, 0.6)",
    value: 'practice'
  }
])

const mapCount = computed(() => mapsData.maps.length)
const totalScreenshots = computed(() => 
  mapsData.maps.reduce((sum, map) => sum + map.screenshots.length, 0)
)

const handleModeSelect = async (mode: string) => {
  playButtonClick()
  
  try {
    let gameMode: GameMode
    let targetQuestions: number | undefined
    
    switch (mode) {
      case 'endless':
        gameMode = GameMode.ENDLESS
        targetQuestions = undefined
        break
      case 'challenge':
        gameMode = GameMode.CHALLENGE
        targetQuestions = 20
        break
      case 'practice':
        gameMode = GameMode.PRACTICE
        targetQuestions = 10
        break
      default:
        return
    }
    
    await startGame(mapsData.maps as MapData[], gameMode, targetQuestions)
    // 游戏开始后继续播放背景音乐（不中断）
  } catch (error) {
    console.error('启动游戏失败:', error)
  }
}

const backToHome = () => {
  playButtonClick()
  stopMusic()
  restartGame()
  playMenuMusic()
}

const backToModeSelect = () => {
  playButtonClick()
  stopMusic()
  showModeSelect()
  playMenuMusic()
}

const handleAnswer = async (answer: string) => {
  // 防止重复点击
  if (isAnswering.value || !gameState.currentQuestion) return
  
  // 开始答题流程
  isAnswering.value = true
  
  // 判断答案是否正确
  const isCorrect = answer === gameState.currentQuestion.correctAnswer
  
  // 设置反馈数据
  feedbackData.value = {
    isCorrect,
    selectedOption: answer,
    correctAnswer: gameState.currentQuestion.correctAnswer
  }
  
  // 播放音效
  playButtonClick()
  
  // 显示反馈
  showAnswerFeedback.value = true
  
  // 等待反馈显示时间
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 清除所有状态
  showAnswerFeedback.value = false
  feedbackData.value = null
  isAnswering.value = false
  
  // 移动端特殊处理：轻量级状态清除
  if ('ontouchstart' in window) {
    // 只在移动端执行最小必要的清理
    setTimeout(() => {
      const buttons = document.querySelectorAll('.answer-btn')
      buttons.forEach(btn => {
        btn.blur() // 移除焦点
      })
    }, 10) // 减少延迟
  }
  
  // 提交答案到游戏状态
  answerQuestion(answer)
}

const handleRestart = () => {
  playButtonClick()
  stopMusic()
  restartGame()
  playMenuMusic()
}

// 禁用系统交互事件
const preventDefaultEvents = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  return false
}

const preventZoom = (e: TouchEvent) => {
  if (e.touches.length > 1) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
}

const preventContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  return false
}

onMounted(() => {
  // 检测设备性能
  detectDevicePerformance()
  
  // 启动时播放菜单音乐
  playMenuMusic()
  
  // 禁用双指缩放
  document.addEventListener('touchstart', preventZoom, { passive: false })
  document.addEventListener('touchmove', preventZoom, { passive: false })
  document.addEventListener('touchend', preventZoom, { passive: false })
  
  // 禁用右键菜单
  document.addEventListener('contextmenu', preventContextMenu)
  
  // 禁用键盘缩放快捷键
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
      e.preventDefault()
      return false
    }
  })
  
  // 禁用鼠标滚轮缩放
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      return false
    }
  }, { passive: false })
  
  // 为低性能设备添加CSS类
  if (isLowPerformanceDevice.value) {
    document.body.classList.add('low-performance-device')
  }
})

onUnmounted(() => {
  document.removeEventListener('touchstart', preventZoom)
  document.removeEventListener('touchmove', preventZoom)
  document.removeEventListener('touchend', preventZoom)
  document.removeEventListener('contextmenu', preventContextMenu)
})
</script>
<style scoped>
/* 导入守望先锋风格字体 */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

/* 如果你有Bank Sans EF CY Compressed字体文件，可以这样导入：
@font-face {
  font-family: 'Bank Sans EF CY Compressed';
  src: url('./assets/fonts/BankSansEFCYCompressed.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
*/

/* ========== VueBitsProfileCard 包装器样式 ========== */
.game-preview-card,
.stats-preview-card {
  width: 100%;
  max-width: 350px;
  height: clamp(200px, 25vh, 250px);
  flex-shrink: 0;
}

.mode-card {
  width: 100%;
  max-width: 280px;
  height: clamp(200px, 30vh, 280px);
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-card:hover {
  transform: translateY(-5px);
}

.mode-card.selected {
  transform: translateY(-5px) scale(1.05);
  filter: brightness(1.2);
}

.card-content,
.stats-preview-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 24px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.mode-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 20px 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.image-card-wrapper {
  width: 100%;
  max-width: clamp(200px, 40vw, 280px);
  height: clamp(480px, 65vh, 700px);
  flex-shrink: 0;
}

.image-card-inner {
  position: relative;
  z-index: 1;
  background: rgba(20, 20, 20, 0.9);
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.stats-card-wrapper {
  width: 100%;
  max-width: clamp(350px, 80vw, 500px);
  height: clamp(350px, 60vh, 450px);
  flex-shrink: 0;
}

.stats-card-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.error-card-wrapper {
  width: 100%;
  max-width: 350px;
  height: clamp(250px, 40vh, 300px);
  flex-shrink: 0;
}

.error-card-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 32px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

/* ========== 守望先锋风格全局字体 ========== */
.game-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  font-family: 'Orbitron', 'Bank Sans EF CY Compressed', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
  /* 禁用所有系统交互 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* 守望先锋风格文字 - 轻微倾斜 */
.ow-text {
  transform: skew(-8deg);
  font-style: italic;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-family: 'Bank Sans EF CY Compressed', sans-serif;
}

/* 应用到主要文本元素 */
.mode-title,
.subtitle,
.preview-text,
.question-text,
.stat-label,
.rating-text {
  transform: skew(-8deg) !important;
  font-style: italic !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  font-family: 'Bank Sans EF CY Compressed', sans-serif !important;
}

/* 确保html和body也不会产生滚动条 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  /* 禁用所有系统交互 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
  /* 禁用缩放 */
  touch-action: manipulation;
}

/* ========== 动态背景 ========== */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: #0a0a0a;
}

.bg-gradient {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 50%, rgba(244, 67, 60, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 156, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%);
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.bg-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, rgba(255, 255, 255, 0.1), transparent),
    radial-gradient(2px 2px at 60% 70%, rgba(255, 255, 255, 0.1), transparent),
    radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.1), transparent),
    radial-gradient(1px 1px at 80% 10%, rgba(255, 255, 255, 0.1), transparent);
  background-size: 200% 200%;
  animation: particlesFloat 20s linear infinite;
}

@keyframes particlesFloat {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

/* ========== 守望先锋风格标题 - 简洁版本 ========== */
.ow-title-skew {
  transform: skew(25rad);
  display: inline-block;
  color: #ffffff;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  position: relative;
  padding: 8px 16px;
  font-family: 'Bank Sans EF CY Compressed', sans-serif;
}

/* ========== 发光文字 ========== */
.glow-text {
  color: #B5FA23;
  text-shadow: 
    0 0 10px rgba(181, 250, 35, 0.5),
    0 0 20px rgba(181, 250, 35, 0.3),
    0 0 30px rgba(181, 250, 35, 0.2);
  animation: textGlow 2s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% { text-shadow: 0 0 10px rgba(181, 250, 35, 0.5), 0 0 20px rgba(181, 250, 35, 0.3); }
  50% { text-shadow: 0 0 20px rgba(181, 250, 35, 0.8), 0 0 30px rgba(181, 250, 35, 0.5); }
}

/* ========== 按钮样式 - 守望先锋风格 ========== */
.ow-button {
  position: relative;
  background: linear-gradient(135deg, #3B9CE1 0%, #01FFFF 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(59, 156, 225, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ow-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0px 0px 2px 3px rgba(255, 255, 255, 1),
    0 8px 25px rgba(59, 156, 225, 0.6);
  animation: border-breathe 2s ease-in-out infinite;
}

.ow-button:active:not(:disabled) {
  transform: scale(0.9);
  box-shadow: 
    0px 0px 2px 3px rgba(255, 255, 255, 1),
    0 4px 15px rgba(59, 156, 225, 0.4);
}

.ow-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 守望先锋按钮呼吸动画 */
@keyframes border-breathe {
  0% { box-shadow: 0px 0px 0px 1px rgba(255, 255, 255, 1), 0 8px 25px rgba(59, 156, 225, 0.6); }
  33% { box-shadow: 0px 0px 2px 3px rgba(255, 255, 255, 1), 0 8px 25px rgba(59, 156, 225, 0.6); }
  100% { box-shadow: 0px 0px 0px 1px rgba(255, 255, 255, 1), 0 8px 25px rgba(59, 156, 225, 0.6); }
}

.btn-text {
  transform: skew(-8deg);
  font-style: italic;
  font-weight: 700;
  letter-spacing: 1px;
  display: inline-block;
  font-family: 'Bank Sans EF CY Compressed', sans-serif;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: buttonGlow 2s ease-in-out infinite;
}

@keyframes buttonGlow {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

/* ========== 页面布局 ========== */
.start-screen,
.mode-select-screen,
.finish-screen,
.error-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: clamp(10px, 2vh, 20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.title {
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 900;
  letter-spacing: 2px;
  margin: 0 0 8px 0;
}

.logo-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.game-logo {
  max-width: clamp(300px, 60vw, 500px);
  max-height: clamp(90px, 20vh, 150px);
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(255, 156, 0, 0.3));
  animation: logoGlow 3s ease-in-out infinite;
}

@keyframes logoGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 20px rgba(255, 156, 0, 0.3));
  }
  50% { 
    filter: drop-shadow(0 0 30px rgba(255, 156, 0, 0.6)) drop-shadow(0 0 40px rgba(255, 156, 0, 0.4));
  }
}

.subtitle {
  font-size: clamp(14px, 3vw, 20px);
  color: #b3b3b3;
  font-weight: 300;
  letter-spacing: 1px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
  max-width: 500px;
  min-height: 0;
}

.icon-wrapper {
  margin-bottom: 8px;
  flex-shrink: 0;
}

.ow-icon {
  font-size: 64px;
  animation: iconFloat 3s ease-in-out infinite;
}

.ow-icon-logo {
  max-width: clamp(120px, 25vw, 160px);
  max-height: clamp(120px, 25vw, 160px);
  width: auto;
  height: auto;
  object-fit: contain;
  animation: iconFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 0 15px rgba(255, 156, 0, 0.4));
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.preview-text {
  font-size: 20px;
  line-height: 1.6;
  margin-bottom: 12px;
  color: #ffffff;
}

.stats-text {
  font-size: 16px;
  color: #b3b3b3;
}

.stat-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(244, 67, 60, 0.2);
  border-radius: 12px;
  color: #ff9c00;
  font-weight: 600;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
  flex-shrink: 0;
}

.footer {
  margin-top: 32px;
  text-align: center;
  flex-shrink: 0;
}

.version {
  color: #7a7e83;
  font-size: 14px;
}







/* 移除背景层，改用其他方式防止穿模 */

/* 禁用VueBits的所有背景效果，保持卡片纯净 */
.current-card .card-background,
.current-card .card-overlay,
.current-card .card-shine,
.current-card .card-glow {
  display: none !important;
}

/* 禁用首页卡片的炫光效果 */
.stats-preview-card .card-shine {
  display: none !important;
}

/* 或者如果你想保留但减弱效果，可以用这个替代上面的规则 */
/* .stats-preview-card .card-shine {
  opacity: 0.1 !important;
  mix-blend-mode: normal !important;
} */

/* 确保图片容器有正确的背景和边界 */
.image-card-inner {
  position: relative;
  z-index: 1;
  background: rgba(20, 20, 20, 0.95);
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  /* 防止内容溢出 */
  contain: layout style paint;
}

/* 卡片滑动动画 - 进一步缩短动画时间 */
.current-card.swipe-right {
  animation: swipeRight 0.3s ease-out forwards;
}

.current-card.swipe-left {
  animation: swipeLeft 0.3s ease-out forwards;
}

/* 移除复杂的光环效果，保持简单 */

/* 移除复杂的光环动画 */

/* 答案反馈动画 - 进一步缩短动画时间 */
.current-card.answer-correct {
  animation: correctPulse 0.3s ease;
}

.current-card.answer-wrong {
  animation: wrongShake 0.3s ease;
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: scale(0.9) translateX(-50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
}

@keyframes correctPulse {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
  25% {
    transform: scale(1.02);
    filter: brightness(1.2) saturate(1.3);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.4) saturate(1.5);
  }
  75% {
    transform: scale(1.02);
    filter: brightness(1.2) saturate(1.3);
  }
}

@keyframes wrongShake {
  0%, 100% {
    transform: translateX(0) scale(1);
    filter: brightness(1) saturate(1);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-8px) scale(1.01);
    filter: brightness(0.8) saturate(1.2);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(8px) scale(1.01);
    filter: brightness(0.8) saturate(1.2);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.card-number {
  font-size: clamp(11px, 2.2vw, 13px);
  color: #ff9c00;
  font-weight: 600;
}

.card-type {
  font-size: clamp(9px, 1.8vw, 11px);
  color: #7a7e83;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.image-container {
  position: relative;
  width: 100%;
  flex: 1;
  overflow: hidden;
  background: #000;
  min-height: 0;
  border-radius: 0;
  /* 确保内容完全包含在容器内 */
  contain: layout style paint;
  /* 防止任何内容溢出 */
  clip-path: inset(0);
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}



/* 答案反馈覆盖层 - 加快淡入速度 */
.answer-feedback-overlay {
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
  backdrop-filter: blur(10px);
  z-index: 10;
  animation: feedbackFadeIn 0.2s ease;
}

.feedback-icon {
  font-size: clamp(48px, 8vw, 80px);
  margin-bottom: clamp(8px, 2vh, 16px);
  animation: iconBounce 0.4s ease;
}

.correct-icon {
  color: #4cd964;
  text-shadow: 0 0 20px rgba(76, 217, 100, 0.6);
  animation: correctGlow 0.3s ease;
}

.wrong-icon {
  color: #ff4757;
  text-shadow: 0 0 20px rgba(255, 71, 87, 0.6);
  animation: wrongPulse 0.3s ease;
}

.feedback-text {
  font-size: clamp(20px, 4vw, 32px);
  font-weight: 700;
  margin-bottom: clamp(8px, 1vh, 12px);
  animation: textSlideUp 0.5s ease 0.2s both;
}

.correct-text {
  color: #4cd964;
  text-shadow: 0 0 10px rgba(76, 217, 100, 0.4);
}

.wrong-text {
  color: #ff4757;
  text-shadow: 0 0 10px rgba(255, 71, 87, 0.4);
}

.correct-answer-text {
  font-size: clamp(14px, 3vw, 18px);
  color: #ffffff;
  text-align: center;
  padding: clamp(8px, 1vh, 12px) clamp(12px, 2vw, 16px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: textSlideUp 0.5s ease 0.4s both;
}

@keyframes feedbackFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(10px);
  }
}

@keyframes iconBounce {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

@keyframes correctGlow {
  0%, 100% {
    text-shadow: 0 0 20px rgba(76, 217, 100, 0.6);
  }
  50% {
    text-shadow: 0 0 30px rgba(76, 217, 100, 1), 0 0 40px rgba(76, 217, 100, 0.8);
  }
}

@keyframes wrongPulse {
  0%, 100% {
    text-shadow: 0 0 20px rgba(255, 71, 87, 0.6);
  }
  50% {
    text-shadow: 0 0 30px rgba(255, 71, 87, 1), 0 0 40px rgba(255, 71, 87, 0.8);
  }
}

@keyframes textSlideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}











/* ========== 通用工具类 ========== */
.control-button {
  position: absolute !important;
  top: 20px !important;
  z-index: 100 !important;
  width: 40px !important;
  height: 40px !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.control-button-left {
  left: 8px !important;
}

.control-button-right {
  right: 8px !important;
}

.ow-mode-container {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  width: 100% !important;
  max-width: 600px !important;
}

.ow-mode-card {
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch !important;
  height: 80px !important;
  background: #464F6A !important;
  border: 2px solid rgba(59, 156, 225, 0.3) !important;
  cursor: pointer !important;
  border-radius: 4px !important;
  overflow: hidden !important;
}

.ow-mode-left {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  background: transparent !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  padding: 0 !important;
}

.ow-mode-icon {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}

.ow-mode-center {
  flex: 1 !important;
  padding: 16px 20px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  background: #464F6A !important;
}

.ow-mode-title {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  margin: 0 0 4px 0 !important;
}

.ow-mode-subtitle {
  font-size: 13px !important;
  color: #C9D4E3 !important;
  margin: 0 !important;
}

/* ========== 低性能设备优化 ========== */
.low-performance-device * {
  animation: none !important;
  transition: none !important;
  transform-style: flat !important;
  perspective: none !important;
  filter: none !important;
  backdrop-filter: none !important;
}

.low-performance-device .answer-feedback-overlay {
  background: rgba(0, 0, 0, 0.9) !important;
}

/* ========== 移动端性能优化 ========== */
@media (max-width: 768px) {
  /* 禁用所有非必要动画 */
  .bg-gradient,
  .bg-particles,
  .glow-text,
  .ow-button .btn-glow,
  .game-logo,
  .ow-icon-logo {
    animation: none !important;
  }
  
  /* 简化视觉效果 */
  .answer-feedback-overlay {
    backdrop-filter: none !important;
    background: rgba(0, 0, 0, 0.9) !important;
  }
}
@media (max-width: 768px) {
  .game-logo {
    max-width: clamp(200px, 70vw, 400px);
    max-height: clamp(60px, 15vh, 120px);
  }
  
  .ow-icon-logo {
    max-width: clamp(90px, 20vw, 120px);
    max-height: clamp(90px, 20vw, 120px);
  }
}


</style>



/* ========== 音效面板样式 ========== */
.audio-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
  pointer-events: auto;
}

.audio-panel-positioned {
  position: fixed !important;
  top: 70px !important;
  right: 8px !important;
  z-index: 2001 !important;
  transform: none !important;
  pointer-events: auto;
}

/* ========== 新的START按钮 - SVG风格 ========== */
.start-button-svg {
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 100px auto 0 auto;
  text-align: center;
  filter: drop-shadow(0 4px 15px rgba(181, 250, 35, 0.4));
}

.start-button-svg:hover:not([disabled]) {
  transform: translateY(-2px) scale(1.02);
  filter: drop-shadow(0 8px 25px rgba(181, 250, 35, 0.6));
}

.start-button-svg:active:not([disabled]) {
  transform: scale(0.98);
}

.start-button-svg[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.start-button-svg svg {
  width: 100%;
  height: auto;
  max-width: 300px;
}

.start-button-svg svg rect {
  transition: all 0.3s ease;
}

.start-button-svg:hover svg rect {
  fill-opacity: 1;
}

.start-button-svg svg text {
  transition: all 0.3s ease;
}

.start-button-svg:hover svg text {
  fill: #000000;
}
/* ========== 原来的模式选择样式（备份保留） ========== */
.mode-select-screen {
  padding: clamp(20px, 4vh, 40px);
  position: relative;
}

.mode-select-screen .header {
  margin-bottom: 40px;
}

/* 左上角返回按钮 - 使用ow-button样式但调整大小 */
.mode-select-screen .back-button-styled {
  position: absolute !important;
  top: 20px !important;
  left: 0px !important;
  z-index: 100 !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  min-width: auto !important;
  transform: translateX(0) !important;
}

.mode-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 16px;  /* 适中的间距 */
  width: 100%;
  max-width: 600px;
  margin-bottom: 40px;
}

.mode-button {
  width: 100%;
  min-height: 60px;
  transition: all 0.3s ease;
}

.mode-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.mode-button-content {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: 100%;
  height: 100%;
  padding: 16px;
  gap: 16px;
}

.mode-icon {
  flex-shrink: 0;
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  max-width: 40px !important;
  max-height: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: iconFloat 3s ease-in-out infinite;
  overflow: hidden;
}

.mode-icon-img {
  width: 40px !important;
  height: 40px !important;
  max-width: 40px !important;
  max-height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  object-fit: contain !important;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  display: block !important;
}

.mode-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  gap: 4px;
}

.mode-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.mode-subtitle {
  font-size: 14px;
  color: #b3b3b3;
  line-height: 1.4;
  margin: 0;
}

/* 为每个模式添加独特的悬停效果 */
.mode-button-endless:hover {
  border-color: rgba(79, 70, 229, 0.6) !important;
  box-shadow: 0 8px 30px rgba(79, 70, 229, 0.3);
}

.mode-button-challenge:hover {
  border-color: rgba(245, 158, 11, 0.6) !important;
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.3);
}

.mode-button-practice:hover {
  border-color: rgba(16, 185, 129, 0.6) !important;
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.3);
}

/* ========== 挑战模式结果样式 ========== */
.challenge-result {
  text-align: center;
  margin-bottom: 20px;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.stars-display {
  margin: 20px 0;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.star {
  font-size: 32px;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.star.filled {
  opacity: 1;
  animation: starGlow 1s ease infinite;
}

.stars-text {
  font-size: 18px;
  font-weight: 600;
  color: #ff9c00;
}

.pass-info {
  margin-top: 16px;
}

.pass-text {
  font-size: 14px;
  color: #7a7e83;
}

/* ========== 练习模式结果样式 ========== */
.practice-result {
  text-align: center;
  margin-bottom: 20px;
}

.practice-score {
  font-size: 18px;
  font-weight: 600;
  color: #4cd964;
  margin-bottom: 16px;
}
.endless-result {
  text-align: center;
  margin-bottom: 20px;
}

.endless-score {
  font-size: 20px;
  font-weight: 600;
  color: #4cd964;
  margin-bottom: 16px;
}

@keyframes starGlow {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.3);
  }
}

/* ========== 无尽模式结果样式 ========== */
/* ========== 响应式优化 ========== */
@media (max-width: 768px) {
  .mode-select-screen {
    padding: clamp(15px, 3vh, 25px);
  }
  
  .mode-buttons-container {
    gap: 24px;  /* 移动端稍微减少间距 */
    margin-bottom: 30px;
    max-width: 100%;
  }
  
  .mode-button {
    min-height: 55px;
  }
  
  .mode-button-content {
    padding: 12px;
    gap: 12px;
  }
  
  .mode-icon {
    width: 32px !important;
    height: 32px !important;
  }
  
  .mode-icon-img {
    width: 32px !important;
    height: 32px !important;
    max-width: 32px !important;
    max-height: 32px !important;
  }
  
  .mode-title {
    font-size: 18px;
  }
  
  .mode-subtitle {
    font-size: 13px;
  }
  
  .back-button-styled {
    top: 15px !important;
    left: 15px !important;
    padding: 6px 12px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 480px) {
  .mode-buttons-container {
    gap: 20px;  /* 小屏幕保持合适间距 */
  }
  
  .mode-button {
    min-height: 50px;
  }
  
  .mode-button-content {
    padding: 10px;
    gap: 10px;
  }
  
  .mode-icon {
    width: 28px !important;
    height: 28px !important;
  }
  
  .mode-icon-img {
    width: 28px !important;
    height: 28px !important;
    max-width: 28px !important;
    max-height: 28px !important;
  }
  
  .mode-title {
    font-size: 16px;
  }
  
  .mode-subtitle {
    font-size: 12px;
  }
}