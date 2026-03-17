<template>
  <div class="game-screen">
    <ControlButtons 
      show-back
      show-audio
      @back="$emit('back')"
      @toggle-audio="$emit('toggle-audio')"
    />
    
    <ScoreBoard :game-state="gameState" />
    
    <GameCard 
      :current-question="gameState.currentQuestion"
      :next-question="gameState.nextQuestion"
      :total-answered="gameState.totalAnswered"
      :feedback-data="feedbackData"
      :show-feedback="showAnswerFeedback"
      :is-answering="isAnswering"
    />
    
    <AnswerPanel
      v-if="gameState.currentQuestion"
      :question="gameState.currentQuestion"
      :game-mode="gameState.mode"
      :feedback-data="feedbackData"
      :is-answering="isAnswering"
      @answer="handleAnswer"
    />
  </div>
</template>

<script setup lang="ts">
import ControlButtons from '@/components/ControlButtons.vue'
import ScoreBoard from '@/components/ScoreBoard.vue'
import GameCard from '@/components/GameCard.vue'
import AnswerPanel from '@/components/AnswerPanel.vue'

// Props
defineProps<{
  gameState: any
  isAnswering: boolean
  showAnswerFeedback: boolean
  feedbackData: any
}>()

// Emits
const emit = defineEmits<{
  'back': []
  'toggle-audio': []
  'answer': [answer: string]
}>()

// 答题处理
const handleAnswer = (answer: string) => {
  emit('answer', answer)
}
</script>

<style scoped>
.game-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: clamp(5px, 1vh, 10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
  box-sizing: border-box;
  gap: clamp(10px, 2vh, 20px);
}

@media (max-width: 768px) {
  .game-screen {
    padding: clamp(8px, 1.5vh, 12px);
  }
}
</style>