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
      <div class="header">
        <h1 class="title glow-text">OVERWATCH</h1>
        <p class="subtitle">地图识别挑战</p>
      </div>
      
      <div class="content">
        <!-- 统计预览 -->
        <VueBitsProfileCard class="stats-preview-card">
          <div class="stats-preview-content">
            <div class="icon-wrapper">
              <div class="ow-icon">🎮</div>
            </div>
            <p class="preview-text">准备好挑战你的地图知识了吗？</p>
            <p class="stats-text">
              <span class="stat-badge">{{ mapCount }}</span> 个地图 · 
              <span class="stat-badge">{{ totalScreenshots }}</span> 张截图
            </p>
          </div>
        </VueBitsProfileCard>
        
        <div class="actions">
          <button 
            class="btn btn-primary ow-button" 
            @click="showModeSelect" 
            :disabled="isLoading"
          >
            <span class="btn-text">开始游戏</span>
            <span class="btn-glow"></span>
          </button>
        </div>
      </div>
      
      <div class="footer">
        <p class="version">v1.0.0</p>
      </div>
    </div>

    <!-- 模式选择页面 -->
    <div v-else-if="gameState.status === 'mode_select'" class="mode-select-screen">
      <!-- 左上角返回按钮 -->
      <button class="btn btn-primary ow-button back-button-ow" @click="backToHome">
        <span class="btn-text">← 返回</span>
        <span class="btn-glow"></span>
      </button>
      
      <div class="header">
        <h1 class="title glow-text">选择游戏模式</h1>
        <p class="subtitle">每种模式都有独特的挑战体验</p>
      </div>
      
      <div class="content">
        <div class="mode-buttons-container">
          <SpotlightCard 
            v-for="mode in modeItems" 
            :key="mode.value"
            :class="['mode-button', `mode-button-${mode.value}`]"
            :spotlight-color="mode.spotlightColor"
            @click="() => handleModeSelect(mode.value)"
          >
            <div class="mode-button-content">
              <div class="mode-left">
                <div class="mode-icon">{{ mode.icon }}</div>
                <div class="mode-text">
                  <h3 class="mode-title">{{ mode.title }}</h3>
                  <p class="mode-subtitle">{{ mode.subtitle }}</p>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>

    <!-- 游戏页面 -->
    <div v-else-if="gameState.status === 'playing'" class="game-screen">
      <!-- 顶部进度条 -->
      <div class="progress-bar-container">
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">已答题</span>
            <span class="stat-value">{{ gameState.totalAnswered }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确</span>
            <span class="stat-value correct">{{ gameState.correctCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正确率</span>
            <span class="stat-value">{{ gameState.accuracy.toFixed(1) }}%</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: gameState.accuracy + '%' }"></div>
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
            'swipe-right': isAnswering && lastAnswerCorrect,
            'swipe-left': isAnswering && !lastAnswerCorrect,
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
            <span class="answer-text">{{ option }}</span>
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
    </div>
  </GameErrorBoundary>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameState } from '@/composables/useGameState'
import VueBitsProfileCard from '@/component/VueBitsProfileCard/VueBitsProfileCardSimple.vue'
import GameErrorBoundary from '@/components/GameErrorBoundary.vue'
import SpotlightCard from '@/components/SpotlightCard.vue'
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

// 动画状态管理
const isAnswering = ref(false)
const showAnswerFeedback = ref(false)
const lastAnswerCorrect = ref(false)
const selectedAnswer = ref<string | null>(null)

const modeItems = computed(() => [
  {
    icon: "♾️",
    title: "无尽模式",
    subtitle: "无限题目，追求连续答对的最高记录！",
    spotlightColor: "rgba(79, 70, 229, 0.6)",
    value: 'endless'
  },
  {
    icon: "🎯",
    title: "挑战模式", 
    subtitle: "20题挑战，达到70%正确率通关！",
    spotlightColor: "rgba(245, 158, 11, 0.6)",
    value: 'challenge'
  },
  {
    icon: "📚",
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
  } catch (error) {
    console.error('启动游戏失败:', error)
  }
}

const backToHome = () => {
  restartGame()
}

const handleAnswer = async (answer: string) => {
  if (isAnswering.value || !gameState.currentQuestion) return
  
  // 设置选中的答案
  selectedAnswer.value = answer
  
  // 判断答案是否正确
  const isCorrect = answer === gameState.currentQuestion.correctAnswer
  lastAnswerCorrect.value = isCorrect
  
  // 开始答题动画
  isAnswering.value = true
  
  // 显示答案反馈
  showAnswerFeedback.value = true
  
  // 短暂显示反馈
  await new Promise(resolve => setTimeout(resolve, 400))
  
  // 立即提交答案（这会触发状态更新）
  answerQuestion(answer)
  
  // 等待滑出动画开始
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 重置动画状态
  isAnswering.value = false
  showAnswerFeedback.value = false
  selectedAnswer.value = null
}

const handleRestart = () => {
  restartGame()
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
</script>
<style scoped>
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
  padding: 16px;
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

/* ========== 全局样式 ========== */
.game-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
}

/* 确保html和body也不会产生滚动条 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
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

/* ========== 发光文字 ========== */
.glow-text {
  color: #ff9c00;
  text-shadow: 
    0 0 10px rgba(255, 156, 0, 0.5),
    0 0 20px rgba(255, 156, 0, 0.3),
    0 0 30px rgba(255, 156, 0, 0.2);
  animation: textGlow 2s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% { text-shadow: 0 0 10px rgba(255, 156, 0, 0.5), 0 0 20px rgba(255, 156, 0, 0.3); }
  50% { text-shadow: 0 0 20px rgba(255, 156, 0, 0.8), 0 0 30px rgba(255, 156, 0, 0.5); }
}

/* ========== 按钮样式 ========== */
.ow-button {
  position: relative;
  background: linear-gradient(135deg, #f4433c 0%, #ff6b35 100%);
  border: none;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(244, 67, 60, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.ow-button:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 8px 25px rgba(244, 67, 60, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.ow-button:active:not(:disabled) {
  transform: translateY(-1px) scale(1.02);
}

.ow-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  margin-bottom: 24px;
  flex-shrink: 0;
}

.ow-icon {
  font-size: 64px;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.preview-text {
  font-size: 20px;
  line-height: 1.6;
  margin-bottom: 24px;
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

.progress-bar-container {
  width: 100%;
  max-width: 600px;
  flex-shrink: 0;
  margin-bottom: 0;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: clamp(10px, 2vw, 12px);
  color: #7a7e83;
  margin-bottom: 2px;
}

.stat-value {
  display: block;
  font-size: clamp(16px, 4vw, 24px);
  font-weight: 700;
  color: #ffffff;
}

.stat-value.correct {
  color: #4cd964;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f4433c, #ff9c00);
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(244, 67, 60, 0.5);
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

/* ========== 分离的答案区域 ========== */
.separated-answers {
  width: 100%;
  max-width: clamp(200px, 40vw, 280px);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 16px;
  padding: clamp(12px, 2vh, 16px);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  margin-top: clamp(35px, 7vh, 60px);
}

.question-text {
  font-size: clamp(14px, 3vw, 18px);
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
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: clamp(12px, 2.5vw, 16px);
  min-height: clamp(48px, 8vh, 64px);
  position: relative;
  overflow: hidden;
  transform: translateY(0);
}

.answer-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff9c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 156, 0, 0.3);
}

.answer-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 10px rgba(255, 156, 0, 0.2);
  animation: buttonClick 0.2s ease;
}

.answer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 选中状态样式 */
.answer-btn.selected {
  background: rgba(255, 156, 0, 0.2);
  border-color: #ff9c00;
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 20px rgba(255, 156, 0, 0.4);
}

.answer-btn.correct-selected {
  background: rgba(76, 217, 100, 0.2);
  border-color: #4cd964;
  box-shadow: 0 4px 20px rgba(76, 217, 100, 0.4);
  animation: correctButtonPulse 0.6s ease;
}

.answer-btn.wrong-selected {
  background: rgba(255, 71, 87, 0.2);
  border-color: #ff4757;
  box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4);
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

.answer-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(24px, 4vw, 32px);
  height: clamp(24px, 4vw, 32px);
  background: linear-gradient(135deg, #f4433c, #ff6b35);
  border-radius: 8px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  font-size: clamp(12px, 2vw, 16px);
  box-shadow: 0 2px 8px rgba(244, 67, 60, 0.3);
}

.answer-text {
  flex: 1;
  text-align: left;
  font-weight: 500;
  line-height: 1.2;
  color: #ffffff;
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

/* ========== 模式选择页面 ========== */
.mode-select-screen {
  padding: clamp(20px, 4vh, 40px);
  position: relative;
}

.mode-select-screen .header {
  margin-bottom: 40px;
}

/* 左上角返回按钮 - 使用ow-button样式 */
.back-button-ow {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  padding: 12px 24px !important;
  font-size: 16px !important;
  /* 确保继承ow-button的所有样式 */
}

.mode-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 32px;  /* 进一步增加间距 */
  width: 100%;
  max-width: 600px;
  margin-bottom: 40px;
}

.mode-button {
  width: 100%;
  min-height: 80px;
  transition: all 0.3s ease;
}

.mode-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.mode-button-content {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.mode-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mode-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.mode-icon {
  font-size: 32px;
  flex-shrink: 0;
  animation: iconFloat 3s ease-in-out infinite;
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
    min-height: 70px;
  }
  
  .mode-button-content {
    padding: 0 4px;
  }
  
  .mode-left {
    gap: 12px;
  }
  
  .mode-icon {
    font-size: 28px;
  }
  
  .mode-title {
    font-size: 18px;
  }
  
  .mode-subtitle {
    font-size: 13px;
  }
  
  .back-button {
    padding: 10px 24px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .mode-buttons-container {
    gap: 20px;  /* 小屏幕保持合适间距 */
  }
  
  .mode-button {
    min-height: 60px;
  }
  
  .mode-left {
    gap: 10px;
  }
  
  .mode-icon {
    font-size: 24px;
  }
  
  .mode-title {
    font-size: 16px;
  }
  
  .mode-subtitle {
    font-size: 12px;
  }
}