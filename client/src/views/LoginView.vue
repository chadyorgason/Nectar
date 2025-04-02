<script setup lang="ts">
  import { ref } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';

  // User input form data for creating new users
  const newUser = ref({
    username: '',
    password: ''
  });

  const router = useRouter();

  // Create a new user
  const createUser = async () => {
    

    try {
      const response = await axios.post('http://localhost:3001/api/login', newUser.value, {
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });
      console.log('User created:', response.data);

      sessionStorage.setItem('sessionVar', response.data.username);

      newUser.value = {
        username: '',
        password: ''
      };


      // Navigate to the home page after success
      router.push('/');

    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

</script>

<template>

  <!-- Create User Section -->
  <div>
    <h3>Login</h3>
    <form @submit.prevent="createUser">
      <div>
        <label for="username">Username</label>
        <input v-model="newUser.username" type="text" id="username" placeholder="Username" required />
      </div>
      <div>
        <label for="last_name">Password</label>
        <input v-model="newUser.password" type="text" id="password" placeholder="Password" required />
      </div>
      <button type="submit">Log in</button>
    </form>
    <div>
      Don't have an account? <router-link to="/signup">Sign up</router-link>
    </div>
  </div>

</template>
