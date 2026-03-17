<template>
  <div class="finish-screen">
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
          <button class="btn btn-primary ow-button" @click="$emit('restart')">
            <span class="btn-text">再玩一次</span>
            <span class="btn-glow"></span>
          </button>
        </div>
      </div>
    </VueBitsProfileCard>
  </div>
</template>

<script setup lang="ts">
import VueBitsProfileCard from '@/component/VueBitsProfileCard/VueBitsProfileCardSimple.vue'

// Props
const props = defineProps<{
  gameState: {
    mode: string
    totalAnswered: number
    correctCount: number
    accuracy: number
    challenge?: {
      isPassed: boolean
      passAccuracy: number
    }
  }
}>()

// Emits
defineEmits<{
  'restart': []
}>()

const getChallengeStars = () => {
  const accuracy = props.gameState.accuracy
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
.finish-screen {
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

.stats-card-inner h2 {
  font-size: clamp(24px, 5vw, 36px);
  margin-bottom: 16px;
  color: #ffffff;
}

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

/* 挑战模式结果样式 */
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
  transform: skew(-8deg) !important;
  font-style: italic !important;
  letter-spacing: 0.5px !important;
  font-family: 'Bank Sans EF CY Compressed', sans-serif !important;
}

.pass-info {
  margin-top: 16px;
}

.pass-text {
  font-size: 14px;
  color: #7a7e83;
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

/* 练习模式结果样式 */
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

/* 无尽模式结果样式 */
.endless-result {
  text-align: center;
  margin-bottom: 20px;
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

.endless-score {
  font-size: 20px;
  font-weight: 600;
  color: #4cd964;
  margin-bottom: 16px;
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

.stat-label {
  transform: skew(-8deg) !important;
  font-style: italic !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  font-family: 'Bank Sans EF CY Compressed', sans-serif !important;
}

.rating {
  margin-bottom: 20px;
}

.rating-text {
  font-size: clamp(16px, 4vw, 24px);
  font-weight: 600;
  color: #4cd964;
  transform: skew(-8deg) !important;
  font-style: italic !important;
  letter-spacing: 0.5px !important;
  font-family: 'Bank Sans EF CY Compressed', sans-serif !important;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 400px;
  flex-shrink: 0;
}

/* 守望先锋风格按钮 */
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
  transform: scale(0.98);
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
</style>