/**
 * 游戏音效管理服务 - 支持移动端音频池
 */

export enum SoundType {
  BUTTON_CLICK = 'button-click',
  MENU_MUSIC = 'menu-music',
  CORRECT_ANSWER = 'correct-answer'
}

class AudioService {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map()
  /** 音效池：每种音效维护多个Audio实例，解决移动端重复播放问题 */
  private sfxPool: Map<SoundType, HTMLAudioElement[]> = new Map()
  private sfxPoolIndex: Map<SoundType, number> = new Map()
  private readonly POOL_SIZE = 3
  private musicVolume: number = 0.7
  private sfxVolume: number = 0.8
  private currentMusic: HTMLAudioElement | null = null
  private isInitialized: boolean = false
  private lastPlayTime: Map<SoundType, number> = new Map()
  private readonly DEBOUNCE_TIME = 100 // 降低防抖，避免快速答题丢音效

  constructor() {
    this.loadSettings()
    this.preloadSounds()
    this.initUserInteraction()
  }

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
   * 初始化用户交互（移动端必须在用户操作后才能播放音频）
   */
  private initUserInteraction() {
    const initAudio = () => {
      if (this.isInitialized) return
      
      // 初始化主音频实例
      this.sounds.forEach((audio, soundType) => {
        const targetVolume = soundType === SoundType.MENU_MUSIC ? this.musicVolume : this.sfxVolume
        audio.volume = 0
        audio.play().then(() => {
          audio.pause()
          audio.currentTime = 0
          audio.volume = targetVolume
        }).catch(() => {
          audio.volume = targetVolume
        })
      })

      // 初始化音效池中的所有实例
      this.sfxPool.forEach((pool) => {
        pool.forEach(audio => {
          audio.volume = 0
          audio.play().then(() => {
            audio.pause()
            audio.currentTime = 0
            audio.volume = this.sfxVolume
          }).catch(() => {
            audio.volume = this.sfxVolume
          })
        })
      })
      
      this.isInitialized = true
    }

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
        
        // 为音效类型创建音频池（多个实例轮换播放）
        const pool: HTMLAudioElement[] = []
        for (let i = 0; i < this.POOL_SIZE; i++) {
          const poolAudio = new Audio()
          poolAudio.preload = 'auto'
          poolAudio.src = path
          poolAudio.volume = this.sfxVolume
          pool.push(poolAudio)
        }
        this.sfxPool.set(type as SoundType, pool)
        this.sfxPoolIndex.set(type as SoundType, 0)
      }

      this.sounds.set(type as SoundType, audio)
    })
  }

  /**
   * 强制初始化音频系统
   */
  public forceInitialize(): void {
    if (this.isInitialized) return
    
    this.sounds.forEach((audio, soundType) => {
      const targetVolume = soundType === SoundType.MENU_MUSIC ? this.musicVolume : this.sfxVolume
      audio.volume = 0
      audio.play().then(() => {
        audio.pause()
        audio.currentTime = 0
        audio.volume = targetVolume
      }).catch(() => {
        audio.volume = targetVolume
      })
    })

    this.sfxPool.forEach((pool) => {
      pool.forEach(audio => {
        audio.volume = 0
        audio.play().then(() => {
          audio.pause()
          audio.currentTime = 0
          audio.volume = this.sfxVolume
        }).catch(() => {
          audio.volume = this.sfxVolume
        })
      })
    })
    
    this.isInitialized = true
  }

  /**
   * 播放音效（使用音频池轮换，解决移动端重复播放问题）
   */
  play(soundType: SoundType) {
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

    // 优先从音频池获取（轮换实例，避免同一个Audio重复play）
    const pool = this.sfxPool.get(soundType)
    if (pool && pool.length > 0) {
      const index = this.sfxPoolIndex.get(soundType) || 0
      const audio = pool[index]
      
      // 轮换到下一个实例
      this.sfxPoolIndex.set(soundType, (index + 1) % pool.length)
      
      try {
        audio.volume = this.sfxVolume
        audio.currentTime = 0
        audio.play().catch(() => {})
      } catch (error) {}
      return
    }

    // 兜底：使用主实例（用于背景音乐等）
    const sound = this.sounds.get(soundType)
    if (!sound) return

    try {
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
      if (this.currentMusic === music && !this.currentMusic.paused) {
        return
      }
      
      if (this.currentMusic === music && this.currentMusic.paused) {
        music.volume = this.musicVolume
        music.play().catch(() => {})
        return
      }
      
      music.currentTime = 0
      music.loop = true
      music.volume = this.musicVolume
      music.play().catch(() => {})
      this.currentMusic = music
    } catch (error) {}
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause()
      this.currentMusic.currentTime = 0
      this.currentMusic = null
    }
  }

  pauseMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause()
    }
  }

  resumeMusic() {
    if (this.currentMusic && this.currentMusic.paused) {
      this.currentMusic.play().catch(() => {})
    }
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    
    // 更新主实例音量
    const buttonSound = this.sounds.get(SoundType.BUTTON_CLICK)
    const correctSound = this.sounds.get(SoundType.CORRECT_ANSWER)
    if (buttonSound) buttonSound.volume = this.sfxVolume
    if (correctSound) correctSound.volume = this.sfxVolume
    
    // 更新音频池音量
    this.sfxPool.forEach((pool) => {
      pool.forEach(audio => {
        audio.volume = this.sfxVolume
      })
    })
    
    this.saveSettings()
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    const music = this.sounds.get(SoundType.MENU_MUSIC)
    if (music) {
      music.volume = this.musicVolume
    }
    this.saveSettings()
  }

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