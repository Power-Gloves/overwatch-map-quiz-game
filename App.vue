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
        style="position: absolute !important; top: 20px !important; right: 8px !important; z-index: 100 !important; width: 40px !important; height: 40px !important; cursor: pointer !important; transition: all 0.3s ease !important;"
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
        style="position: absolute !important; top: 20px !important; left: 8px !important; z-index: 100 !important; width: 40px !important; height: 40px !important; cursor: pointer !important; transition: all 0.3s ease !important;"
        @mouseover="$event.target.style.transform = 'scale(1.1)'"
        @mouseout="$event.target.style.transform = 'scale(1)'"
      />
      
      <!-- 右上角音效控制按钮 -->
      <img 
        src="/src/assets/images/icons/audio-control.svg" 
        alt="音效设置" 
        @click="toggleAudioPanel"
        style="position: absolute !important; top: 20px !important; right: 8px !important; z-index: 100 !important; width: 40px !important; height: 40px !important; cursor: pointer !important; transition: all 0.3s ease !important;"
      />
      
      <div class="header">
        <h1 class="title glow-text ow-title-skew">选择游戏模式</h1>
        <p class="subtitle">每种模式都有独特的挑战体验</p>
      </div>
      
      <div class="content">
        <!-- 新的OW四方形风格模式选择 -->
        <div class="ow-mode-container" style="display: flex !important; flex-direction: column !important; gap: 16px !important; width: 100% !important; max-width: 600px !important;">
          <div 
            v-for="mode in modeItems" 
            :key="mode.value"
            class="ow-mode-card"
            @click="() => handleModeSelect(mode.value)"
            style="display: flex !important; flex-direction: row !important; align-items: stretch !important; height: 80px !important; background: #464F6A !important; border: 2px solid rgba(59, 156, 225, 0.3) !important; cursor: pointer !important; border-radius: 4px !important; overflow: hidden !important;"
          >
            <!-- 左侧图标区域 -->
            <div class="ow-mode-left" style="width: 80px !important; min-width: 80px !important; max-width: 80px !important; background: transparent !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; padding: 0 !important;">
              <img 
                :src="mode.icon" 
                :alt="mode.title" 
                class="ow-mode-icon"
                style="width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; min-width: 100% !important; min-height: 100% !important; object-fit: cover !important; display: block !important;"
              />
            </div>
            
            <!-- 中间内容区域 -->
            <div class="ow-mode-center" style="flex: 1 !important; padding: 16px 20px !important; display: flex !important; flex-direction: column !important; justify-content: center !important; background: #464F6A !important;">
              <h3 class="ow-mode-title" style="font-size: 18px !important; font-weight: 700 !important; color: #ffffff !important; margin: 0 0 4px 0 !important;">{{ mode.title }}</h3>
              <p class="ow-mode-subtitle" style="font-size: 13px !important; color: #C9D4E3 !important; margin: 0 !important;">{{ mode.subtitle }}</p>
            </div>
          </div>
        </div>

        <!-- 备份：原来的模式选择（隐藏） -->
        <div class="mode-buttons-container" style="display: none;">
          <SpotlightCard 
            v-for="mode in modeItems" 
            :key="mode.value"
            :class="['mode-button', `mode-button-${mode.value}`]"
            :spotlight-color="mode.spotlightColor"
            @click="() => handleModeSelect(mode.value)"
            style="min-height: 90px !important; max-height: 90px !important; height: 90px !important; padding: 0 !important; margin: 0 0 16px 0 !important;"
          >
            <div 
              class="mode-button-content" 
              style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: flex-start !important; gap: 12px !important; padding: 18px 12px !important; margin: 0 !important; height: 100% !important;"
            >
              <div 
                class="mode-icon"
                style="flex-shrink: 0 !important; order: 1 !important;"
              >
                <img 
                  :src="mode.icon" 
                  :alt="mode.title" 
                  class="mode-icon-img" 
                  style="width: 40px !important; height: 40px !important; max-width: 40px !important; max-height: 40px !important; object-fit: contain;"
                />
              </div>
              <div 
                class="mode-text"
                style="flex: 1 !important; display: flex !important; flex-direction: column !important; align-items: flex-start !important; text-align: left !important; order: 2 !important;"
              >
                <h3 class="mode-title">{{ mode.title }}</h3>
                <p class="mode-subtitle">{{ mode.subtitle }}</p>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>

    <!-- 游戏页面 -->
    <div v-else-if="gameState.status === 'playing'" class="game-screen">
      <!-- 左上角返回按钮 -->
      <img 
        src="/src/assets/images/icons/back-arrow-left.svg" 
        alt="返回" 
        @click="backToModeSelect"
        style="position: absolute !important; top: 20px !important; left: 8px !important; z-index: 100 !important; width: 40px !important; height: 40px !important; cursor: pointer !important; transition: all 0.3s ease !important;"
        @mouseover="$event.target.style.transform = 'scale(1.1)'"
        @mouseout="$event.target.style.transform = 'scale(1)'"
      />
      
      <!-- 右上角音效控制按钮 -->
      <img 
        src="/src/assets/images/icons/audio-control.svg" 
        alt="音效设置" 
        @click="toggleAudioPanel"
        style="position: absolute !important; top: 20px !important; right: 8px !important; z-index: 100 !important; width: 40px !important; height: 40px !important; cursor: pointer !important; transition: all 0.3s ease !important;"
      />
      
      <!-- 顶部计分板 - 重新设计 -->
      <div class="score-board">
        <div class="score-items">
          <div class="score-item">
            <img src="/src/assets/images/defenban/1.png" alt="已答题" class="score-icon-img" />
            <div class="score-info">
              <span class="score-label">已答题</span>
              <span class="score-value">{{ gameState.totalAnswered }}</span>
            </div>
          </div>
          <div class="score-divider"></div>
          <div class="score-item">
            <img src="/src/assets/images/defenban/2.png" alt="正确" class="score-icon-img" />
            <div class="score-info">
              <span class="score-label">正确</span>
              <span class="score-value correct">{{ gameState.correctCount }}</span>
            </div>
          </div>
          <div class="score-divider"></div>
          <div class="score-item">
            <img src="/src/assets/images/defenban/3.png" alt="正确率" class="score-icon-img" />
            <div class="score-info">
              <span class="score-label">正确率</span>
              <span class="score-value accuracy">{{ gameState.accuracy.toFixed(0) }}%</span>
            </div>
          </div>
        </div>
        <div class="accuracy-bar">
          <div class="accuracy-fill" :style="{ width: gameState.accuracy + '%' }">
            <ElectricBorder class="electric-progress-border" />
          </div>
          <div class="accuracy-glow" :style="{ width: gameState.accuracy + '%' }"></div>
        </div>
      </div>
      
      <!-- 卡片区域 - 恢复原来的逻辑，只添加Stack风格动画 -->
      <div class="card-stack">
        <!-- 下一张卡片（背景层） -->
        <VueBitsProfileCard 
          v-if="gameState.nextQuestion" 
          class="image-card-wrapper next-card"
          :enable-tilt="false"
        >
          <div class="image-card-inner">
            <div class="card-header">
              <span class="card-number">#{{ gameState.totalAnswered + 2 }}</span>
              <span class="card-type">{{ gameState.nextQuestion.mapData.type }}</span>
            </div>
            <div class="image-container">
              <img :src="gameState.nextQuestion.screenshot.url" alt="下一张" class="map-image" />
            </div>
          </div>
        </VueBitsProfileCard>

        <!-- 当前卡片（顶层） -->
        <VueBitsProfileCard 
          v-if="gameState.currentQuestion" 
          class="image-card-wrapper current-card"
          :class="{
            'answer-correct': showAnswerFeedback && lastAnswerCorrect,
            'answer-wrong': showAnswerFeedback && !lastAnswerCorrect,
            'idle': !isAnswering && !showAnswerFeedback
          }"
          :enable-tilt="true"
        >
          <div class="image-card-inner">
            <div class="card-header">
              <span class="card-number">#{{ gameState.totalAnswered + 1 }}</span>
              <span class="card-type">{{ gameState.currentQuestion.mapData.type }}</span>
            </div>
            
            <div class="image-container">
              <img :src="gameState.currentQuestion.screenshot.url" alt="地图截图" class="map-image" />
              
              <!-- 答案反馈覆盖层 -->
              <div v-if="showAnswerFeedback" class="answer-feedback-overlay">
                <div class="feedback-icon">
                  <span v-if="lastAnswerCorrect" class="correct-icon">✓</span>
                  <span v-else class="wrong-icon">✗</span>
                </div>
                <div class="feedback-text">
                  <span v-if="lastAnswerCorrect" class="correct-text">正确！</span>
                  <span v-else class="wrong-text">错误</span>
                </div>
                <div v-if="!lastAnswerCorrect" class="correct-answer-text">
                  正确答案：{{ gameState.currentQuestion.correctAnswer }}
                </div>
              </div>
            </div>
          </div>
        </VueBitsProfileCard>
      </div>

      <!-- 分离的答案区域 - 在卡片外部 -->
      <div class="separated-answers" v-if="gameState.currentQuestion">
        <p class="question-text">这是哪个地图？</p>
        <div class="answer-grid">
          <button 
            v-for="(option, index) in gameState.currentQuestion.allOptions" 
            :key="`${gameState.totalAnswered}-${index}-${option}`"
            @click="handleAnswer(option)"
            class="answer-btn"
            :class="{
              ['answer-' + (index + 1)]: true,
              'selected': selectedAnswer === option,
              'correct-selected': selectedAnswer === option && lastAnswerCorrect,
              'wrong-selected': selectedAnswer === option && !lastAnswerCorrect
            }"
            :disabled="isAnswering"
          >
            <span class="answer-letter">{{ String.fromCharCode(65 + index) }}</span>
            <span class="answer-text">
              <template v-if="getDisplayText(option, gameState.mode).hasBlur">
                {{ getDisplayText(option, gameState.mode).beforeText }}<span 
                  style="filter: blur(4px); text-shadow: 0 0 8px currentColor;"
                >{{ getDisplayText(option, gameState.mode).blurText }}</span>{{ getDisplayText(option, gameState.mode).afterText }}
              </template>
              <template v-else>
                {{ getDisplayText(option, gameState.mode).text }}
              </template>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 游戏结束页面 -->
    <div v-else-if="gameState.status === 'finished'" class="finish-screen">
      <VueBitsProfileCard class="stats-card-wrapper">
        <div class="stats-card-inner">
          <!-- 挑战模式结果 -->
          <div v-if="gameState.mode === 'challenge'" class="challenge-result">
            <div class="result-icon">
              {{ gameState.challenge?.isPassed ? '🎉' : '😔' }}
            </div>
            <h2 class="glow-text">
              {{ gameState.challenge?.isPassed ? '挑战成功！' : '挑战失败' }}
            </h2>
            
            <!-- 星级显示 -->
            <div v-if="gameState.challenge?.isPassed" class="stars-display">
              <div class="stars">
                <span 
                  v-for="star in 3" 
                  :key="star"
                  class="star"
                  :class="{ 'filled': star <= getChallengeStars() }"
                >
                  ⭐
                </span>
              </div>
              <p class="stars-text">{{ getStarsText() }}</p>
            </div>
            
            <div class="pass-info">
              <p class="pass-text">
                通关条件：{{ gameState.challenge?.passAccuracy }}% 正确率
              </p>
            </div>
          </div>
          
          <!-- 练习模式结果 -->
          <div v-else-if="gameState.mode === 'practice'" class="practice-result">
            <div class="result-icon">📚</div>
            <h2 class="glow-text">练习完成！</h2>
            <p class="practice-score">完成 {{ gameState.totalAnswered }} 题练习</p>
          </div>
          
          <!-- 无尽模式结果 -->
          <div v-else class="endless-result">
            <div class="trophy-icon">🏆</div>
            <h2 class="glow-text">游戏结束！</h2>
            <p class="endless-score">连续答对 {{ gameState.correctCount }} 题</p>
          </div>
          
          <!-- 通用统计 -->
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-number">{{ gameState.totalAnswered }}</div>
              <div class="stat-label">总题数</div>
            </div>
            <div class="stat-box">
              <div class="stat-number correct">{{ gameState.correctCount }}</div>
              <div class="stat-label">正确数</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">{{ gameState.accuracy.toFixed(1) }}%</div>
              <div class="stat-label">正确率</div>
            </div>
          </div>

          <div class="rating">
            <p class="rating-text">{{ getRating(gameState.accuracy) }}</p>
          </div>
          
          <div class="actions">
            <button class="btn btn-primary ow-button" @click="handleRestart">
              <span class="btn-text">再玩一次</span>
              <span class="btn-glow"></span>
            </button>
          </div>
        </div>
      </VueBitsProfileCard>
    </div>

    <!-- 错误页面 -->
    <div v-else-if="gameState.status === 'error'" class="error-screen">
      <VueBitsProfileCard class="error-card-wrapper">
        <div class="error-card-inner">
          <div class="error-icon">⚠️</div>
          <h2>出现错误</h2>
          <p>{{ gameState.error }}</p>
          <button class="btn btn-primary ow-button" @click="handleRestart">
            <span class="btn-text">重新开始</span>
            <span class="btn-glow"></span>
          </button>
        </div>
      </VueBitsProfileCard>
    </div>
    
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameState } from '@/composables/useGameState'
import { useAudio } from '@/composables/useAudio'
import VueBitsProfileCard from '@/component/VueBitsProfileCard/VueBitsProfileCardSimple.vue'
import GameErrorBoundary from '@/components/GameErrorBoundary.vue'
import SpotlightCard from '@/components/SpotlightCard.vue'
import AudioControlPanel from '@/components/AudioControlPanel.vue'
import ElectricBorder from '@/component/ElectricBorder/ElectricBorder.vue'
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

