<template>
  <div class="error-screen">
    <VueBitsProfileCard class="error-card-wrapper">
      <div class="error-card-inner">
        <div class="error-icon">⚠️</div>
        <h2>出现错误</h2>
        <p>{{ gameState.error }}</p>
        <button class="btn btn-primary ow-button" @click="$emit('restart')">
          <span class="btn-text">重新开始</span>
          <span class="btn-glow"></span>
        </button>
      </div>
    </VueBitsProfileCard>
  </div>
</template>

<script setup lang="ts">
import VueBitsProfileCard from '@/component/VueBitsProfileCard/VueBitsProfileCardSimple.vue'

// Props
defineProps<{
  gameState: {
    error: string
  }
}>()

// Emits
defineEmits<{
  'restart': []
}>()
</script>

<style scoped>
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