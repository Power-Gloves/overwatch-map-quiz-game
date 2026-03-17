<template>
  <div class="separated-answers">
    <p class="question-text">这是哪个地图？</p>
    <div class="answer-grid">
      <button 
        v-for="(option, index) in props.question.allOptions" 
        :key="`${props.question.id}-${index}-${option}`"
        @click="handleAnswer(option)"
        class="answer-btn"
        :class="{
          ['answer-' + (index + 1)]: true,
          'selected': feedbackData && feedbackData.selectedOption === option,
          'correct-selected': feedbackData && feedbackData.selectedOption === option && feedbackData.isCorrect,
          'wrong-selected': feedbackData && feedbackData.selectedOption === option && !feedbackData.isCorrect
        }"
        :disabled="isAnswering"
      >
        <span class="answer-letter">{{ String.fromCharCode(65 + index) }}</span>
        <span class="answer-text">
          <template v-if="getDisplayText(option, gameMode).hasBlur">
            {{ getDisplayText(option, gameMode).beforeText }}<span 
              style="filter: blur(4px); text-shadow: 0 0 8px currentColor;"
            >{{ getDisplayText(option, gameMode).blurText }}</span>{{ getDisplayText(option, gameMode).afterText }}
          </template>
          <template v-else>
            {{ getDisplayText(option, gameMode).text }}
          </template>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GameMode } from '@/types'

// Props
const props = defineProps<{
  question: any
  gameMode: GameMode
  feedbackData: any
  isAnswering: boolean
}>()

// Emits
const emit = defineEmits<{
  'answer': [answer: string]
}>()

// 简化的文本显示方法 - 缓存结果避免重复计算
const textDisplayCache = new Map<string, any>()

const getDisplayText = (text: string, gameMode: GameMode) => {
  const cacheKey = `${text}-${gameMode}`
  
  if (textDisplayCache.has(cacheKey)) {
    return textDisplayCache.get(cacheKey)
  }
  
  // 只在挑战模式中模糊文字
  if (gameMode !== 'challenge' && gameMode !== GameMode.CHALLENGE) {
    const result = { text, hasBlur: false }
    textDisplayCache.set(cacheKey, result)
    return result
  }
  
  const length = text.length
  if (length <= 2) {
    const result = { text, hasBlur: false }
    textDisplayCache.set(cacheKey, result)
    return result
  }
  
  // 根据长度决定模糊几个字
  let hideCount = 1
  if (length >= 6) hideCount = Math.floor(length / 2) - 1
  else if (length >= 4) hideCount = 2
  
  // 保留首尾，中间模糊
  const start = Math.floor((length - hideCount) / 2)
  const end = start + hideCount
  
  const result = {
    beforeText: text.substring(0, start),
    blurText: text.substring(start, end),
    afterText: text.substring(end),
    hasBlur: true
  }
  
  textDisplayCache.set(cacheKey, result)
  return result
}

const handleAnswer = (answer: string) => {
  emit('answer', answer)
}
</script>

<style scoped>
/* 分离的答案区域 - 守望先锋绿色主题 */
.separated-answers {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
  border-radius: 4px;
  padding: clamp(10px, 1.5vh, 14px);
  backdrop-filter: blur(20px);
  /* 守望先锋经典绿色边框 */
  border: 2px solid rgba(181, 250, 35, 0.8);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    /* 绿色外发光效果 */
    0 0 0 1px rgba(181, 250, 35, 0.4),
    0 0 20px rgba(181, 250, 35, 0.3);
  flex-shrink: 0;
  margin-top: clamp(-80px, -8vh, -75px);
  position: relative;
  overflow: hidden;
}

.separated-answers::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #B5FA23 0%, #32CD32 50%, #B5FA23 100%);
  animation: topGlow 3s ease-in-out infinite;
}

/* 左侧绿色装饰条 */
.separated-answers::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, transparent 0%, #B5FA23 30%, #32CD32 70%, transparent 100%);
  opacity: 0.9;
}

@keyframes topGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.question-text {
  font-size: clamp(16px, 3.5vw, 20px);
  font-weight: 600;
  text-align: center;
  margin-bottom: clamp(1px, 2vh, 1px);
  color: #ffffff;
  transform: skew(-8deg) !important;
  font-style: italic !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  font-family: 'Bank Sans EF CY Compressed', sans-serif !important;
}

