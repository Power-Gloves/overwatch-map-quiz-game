<template>
  <div class="start-screen">
    <!-- 右上角音效控制按钮 -->
    <img 
      src="/src/assets/images/icons/audio-control.svg" 
      alt="音效设置" 
      @click="$emit('toggle-audio')"
      class="control-button control-button-right"
    />
    
    <div class="header">
      <div class="logo-container">
        <img src="/src/assets/images/logos/logo-white.png" alt="OVERWATCH" class="game-logo" />
        <p class="subtitle">地图识别挑战</p>
      </div>
    </div>
    
    <div class="content">
      <VueBitsProfileCard 
        class="stats-preview-card"
        :enable-tilt="true"
        :enable-shine="false"
        :behind-gradient="cardGradient"
        :inner-gradient="innerGradient"
        :icon-url="iconUrl"
      >
        <div class="stats-preview-content">
          <div class="icon-wrapper">
            <img src="/src/assets/images/logos/带文字logo-white.png" alt="游戏图标" class="ow-icon-logo" />
          </div>
          <p class="preview-text">准备好挑战你的地图知识了吗？</p>
          <p class="stats-text">
            <span class="stat-badge">{{ mapCount }}</span> 个地图 · 
            <span class="stat-badge">{{ totalScreenshots }}</span> 张截图
          </p>
        </div>
      </VueBitsProfileCard>
      
      <div class="actions">
        <div 
          class="start-button-svg" 
          @click="$emit('start-game')"
        >
          <svg width="100%" height="60" viewBox="0 0 350 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="350" height="60" fill="#B5FA23" fill-opacity="0.9" rx="4"/>
            <text x="175" y="38" text-anchor="middle" fill="#1D1D1F" font-family="'Orbitron', 'Bank Sans EF CY Compressed', sans-serif" font-size="24" font-weight="700" letter-spacing="2px">START</text>
          </svg>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p class="version">v1.0.0</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueBitsProfileCard from '@/component/VueBitsProfileCard/VueBitsProfileCardSimple.vue'
import mapsData from '@/assets/data/maps.json'

// Props
defineProps<{
  isLoading?: boolean
}>()

// Emits
defineEmits<{
  'toggle-audio': []
  'start-game': []
}>()

// Computed
const mapCount = computed(() => mapsData.maps.length)
const totalScreenshots = computed(() => 
  mapsData.maps.reduce((sum, map) => sum + map.screenshots.length, 0)
)

const cardGradient = `radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y), hsla(120,100%,90%,calc(var(--card-opacity)*0.7)) 4%, hsla(120,50%,80%,calc(var(--card-opacity)*0.525)) 10%, hsla(120,25%,70%,calc(var(--card-opacity)*0.35)) 50%, hsla(120,0%,60%,0) 100%), radial-gradient(35% 52% at 55% 20%, #B5FA2389 0%, #073aff00 100%), radial-gradient(100% 100% at 50% 50%, #B5FA23b3 1%, #073aff00 76%), conic-gradient(from 124deg at 50% 50%, #B5FA23b3 0%, #32CD32b3 40%, #32CD32b3 60%, #B5FA23b3 100%)`

const innerGradient = `linear-gradient(145deg, rgba(181, 250, 35, 0.1) 0%, rgba(181, 250, 35, 0.05) 100%)`

const iconUrl = `/src/assets/images/guiling.png`
</script>

<style scoped>
.start-screen {
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

.stats-preview-content {
  padding: 24px 20px !important;
  border: 2px solid #B5FA23;
  border-radius: 16px;
  background: rgba(181, 250, 35, 0.05);
}

.start-button-svg {
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 60px auto 0 auto;
  text-align: center;
  filter: drop-shadow(0 4px 15px rgba(181, 250, 35, 0.4));
}

.start-button-svg:hover:not([disabled]) {
  transform: translateY(-2px) scale(1.02);
  filter: drop-shadow(0 8px 25px rgba(181, 250, 35, 0.6));
}
</style>