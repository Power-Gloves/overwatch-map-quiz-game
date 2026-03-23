/**
 * 游戏音效管理服务 - 简化版
 */

export enum SoundType {
  BUTTON_CLICK = 'button-click',
  MENU_MUSIC = 'menu-music',
  CORRECT_ANSWER = 'correct-answer'
}

class AudioService {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map()
  private musicVolume: number = 0.7
  private sfxVolume: number = 0.8
  private currentMusic: HTMLAudioElement | null = null
  private isInitialized: boolean = false
  private lastPlayTime: Map<SoundType, number> = new Map()
  private readonly DEBOUNCE_TIME = 300

  constructor() {
    this.loadSettings()
    this.preloadSounds()
    this.initUserInteraction()
  }

  /**
   * 从本地存储加载设置
   */
  private loadSettings() {
    try {
      const savedSettings = localStorage.getItem('audioSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        this.musicVolume = settings.musicVolume ?? 0.7
        this.sfxVolume = settings.sfxVolume ?? 0.8
      }
    } catch (error) {
      console.warn('加载音频设置失败')
    }
  }

  /**
   * 保存设置到本地存储
   */
  private saveSettings() {
    try {
      const settings = {
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume
      }
      localStorage.setItem('audioSettings', JSON.stringify(settings))
    } catch (error) {
      console.warn('保存音频设置失败')
    }
  }

  /**
   * 初始化用户交互
   */
  private initUserInteraction() {
    const initAudio = () => {
      if (this.isInitialized) return
      
      this.sounds.forEach((audio, soundType) => {
        // 保存当前音量
        const targetVolume = soundType === SoundType.MENU_MUSIC ? this.musicVolume : this.sfxVolume
        
        // 临时设置为静音进行初始化
        audio.volume = 0
        audio.play().then(() => {
          audio.pause()
          audio.currentTime = 0
          // 恢复正确的音量
          audio.volume = targetVolume
        }).catch((error) => {
          // 即使播放失败，也要恢复音量
          audio.volume = targetVolume
        })
      })
      
      this.isInitialized = true
    }

    // 监听多种用户交互事件
    const events = ['click', 'touchstart', 'keydown']
    events.forEach(eventType => {
      document.addEventListener(eventType, initAudio, { once: true })
    })
  }

  /**
   * 预加载音效文件
   */
  private preloadSounds() {
    const base = import.meta.env.BASE_URL || '/'
    const soundFiles = {
      [SoundType.BUTTON_CLICK]: `${base}sounds/confirm.wav`,
      [SoundType.MENU_MUSIC]: `${base}sounds/bgm.mp3`,
      [SoundType.CORRECT_ANSWER]: `${base}sounds/ok.mp3`
    }

    Object.entries(soundFiles).forEach(([type, path]) => {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.src = path
      
      if (type === SoundType.MENU_MUSIC) {
        audio.volume = this.musicVolume
        audio.loop = true
      } else {
        audio.volume = this.sfxVolume
      }

      this.sounds.set(type as SoundType, audio)
    })
  }

  /**
   * 强制初始化音频系统（用于确保用户交互后音效可用）
   */
  public forceInitialize(): void {
    if (this.isInitialized) return
    
    this.sounds.forEach((audio, soundType) => {
      // 保存当前音量
      const targetVolume = soundType === SoundType.MENU_MUSIC ? this.musicVolume : this.sfxVolume
      
      // 临时设置为静音进行初始化
      audio.volume = 0
      audio.play().then(() => {
        audio.pause()
        audio.currentTime = 0
        // 恢复正确的音量
        audio.volume = targetVolume
      }).catch((error) => {
        // 即使播放失败，也要恢复音量
        audio.volume = targetVolume
      })
    })
    
    this.isInitialized = true
  }
  play(soundType: SoundType) {
    // 如果音频系统未初始化，先尝试初始化
    if (!this.isInitialized) {
      this.forceInitialize()
    }

    // 防抖检查
    const now = Date.now()
    const lastTime = this.lastPlayTime.get(soundType) || 0
    if (now - lastTime < this.DEBOUNCE_TIME) {
      return
    }
    this.lastPlayTime.set(soundType, now)

    const sound = this.sounds.get(soundType)
    if (!sound) return

    try {
      // 确保音量设置正确
      const targetVolume = soundType === SoundType.MENU_MUSIC ? this.musicVolume : this.sfxVolume
      sound.volume = targetVolume
      
      sound.currentTime = 0
      sound.play().catch(() => {})
    } catch (error) {}
  }

  /**
   * 播放背景音乐
   */
  playMusic() {
    const music = this.sounds.get(SoundType.MENU_MUSIC)
    if (!music) return

    try {
      // 如果音乐已经在播放，不重新开始
      if (this.currentMusic === music && !this.currentMusic.paused) {
        return
      }
      
      // 如果音乐暂停了，直接恢复播放
      if (this.currentMusic === music && this.currentMusic.paused) {
        music.volume = this.musicVolume
        music.play().catch(() => {})
        return
      }
      
      // 否则从头开始播放
      music.currentTime = 0
      music.loop = true
      music.volume = this.musicVolume
      music.play().catch(() => {})
      this.currentMusic = music
    } catch (error) {}
  }

  /**
   * 停止背景音乐
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause()
      this.currentMusic.currentTime = 0
      this.currentMusic = null
    }
  }

  /**
   * 暂停背景音乐
   */
  pauseMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause()
    }
  }

  /**
   * 恢复背景音乐
   */
  resumeMusic() {
    if (this.currentMusic && this.currentMusic.paused) {
      this.currentMusic.play().catch(() => {})
    }
  }

  /**
   * 设置音效音量
   */
  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    const buttonSound = this.sounds.get(SoundType.BUTTON_CLICK)
    const correctSound = this.sounds.get(SoundType.CORRECT_ANSWER)
    if (buttonSound) {
      buttonSound.volume = this.sfxVolume
    }
    if (correctSound) {
      correctSound.volume = this.sfxVolume
    }
    this.saveSettings()
  }

  /**
   * 设置音乐音量
   */
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    const music = this.sounds.get(SoundType.MENU_MUSIC)
    if (music) {
      music.volume = this.musicVolume
    }
    this.saveSettings()
  }

  /**
   * 获取当前状态
   */
  getState() {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isPlayingMusic: !!(this.currentMusic && !this.currentMusic.paused)
    }
  }
}

// 创建单例实例
export const audioService = new AudioService()