<template>
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
</template>

<script setup lang="ts">
import ElectricBorder from '@/component/ElectricBorder/ElectricBorder.vue'

// Props
defineProps<{
  gameState: {
    totalAnswered: number
    correctCount: number
    accuracy: number
  }
}>()
</script>

<style scoped>
/* 保持原有样式完全不变 */
.score-board {
  width: 100%;
  max-width: 600px;
  flex-shrink: 0;
  margin: clamp(20px, 4vh, 30px) 8px 0 8px;
  background: linear-gradient(135deg, #464F6A 0%, #2B3753 100%);
  border-radius: 0;
  padding: 12px 16px;
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
  margin-bottom: 10px;
  gap: 8px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.score-icon-img {
  width: 26px;
  height: 26px;
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
  font-size: 9px;
  color: #C9D4E3;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  font-family: 'Bank Sans EF CY Compressed', sans-serif;
  line-height: 1;
  margin-bottom: 2px;
}

.score-value {
  font-size: 20px;
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
  height: 32px;
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
</style>