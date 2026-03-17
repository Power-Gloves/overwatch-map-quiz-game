<template>
  <div class="card-selector-container">
    <div class="header">
      <h2>🎮 选择你喜欢的卡片效果</h2>
      <p>基于 vue-bits 组件库的精美卡片效果</p>
    </div>

    <div class="cards-grid">
      <!-- ProfileCard 效果 -->
      <div class="card-option" @click="selectCard('profile')">
        <div class="card-preview profile-preview">
          <ProfileCardDemo />
        </div>
        <div class="card-info">
          <h3>ProfileCard 全息效果</h3>
          <p>3D倾斜 + 全息渐变 + 交互动画</p>
          <div class="features">
            <span class="feature">✨ 全息背景</span>
            <span class="feature">🎯 鼠标跟踪</span>
            <span class="feature">🌈 彩虹渐变</span>
          </div>
        </div>
      </div>

      <!-- TiltedCard 效果 -->
      <div class="card-option" @click="selectCard('tilted')">
        <div class="card-preview tilted-preview">
          <TiltedCardDemo />
        </div>
        <div class="card-info">
          <h3>TiltedCard 倾斜效果</h3>
          <p>3D透视 + 弹性动画 + 悬浮提示</p>
          <div class="features">
            <span class="feature">📐 3D透视</span>
            <span class="feature">🔄 弹性动画</span>
            <span class="feature">💫 悬浮效果</span>
          </div>
        </div>
      </div>

      <!-- SpotlightCard 效果 -->
      <div class="card-option" @click="selectCard('spotlight')">
        <div class="card-preview spotlight-preview">
          <SpotlightCardDemo />
        </div>
        <div class="card-info">
          <h3>SpotlightCard 聚光灯</h3>
          <p>聚光灯跟踪 + 渐变光晕 + 简约设计</p>
          <div class="features">
            <span class="feature">💡 聚光跟踪</span>
            <span class="feature">🌟 光晕效果</span>
            <span class="feature">🎨 简约风格</span>
          </div>
        </div>
      </div>

      <!-- PixelCard 效果 (现有的) -->
      <div class="card-option" @click="selectCard('pixel')">
        <div class="card-preview pixel-preview">
          <PixelCardDemo />
        </div>
        <div class="card-info">
          <h3>PixelCard 像素效果</h3>
          <p>像素动画 + 出现消失 + 多种主题</p>
          <div class="features">
            <span class="feature">🔲 像素动画</span>
            <span class="feature">⚡ 快速响应</span>
            <span class="feature">🎭 多种主题</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedCard" class="selection-result">
      <div class="result-card">
        <h3>已选择：{{ getCardName(selectedCard) }}</h3>
        <p>{{ getCardDescription(selectedCard) }}</p>
        <div class="action-buttons">
          <button class="apply-btn" @click="applySelection">
            应用到游戏
          </button>
          <button class="preview-btn" @click="previewSelection">
            预览效果
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProfileCardDemo from './demos/ProfileCardDemo.vue'
import TiltedCardDemo from './demos/TiltedCardDemo.vue'
import SpotlightCardDemo from './demos/SpotlightCardDemo.vue'
import PixelCardDemo from './demos/PixelCardDemo.vue'

type CardType = 'profile' | 'tilted' | 'spotlight' | 'pixel'

const selectedCard = ref<CardType | null>(null)

const emit = defineEmits<{
  cardSelected: [cardType: CardType]
  previewCard: [cardType: CardType]
}>()

const selectCard = (cardType: CardType) => {
  selectedCard.value = cardType
}

const getCardName = (cardType: CardType) => {
  const names = {
    profile: 'ProfileCard 全息效果',
    tilted: 'TiltedCard 倾斜效果',
    spotlight: 'SpotlightCard 聚光灯',
    pixel: 'PixelCard 像素效果'
  }
  return names[cardType]
}

const getCardDescription = (cardType: CardType) => {
  const descriptions = {
    profile: '具有全息背景和3D倾斜效果的高级卡片，适合展示重要内容',
    tilted: '带有3D透视和弹性动画的倾斜卡片，交互感强烈',
    spotlight: '简约的聚光灯跟踪效果，优雅而不失现代感',
    pixel: '经典的像素动画效果，轻量且响应迅速'
  }
  return descriptions[cardType]
}

const applySelection = () => {
  if (selectedCard.value) {
    emit('cardSelected', selectedCard.value)
  }
}

const previewSelection = () => {
  if (selectedCard.value) {
    emit('previewCard', selectedCard.value)
  }
}
</script>

<style scoped>
.card-selector-container {
  padding: 40px 20px;
  background: #0a0a0a;
  color: white;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 50px;
}

.header h2 {
  font-size: clamp(28px, 5vw, 42px);
  color: #ff9c00;
  margin-bottom: 15px;
  font-weight: 800;
}

.header p {
  font-size: clamp(16px, 3vw, 20px);
  color: #b3b3b3;
  font-weight: 300;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto 60px;
}

.card-option {
  cursor: pointer;
  transition: transform 0.3s ease;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.card-option:hover {
  transform: translateY(-8px);
  border-color: #ff9c00;
  box-shadow: 0 20px 40px rgba(255, 156, 0, 0.2);
}

.card-preview {
  width: 100%;
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-preview {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

.tilted-preview {
  background: linear-gradient(135deg, #2d1b69, #11998e);
}

.spotlight-preview {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.pixel-preview {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.card-info {
  text-align: center;
}

.card-info h3 {
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 700;
}

.card-info p {
  font-size: 14px;
  color: #b3b3b3;
  margin-bottom: 15px;
  line-height: 1.5;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.feature {
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(255, 156, 0, 0.1);
  border: 1px solid rgba(255, 156, 0, 0.3);
  border-radius: 12px;
  color: #ff9c00;
  font-weight: 500;
}

.selection-result {
  max-width: 600px;
  margin: 0 auto;
}

.result-card {
  background: rgba(244, 67, 60, 0.1);
  border: 2px solid #ff9c00;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.result-card h3 {
  font-size: 24px;
  color: #ff9c00;
  margin-bottom: 10px;
  font-weight: 700;
}

.result-card p {
  font-size: 16px;
  color: #b3b3b3;
  margin-bottom: 25px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.apply-btn,
.preview-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-btn {
  background: linear-gradient(135deg, #f4433c 0%, #ff6b35 100%);
  color: white;
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(244, 67, 60, 0.4);
}

.preview-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.preview-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .card-preview {
    height: 250px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .apply-btn,
  .preview-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>