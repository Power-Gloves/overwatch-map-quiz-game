<template>
  <div 
    ref="wrapRef" 
    :class="`profile-card-wrapper ${className}`.trim()" 
    :style="cardStyle"
  >
    <section 
      ref="cardRef" 
      class="profile-card"
      @pointerenter="handlePointerEnter"
      @pointermove="handlePointerMove"
      @pointerleave="handlePointerLeave"
    >
      <!-- 背景效果层 -->
      <div class="card-background">
        <div v-if="enableShine" class="card-shine" />
        <div class="card-glare" />
      </div>
      
      <!-- 游戏内容层 -->
      <div class="game-content">
        <slot />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, useTemplateRef } from 'vue'

interface Props {
  className?: string
  enableTilt?: boolean
  enableShine?: boolean
  behindGradient?: string
  innerGradient?: string
  showBehindGradient?: boolean
  iconUrl?: string
  grainUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  enableTilt: true,
  enableShine: true,
  behindGradient: undefined,
  innerGradient: undefined,
  showBehindGradient: true,
  iconUrl: undefined,
  grainUrl: undefined
})

const wrapRef = useTemplateRef<HTMLDivElement>('wrapRef')
const cardRef = useTemplateRef<HTMLElement>('cardRef')

const DEFAULT_BEHIND_GRADIENT = `
  radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),
    hsla(266,100%,90%,var(--card-opacity)) 4%,
    hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,
    hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,
    hsla(266,0%,60%,0) 100%),
  radial-gradient(35% 52% at 55% 20%, #00ffaac4 0%, #073aff00 100%),
  radial-gradient(100% 100% at 50% 50%, #00c1ffff 1%, #073aff00 76%),
  conic-gradient(from 124deg at 50% 50%, #c137ffff 0%, #07c6ffff 40%, #07c6ffff 60%, #c137ffff 100%)
`

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg, #60496e8c 0%, #71C4FF44 100%)'

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60
} as const

const clamp = (value: number, min = 0, max = 100): number => Math.min(Math.max(value, min), max)
const round = (value: number, precision = 3): number => parseFloat(value.toFixed(precision))
const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin))

const easeInOutCubic = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

let rafId: number | null = null

const updateCardTransform = (offsetX: number, offsetY: number, card: HTMLElement, wrap: HTMLElement) => {
  const width = card.clientWidth
  const height = card.clientHeight

  const percentX = clamp((100 / width) * offsetX)
  const percentY = clamp((100 / height) * offsetY)

  const centerX = percentX - 50
  const centerY = percentY - 50

  const properties = {
    '--pointer-x': `${percentX}%`,
    '--pointer-y': `${percentY}%`,
    '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
    '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
    '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
    '--pointer-from-top': `${percentY / 100}`,
    '--pointer-from-left': `${percentX / 100}`,
    '--rotate-x': `${round(-(centerX / 5))}deg`,
    '--rotate-y': `${round(centerY / 4)}deg`
  }

  Object.entries(properties).forEach(([property, value]) => {
    wrap.style.setProperty(property, value)
  })
}

const createSmoothAnimation = (
  duration: number,
  startX: number,
  startY: number,
  card: HTMLElement,
  wrap: HTMLElement
) => {
  const startTime = performance.now()
  const targetX = wrap.clientWidth / 2
  const targetY = wrap.clientHeight / 2

  const animationLoop = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = clamp(elapsed / duration)
    const easedProgress = easeInOutCubic(progress)

    const currentX = adjust(easedProgress, 0, 1, startX, targetX)
    const currentY = adjust(easedProgress, 0, 1, startY, targetY)

    updateCardTransform(currentX, currentY, card, wrap)

    if (progress < 1) {
      rafId = requestAnimationFrame(animationLoop)
    }
  }

  rafId = requestAnimationFrame(animationLoop)
}

const cancelAnimation = () => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

const handlePointerMove = (event: PointerEvent) => {
  const card = cardRef.value
  const wrap = wrapRef.value

  if (!card || !wrap || !props.enableTilt) return

  const rect = card.getBoundingClientRect()
  updateCardTransform(event.clientX - rect.left, event.clientY - rect.top, card, wrap)
}

const handlePointerEnter = () => {
  const card = cardRef.value
  const wrap = wrapRef.value

  if (!card || !wrap || !props.enableTilt) return

  cancelAnimation()
  wrap.classList.add('active')
  card.classList.add('active')
}

