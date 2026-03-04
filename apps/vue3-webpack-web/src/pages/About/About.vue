<template>
  <div class="container">
    <Switch />
    <div>
      <div style="float: left">2123</div>
      <div style="float: left">456</div>
    </div>
    <div style="float: left; height: 100px; width: 100px; background-color: red"></div>
    <div style="height: 100px; width: 100px; background-color: green; overflow: hidden"></div>
    <!-- <div style="float: left; height: 100px; width: 100px; background-color: blue"></div> -->
    <div
      style="
        position: sticky;
        top: 0;
        height: 100px;
        width: 100px;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      "
    >
      <div style="mix-blend-mode: overlay; color: white">哈哈哈</div>
    </div>
    <div style="float: left; height: 100px; width: 100px; background-color: yellow"></div>
    <div style="height: 1600px; width: 100px; background-color: blue"></div>
  </div>
</template>

<script setup lang="ts">
import Switch from '@/components/Switch/index.vue'

import { ref } from 'vue'

const count = ref(0)
</script>

<style scoped>
.container {
  display: grid;
  justify-content: center; /* 水平居中 */
  align-content: center; /* 垂直居中 */
}
</style>
