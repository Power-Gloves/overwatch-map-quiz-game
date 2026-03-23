<template>
  <div class="mode-select-screen">
    <ControlButtons 
      show-back
      show-audio
      @back="$emit('back')"
      @toggle-audio="$emit('toggle-audio')"
    />
    
    <div class="header">
      <h1 class="title ow-text-glow">选择游戏模式</h1>
      <p class="subtitle">每种模式都有独特的挑战体验</p>
    </div>
    
    <div class="content">
      <div class="mode-grid">
        <ModeCard
          v-for="mode in modes"
          :key="mode.value"
          :mode="mode"
          @select="$emit('mode-select', mode.value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ControlButtons from '@/components/ControlButtons.vue'
import ModeCard from '@/components/ModeCard.vue'

const baseUrl = import.meta.env.BASE_URL

// Emits
defineEmits<{
  'back': []
  'toggle-audio': []
  'mode-select': [mode: string]
}>()

// 游戏模式配置
const modes = computed(() => [
  {
    icon: `${baseUrl}images/1.png`,
    title: "无尽模式",
    subtitle: "无限题目，追求连续答对的最高记录！",
    value: 'endless'
  },
  {
    icon: `${baseUrl}images/2.png`,
    title: "挑战模式", 
    subtitle: "20题挑战，达到70%正确率通关！",
    value: 'challenge'
  },
  {
    icon: `${baseUrl}images/3.png`,
    title: "练习模式",
    subtitle: "10题轻松练习，熟悉地图布局！", 
    value: 'practice'
  }
])
</script>

<style scoped lang="scss">
@import '@/styles/design-system.scss';

.mode-select-screen {
  @extend .full-screen;
  @extend .flex-col;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  color: var(--ow-text-primary);
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: 900;
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  font-size: var(--font-size-md);
  color: var(--ow-text-secondary);
}

.content {
  width: 100%;
  max-width: 600px;
}

.mode-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
</style>