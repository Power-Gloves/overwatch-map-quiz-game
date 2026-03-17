<template>
  <div class="card-variants-demo">
    <h2>卡片效果选择</h2>
    <p>请选择你喜欢的卡片效果：</p>
    
    <div class="cards-grid">
      <!-- 选项1：毛玻璃卡片 -->
      <div class="card-option" @click="selectCard('glassmorphism')">
        <div class="card glassmorphism-card">
          <div class="card-header">
            <span class="card-number">#1</span>
            <span class="card-type">ESCORT</span>
          </div>
          <div class="card-image">
            <div class="placeholder-image">🗺️</div>
          </div>
          <div class="card-content">
            <p class="question">这是哪个地图？</p>
            <div class="options-grid">
              <button class="option-btn">A. 选项一</button>
              <button class="option-btn">B. 选项二</button>
            </div>
          </div>
        </div>
        <div class="card-label">毛玻璃效果</div>
      </div>

      <!-- 选项2：霓虹边框卡片 -->
      <div class="card-option" @click="selectCard('neon')">
        <div class="card neon-card">
          <div class="card-header">
            <span class="card-number">#1</span>
            <span class="card-type">ESCORT</span>
          </div>
          <div class="card-image">
            <div class="placeholder-image">🗺️</div>
          </div>
          <div class="card-content">
            <p class="question">这是哪个地图？</p>
            <div class="options-grid">
              <button class="option-btn">A. 选项一</button>
              <button class="option-btn">B. 选项二</button>
            </div>
          </div>
        </div>
        <div class="card-label">霓虹边框</div>
      </div>

      <!-- 选项3：3D 立体卡片 -->
      <div class="card-option" @click="selectCard('3d')">
        <div class="card card-3d">
          <div class="card-header">
            <span class="card-number">#1</span>
            <span class="card-type">ESCORT</span>
          </div>
          <div class="card-image">
            <div class="placeholder-image">🗺️</div>
          </div>
          <div class="card-content">
            <p class="question">这是哪个地图？</p>
            <div class="options-grid">
              <button class="option-btn">A. 选项一</button>
              <button class="option-btn">B. 选项二</button>
            </div>
          </div>
        </div>
        <div class="card-label">3D 立体</div>
      </div>

      <!-- 选项4：渐变光泽卡片 -->
      <div class="card-option" @click="selectCard('gradient')">
        <div class="card gradient-card">
          <div class="card-header">
            <span class="card-number">#1</span>
            <span class="card-type">ESCORT</span>
          </div>
          <div class="card-image">
            <div class="placeholder-image">🗺️</div>
          </div>
          <div class="card-content">
            <p class="question">这是哪个地图？</p>
            <div class="options-grid">
              <button class="option-btn">A. 选项一</button>
              <button class="option-btn">B. 选项二</button>
            </div>
          </div>
        </div>
        <div class="card-label">渐变光泽</div>
      </div>
    </div>

    <div class="selected-info" v-if="selectedCard">
      <p>已选择：<strong>{{ getCardName(selectedCard) }}</strong></p>
      <button class="apply-btn" @click="applyCard">应用此效果</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedCard = ref<string>('')

const selectCard = (cardType: string) => {
  selectedCard.value = cardType
}

const getCardName = (cardType: string) => {
  const names = {
    glassmorphism: '毛玻璃效果',
    neon: '霓虹边框',
    '3d': '3D 立体',
    gradient: '渐变光泽'
  }
  return names[cardType as keyof typeof names] || cardType
}

const applyCard = () => {
  // 这里可以触发事件或调用父组件方法
  console.log('应用卡片效果:', selectedCard.value)
  // emit('card-selected', selectedCard.value)
}
</script>

<style scoped>
.card-variants-demo {
  padding: 20px;
  background: #0a0a0a;
  color: white;
  min-height: 100vh;
}

.card-variants-demo h2 {
  text-align: center;
  color: #ff9c00;
  margin-bottom: 10px;
}

.card-variants-demo p {
  text-align: center;
  color: #b3b3b3;
  margin-bottom: 30px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-option {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.card-option:hover {
  transform: translateY(-5px);
}

.card {
  width: 100%;
  height: 350px;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.card-number {
  color: #ff9c00;
  font-weight: 600;
  font-size: 14px;
}

.card-type {
  color: #7a7e83;
  font-size: 12px;
  text-transform: uppercase;
}

.card-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.placeholder-image {
  font-size: 48px;
  opacity: 0.7;
}

.card-content {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.question {
  text-align: center;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 16px;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.option-btn {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 毛玻璃效果 */
.glassmorphism-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glassmorphism-card:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

/* 霓虹边框效果 */
.neon-card {
  background: rgba(20, 20, 20, 0.9);
  border: 2px solid #00d4ff;
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.5),
    inset 0 0 20px rgba(0, 212, 255, 0.1);
  animation: neonPulse 2s ease-in-out infinite alternate;
}

@keyframes neonPulse {
  from {
    box-shadow: 
      0 0 20px rgba(0, 212, 255, 0.5),
      inset 0 0 20px rgba(0, 212, 255, 0.1);
  }
  to {
    box-shadow: 
      0 0 30px rgba(0, 212, 255, 0.8),
      inset 0 0 30px rgba(0, 212, 255, 0.2);
  }
}

/* 3D 立体效果 */
.card-3d {
  background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
  border: 1px solid #333;
  box-shadow: 
    0 10px 20px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform-style: preserve-3d;
}

.card-3d:hover {
  transform: rotateX(5deg) rotateY(5deg) translateZ(10px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 渐变光泽效果 */
.gradient-card {
  background: linear-gradient(135deg, 
    rgba(244, 67, 60, 0.2) 0%, 
    rgba(255, 156, 0, 0.2) 50%, 
    rgba(0, 212, 255, 0.2) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.gradient-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.card-label {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #ff9c00;
  font-weight: 600;
}

.selected-info {
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  background: rgba(244, 67, 60, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(244, 67, 60, 0.3);
}

.apply-btn {
  margin-top: 15px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #f4433c 0%, #ff6b35 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.apply-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .card {
    height: 300px;
  }
}
</style>