<template>
  <div class="switch-container">
    <input type="checkbox" id="switch" class="toggle-input" />
    <label for="switch" class="toggle-switch">
      <span>√</span>
      <span>×</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOn = ref(false)
</script>

<style scoped>
.switch-container {
  display: inline-block;
  position: relative;
  width: 40px;
  height: 20px;
}
.toggle-input {
  display: none;
}
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.toggle-switch::before {
  content: '';
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
  border-radius: 34px;
  transition: all 0.3s ease-in-out;
}
.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: #fff;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
/* 开关打开状态 - 轨道背景色 */
.toggle-input:checked + .toggle-switch::before {
  background-color: #4caf50;
}
/* 开关打开状态 - 滑块位置 */
.toggle-input:checked + .toggle-switch::after {
  left: calc(100% - 16px);
  transform: scale(1.1);
}
/* 禁用状态 */
.toggle-input:disabled + .toggle-switch {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