const handlePointerLeave = (event: PointerEvent) => {
  const card = cardRef.value
  const wrap = wrapRef.value

  if (!card || !wrap || !props.enableTilt) return

  createSmoothAnimation(ANIMATION_CONFIG.SMOOTH_DURATION, event.offsetX, event.offsetY, card, wrap)
  wrap.classList.remove('active')
  card.classList.remove('active')
}

const cardStyle = computed(() => ({
  '--icon': props.iconUrl ? `url(${props.iconUrl})` : 'none',
  '--grain': props.grainUrl ? `url(${props.grainUrl})` : 'none',
  '--behind-gradient': props.showBehindGradient ? (props.behindGradient ?? DEFAULT_BEHIND_GRADIENT) : 'none',
  '--inner-gradient': props.innerGradient ?? DEFAULT_INNER_GRADIENT
}))

onMounted(() => {
  if (!props.enableTilt) return

  const card = cardRef.value
  const wrap = wrapRef.value

  if (!card || !wrap) return

  const initialX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET
  const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET

  updateCardTransform(initialX, initialY, card, wrap)
  createSmoothAnimation(ANIMATION_CONFIG.INITIAL_DURATION, initialX, initialY, card, wrap)
})

onUnmounted(() => {
  cancelAnimation()
})
</script>

<style scoped>
.profile-card-wrapper {
  --pointer-x: 50%;
  --pointer-y: 50%;
  --pointer-from-center: 0;
  --pointer-from-top: 0.5;
  --pointer-from-left: 0.5;
  --card-opacity: 0;
  --rotate-x: 0deg;
  --rotate-y: 0deg;
  --background-x: 50%;
  --background-y: 50%;
  --behind-gradient: none;
  --inner-gradient: none;
  --sunpillar-1: hsl(2, 100%, 73%);
  --sunpillar-2: hsl(53, 100%, 69%);
  --sunpillar-3: hsl(93, 100%, 69%);
  --sunpillar-4: hsl(176, 100%, 76%);
  --sunpillar-5: hsl(228, 100%, 74%);
  --sunpillar-6: hsl(283, 100%, 73%);
  --card-radius: 20px;
  
  perspective: 500px;
  transform: translate3d(0, 0, 0.1px);
  position: relative;
  touch-action: none;
  width: 100%;
  height: 100%;
}

.profile-card-wrapper::before {
  content: '';
  position: absolute;
  inset: -10px;
  background: inherit;
  background-position: inherit;
  border-radius: inherit;
  transition: all 0.5s ease;
  filter: contrast(2) saturate(2) blur(36px);
  transform: scale(0.8) translate3d(0, 0, 0.1px);
  background-size: 100% 100%;
  background-image: var(--behind-gradient);
  pointer-events: none;
}

.profile-card-wrapper:hover,
.profile-card-wrapper.active {
  --card-opacity: 1;
}

.profile-card-wrapper:hover::before,
.profile-card-wrapper.active::before {
  filter: contrast(1) saturate(2) blur(40px) opacity(1);
  transform: scale(0.9) translate3d(0, 0, 0.1px);
}

