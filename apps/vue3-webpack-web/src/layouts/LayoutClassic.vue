<!-- 三栏布局 -->
<template>
  <div class="layout-classic">
    <div class="header classic-header flex flex-between">
      <h1>Classic Layout</h1>
      <slot name="layout-changer"></slot>
    </div>
    <div class="container classic-container flex flex-between">
      <div class="content classic-content">
        <slot></slot>
      </div>
      <div class="sidebar classic-sidebar-left">
        <slot name="sidebar-left"></slot>
      </div>

      <div class="sidebar classic-sidebar-right">
        <slot name="sidebar-right"></slot>
      </div>
    </div>
    <div class="footer classic-footer">
      <p>Footer</p>
    </div>
  </div>
</template>

<style scoped>
.layout-classic {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.classic-header {
  background-color: #f5f5f5;
  padding: 20px;
  flex-shrink: 0;
}
.classic-content {
  flex: 1;
  padding: 20px;
  order: 2;
  /* overflow-y: auto; */
  max-height: 100%;
  overflow: hidden;
}
.classic-footer {
  background-color: #f5f5f5;
  padding: 20px;
  flex-shrink: 0;
}
.container {
  flex: 1;
  display: flex;
  overflow: hidden;
  align-items: flex-start;
}
.sidebar {
  flex-shrink: 0;
}
</style>
<script setup></script>