/* 关键：2行2列答案网格 */
.answer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: clamp(8px, 1.5vh, 12px);
  width: 100%;
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: clamp(6px, 1vh, 10px);
  padding: clamp(12px, 2vh, 16px) clamp(10px, 2vw, 14px);
  /* 守望先锋黑色背景 */
  background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
  /* 守望先锋白色边框 */
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  /* 稍微调大按钮整体字体找到平衡点 */
  font-size: clamp(14.5px, 3vw, 18px) !important;
  min-height: clamp(42px, 6.5vh, 55px);
  position: relative;
  overflow: hidden;
  transform: translateY(0);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  /* 守望先锋按钮阴影 */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3), 
    0 0 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.answer-btn:hover {
  /* 守望先锋绿色悬浮效果 */
  background: linear-gradient(135deg, #B5FA23 0%, #32CD32 100%);
  border-color: rgba(255, 255, 255, 1);
  color: #000000;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0px 0px 2px 3px rgba(181, 250, 35, 0.8),
    0 4px 15px rgba(181, 250, 35, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: owGreenGlow 2s ease-in-out infinite;
}

/* 移动端禁用hover效果，避免状态粘滞 */
@media (hover: none) and (pointer: coarse) {
  .answer-btn:hover {
    background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
    border-color: rgba(255, 255, 255, 0.6);
    color: white;
    transform: translateY(0);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3), 
      0 0 6px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: none;
  }
}

.answer-btn:active {
  transform: translateY(0) scale(0.95);
  box-shadow: 
    0 2px 10px rgba(181, 250, 35, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: owButtonPress 0.2s ease;
}

.answer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 选中状态样式 - 守望先锋绿色风格 */
.answer-btn.selected {
  background: linear-gradient(135deg, #B5FA23 0%, #32CD32 100%);
  border-color: rgba(255, 255, 255, 1);
  color: #000000;
  transform: translateY(-1px) scale(1.02);
  box-shadow: 
    0px 0px 2px 3px rgba(181, 250, 35, 1),
    0 4px 15px rgba(181, 250, 35, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.answer-btn.correct-selected {
  background: linear-gradient(135deg, #33A03D 0%, #4cd964 100%);
  border-color: #4cd964;
  color: #ffffff;
  box-shadow: 
    0px 0px 2px 3px rgba(76, 217, 100, 1),
    0 4px 20px rgba(76, 217, 100, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: correctButtonPulse 0.6s ease;
}

.answer-btn.wrong-selected {
  background: linear-gradient(135deg, #DE4561 0%, #ff4757 100%);
  border-color: #ff4757;
  color: #ffffff;
  box-shadow: 
    0px 0px 2px 3px rgba(255, 71, 87, 1),
    0 4px 20px rgba(255, 71, 87, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: wrongButtonShake 0.6s ease;
}

.answer-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.answer-btn:hover::before {
  left: 100%;
}

@keyframes correctButtonPulse {
  0%, 100% {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 4px 20px rgba(76, 217, 100, 0.4);
  }
  50% {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 30px rgba(76, 217, 100, 0.6);
  }
}

@keyframes wrongButtonShake {
  0%, 100% {
    transform: translateY(-1px) scale(1.02) translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateY(-1px) scale(1.02) translateX(-3px);
  }
  20%, 40%, 60%, 80% {
    transform: translateY(-1px) scale(1.02) translateX(3px);
  }
}

/* 守望先锋绿色主题动画 */
@keyframes owGreenGlow {
  0%, 100% { 
    box-shadow: 
      0px 0px 2px 3px rgba(181, 250, 35, 0.8),
      0 4px 15px rgba(181, 250, 35, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  50% { 
    box-shadow: 
      0px 0px 4px 5px rgba(181, 250, 35, 0.9),
      0 6px 25px rgba(181, 250, 35, 0.8),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

.answer-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(36px, 5.5vw, 44px);
  height: clamp(36px, 5.5vw, 44px);
  /* 守望先锋绿色字母标识 */
  background: linear-gradient(135deg, #B5FA23, #32CD32);
  border-radius: 4px;
  font-weight: 700;
  color: #000000;
  flex-shrink: 0;
  /* 强制增大字母字体 */
  font-size: clamp(18px, 3.5vw, 22px) !important;
  /* 守望先锋字母标识样式 */
  box-shadow: 
    0 2px 8px rgba(181, 250, 35, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.answer-text {
  flex: 1;
  text-align: left;
  font-weight: 600 !important;
  line-height: 1.3;
  color: #ffffff;
  transform: skew(-8deg) !important;
  font-style: italic !important;
  letter-spacing: 0.5px !important;
  font-family: 'Bank Sans EF CY Compressed', sans-serif !important;
  /* 稍微调大字体大小找到平衡点 */
  font-size: clamp(14.5px, 3vw, 18px) !important;
}

/* 移动端性能优化 */
@media (max-width: 768px) {
  .separated-answers {
    backdrop-filter: none !important;
    background: rgba(44, 44, 44, 0.95) !important;
  }
  
  .answer-btn {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  }
  
  .answer-btn:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  }
  
  .separated-answers::before {
    animation: none !important;
  }
}

@media (max-width: 768px) {
  .separated-answers {
    max-width: 100%;
    padding: clamp(8px, 1.2vh, 12px);
    margin-top: clamp(30px, 6vh, 45px);
  }
  
  .answer-grid {
    gap: clamp(6px, 1vh, 10px);
  }
  
  .answer-btn {
    padding: clamp(10px, 1.5vh, 14px) clamp(8px, 1.5vw, 12px);
    min-height: clamp(36px, 5vh, 50px);
  }
}

@media (max-width: 480px) {
  .separated-answers {
    max-width: 100%;
    padding: clamp(6px, 1vh, 10px);
    margin-top: clamp(0px, 0vh, 0px);
  }
  
  .answer-grid {
    gap: clamp(4px, 0.8vh, 8px);
  }
  
  .answer-btn {
    padding: clamp(8px, 1vh, 12px) clamp(6px, 1vw, 10px);
    min-height: clamp(32px, 4vh, 42px);
  }
  
  .answer-text {
    font-size: clamp(10px, 2vw, 14px);
  }
}

@media (max-height: 600px) {
  .separated-answers {
    max-width: 100%;
    padding: clamp(6px, 1vh, 8px);
    margin-top: clamp(8px, 1.5vh, 12px);
  }
  
  .answer-btn {
    min-height: clamp(28px, 3.5vh, 38px);
  }
}

/* 超宽屏幕优化 */
@media (min-width: 1200px) {
  .separated-answers {
    max-width: 320px;
    margin-top: clamp(30px, 6vh, 50px);
  }
  
  .answer-btn {
    min-height: clamp(56px, 8vh, 72px);
  }
}
</style>