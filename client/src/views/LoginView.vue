<script setup lang="ts">
  import { ref } from 'vue';
  import axios, {AxiosError} from 'axios';
  import { useRouter } from 'vue-router';
  import AlertToast from './AlertToast.vue'

  // User input form data for creating new users
  const newUser = ref({
    username: '',
    password: ''
  });

  const router = useRouter();

  // State to show/hide alert
  const showAlert = ref(false);
  const alertMessage = ref("");

  // Create a new user
  const createUser = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/login', newUser.value, {
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });
      console.log('User login:', response.data);

      sessionStorage.setItem('sessionVar', response.data.username);
      sessionStorage.setItem('user', JSON.stringify(response.data));

      newUser.value = {
        username: '',
        password: ''
      };

      // Navigate to the home page after success
      router.push('/');
    } catch (error) {
      // Cast the error to AxiosError
      if (error instanceof AxiosError) {
        console.error('Error logging in user:', error);

        // Show alert if there is an error
        alertMessage.value = error.response?.data.error || "An error occurred"; // Handle possible undefined
        showAlert.value = true;

        // Optionally, hide the alert after a few seconds
        setTimeout(() => {
          showAlert.value = false;
        }, 5000);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  };

</script>

<template>

  <AlertToast v-if="showAlert" :message="alertMessage" />

  <!-- Create User Section -->
  <div class="login-container">
    <div class="login-box">
      <h3>Login</h3>
      <form @submit.prevent="createUser">
        <div>
          <label for="username">Username</label>
          <input v-model="newUser.username" type="text" id="username" placeholder="Username" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input v-model="newUser.password" type="password" id="password" placeholder="Password" required />
        </div>
        <button type="submit">Log in</button>
      </form>
      <div>
        <p>Don't have an account? <router-link to="/signup">Sign up</router-link></p>
      </div>
    </div>
  </div>

</template>


<style scoped>
  /* Center the container */
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh; /* Full viewport height */
    background-color: #333; /* Darker gray background */
  }

  /* Login box styling */
  .login-box {
    background-color: #444; /* Dark gray background for the box */
    padding: 30px;
    border-radius: 20px; /* Rounded corners */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    width: 300px; /* Fixed width */
    color: white; /* Text color */
    border: 2px solid #555;
  }

  .login-box h3 {
    margin-bottom: 20px;
    text-align: center;
  }

  .login-box div {
    margin-bottom: 15px;
  }

  .login-box label {
    display: block;
    font-size: 14px;
  }

  .login-box p {
    display: block;
    font-size: 14px;
  }

  .login-box input {
    width: 92.5%;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid #ddd;
  }

  .login-box button {
    width: 100%;
    padding: 10px;
    background-color: #478FC2;
    color: white;
    font-size: 16px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }

  .login-box button:hover {
    background-color: rgb(61, 123, 167);
  }

  .login-box div a {
    color: #478FC2;
    text-decoration: none;
  }

  .login-box div a:hover {
    text-decoration: underline;
  }
</style>