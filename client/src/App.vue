<script setup lang="ts">
  import { RouterLink, RouterView, useRouter } from 'vue-router'

  const router = useRouter();

  // Logout function
  const logout = () => {
    // Remove the sessionStorage variable
    sessionStorage.removeItem('sessionVar'); // Replace 'yourKey' with the actual key
    // Redirect to the login page
    router.push('/login')
  };
</script>

<template>
  <div class="backmost">
    <nav v-if="$route.path !== '/login' && $route.path !== '/signup'" class="backdrop">
      <img alt="Vue logo" class="logo" src="@/assets/weather.png" width="230" height="50" />
      <!-- <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/weather">Weather</RouterLink> -->
      <!-- Logout link -->
      <RouterLink to="#" @click.prevent="logout">
        <div class="icon">
          <img alt="Logout icon" class="logo" src="@/assets/logout.png" width="40" height="40" />
        </div>
      </RouterLink>
    </nav>
    <header>
    </header>

    <div :class="$route.path === '/login' || $route.path === '/signup' ? 'column' : 'row'">
      <nav v-if="$route.path !== '/login' && $route.path !== '/signup'" class="backdropside">
        <RouterLink to="/">
          <div class="menubutton">
            <h4>Home</h4>
          </div>
        </RouterLink>
        <RouterLink to="/manage">
          <div class="menubutton">
            <h4>Manage Users</h4>
          </div>
        </RouterLink>
        <RouterLink to="/weather">
          <div class="menubutton">
            <h4>Weather</h4>
          </div>
        </RouterLink>
      </nav>
  
      <RouterView />
    </div>
  </div>
</template>

<style>
  .backmost {
    background-color: #333;
    padding-top: 15px;
    /* padding-bottom: 15px; */
  }
  .backdrop {
    background-color: #444;
    padding: 5px;
    /* padding-right: 15px; */
    padding-left: 15px;
    margin-right: 15px;
    margin-left: 15px;
    margin-bottom: 15px;
    border-radius: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .backdropside {
    background-color: #444;
    padding: 15px;
    margin-right: 15px;
    margin-left: 15px;
    margin-bottom: 15px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    max-height: 80vh;
  }
  body {
    font-family:Verdana, Geneva, Tahoma, sans-serif;
    margin: 0px;
    padding: 0px;
    box-sizing: border-box;
    color: white;
    height: 100vh;
  }
  .icon {
    padding: 5px;
    margin: 3px;
    border-radius: 15px;
  }
  .icon:hover {
    background-color: #555;
  }
  .menubutton {
    padding: 5px;
    margin: 3px;
    border-radius: 15px;
    min-width: 200px;
  }
  .menubutton:hover {
    background-color: #555;
  }
  .row {
    display: flex;
    flex-direction: row;
    height: 100vh;
  }
  .column {
    display: flex;
    flex-direction: column;
  }
  h4 {
    padding-left: 20px;
    padding-right: 20px;
    color: white;
    width: 100%;
  }
  a {
    text-decoration: none;
  }
  .slide-toast-enter-active,
  .slide-toast-leave-active {
    transition: all 0.4s ease;
  }

  .slide-toast-enter-from {
    transform: translateY(-100%);
    opacity: 0;
  }

  .slide-toast-enter-to {
    transform: translateY(0);
    opacity: 1;
  }

  .slide-toast-leave-from {
    transform: translateY(0);
    opacity: 1;
  }

  .slide-toast-leave-to {
    transform: translateY(-100%);
    opacity: 0;
  }
</style>
