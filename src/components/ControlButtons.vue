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

<style scoped>
.control-buttons {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
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
  transition: all 0.3s ease;
  z-index: 100;
  pointer-events: auto;
}

.control-button img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.control-button:hover {
  transform: scale(1.1);
}

.control-button-left {
  left: 8px;
}

.control-button-right {
  right: 8px;
}
</style>