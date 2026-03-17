<template>
  <div class="audio-control-content">
    <div class="control-header">
      <h3>音效设置</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    
    <div class="control-section">
      <!-- 背景音乐控制 - 单行布局 -->
      <div class="control-row">
        <div class="control-info">
          <span class="label-icon">🎼</span>
          <span class="label-text">BGM</span>
        </div>
        <button 
          class="toggle-btn-square" 
          :class="{ active: !isMusicMuted }"
          @click="toggleMusic"
        >
          {{ isMusicMuted ? 'OFF' : 'ON' }}
        </button>
        <div class="volume-slider-container">
          <input 
            type="range" 
            class="volume-slider-square"
            :value="musicVolume * 100"
            @input="handleMusicVolumeChange"
            min="0" 
            max="100"
            :disabled="isMusicMuted"
          />
        </div>
        <span class="volume-value">{{ Math.round(musicVolume * 100) }}</span>
      </div>
      
      <!-- 音效控制 - 单行布局 -->
      <div class="control-row">
        <div class="control-info">
          <span class="label-icon">🔊</span>
          <span class="label-text">SFX</span>
        </div>
        <button 
          class="toggle-btn-square" 
          :class="{ active: !isSfxMuted }"
          @click="toggleSfx"
        >
          {{ isSfxMuted ? 'OFF' : 'ON' }}
        </button>
        <div class="volume-slider-container">
          <input 
            type="range" 
            class="volume-slider-square"
            :value="sfxVolume * 100"
            @input="handleSfxVolumeChange"
            min="0" 
            max="100"
            :disabled="isSfxMuted"
          />
        </div>
        <span class="volume-value">{{ Math.round(sfxVolume * 100) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'

defineEmits<{
  close: []
}>()

const { 
  musicVolume, 
  sfxVolume,
  setMusicVolume, 
  setSfxVolume,
  playButtonClick,
  pauseMusic,
  resumeMusic
} = useAudio()

const isMusicMuted = ref(false)
const isSfxMuted = ref(false)

// 从本地存储加载设置
onMounted(() => {
  try {
    const savedSettings = localStorage.getItem('audioSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      isMusicMuted.value = settings.isMuted || musicVolume.value === 0
      isSfxMuted.value = settings.isMuted || sfxVolume.value === 0
    }
  } catch (error) {
    console.warn('加载音频面板设置失败:', error)
  }
})

// 音乐控制
const toggleMusic = () => {
  isMusicMuted.value = !isMusicMuted.value
  if (isMusicMuted.value) {
    setMusicVolume(0)
    pauseMusic()
  } else {
    setMusicVolume(musicVolume.value || 0.7)
    resumeMusic()
  }
  if (!isSfxMuted.value) {
    playButtonClick()
  }
}

const handleMusicVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const volume = parseInt(target.value) / 100
  if (!isMusicMuted.value) {
    setMusicVolume(volume)
  }
}

// 音效控制
const toggleSfx = () => {
  isSfxMuted.value = !isSfxMuted.value
  if (isSfxMuted.value) {
    setSfxVolume(0)
  } else {
    setSfxVolume(sfxVolume.value || 0.8)
    playButtonClick()
  }
}

const handleSfxVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const volume = parseInt(target.value) / 100
  if (!isSfxMuted.value) {
    setSfxVolume(volume)
  }
}
</script>

<style scoped>
.audio-control-content {
  width: 280px;
  background: linear-gradient(135deg, #464F6A 0%, #2B3753 100%);
  border: 2px solid rgba(181, 250, 35, 0.4);
  border-radius: 0;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(181, 250, 35, 0.2);
  backdrop-filter: blur(20px);
  animation: slideIn 0.3s ease;
  position: fixed;
  top: 70px;
  right: 8px;
  z-index: 2001;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 2px solid rgba(181, 250, 35, 0.3);
  background: linear-gradient(135deg, rgba(181, 250, 35, 0.1) 0%, rgba(181, 250, 35, 0.05) 100%);
}

.control-header h3 {
  color: #B5FA23;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  transform: skew(-8deg);
  font-style: italic;
  font-family: 'Bank Sans EF CY Compressed', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(181, 250, 35, 0.3);
}

.close-btn {
  background: linear-gradient(135deg, #565F76 0%, #464F6A 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  transition: all 0.3s ease;
  font-weight: bold;
}

.close-btn:hover {
  background: linear-gradient(135deg, #B5FA23 0%, #32CD32 100%);
  color: #1D1D1F;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(181, 250, 35, 0.5);
}

.control-section {
  padding: 16px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  position: relative;
  height: 32px;
}

.control-row:last-child {
  margin-bottom: 0;
}

.control-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, transparent 0%, #B5FA23 50%, transparent 100%);
  opacity: 0.6;
}

.control-info {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 50px;
  flex-shrink: 0;
}

.label-icon {
  font-size: 14px;
  width: 14px;
  text-align: center;
}

.label-text {
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Bank Sans EF CY Compressed', sans-serif;
  line-height: 1;
}

.toggle-btn-square {
  background: linear-gradient(135deg, #565F76 0%, #464F6A 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 0;
  border-radius: 0;
  cursor: pointer;
  font-size: 9px;
  font-weight: 700;
  transition: all 0.3s ease;
  width: 36px;
  height: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Bank Sans EF CY Compressed', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.toggle-btn-square.active {
  background: linear-gradient(135deg, #B5FA23 0%, #32CD32 100%);
  color: #1D1D1F;
  border-color: rgba(181, 250, 35, 0.8);
  box-shadow: 
    0 0 8px rgba(181, 250, 35, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.toggle-btn-square:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.volume-slider-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  height: 20px;
}

.volume-slider-square {
  width: 100%;
  height: 8px;
  background: linear-gradient(135deg, #2B3753 0%, #464F6A 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  position: relative;
}

.volume-slider-square::-webkit-slider-track {
  height: 8px;
  background: linear-gradient(135deg, #2B3753 0%, #464F6A 100%);
  border-radius: 0;
}

.volume-slider-square::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #B5FA23 0%, #32CD32 100%);
  border-radius: 0;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.4),
    0 0 8px rgba(181, 250, 35, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.volume-slider-square::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 
    0 3px 10px rgba(0, 0, 0, 0.5),
    0 0 12px rgba(181, 250, 35, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.volume-slider-square:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.volume-slider-square:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
  transform: none;
  background: linear-gradient(135deg, #565F76 0%, #464F6A 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.volume-value {
  color: #B5FA23;
  font-size: 10px;
  font-weight: 700;
  width: 28px;
  height: 20px;
  text-align: center;
  font-family: 'Bank Sans EF CY Compressed', sans-serif;
  text-shadow: 0 0 6px rgba(181, 250, 35, 0.4);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(181, 250, 35, 0.2);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .audio-control-content {
    width: 260px;
  }
  
  .control-header {
    padding: 10px 14px;
  }
  
  .control-section {
    padding: 14px;
  }
  
  .control-row {
    gap: 10px;
    margin-bottom: 14px;
    padding: 6px;
  }
  
  .control-info {
    min-width: 50px;
  }
  
  .label-text {
    font-size: 11px;
  }
  
  .toggle-btn-square {
    min-width: 28px;
    height: 18px;
    font-size: 9px;
  }
}
</style>