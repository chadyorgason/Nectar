<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios, {AxiosError} from 'axios';
  import { useRouter } from 'vue-router';
  import AlertToast from './AlertToast.vue'

  // User input form data for creating new users
  const newUser = ref({
    first_name: '',
    last_name: '',
    position: '',
    organization: '',
    username: '',
    password: '',
    email: '',
    country: 'US',
    active: true
  });

  // State to show/hide alert
  const showAlert = ref(false);
  const alertMessage = ref("");

  const countries = ref<{ [key: string]: string }>({}); // To hold the country codes and names

  const router = useRouter();

  // Fetch countries from the JSON file
  const fetchCountries = async () => {
    try {
      const response = await axios.get('/countries.json');
      countries.value = response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

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
        country: 'US',
        active: true
      };

      // Navigate to the home page after success
      router.push('/');
    } catch (error) {
      // Cast the error to AxiosError
      if (error instanceof AxiosError) {
        console.error('Error creating user:', error);

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

  // Fetch the countries when the component is mounted
  onMounted(() => {
    fetchCountries();
  });

</script>

<template>

  <transition name="slide-toast">
    <AlertToast v-if="showAlert" :message="alertMessage" />
  </transition>

  <!-- Create User Section -->
  <div class="signup-container">
    <div class="signup-box">
      <h3>Sign up</h3>
      <form @submit.prevent="createUser">
        <div class="grid">
          <div>
            <label for="first_name">First Name</label>
            <input v-model="newUser.first_name" type="text" id="first_name" placeholder="First Name" required />
          </div>
          <div>
            <label for="last_name">Last Name</label>
            <input v-model="newUser.last_name" type="text" id="last_name" placeholder="Last Name" required />
          </div>
          <!-- <div>
            <label for="position">Position</label>
            <input v-model="newUser.position" type="text" id="position" placeholder="Position" required />
          </div> -->
          <div>
            <label for="position">Position</label>
            <select v-model="newUser.position" id="position" required>
              <option value="" disabled>Select a position</option>
              <option value="User">User</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <div>
            <label for="organization">Organization</label>
            <input v-model="newUser.organization" type="text" id="organization" placeholder="Organization" required />
          </div>
          <div>
            <label for="email">Email</label>
            <input v-model="newUser.email" type="email" id="email" placeholder="Email" required />
          </div>
          <div>
            <label for="country">Country</label>
            <select v-model="newUser.country" id="country" required>
              <option value="" disabled>Select a country</option>
              <option v-for="(name, code) in countries" :key="code" :value="code">
                {{ name }} ({{ code }})
              </option>
            </select>
          </div>
        </div>
        <div class="fullinput">
          <label for="username">Username</label>
          <input v-model="newUser.username" type="text" id="username" placeholder="Username" required />
        </div>
        <div class="fullinput">
          <label for="password">Password</label>
          <input v-model="newUser.password" type="password" id="password" placeholder="Password" required />
        </div>
        <div class="checkbox-container">
          <label for="active">Active</label>
          <input v-model="newUser.active" type="checkbox" id="active" class="checkbox" />
        </div>
        <button type="submit">Sign up</button>
      </form>
      <div>
        <p>Already have an account? <router-link to="/login">Login</router-link></p>
      </div>
    </div>
  </div>

</template>

<style scoped>
  /* Center the container */
  .signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh; /* Full viewport height */
    background-color: #333; /* Darker gray background */
  }

  /* Signup box styling */
  .signup-box {
    background-color: #444; /* Dark gray background for the box */
    padding: 30px;
    border-radius: 20px; /* Rounded corners */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    width: 500px; /* Fixed width */
    color: white; /* Text color */
  }

  .signup-box h3 {
    margin-bottom: 20px;
    text-align: center;
  }

  .signup-box div {
    margin-bottom: 15px;
  }

  .signup-box label {
    display: block;
    font-size: 14px;
  }

  .signup-box p {
    display: block;
    font-size: 14px;
  }

  .signup-box .grid {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Two columns */
    column-gap: 15px; /* Space between grid items */
    margin-bottom: 0px;
  }

  .signup-box .grid input {
    width: 90%;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid #ddd;
  }

  .signup-box .grid select {
    width: 99%;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid #ddd;
  }

  .signup-box .fullinput {
    width: 100%;
  }

  .signup-box input {
    width: 95%;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid #ddd;
  }

  .signup-box button {
    width: 100%;
    padding: 10px;
    background-color: #478FC2;
    color: white;
    font-size: 16px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }

  .signup-box button:hover {
    background-color: rgb(61, 123, 167);
  }

  .signup-box div a {
    color: #478FC2;
    text-decoration: none;
  }

  .signup-box div a:hover {
    text-decoration: underline;
  }

  .signup-box form {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .signup-box .checkbox-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin-bottom: 20px;
  }

  .checkbox {
    transform: scale(1.5);
    margin-left: 10px;
  }
</style>
