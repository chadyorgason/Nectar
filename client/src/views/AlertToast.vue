<script setup lang="ts">
  const props = defineProps<{
    message: string;
    alertType?: 'success' | 'error' | 'info';
  }>();
</script>

<template>
  <div class="custom-tag" :class="props.alertType">
    <p>{{ props.message }}</p>
  </div>
</template>

<style scoped>
  p {
    color: black;
  }

  .custom-tag {
    padding: 10px;
    margin: 15px;
    border-radius: 20px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding-left: 20px;
    padding-right: 20px;
    z-index: 1000;
    background-color: #f5b8c2; /* default */
  }

  /* Success alert (light green) */
  .success {
    background-color: #c1e8c4;
  }
</style>
