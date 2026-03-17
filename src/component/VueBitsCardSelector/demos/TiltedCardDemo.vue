<template>
  <div class="tilted-demo">
    <div 
      ref="cardRef"
      class="demo-card tilted-card"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="card-content">
        <div class="game-header">
          <span class="question-number">#2</span>
          <span class="map-type">ASSAULT</span>
        </div>
        
        <div class="image-area">
          <div class="map-placeholder">🏰</div>
        </div>
        
        <div class="question-area">
          <p class="question">这是哪个地图？</p>
          <div class="options">
            <button class="option">A. 城堡</button>
            <button class="option">B. 墓园</button>
          </div>
        </div>
      </div>
      
      <div v-if="showTooltip" class="tooltip" :style="tooltipStyle">
        悬停查看效果
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'

const cardRef = useTemplateRef<HTMLDivElement>('cardRef')
const rotateX = ref(0)
const rotateY = ref(0)
const scale = ref(1)
const showTooltip = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)

const tooltipStyle = computed(() => ({
  left: `${mouseX.value}px`,
  top: `${mouseY.value - 30}px`
}))

const handleMouseMove = (event: MouseEvent) => {
  if (!cardRef.value) return
  
  const rect = cardRef.value.getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const offsetX = event.offsetX - centerX
  const offsetY = event.offsetY - centerY
  
  rotateX.value = (offsetY / centerY) * -15
  rotateY.value = (offsetX / centerX) * 15
  
  mouseX.value = event.offsetX
  mouseY.value = event.offsetY
  
  cardRef.value.style.transform = `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale(${scale.value})`
}

const handleMouseEnter = () => {
  scale.value = 1.05
  showTooltip.value = true
}

const handleMouseLeave = () => {
  rotateX.value = 0
  rotateY.value = 0
  scale.value = 1
  showTooltip.value = false
  
  if (cardRef.value) {
    cardRef.value.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
  }
}
</script>

<style scoped>
.tilted-demo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.demo-card {
  width: 200px;
  height: 280px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.tilted-card {
  background: linear-gradient(135deg, #2d1b69, #11998e);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  transform: translateZ(20px);
}

.game-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.question-number {
  color: #00d4ff;
  font-weight: 600;
  font-size: 12px;
}

.map-type {
  color: #b3b3b3;
  font-size: 10px;
  text-transform: uppercase;
}

.image-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 12px;
  transform: translateZ(10px);
}

.map-placeholder {
  font-size: 32px;
  opacity: 0.9;
}

.question-area {
  text-align: center;
  transform: translateZ(15px);
}

.question {
  font-size: 12px;
  color: white;
  margin-bottom: 8px;
  font-weight: 600;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.option {
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  transform: translateZ(5px);
}

.option:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
  transform: translateZ(8px);
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  pointer-events: none;
  z-index: 10;
  transform: translateZ(50px);
  white-space: nowrap;
}
</style>