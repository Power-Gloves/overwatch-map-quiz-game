<template>
  <view class="container">
    <!-- 这里直接引用App.vue的内容，或者重定向到App.vue -->
    <App />
  </view>
</template>

<script setup lang="ts">
import App from '../../App.vue'
</script>

<style>
.container {
  width: 100%;
  height: 100vh;
}
</style>