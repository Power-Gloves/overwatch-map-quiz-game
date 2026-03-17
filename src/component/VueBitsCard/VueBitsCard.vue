<template>
  <div 
    :class="[
      'vue-bits-card',
      `variant-${variant}`,
      { 'is-hovered': isHovered }
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 背景装饰 -->
    <div class="card-background">
      <div v-if="variant === 'gradient'" class="gradient-overlay"></div>
      <div v-if="variant === 'neon'" class="neon-glow"></div>
      <div v-if="variant === 'glass'" class="glass-blur"></div>
      <div v-if="variant === 'tilt'" class="tilt-shine"></div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <slot />
    </div>

    <!-- 装饰元素 -->
    <div v-if="variant === 'gradient'" class="floating-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  variant?: 'gradient' | 'neon' | 'glass' | 'tilt'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'gradient'
})

const isHovered = ref(false)
</script>

<style scoped>
.vue-bits-card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.card-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ========== 渐变变体 ========== */
.variant-gradient {
  background: linear-gradient(135deg, 
    rgba(244, 67, 60, 0.1) 0%,
    rgba(255, 156, 0, 0.1) 25%,
    rgba(0, 212, 255, 0.1) 50%,
    rgba(138, 43, 226, 0.1) 75%,
    rgba(244, 67, 60, 0.1) 100%);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.variant-gradient:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.gradient-overlay {
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

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(200%) rotate(45deg); }
}

.floating-orbs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 20px;
  height: 20px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 15px;
  height: 15px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 25px;
  height: 25px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
  50% { transform: translateY(-20px) scale(1.1); opacity: 1; }
}

/* ========== 霓虹变体 ========== */
.variant-neon {
  background: rgba(10, 10, 10, 0.9);
  border: 2px solid #00d4ff;
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.5),
    0 0 40px rgba(0, 212, 255, 0.3),
    inset 0 0 20px rgba(0, 212, 255, 0.1);
}

.variant-neon:hover {
  transform: translateY(-5px);
  border-color: #ff0080;
  box-shadow: 
    0 0 30px rgba(255, 0, 128, 0.6),
    0 0 60px rgba(255, 0, 128, 0.4),
    inset 0 0 30px rgba(255, 0, 128, 0.2);
}

.neon-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00d4ff, #ff0080, #00d4ff);
  background-size: 400% 400%;
  animation: neonPulse 4s ease infinite;
  border-radius: 20px;
  z-index: -1;
}

@keyframes neonPulse {
  0%, 100% { 
    background-position: 0% 50%;
    opacity: 0.8;
  }
  50% { 
    background-position: 100% 50%;
    opacity: 1;
  }
}

/* ========== 毛玻璃变体 ========== */
.variant-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.variant-glass:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-6px);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.glass-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.1) 100%);
  animation: glassShimmer 4s ease-in-out infinite;
}

@keyframes glassShimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ========== 倾斜变体 ========== */
.variant-tilt {
  background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
  border: 1px solid #333;
  box-shadow: 
    0 10px 20px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.variant-tilt:hover {
  transform: perspective(1000px) rotateX(10deg) rotateY(10deg) translateZ(20px);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.tilt-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, 
    transparent 40%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 60%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.variant-tilt.is-hovered .tilt-shine {
  transform: translateX(100%);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .vue-bits-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
  
  .variant-tilt:hover {
    transform: perspective(1000px) rotateX(5deg) rotateY(5deg) translateZ(10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vue-bits-card,
  .gradient-overlay,
  .neon-glow,
  .glass-blur,
  .tilt-shine,
  .orb {
    animation: none;
    transition: none;
  }
  
  .vue-bits-card:hover {
    transform: none;
  }
}
</style>