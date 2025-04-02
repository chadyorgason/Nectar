<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav v-if="$route.path !== '/login' && $route.path !== '/signup'">
    <img alt="Vue logo" class="logo" src="@/assets/nectarhr.png" width="128" height="31" />
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/login">Logout</RouterLink>
  </nav>
  <header>
  </header>

  <RouterView />
</template>

<style scoped>

</style>