// 动画状态管理
const isAnswering = ref(false)
const showAnswerFeedback = ref(false)
const lastAnswerCorrect = ref(false)
const selectedAnswer = ref<string | null>(null)

// 音效面板控制
const showAudioPanel = ref(false)

const toggleAudioPanel = () => {
  showAudioPanel.value = !showAudioPanel.value
  playButtonClick()
}

// 简化的文本显示方法 - 返回带模糊标记的对象
const getDisplayText = (text: string, gameMode: GameMode) => {
  // 只在挑战模式中模糊文字
  if (gameMode !== 'challenge' && gameMode !== GameMode.CHALLENGE) {
    return { text, hasBlur: false }
  }
  
  const length = text.length
  if (length <= 2) return { text, hasBlur: false } // 太短不模糊
  
  // 根据长度决定模糊几个字
  let hideCount = 1
  if (length >= 6) hideCount = Math.floor(length / 2) - 1
  else if (length >= 4) hideCount = 2
  
  // 保留首尾，中间模糊
  const start = Math.floor((length - hideCount) / 2)
  const end = start + hideCount
  
  return {
    beforeText: text.substring(0, start),
    blurText: text.substring(start, end),
    afterText: text.substring(end),
    hasBlur: true
  }
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
  if (isAnswering.value || !gameState.currentQuestion) return
  
  // 设置选中的答案
  selectedAnswer.value = answer
  
  // 判断答案是否正确
  const isCorrect = answer === gameState.currentQuestion.correctAnswer
  lastAnswerCorrect.value = isCorrect
  
  // 播放音效
  playButtonClick()
  
  // 开始答题动画
  isAnswering.value = true
  
  // 显示答案反馈覆盖层
  showAnswerFeedback.value = true
  
  // 等待反馈显示
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 隐藏反馈覆盖层
  showAnswerFeedback.value = false
  
  // 提交答案
  answerQuestion(answer)
  
  // 重置动画状态
  isAnswering.value = false
  selectedAnswer.value = null
}

