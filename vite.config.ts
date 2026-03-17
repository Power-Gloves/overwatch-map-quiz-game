import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
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
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue'],
          'audio-vendor': ['gsap'],
          'ui-components': [
            './src/component/VueBitsProfileCard/VueBitsProfileCardSimple.vue',
            './src/component/ElectricBorder/ElectricBorder.vue'
          ]
        }
      }
    },
    // 资源内联阈值
    assetsInlineLimit: 4096
  }
})