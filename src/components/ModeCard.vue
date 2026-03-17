<template>
  <div 
    class="mode-card"
    @click="$emit('select')"
  >
    <div class="mode-icon">
      <img :src="mode.icon" :alt="mode.title" />
    </div>
    
    <div class="mode-content">
      <h3 class="mode-title">{{ mode.title }}</h3>
      <p class="mode-subtitle">{{ mode.subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  mode: {
    icon: string
    title: string
    subtitle: string
    value: string
  }
}>()

// Emits
defineEmits<{
  'select': []
}>()
</script>

<style scoped lang="scss">
@import '@/styles/design-system.scss';

.mode-card {
  display: flex;
  align-items: center;
  height: 80px;
  background: #464F6A;
  border: 2px solid rgba(59, 156, 225, 0.3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-normal);
  overflow: hidden;
  
  &:hover {
    border-color: var(--ow-border-active);
    transform: translateY(-2px);
    box-shadow: var(--ow-shadow-lg);
  }
}

.mode-icon {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  @extend .flex-center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.mode-content {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
}

.mode-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--ow-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.mode-subtitle {
  font-size: var(--font-size-sm);
  color: var(--ow-text-secondary);
  margin: 0;
}
</style>