const handleRestart = () => {
  playButtonClick()
  stopMusic()
  restartGame()
  playMenuMusic()
}

const getChallengeStars = () => {
  const accuracy = gameState.accuracy
  if (accuracy >= 90) return 3
  if (accuracy >= 80) return 2
  if (accuracy >= 70) return 1
  return 0
}

const getStarsText = () => {
  const stars = getChallengeStars()
  switch (stars) {
    case 3: return '完美通关！'
    case 2: return '优秀表现！'
    case 1: return '成功通关！'
    default: return ''
  }
}

const getRating = (accuracy: number) => {
  if (accuracy >= 90) return '🌟 传奇大师！'
  if (accuracy >= 80) return '💎 钻石水平！'
  if (accuracy >= 70) return '🥇 黄金选手！'
  if (accuracy >= 60) return '🥈 白银玩家'
  return '🥉 继续加油！'
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
.game-screen,
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

/* ========== 游戏页面 ========== */
.game-screen {
  padding: clamp(5px, 1vh, 10px);
  gap: clamp(10px, 2vh, 20px);
}

/* ========== 计分板 - 守望先锋绿色风格 ========== */
.score-board {
  width: 100%;
  max-width: 600px;
  flex-shrink: 0;
  margin: 0 8px;
  background: linear-gradient(135deg, #464F6A 0%, #2B3753 100%);
  border-radius: 0;
  padding: 16px 20px;
  border: 2px solid rgba(181, 250, 35, 0.4);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(181, 250, 35, 0.2);
  position: relative;
}

.score-board::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, transparent 0%, #B5FA23 50%, transparent 100%);
  opacity: 0.8;
}

.score-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 14px;
  gap: 12px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: center;
}

