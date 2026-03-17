<template>
  <div
    ref="cardRef"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    :class="['spotlight-card', className]"
  >
    <!-- 聚光灯效果层 -->
    <div
      class="spotlight-overlay"
      :style="{
        opacity: opacity,
        background: `radial-gradient(circle 150px at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`
      }"
    />

    <!-- 内容层 -->
    <div class="spotlight-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Position {
  x: number
  y: number
}

interface SpotlightCardProps {
  className?: string
  spotlightColor?: string
}

const { className = '', spotlightColor = 'rgba(255, 255, 255, 0.3)' } = defineProps<SpotlightCardProps>()

const cardRef = ref<HTMLDivElement>()
const position = ref<Position>({ x: 0, y: 0 })
const opacity = ref<number>(0)

const handleMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  position.value = { 
    x: e.clientX - rect.left, 
    y: e.clientY - rect.top 
  }
}

const handleMouseEnter = () => {
  opacity.value = 1
}

const handleMouseLeave = () => {
  opacity.value = 0
}

// 触摸事件支持
const handleTouchStart = (e: TouchEvent) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const touch = e.touches[0]
  position.value = { 
    x: touch.clientX - rect.left, 
    y: touch.clientY - rect.top 
  }
  opacity.value = 1
}

const handleTouchMove = (e: TouchEvent) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const touch = e.touches[0]
  position.value = { 
    x: touch.clientX - rect.left, 
    y: touch.clientY - rect.top 
  }
}

const handleTouchEnd = () => {
  opacity.value = 0
}
</script>

<style scoped>
.spotlight-card {
  position: relative;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(20, 20, 20, 0.7);
  overflow: hidden;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.spotlight-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(30, 30, 30, 0.8);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.spotlight-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: overlay;
}

.spotlight-content {
  position: relative;
  z-index: 2;
}

/* 移动端优化 - 添加点击时的聚光灯效果 */
@media (hover: none) and (pointer: coarse) {
  .spotlight-card:active .spotlight-overlay {
    opacity: 0.8 !important;
    transition: opacity 0.1s ease;
  }
}
</style>