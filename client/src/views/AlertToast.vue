<script setup lang="ts">
  defineProps({
    message: String
  });
</script>

<template>
  <div class="custom-tag">
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
  p {
    color: black;
  }
  .custom-tag {
    padding: 10px;
    margin: 15px;
    background-color: #f5b8c2;
    border-radius: 20px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding-left: 20px;
    padding-right: 20px
  }
</style>