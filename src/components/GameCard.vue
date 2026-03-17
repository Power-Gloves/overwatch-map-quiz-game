<template>
  <div class="card-stack">
    <!-- 下一张卡片（背景层） -->
    <VueBitsProfileCard 
      v-if="nextQuestion" 
      class="image-card-wrapper next-card"
      :enable-tilt="false"
    >
      <div class="image-card-inner">
        <div class="card-header">
          <span class="card-number">#{{ totalAnswered + 2 }}</span>
          <span class="card-type">{{ nextQuestion.mapData.type }}</span>
        </div>
        <div class="image-container">
          <img :src="nextQuestion.screenshot.url" alt="下一张" class="map-image" />
        </div>
      </div>
    </VueBitsProfileCard>

    <!-- 当前卡片（顶层） -->
    <VueBitsProfileCard 
      v-if="currentQuestion" 
      class="image-card-wrapper current-card"
      :class="{
        'answer-correct': showFeedback && feedbackData?.isCorrect,
        'answer-wrong': showFeedback && feedbackData && !feedbackData.isCorrect,
        'idle': !isAnswering && !showFeedback
      }"
      :enable-tilt="true"
    >
      <div class="image-card-inner">
        <div class="card-header">
          <span class="card-number">#{{ totalAnswered + 1 }}</span>
          <span class="card-type">{{ currentQuestion.mapData.type }}</span>
        </div>
        
        <div class="image-container">
          <img :src="currentQuestion.screenshot.url" alt="地图截图" class="map-image" />
          
          <!-- 答案反馈覆盖层 -->
          <div v-if="showFeedback && feedbackData" class="answer-feedback-overlay">
            <div class="feedback-icon">
              <span v-if="feedbackData.isCorrect" class="correct-icon">✓</span>
              <span v-else class="wrong-icon">✗</span>
            </div>
            <div class="feedback-text">
              <span v-if="feedbackData.isCorrect" class="correct-text">正确！</span>
              <span v-else class="wrong-text">错误</span>
            </div>
            <div v-if="!feedbackData.isCorrect" class="correct-answer-text">
              正确答案：{{ feedbackData.correctAnswer }}
            </div>
          </div>
        </div>
      </div>
    </VueBitsProfileCard>
  </div>
</template>

<script setup lang="ts">
import VueBitsProfileCard from '@/component/VueBitsProfileCard/VueBitsProfileCardSimple.vue'

// Props
defineProps<{
  currentQuestion: any
  nextQuestion: any
  totalAnswered: number
  feedbackData: any
  showFeedback: boolean
  isAnswering?: boolean
}>()
</script>

<style scoped>
/* 保持原有卡片样式完全不变 */
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
  width: 100%;
  max-width: clamp(200px, 40vw, 280px);
  height: clamp(480px, 65vh, 700px);
  flex-shrink: 0;
}

.next-card {
  transform: scale(0.95) translateY(10px) translateZ(-20px);
  opacity: 0.8;
  z-index: 1;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
}

.current-card {
  z-index: 2;
  transform: scale(1) translateY(0) translateZ(0);
  animation: cardEntrance 0.5s ease;
}

.current-card.idle {
  animation: cardEntrance 0.5s ease;
  transform-style: preserve-3d;
  perspective: 800px;
  filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.5));
}

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
  contain: layout style paint;
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
  contain: layout style paint;
  clip-path: inset(0);
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

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
</style>