<template>
  <div class="spotlight-demo">
    <div 
      ref="cardRef"
      class="demo-card spotlight-card"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="spotlight-overlay" :style="spotlightStyle"></div>
      
      <div class="card-content">
        <div class="game-header">
          <span class="question-number">#3</span>
          <span class="map-type">HYBRID</span>
        </div>
        
        <div class="image-area">
          <div class="map-placeholder">🌨️</div>
        </div>
        
        <div class="question-area">
          <p class="question">这是哪个地图？</p>
          <div class="options">
            <button class="option">A. 南极洲</button>
            <button class="option">B. 黑森林</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'

const cardRef = useTemplateRef<HTMLDivElement>('cardRef')
const mouseX = ref(0)
const mouseY = ref(0)
const opacity = ref(0)

const spotlightStyle = computed(() => ({
  opacity: opacity.value,
  background: `radial-gradient(circle at ${mouseX.value}px ${mouseY.value}px, rgba(255, 255, 255, 0.25), transparent 80%)`
}))

const handleMouseMove = (event: MouseEvent) => {
  if (!cardRef.value) return
  
  const rect = cardRef.value.getBoundingClientRect()
  mouseX.value = event.clientX - rect.left
  mouseY.value = event.clientY - rect.top
}

const handleMouseEnter = () => {
  opacity.value = 0.6
}

const handleMouseLeave = () => {
  opacity.value = 0
}
</script>

<style scoped>
.spotlight-demo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-card {
  width: 200px;
  height: 280px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.spotlight-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.spotlight-card:hover {
  transform: translateY(-4px);
}

.spotlight-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.question-number {
  color: #ffffff;
  font-weight: 600;
  font-size: 12px;
}

.map-type {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  text-transform: uppercase;
}

.image-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 12px;
}

.map-placeholder {
  font-size: 32px;
  opacity: 0.9;
}

.question-area {
  text-align: center;
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
}

.option:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}
</style>