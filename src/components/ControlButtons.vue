<template>
  <div class="control-buttons">
    <button
      v-if="showBack"
      class="control-button control-button-left"
      @click="$emit('back')"
      aria-label="返回"
    >
      <img 
        src="/src/assets/images/icons/back-arrow-left.svg" 
        alt="返回"
      />
    </button>
    
    <button
      v-if="showAudio"
      class="control-button control-button-right"
      @click="$emit('toggle-audio')"
      aria-label="音效设置"
    >
      <img 
        src="/src/assets/images/icons/audio-control.svg" 
        alt="音效设置"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  showBack?: boolean
  showAudio?: boolean
}>()

// Emits
defineEmits<{
  'back': []
  'toggle-audio': []
}>()
</script>

<style scoped lang="scss">
@import '@/styles/design-system.scss';

.control-buttons {
  position: relative;
  z-index: 100;
}

.control-button {
  position: absolute;
  top: 20px;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition-normal);
  z-index: 100;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  &:hover {
    transform: scale(1.1);
  }
  
  &-left {
    left: var(--spacing-sm);
  }
  
  &-right {
    right: var(--spacing-sm);
  }
}
</style>