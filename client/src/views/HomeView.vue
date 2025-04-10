<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import AlertToast from './AlertToast.vue';

  // Using ref for reactivity in Composition API
  const healthStatus = ref<string | null>(null);
  const users = ref<any[]>([]);
  const userById = ref<any>(null);  // Store the user fetched by ID
  const userId = ref<number | null>(null);  // User ID input for searching
  const selectedUser = ref<any>(null);  // Store the user selected for update
  const position = ref<string>('');
  const organization = ref<string>('');
  const country = ref<string>('');
  const usersInOrg = ref<any[]>([]);
  const usersInCountry = ref<any[]>([]);
  const countryChecked = ref<boolean>(false);
  const duplicatesChecked = ref<boolean>(false);
  const duplicates = ref<any[]>([]);
  const countries = ref<{ [key: string]: string }>({});

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

  // Check the session variable when the page loads
  onMounted(() => {
    fetchCountries();
    const sessionVar = sessionStorage.getItem('sessionVar');
    if (!sessionVar) {
      // If session variable is not found, navigate to the login page
      console.log('No session variable found. Redirecting to login...');
      router.push('/login'); // Replace with your login route
    } else {
      console.log('Session variable found:', sessionVar);
      // You can also perform other actions here if needed
    }
  });

  // User input form data for updating a user
  const updateUser = ref({
    first_name: '',
    last_name: '',
    position: '',
    email: '',
    active: true
  });

  // Make sure API is working
  const getHealthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/health', {
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });
      healthStatus.value = 'Healthy';
      console.log('Health check response:', response.data);
    } catch (error) {
      healthStatus.value = 'Unhealthy';
      console.error('Error during health check:', error);
    }
  };

  // Get all users from the API
  const getAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users', {
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });
      users.value = response.data;
      console.log('Users fetched:', response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Get all duplicate names
  const getAllDuplicates = async () => {
    console.log('here')
    try {
      const response = await axios.get('http://localhost:3001/api/duplicates', {
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
      });
      duplicates.value = response.data; // Store duplicate data
      duplicatesChecked.value = true;
      console.log('Duplicates fetched:', response.data);
    } catch (error) {
      console.error('Error fetching duplicates:', error);
    }
  };

  // Get a user by ID
  const getUserById = async () => {
    if (!userId.value) {
      console.error("User ID is required");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/api/users/${userId.value}`, {
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });
      userById.value = response.data;
      console.log('User fetched by ID:', response.data);
    } catch (error) {
      userById.value = null;
      console.error('Error fetching user by ID:', error);
    }
  };

  // Define the method to get users with the specified position and organization
  const getUsersByPositionAndOrganization = async () => {
    if (!position.value || !organization.value) {
      console.error("Position and Organization are required");
      return;
    }
    try {
      const response = await axios.get('http://localhost:3001/api/org-users', {
        params: {
          position: position.value,
          organization: organization.value,
        },
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });

      usersInOrg.value = response.data;
      console.log('Users fetched:', response.data);
    } catch (error) {
      users.value = [];
      console.error('Error fetching users by position and organization:', error);
    }
  };

  // Define the method to get users with the specified position and organization
  const getUsersByCountry = async () => {
    if (!country.value) {
      console.error("Country required");
      return;
    }
    try {
      const response = await axios.get('http://localhost:3001/api/country', {
        params: {
          country: country.value,
        },
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });

      usersInCountry.value = response.data;
      countryChecked.value = true;
      console.log('Users fetched:', response.data);
      console.log('Response', response);
    } catch (error) {
      users.value = [];
      console.error('Error fetching users by country:', error);
    }
  };

  // Select a user for updating
  const selectUserForUpdate = (user: any) => {
    selectedUser.value = user;
    updateUser.value = {
      first_name: user.first_name,
      last_name: user.last_name,
      position: user.position,
      email: user.email,
      active: user.active
    };
  };

  // Update user
  const updateUserDetails = async () => {
    if (!selectedUser.value || !selectedUser.value.id) {
      console.error("No user selected to update");
      return;
    }
    try {
      const response = await axios.put(`http://localhost:3001/api/users/${selectedUser.value.id}`, updateUser.value, {
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });
      console.log('User updated:', response.data);
      // Fetch all users again after the update
      await getAllUsers();
      selectedUser.value = null; // Clear selected user
      updateUser.value = {
        first_name: '',
        last_name: '',
        position: '',
        email: '',
        active: true
      };
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Method to delete a user
  const deleteUser = async (userId: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/users/${userId}`, {
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });
      console.log('User deleted');
      // Refresh the list of users after deletion
      await getAllUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
</script>

<template>

  <!-- <AlertToast /> -->

  <div class="background-container">
    <div class="center">
      <h1 class="green">Home</h1>
      <h3>
        Welcome to your weather and management app!
      </h3>
    </div>

    <div class="iframe-container">
      <iframe src="https://lottie.host/embed/82625ec6-bd63-464a-918a-3a5086eec9d0/ltp1mCcyQP.lottie" frameborder="0"></iframe>
    </div>

  </div>
</template>

<style scoped>
  /* Center the container */
  .background-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 90vh; /* Full viewport height */
    background-color: #333; /* Darker gray background */
    width: calc(100% - 250px);
    overflow-y: auto;
    padding-right: 15px;
    padding-bottom: 40px;
  }
  .center {
    width: 100%;
    text-align: center;
  }
  .iframe-container {
      width: 50%;          /* Set the width of the container */
      height: 60vh;        /* Set the height of the container */
      overflow: hidden;    /* Hide the overflowed content */
      position: relative;  /* Necessary for positioning */
      min-width: 433px;
      max-width: 433px;
      border-radius: 20px;
    }

    iframe {
      width: 260%;         /* Increase the width to crop the right side */
      height: 134%;        /* Increase the height to crop the bottom side */
      position: absolute;  /* Ensure iframe fills the container */
      top: -20%;           /* Move up to crop the top */
      left: -75.5%;          /* Move left to crop the left */
    }
</style>