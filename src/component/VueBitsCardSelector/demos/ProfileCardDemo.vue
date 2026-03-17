<template>
  <div class="profile-demo">
    <div 
      ref="cardRef"
      class="demo-card profile-card"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="card-background"></div>
      <div class="card-shine"></div>
      
      <div class="card-content">
        <div class="game-header">
          <span class="question-number">#1</span>
          <span class="map-type">ESCORT</span>
        </div>
        
        <div class="image-area">
          <div class="map-placeholder">🗺️</div>
        </div>
        
        <div class="question-area">
          <p class="question">这是哪个地图？</p>
          <div class="options">
            <button class="option">A. 漓江塔</button>
            <button class="option">B. 城堡</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

const cardRef = useTemplateRef<HTMLDivElement>('cardRef')
const isHovered = ref(false)

const handleMouseMove = (event: MouseEvent) => {
  if (!cardRef.value) return
  
  const rect = cardRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  cardRef.value.style.setProperty('--mouse-x', `${x}%`)
  cardRef.value.style.setProperty('--mouse-y', `${y}%`)
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>

<style scoped>
.profile-demo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-card {
  --mouse-x: 50%;
  --mouse-y: 50%;
  width: 200px;
  height: 280px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.profile-card {
  background: 
    radial-gradient(circle at var(--mouse-x) var(--mouse-y), 
      rgba(255, 156, 0, 0.3) 0%,
      rgba(244, 67, 60, 0.2) 30%,
      rgba(0, 212, 255, 0.2) 60%,
      transparent 100%),
    linear-gradient(135deg, #1a1a2e, #16213e);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-card:hover {
  transform: perspective(1000px) rotateX(5deg) rotateY(5deg);
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

.card-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), 
    rgba(255, 255, 255, 0.2) 0%,
    transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-card:hover .card-shine {
  opacity: 1;
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
  color: #ff9c00;
  font-weight: 600;
  font-size: 12px;
}

.map-type {
  color: #7a7e83;
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
}

.map-placeholder {
  font-size: 32px;
  opacity: 0.8;
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
  background: rgba(255, 156, 0, 0.2);
  border-color: #ff9c00;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(200%) rotate(45deg); }
}
</style>