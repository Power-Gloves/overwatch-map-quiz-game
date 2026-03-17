// Vitest 测试环境设置
import { vi } from 'vitest'

// Mock uni-app APIs
// 全局类型声明
declare global {
  var uni: any
}

global.uni = {
  getStorageSync: vi.fn(),
  setStorageSync: vi.fn(),
  removeStorageSync: vi.fn(),
  clearStorageSync: vi.fn(),
  showToast: vi.fn(),
  showModal: vi.fn(),
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
  switchTab: vi.fn(),
  reLaunch: vi.fn(),
  navigateBack: vi.fn()
} as any