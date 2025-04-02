<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  // Check the session variable when the page loads
  onMounted(() => {
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

  // Using ref for reactivity in Composition API
  const healthStatus = ref<string | null>(null); 
  const users = ref<any[]>([]);
  const userById = ref<any>(null);  // Store the user fetched by ID
  const userId = ref<number | null>(null);  // User ID input for searching
  const selectedUser = ref<any>(null);  // Store the user selected for update
  const position = ref<string>('');
  const organization = ref<string>('');
  const usersInOrg = ref<any[]>([]);  // Store users list

  // User input form data for creating new users
  const newUser = ref({
    first_name: '',
    last_name: '',
    position: '',
    organization: '',
    email: '',
    active: true
  });

  // User input form data for updating a user
  const updateUser = ref({
    first_name: '',
    last_name: '',
    position: '',
    email: '',
    active: true
  });

  // Define the method to call the API
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
  <div class="greetings">
    <h1 class="green">You Did it! Wow!</h1>
    <h3>
      You’ve successfully launched the skeleton application
    </h3>
  </div>

  <!-- Health Status Section -->
  <div>
    <button @click="getHealthStatus">Get Health Status</button>
    <div v-if="healthStatus">
      <p>API Health Status: {{ healthStatus }}</p>
    </div>
  </div>

  <!-- User List Section -->
  <div>
    <button @click="getAllUsers">Get All Users</button>
    <div v-if="users.length > 0">
      <h3>Users:</h3>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
          <button @click="selectUserForUpdate(user)">Update</button>
          <!-- Delete button -->
          <button @click.stop="deleteUser(user.id)">Delete</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No users found.</p>
    </div>
  </div>

  <div>
    <h3>Get Users by Position and Organization</h3>
    
    <!-- Input fields for position and organization -->
    <input v-model="position" type="text" placeholder="Enter Position" />
    <input v-model="organization" type="text" placeholder="Enter Organization" />
    
    <!-- Button to fetch users -->
    <button @click="getUsersByPositionAndOrganization">Get Users</button>

    <!-- Displaying the list of users -->
    <div v-if="usersInOrg.length > 0">
      <h3>Users:</h3>
      <ul>
        <li v-for="user in usersInOrg" :key="user.id">
          {{ user.first_name }} {{ user.last_name }} ({{ user.email }}) - Position: {{ user.position }} - Organization: {{ user.organization }}
        </li>
      </ul>
    </div>

    <!-- Message when no users are found -->
    <div v-else>
      <p v-if="users.length === 0 && position && organization">No users found for the given position and organization.</p>
    </div>
  </div>

  <!-- Get User by ID Section -->
  <div>
    <h3>Get User by ID</h3>
    <input v-model="userId" type="number" placeholder="Enter User ID" />
    <button @click="getUserById">Get User</button>
    <div v-if="userById">
      <h3>User Info:</h3>
      <p><strong>Name:</strong> {{ userById.first_name }} {{ userById.last_name }}</p>
      <p><strong>Position:</strong> {{ userById.position }}</p>
      <p><strong>Email:</strong> {{ userById.email }}</p>
      <p><strong>Status:</strong> {{ userById.active ? 'Active' : 'Inactive' }}</p>
    </div>
    <div v-else>
      <p v-if="userId">User not found or ID not provided.</p>
    </div>
  </div>

  <!-- Update User Section -->
  <div v-if="selectedUser">
    <h3>Update User</h3>
    <form @submit.prevent="updateUserDetails">
      <div>
        <label for="update_first_name">First Name</label>
        <input v-model="updateUser.first_name" type="text" id="update_first_name" required />
      </div>
      <div>
        <label for="update_last_name">Last Name</label>
        <input v-model="updateUser.last_name" type="text" id="update_last_name" required />
      </div>
      <div>
        <label for="update_position">Position</label>
        <input v-model="updateUser.position" type="text" id="update_position" required />
      </div>
      <div>
        <label for="update_email">Email</label>
        <input v-model="updateUser.email" type="email" id="update_email" required />
      </div>
      <div>
        <label for="update_active">Active</label>
        <input v-model="updateUser.active" type="checkbox" id="update_active" />
      </div>
      <button type="submit">Update User</button>
    </form>
  </div>
</template>