.score-icon {
  font-size: 20px;
  opacity: 0.8;
}

.score-icon-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  opacity: 0.8;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.score-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.score-label {
  font-size: 10px;
  color: #C9D4E3;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  font-family: 'Bank Sans EF CY Compressed', sans-serif;
  line-height: 1;
  margin-bottom: 4px;
}

.score-value {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  font-family: 'Orbitron', sans-serif;
  line-height: 1;
}

.score-value.correct {
  color: #B5FA23;
  text-shadow: 0 0 10px rgba(181, 250, 35, 0.6);
}

.score-value.accuracy {
  color: #B5FA23;
  text-shadow: 0 0 10px rgba(181, 250, 35, 0.6);
}

.score-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent 0%, rgba(181, 250, 35, 0.3) 50%, transparent 100%);
}

.accuracy-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0;
  overflow: visible;
  border: 1px solid rgba(181, 250, 35, 0.2);
  position: relative;
}

.accuracy-fill {
  height: 100%;
  background: linear-gradient(90deg, #B5FA23 0%, #32CD32 100%);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 10px rgba(181, 250, 35, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 2;
}

.electric-progress-border {
  position: absolute;
  top: -1px;
  left: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  pointer-events: none;
  z-index: 10;
  mix-blend-mode: screen;
}

.accuracy-glow {
  position: absolute;
  top: -2px;
  left: 0;
  height: calc(100% + 4px);
  background: linear-gradient(90deg, rgba(181, 250, 35, 0.4) 0%, rgba(50, 205, 50, 0.4) 100%);
  filter: blur(4px);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

/* ========== 卡片堆叠 - Stack风格 ========== */
.card-stack {
  position: relative;
  width: 100%;
  max-width: clamp(200px, 40vw, 280px);
  height: clamp(480px, 65vh, 700px);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.image-card-wrapper {
  position: absolute;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-style: preserve-3d;
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4));
  isolation: isolate;
  contain: layout style;
}

/* 下一张卡片 - 简单的Stack风格层叠 */
.next-card {
  transform: scale(0.95) translateY(10px) translateZ(-20px);
  opacity: 0.8;
  z-index: 1;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
}

/* 当前卡片 - 在最前面 */
.current-card {
  z-index: 2;
  transform: scale(1) translateY(0) translateZ(0);
  animation: cardEntrance 0.5s ease;
}

.current-card.idle {
  animation: cardEntrance 0.5s ease, cardIdle 10s ease-in-out 2s infinite;
  transform-style: preserve-3d;
  perspective: 800px;
  filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.5));
}

