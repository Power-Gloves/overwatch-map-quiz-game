import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/overwatch-map-quiz-game/', // GitHub Pages 路径
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./uni.scss";`
      }
    }
  },
  server: {
    port: 8080,
    host: true
  },
  build: {
    // 生产环境优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除console.log
        drop_debugger: true // 移除debugger
      }
    },
    // 简化代码分割，避免构建错误
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue']
        }
      }
    },
    // 资源内联阈值
    assetsInlineLimit: 4096,
    // 确保构建成功
    emptyOutDir: true
  }
})