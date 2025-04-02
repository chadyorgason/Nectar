<script setup lang="ts">
  import { ref } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';

  // User input form data for creating new users
  const newUser = ref({
    first_name: '',
    last_name: '',
    position: '',
    organization: '',
    username: '',
    password: '',
    email: '',
    active: true
  });

  const router = useRouter();

  // Create a new user
  const createUser = async () => {
    
    try {
      const response = await axios.post('http://localhost:3001/api/users', newUser.value, {
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });
      console.log('User created:', response.data);

      sessionStorage.setItem('sessionVar', newUser.value.first_name);

      newUser.value = {
        first_name: '',
        last_name: '',
        position: '',
        organization: '',
        username: '',
        password: '',
        email: '',
        active: true
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
    <h3>Sign up</h3>
    <form @submit.prevent="createUser">
      <div>
        <label for="first_name">First Name</label>
        <input v-model="newUser.first_name" type="text" id="first_name" placeholder="First Name" required />
      </div>
      <div>
        <label for="last_name">Last Name</label>
        <input v-model="newUser.last_name" type="text" id="last_name" placeholder="Last Name" required />
      </div>
      <div>
        <label for="last_name">Position</label>
        <input v-model="newUser.position" type="text" id="position" placeholder="Position" required />
      </div>
      <div>
        <label for="last_name">Organization</label>
        <input v-model="newUser.organization" type="text" id="organization" placeholder="Organization" required />
      </div>
      <div>
        <label for="email">Email</label>
        <input v-model="newUser.email" type="email" id="email" placeholder="Email" required />
      </div>
      <div>
        <label for="username">Username</label>
        <input v-model="newUser.username" type="text" id="username" placeholder="Username" required />
      </div>
      <div>
        <label for="last_name">Password</label>
        <input v-model="newUser.password" type="text" id="password" placeholder="Password" required />
      </div>
      <div>
        <label for="active">Active</label>
        <input v-model="newUser.active" type="checkbox" id="active" />
      </div>
      <button type="submit">Sign up</button>
    </form>
    <div>
      Already have an account? <router-link to="/login">Login</router-link>
    </div>
  </div>

</template>
