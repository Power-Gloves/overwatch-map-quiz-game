import { ref, readonly } from 'vue'
import { audioService, SoundType } from '@/services/AudioService'

export function useAudio() {
  const musicVolume = ref(0.7)
  const sfxVolume = ref(0.8)
  const isPlayingMusic = ref(false)

  // 更新状态
  const updateState = () => {
    const state = audioService.getState()
    musicVolume.value = state.musicVolume
    sfxVolume.value = state.sfxVolume
    isPlayingMusic.value = state.isPlayingMusic
  }

  // 初始化状态
  updateState()

  // 播放按钮点击音效
  const playButtonClick = () => {
    audioService.play(SoundType.BUTTON_CLICK)
  }

  // 播放背景音乐
  const playMenuMusic = () => {
    audioService.playMusic()
    updateState()
  }

  // 音乐控制
  const stopMusic = () => {
    audioService.stopMusic()
    updateState()
  }

  const pauseMusic = () => {
    audioService.pauseMusic()
    updateState()
  }

  const resumeMusic = () => {
    audioService.resumeMusic()
    updateState()
  }

  // 音量控制
  const setMusicVolume = (volume: number) => {
    audioService.setMusicVolume(volume)
    updateState()
  }

  const setSfxVolume = (volume: number) => {
    audioService.setSfxVolume(volume)
    updateState()
  }

  return {
    // 状态
    musicVolume: readonly(musicVolume),
    sfxVolume: readonly(sfxVolume),
    isPlayingMusic: readonly(isPlayingMusic),
    
    // 音效
    playButtonClick,
    
    // 音乐控制
    playMenuMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    
    // 音量控制
    setMusicVolume,
    setSfxVolume
  }
}