/* 简单的淡出效果 */
.current-card.swipe-right,
.current-card.swipe-left {
  animation: cardFadeOut 0.5s ease forwards;
}

/* 下一张卡片升级为当前卡片 */
.current-card.swipe-right ~ .next-card,
.current-card.swipe-left ~ .next-card {
  animation: stackPromote 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards;
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

@keyframes cardIdle {
  0% {
    transform: scale(1) translateY(0) rotateX(0deg) rotateY(0deg) translateZ(0px);
  }
  12.5% {
    transform: scale(1.02) translateY(-8px) rotateX(4deg) rotateY(-3deg) translateZ(10px);
  }
  25% {
    transform: scale(1.01) translateY(-4px) rotateX(2deg) rotateY(4deg) translateZ(6px);
  }
  37.5% {
    transform: scale(1.02) translateY(-6px) rotateX(-2deg) rotateY(3deg) translateZ(8px);
  }
  50% {
    transform: scale(1.01) translateY(-1px) rotateX(-4deg) rotateY(-4deg) translateZ(3px);
  }
  62.5% {
    transform: scale(1.02) translateY(-5px) rotateX(-3deg) rotateY(2deg) translateZ(7px);
  }
  75% {
    transform: scale(1.02) translateY(-7px) rotateX(2deg) rotateY(-3deg) translateZ(9px);
  }
  87.5% {
    transform: scale(1.01) translateY(-3px) rotateX(3deg) rotateY(2deg) translateZ(5px);
  }
  100% {
    transform: scale(1) translateY(0) rotateX(0deg) rotateY(0deg) translateZ(0px);
  }
}

@keyframes shadowIdle {
  0% {
    transform: translateX(-50%) scale(1) skewX(0deg);
    opacity: 0.4;
  }
  12.5% {
    transform: translateX(-45%) scale(0.8) skewX(-8deg);
    opacity: 0.6;
  }
  25% {
    transform: translateX(-55%) scale(0.9) skewX(6deg);
    opacity: 0.5;
  }
  37.5% {
    transform: translateX(-48%) scale(0.85) skewX(5deg);
    opacity: 0.55;
  }
  50% {
    transform: translateX(-50%) scale(1.1) skewX(-6deg);
    opacity: 0.4;
  }
  62.5% {
    transform: translateX(-52%) scale(0.88) skewX(4deg);
    opacity: 0.52;
  }
  75% {
    transform: translateX(-46%) scale(0.82) skewX(-7deg);
    opacity: 0.58;
  }
  87.5% {
    transform: translateX(-54%) scale(0.92) skewX(5deg);
    opacity: 0.48;
  }
  100% {
    transform: translateX(-50%) scale(1) skewX(0deg);
    opacity: 0.4;
  }
}

/* 简单的淡出动画 */
@keyframes cardFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* 简单的Stack升级动画 */
@keyframes stackPromote {
  from {
    transform: scale(0.95) translateY(10px) translateZ(-20px);
    opacity: 0.8;
    z-index: 1;
  }
  to {
    transform: scale(1) translateY(0) translateZ(0);
    opacity: 1;
    z-index: 2;
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

/* ========== 分离的答案区域 - 守望先锋绿色主题 ========== */
.separated-answers {
  width: 100%;
  max-width: clamp(200px, 40vw, 280px);
  background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
  border-radius: 4px;
  padding: clamp(12px, 2vh, 16px);
  backdrop-filter: blur(20px);
  /* 守望先锋经典绿色边框 */
  border: 2px solid rgba(181, 250, 35, 0.8);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    /* 绿色外发光效果 */
    0 0 0 1px rgba(181, 250, 35, 0.4),
    0 0 20px rgba(181, 250, 35, 0.3);
  flex-shrink: 0;
  margin-top: clamp(35px, 7vh, 60px);
  position: relative;
  overflow: hidden;
}

.separated-answers::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #B5FA23 0%, #32CD32 50%, #B5FA23 100%);
  animation: topGlow 3s ease-in-out infinite;
}

/* 左侧绿色装饰条 */
.separated-answers::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, transparent 0%, #B5FA23 30%, #32CD32 70%, transparent 100%);
  opacity: 0.9;
}

@keyframes topGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.question-text {
  font-size: clamp(16px, 3.5vw, 20px);
  font-weight: 600;
  text-align: center;
  margin-bottom: clamp(12px, 2vh, 16px);
  color: #ffffff;
}

/* 关键：2行2列答案网格 */
.answer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: clamp(8px, 1.5vh, 12px);
  width: 100%;
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: clamp(6px, 1vh, 10px);
  padding: clamp(12px, 2vh, 16px) clamp(10px, 2vw, 14px);
  /* 守望先锋黑色背景 */
  background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
  /* 守望先锋白色边框 */
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  /* 稍微调大按钮整体字体找到平衡点 */
  font-size: clamp(14.5px, 3vw, 18px) !important;
  min-height: clamp(47px, 7.8vh, 62px);
  position: relative;
  overflow: hidden;
  transform: translateY(0);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  /* 守望先锋按钮阴影 */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3), 
    0 0 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.answer-btn:hover {
  /* 守望先锋绿色悬浮效果 */
  background: linear-gradient(135deg, #B5FA23 0%, #32CD32 100%);
  border-color: rgba(255, 255, 255, 1);
  color: #000000;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0px 0px 2px 3px rgba(181, 250, 35, 0.8),
    0 4px 15px rgba(181, 250, 35, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: owGreenGlow 2s ease-in-out infinite;
}

.answer-btn:active {
  transform: translateY(0) scale(0.95);
  box-shadow: 
    0 2px 10px rgba(181, 250, 35, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: owButtonPress 0.2s ease;
}

.answer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 选中状态样式 - 守望先锋绿色风格 */
.answer-btn.selected {
  background: linear-gradient(135deg, #B5FA23 0%, #32CD32 100%);
  border-color: rgba(255, 255, 255, 1);
  color: #000000;
  transform: translateY(-1px) scale(1.02);
  box-shadow: 
    0px 0px 2px 3px rgba(181, 250, 35, 1),
    0 4px 15px rgba(181, 250, 35, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.answer-btn.correct-selected {
  background: linear-gradient(135deg, #33A03D 0%, #4cd964 100%);
  border-color: #4cd964;
  color: #ffffff;
  box-shadow: 
    0px 0px 2px 3px rgba(76, 217, 100, 1),
    0 4px 20px rgba(76, 217, 100, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: correctButtonPulse 0.6s ease;
}

.answer-btn.wrong-selected {
  background: linear-gradient(135deg, #DE4561 0%, #ff4757 100%);
  border-color: #ff4757;
  color: #ffffff;
  box-shadow: 
    0px 0px 2px 3px rgba(255, 71, 87, 1),
    0 4px 20px rgba(255, 71, 87, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: wrongButtonShake 0.6s ease;
}

.answer-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.answer-btn:hover::before {
  left: 100%;
}

@keyframes buttonClick {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-1px) scale(0.98);
  }
  100% {
    transform: translateY(0) scale(0.98);
  }
}

@keyframes correctButtonPulse {
  0%, 100% {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 4px 20px rgba(76, 217, 100, 0.4);
  }
  50% {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 30px rgba(76, 217, 100, 0.6);
  }
}

@keyframes wrongButtonShake {
  0%, 100% {
    transform: translateY(-1px) scale(1.02) translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateY(-1px) scale(1.02) translateX(-3px);
  }
  20%, 40%, 60%, 80% {
    transform: translateY(-1px) scale(1.02) translateX(3px);
  }
}

/* 守望先锋绿色主题动画 */
@keyframes owGreenGlow {
  0%, 100% { 
    box-shadow: 
      0px 0px 2px 3px rgba(181, 250, 35, 0.8),
      0 4px 15px rgba(181, 250, 35, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  50% { 
    box-shadow: 
      0px 0px 4px 5px rgba(181, 250, 35, 0.9),
      0 6px 25px rgba(181, 250, 35, 0.8),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

.answer-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(36px, 5.5vw, 44px);
  height: clamp(36px, 5.5vw, 44px);
  /* 守望先锋绿色字母标识 */
  background: linear-gradient(135deg, #B5FA23, #32CD32);
  border-radius: 4px;
  font-weight: 700;
  color: #000000;
  flex-shrink: 0;
  /* 强制增大字母字体 */
  font-size: clamp(18px, 3.5vw, 22px) !important;
  /* 守望先锋字母标识样式 */
  box-shadow: 
    0 2px 8px rgba(181, 250, 35, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.answer-text {
  flex: 1;
  text-align: left;
  font-weight: 600 !important;
  line-height: 1.3;
  color: #ffffff;
  transform: skew(-8deg) !important;
  font-style: italic !important;
  letter-spacing: 0.5px !important;
  font-family: 'Bank Sans EF CY Compressed', sans-serif !important;
  /* 稍微调大字体大小找到平衡点 */
  font-size: clamp(14.5px, 3vw, 18px) !important;
}



/* ========== 结束页面 ========== */
.stats-card-inner h2 {
  font-size: clamp(24px, 5vw, 36px);
  margin-bottom: 16px;
  color: #ffffff;
}

.trophy-icon {
  font-size: clamp(48px, 8vw, 80px);
  margin-bottom: 16px;
  animation: trophyBounce 1s ease infinite;
}

@keyframes trophyBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-5px) scale(1.05); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  width: 100%;
}

.stat-box {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-number {
  font-size: clamp(20px, 5vw, 32px);
  font-weight: 700;
  margin-bottom: 4px;
  color: #ff9c00;
}

.stat-number.correct {
  color: #4cd964;
}

.rating {
  margin-bottom: 20px;
}

.rating-text {
  font-size: clamp(16px, 4vw, 24px);
  font-weight: 600;
  color: #4cd964;
}

/* ========== 错误页面 ========== */
.error-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.error-card-inner h2 {
  color: #ff4757;
  margin-bottom: 16px;
  font-size: 28px;
}

.error-card-inner p {
  margin-bottom: 24px;
  color: #b3b3b3;
  font-size: 16px;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .game-screen {
    padding: clamp(8px, 1.5vh, 12px);
  }
  
  .game-logo {
    max-width: clamp(200px, 70vw, 400px);
    max-height: clamp(60px, 15vh, 120px);
  }
  
  .ow-icon-logo {
    max-width: clamp(90px, 20vw, 120px);
    max-height: clamp(90px, 20vw, 120px);
  }
  
  .game-screen .back-button-styled {
    top: 15px !important;
    left: 5px !important;
    padding: 6px 12px !important;
    font-size: 12px !important;
  }
  
  .image-card-wrapper {
    max-width: min(75vw, 240px);
    height: clamp(420px, 55vh, 580px);
  }
  
  .card-stack {
    max-width: min(75vw, 240px);
    height: clamp(420px, 55vh, 580px);
  }
  
  .separated-answers {
    max-width: min(75vw, 240px);
    padding: clamp(10px, 1.5vh, 14px);
    margin-top: clamp(30px, 6vh, 45px);
  }
  
  .answer-grid {
    gap: clamp(6px, 1vh, 10px);
  }
  
  .answer-btn {
    padding: clamp(10px, 1.5vh, 14px) clamp(8px, 1.5vw, 12px);
    min-height: clamp(40px, 6vh, 56px);
  }
  
  /* 移动端动画优化 */
  .feedback-icon {
    font-size: clamp(40px, 6vw, 64px);
  }
  
  .feedback-text {
    font-size: clamp(18px, 3vw, 24px);
  }
  
  .correct-answer-text {
    font-size: clamp(12px, 2.5vw, 16px);
  }
}

@media (max-width: 480px) {
  .image-card-wrapper {
    max-width: 80vw;
    height: clamp(380px, 50vh, 520px);
  }
  
  .card-stack {
    max-width: 80vw;
    height: clamp(380px, 50vh, 520px);
  }
  
  .separated-answers {
    max-width: 80vw;
    padding: clamp(8px, 1vh, 12px);
    margin-top: clamp(15px, 3vh, 25px);
  }
  
  .answer-grid {
    gap: clamp(4px, 0.8vh, 8px);
  }
  
  .answer-btn {
    padding: clamp(8px, 1vh, 12px) clamp(6px, 1vw, 10px);
    min-height: clamp(36px, 5vh, 48px);
  }
  
  .answer-text {
    font-size: clamp(10px, 2vw, 14px);
  }
}

@media (max-height: 600px) {
  .game-screen {
    padding: clamp(5px, 0.8vh, 8px);
  }
  
  .image-card-wrapper {
    height: clamp(300px, 60vh, 420px);
  }
  
  .card-stack {
    height: clamp(300px, 60vh, 420px);
  }
  
  .separated-answers {
    padding: clamp(8px, 1vh, 10px);
    margin-top: clamp(12px, 2vh, 20px);
  }
  
  .answer-btn {
    min-height: clamp(32px, 4vh, 44px);
  }
}

/* 超宽屏幕优化 */
@media (min-width: 1200px) {
  .image-card-wrapper {
    max-width: 320px;
    height: clamp(600px, 70vh, 800px);
  }
  
  .card-stack {
    max-width: 320px;
    height: clamp(600px, 70vh, 800px);
  }
  
  .separated-answers {
    max-width: 320px;
    margin-top: clamp(30px, 6vh, 50px);
  }
  
  .answer-btn {
    min-height: clamp(56px, 8vh, 72px);
  }
}
</style>

/* 减少动画偏好设置 */
@media (prefers-reduced-motion: reduce) {
  .current-card,
  .next-card,
  .answer-btn,
  .feedback-icon,
  .feedback-text,
  .correct-answer-text,
  .answer-feedback-overlay {
    animation: none !important;
    transition: opacity 0.2s ease, transform 0.2s ease !important;
  }
  
  .current-card.swipe-right,
  .current-card.swipe-left {
    animation: none !important;
    opacity: 0;
    transform: translateX(0);
  }
  
  .current-card.answer-correct,
  .current-card.answer-wrong {
    animation: none !important;
  }
  
  .current-card.swipe-right::before,
  .current-card.swipe-left::before {
    animation: none !important;
    opacity: 0;
  }
}

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
.mode-select-screen .ow-mode-container {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
  width: 100% !important;
  max-width: 600px !important;
}

.mode-select-screen .ow-mode-card {
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch !important;
  height: 80px !important;
  background: #464F6A !important;
  border: 2px solid rgba(59, 156, 225, 0.3) !important;
  cursor: pointer !important;
  border-radius: 4px !important;
  overflow: hidden !important;
  position: relative !important;
}

.mode-select-screen .ow-mode-left {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  background: #3B9CE1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
}
}

.mode-select-screen .ow-mode-icon {
  width: 48px !important;
  height: 48px !important;
  max-width: 48px !important;
  max-height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  object-fit: contain !important;
  display: block !important;
}

.mode-select-screen .ow-mode-center {
  flex: 1 !important;
  flex-grow: 1 !important;
  flex-shrink: 1 !important;
  padding: 16px 20px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  background: #464F6A !important;
}

.mode-select-screen .ow-mode-title {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  margin: 0 0 4px 0 !important;
}

.mode-select-screen .ow-mode-subtitle {
  font-size: 13px !important;
  color: #C9D4E3 !important;
  margin: 0 !important;
}

.mode-select-screen .ow-mode-right {
  width: 60px !important;
  min-width: 60px !important;
  max-width: 60px !important;
  background: #FF7575 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  flex-grow: 0 !important;
}

.mode-select-screen .ow-mode-arrow {
  font-size: 24px !important;
  color: #F5F5F5 !important;
  font-weight: bold !important;
}

/* 响应式调整 - 移除冲突的样式，保持简洁 */

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