.profile-card {
  width: 100%;
  height: 100%;
  border-radius: var(--card-radius);
  position: relative;
  background-blend-mode: color-dodge, normal, normal, normal;
  animation: glow-bg 12s linear infinite;
  box-shadow: rgba(0, 0, 0, 0.8) calc((var(--pointer-from-left) * 10px) - 3px)
    calc((var(--pointer-from-top) * 20px) - 6px) 20px -5px;
  transition: transform 1s ease;
  transform: translate3d(0, 0, 0.1px) rotateX(0deg) rotateY(0deg);
  background-size: 100% 100%;
  background-position: 0 0, 0 0, 50% 50%, 0 0;
  background-image:
    radial-gradient(
      farthest-side circle at var(--pointer-x) var(--pointer-y),
      hsla(266, 100%, 90%, var(--card-opacity)) 4%,
      hsla(266, 50%, 80%, calc(var(--card-opacity) * 0.75)) 10%,
      hsla(266, 25%, 70%, calc(var(--card-opacity) * 0.5)) 50%,
      hsla(266, 0%, 60%, 0) 100%
    ),
    radial-gradient(35% 52% at 55% 20%, #00ffaac4 0%, #073aff00 100%),
    radial-gradient(100% 100% at 50% 50%, #00c1ffff 1%, #073aff00 76%),
    conic-gradient(from 124deg at 50% 50%, #c137ffff 0%, #07c6ffff 40%, #07c6ffff 60%, #c137ffff 100%);
  overflow: hidden;
}

.profile-card:hover,
.profile-card.active {
  transition: none;
  transform: translate3d(0, 0, 0.1px) rotateX(var(--rotate-y)) rotateY(var(--rotate-x));
}

/* 背景效果层 - 绝对定位，不影响内容布局 */
.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.card-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: filter 0.6s ease;
  filter: brightness(0.66) contrast(1.33) saturate(0.33) opacity(0.5);
  animation: holo-bg 18s linear infinite;
  mix-blend-mode: color-dodge;
  --space: 5%;
  --angle: -45deg;
  transform: translate3d(0, 0, 1px);
  overflow: hidden;
  z-index: 3;
  background: transparent;
  background-size: cover;
  background-position: center;
  background-image:
    repeating-linear-gradient(
      0deg,
      var(--sunpillar-1) calc(var(--space) * 1),
      var(--sunpillar-2) calc(var(--space) * 2),
      var(--sunpillar-3) calc(var(--space) * 3),
      var(--sunpillar-4) calc(var(--space) * 4),
      var(--sunpillar-5) calc(var(--space) * 5),
      var(--sunpillar-6) calc(var(--space) * 6),
      var(--sunpillar-1) calc(var(--space) * 7)
    ),
    repeating-linear-gradient(
      var(--angle),
      #0e152e 0%,
      hsl(180, 10%, 60%) 3.8%,
      hsl(180, 29%, 66%) 4.5%,
      hsl(180, 10%, 60%) 5.2%,
      #0e152e 10%,
      #0e152e 12%
    ),
    radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsla(0, 0%, 0%, 0.1) 12%,
      hsla(0, 0%, 0%, 0.15) 20%,
      hsla(0, 0%, 0%, 0.25) 120%
    );
  background-position:
    0 var(--background-y),
    var(--background-x) var(--background-y),
    center;
  background-blend-mode: color, hard-light;
  background-size:
    500% 500%,
    300% 300%,
    200% 200%;
  background-repeat: repeat;
  border-radius: var(--card-radius);
}

.profile-card:hover .card-shine,
.profile-card.active .card-shine {
  filter: brightness(0.85) contrast(1.5) saturate(0.5);
  animation: none;
}

.card-glare {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translate3d(0, 0, 1.1px);
  overflow: hidden;
  background-image: radial-gradient(
    farthest-corner circle at var(--pointer-x) var(--pointer-y),
    hsl(248, 25%, 80%) 12%,
    hsla(207, 40%, 30%, 0.8) 90%
  );
  mix-blend-mode: overlay;
  filter: brightness(0.8) contrast(1.2);
  z-index: 4;
  border-radius: var(--card-radius);
}

/* 游戏内容层 - 正常文档流，完全可交互 */
.game-content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  background-image: 
    var(--inner-gradient);
  background-color: rgba(0, 0, 0, 0.9);
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: cover;
  background-blend-mode: normal;
  opacity: 0.9;
  border-radius: var(--card-radius);
  transform: translate3d(
    calc(var(--pointer-from-left) * -3px + 1.5px),
    calc(var(--pointer-from-top) * -3px + 1.5px),
    2px
  );
}

.game-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--icon);
  background-repeat: repeat;
  background-size: 80px auto;
  background-position: 0 0;
  opacity: calc(0.05 + var(--pointer-from-center) * 0.15);
  pointer-events: none;
  z-index: -1;
  filter: grayscale(100%) brightness(calc(1.5 + var(--pointer-from-center) * 0.8));
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.game-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--icon);
  background-repeat: repeat;
  background-size: 80px auto;
  background-position: calc(var(--pointer-from-left) * 10px) calc(var(--pointer-from-top) * 10px);
  opacity: calc(var(--pointer-from-center) * 0.1);
  pointer-events: none;
  z-index: -1;
  filter: blur(1px) brightness(2) contrast(1.5);
  mix-blend-mode: screen;
  transition: all 0.3s ease;
}

.game-content * {
  pointer-events: auto;
}

@keyframes glow-bg {
  0% { --bgrotate: 0deg; }
  100% { --bgrotate: 360deg; }
}

@keyframes holo-bg {
  0% {
    background-position:
      0 var(--background-y),
      0 0,
      center;
  }
  100% {
    background-position:
      0 var(--background-y),
      90% 90%,
      center;
  }
}

@media (max-width: 768px) {
  .profile-card-wrapper {
    --card-radius: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-card,
  .card-shine {
    animation: none;
  }
  
  .profile-card-wrapper::before {
    transition: none;
  }
}
</style>