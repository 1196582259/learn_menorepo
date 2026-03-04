<template>
  <div class="layout-holy-grail">
    <div class="header holy-grail-header flex flex-between">
      <h1>Holy Grail Layout</h1>
      <slot name="layout-changer"></slot>
    </div>
    <div class="content holy-grail-content">
      <slot></slot>
    </div>
    <div class="footer holy-grail-footer">
      <p>Footer</p>
    </div>
  </div>
</template>
<style scoped>
.layout-holy-grail {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.holy-grail-header {
  background-color: #f5f5f5;
  padding: 20px;
}
.holy-grail-content {
  flex: 1;
  padding: 20px;
}
.holy-grail-footer {
  background-color: #f5f5f5;
  padding: 20px;
}
</style>
