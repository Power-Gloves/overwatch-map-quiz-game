<template>
  <div class="pixel-demo">
    <div 
      ref="cardRef"
      class="demo-card pixel-card"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <canvas ref="canvasRef" class="pixel-canvas"></canvas>
      
      <div class="card-content">
        <div class="game-header">
          <span class="question-number">#4</span>
          <span class="map-type">CONTROL</span>
        </div>
        
        <div class="image-area">
          <div class="map-placeholder">🌊</div>
        </div>
        
        <div class="question-area">
          <p class="question">这是哪个地图？</p>
          <div class="options">
            <button class="option">A. 伊里奥斯</button>
            <button class="option">B. 阿育陀耶</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue'

const cardRef = useTemplateRef<HTMLDivElement>('cardRef')
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
const animationId = ref<number | null>(null)

class Pixel {
  x: number
  y: number
  size: number
  maxSize: number
  color: string
  speed: number
  isGrowing: boolean
  
  constructor(x: number, y: number, color: string) {
    this.x = x
    this.y = y
    this.size = 0
    this.maxSize = Math.random() * 2 + 1
    this.color = color
    this.speed = Math.random() * 0.1 + 0.05
    this.isGrowing = true
  }
  
  update() {
    if (this.isGrowing) {
      this.size += this.speed
      if (this.size >= this.maxSize) {
        this.isGrowing = false
      }
    } else {
      this.size -= this.speed * 0.5
      if (this.size <= 0) {
        this.size = 0
      }
    }
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    if (this.size > 0) {
      ctx.fillStyle = this.color
      ctx.fillRect(this.x, this.y, this.size, this.size)
    }
  }
}

const pixels = ref<Pixel[]>([])
const colors = ['#f093fb', '#f5576c', '#4facfe', '#00f2fe']

const initPixels = () => {
  if (!canvasRef.value || !cardRef.value) return
  
  const canvas = canvasRef.value
  const rect = cardRef.value.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  
  pixels.value = []
  const gap = 8
  
  for (let x = 0; x < canvas.width; x += gap) {
    for (let y = 0; y < canvas.height; y += gap) {
      const color = colors[Math.floor(Math.random() * colors.length)]
      pixels.value.push(new Pixel(x, y, color))
    }
  }
}

const animate = () => {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  pixels.value.forEach(pixel => {
    pixel.update()
    pixel.draw(ctx)
  })
  
  animationId.value = requestAnimationFrame(animate)
}

const handleMouseEnter = () => {
  pixels.value.forEach(pixel => {
    pixel.isGrowing = true
  })
}

const handleMouseLeave = () => {
  pixels.value.forEach(pixel => {
    pixel.isGrowing = false
  })
}

onMounted(() => {
  initPixels()
  animate()
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<style scoped>
.pixel-demo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-card {
  width: 200px;
  height: 280px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.pixel-card {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.pixel-card:hover {
  transform: scale(1.02);
}

.pixel-canvas {
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
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.question-number {
  color: #ffffff;
  font-weight: 600;
  font-size: 12px;
}

.map-type {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  text-transform: uppercase;
}

.image-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 12px;
}

.map-placeholder {
  font-size: 32px;
  opacity: 0.9;
}

.question-area {
  text-align: center;
}

.question {
  font-size: 12px;
  color: white;
  margin-bottom: 8px;
  font-weight: 600;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.option {
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}
</style>