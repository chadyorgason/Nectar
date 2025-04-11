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
  const duplicateCount = ref<number>(1);  // User ID input for searching
  const selectedUser = ref<any>(null);  // Store the user selected for update
  const position = ref<string>('');
  const organization = ref<string>('');
  const country = ref<string>('');
  const usersInOrg = ref<any[]>([]);
  const usersInCountry = ref<any[]>([]);
  const countryChecked = ref<boolean>(false);
  const duplicatesChecked = ref<boolean>(false);
  const usersChecked = ref<boolean>(false);
  const positionChecked = ref<boolean>(false);
  const duplicates = ref<any[]>([]);
  const countries = ref<{ [key: string]: string }>({});

  // State to show/hide alert
  const showAlert = ref(false);
  const alertMessage = ref("");
  const alertType = ref("success");

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
    const thisUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    if ( thisUser ) {
      organization.value = thisUser.organization || '';
    }
  });

  // User input form data for updating a user
  const updateUser = ref({
    first_name: '',
    last_name: '',
    position: '',
    country: '',
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
      usersChecked.value = true;
      console.log('Users fetched:', response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Get all duplicate names
  const getAllDuplicates = async (duplicateCount = 1) => {
    console.log('here')
    try {
      const response = await axios.get('http://localhost:3001/api/duplicates', {
        params: {
          count: duplicateCount,
        },
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
      });
      console.log(response.data)
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
      positionChecked.value = true;
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
      country: user.country,
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

      // Show alert if there is an error
      alertMessage.value = response?.data.message;
      alertType.value = 'success';
      showAlert.value = true;

      // Optionally, hide the alert after a few seconds
      setTimeout(() => {
        showAlert.value = false;
        alertType.value = 'success';
      }, 5000);
      
      // Fetch all users again after the update
      await getAllUsers();
      selectedUser.value = null; // Clear selected user
      updateUser.value = {
        first_name: '',
        last_name: '',
        position: '',
        country: '',
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
      const response = await axios.delete(`http://localhost:3001/api/users/${userId}`, {
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
      });
      console.log('User deleted');
      console.log(response);

      // Show alert if there is an error
      alertMessage.value = response?.data.message;
      alertType.value = 'success';
      showAlert.value = true;

      // Optionally, hide the alert after a few seconds
      setTimeout(() => {
        showAlert.value = false;
        alertType.value = 'success';
      }, 5000);
      // Refresh the list of users after deletion
      await getAllUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
</script>

<template>

  <transition name="slide-toast">
    <AlertToast v-if="showAlert" :message="alertMessage" :alertType="alertType" />
  </transition>

  <div class="background-container">
    <div class="center">
      <h1 class="green">Manage Users</h1>
      <h3>
        See information about users in your organization.
      </h3>
    </div>

    <!-- Health Status Section
    <div>
      <button @click="getHealthStatus">Get Health Status</button>
      <div v-if="healthStatus">
        <p>API Health Status: {{ healthStatus }}</p>
      </div>
    </div> -->

    <!-- All Users Section -->
    <div v-if="!selectedUser" class="card">
      <h3>All Users</h3>
      <button @click="getAllUsers">Get All Users</button>

      <div v-if="users.length > 0">
        <table border="1" cellspacing="0" cellpadding="8">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.first_name }}</td>
              <td>{{ user.last_name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <button @click="selectUserForUpdate(user)" class="upbutton">Update</button>
                <button @click.stop="deleteUser(user.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="users.length === 0 && usersChecked">
        <p>No users found.</p>
      </div>

      <a v-if="usersChecked" @click="() => { users = []; usersChecked = false; }">
        Hide Results
      </a>

    </div>

    <!-- Update User Section -->
    <div v-if="selectedUser" class="card update">
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
          <select v-model="updateUser.position" id="update_position" class="position" required>
            <option value="" disabled>Select a position</option>
            <option value="User">User</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        <div>
          <label for="country">Country</label>
          <select v-model="updateUser.country" id="country" required>
            <option value="" disabled>Select a country</option>
            <option v-for="(name, code) in countries" :key="code" :value="code">
              {{ name }} ({{ code }})
            </option>
          </select>
        </div>
        <div>
          <label for="update_email">Email</label>
          <input v-model="updateUser.email" type="email" id="update_email" required />
        </div>
        <div class="active">
          <label for="update_active">Active</label>
          <input v-model="updateUser.active" type="checkbox" id="update_active" class="checkbox" />
        </div>
        <button @click="() => { selectedUser = null; }" class="cancel">Cancel</button>
        <button type="submit">Update User</button>
      </form>
    </div>

    <!-- Get Users by Country -->
    <div class="card">
      <h3>Get Users by Country</h3>
      
      <!-- Input field for country -->
      <!-- <label for="country">Country</label> -->
      <select v-model="country" id="country" required>
        <option value="" disabled>Select a country</option>
        <option v-for="(name, code) in countries" :key="code" :value="code">
          {{ name }} ({{ code }})
        </option>
      </select>
      
      <!-- Button to fetch users -->
      <button @click="getUsersByCountry">Get Users</button>

      <!-- Displaying the list of users -->
      <div v-if="usersInCountry.length > 0">
        <table border="1" cellspacing="0" cellpadding="8">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Country</th>
              <th>Email</th>
              <th>Position</th>
              <th>Organization</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usersInCountry" :key="user.id">
              <td>{{ user.first_name }}</td>
              <td>{{ user.last_name }}</td>
              <td>{{ countries[user.country] }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.position }}</td>
              <td>{{ user.organization }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Message when no users are found -->
      <div v-else>
        <p v-if="usersInCountry.length === 0 && countryChecked">
          No users found for the given country.
        </p>
      </div>

      <a v-if="countryChecked" @click="() => { usersInCountry = []; countryChecked = false; }">
        Hide Results
      </a>

    </div>

    <!-- Duplicate User List Section -->
    <div class="card duplicate">
      <h3>Duplicate Names</h3>

      <label for="duplicate_count">Duplicate Count</label>
      <input v-model="duplicateCount" type="number" placeholder="Enter Duplicate Count" id="duplicate_count" />
      <button @click="getAllDuplicates(duplicateCount)">Get All Duplicate Names</button>
      <div v-if="duplicates.length > 0">
        <table border="1" cellspacing="0" cellpadding="8">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Duplicate Count</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(duplicate, index) in duplicates" :key="index">
              <td>{{ duplicate.first_name }}</td>
              <td>{{ duplicate.last_name }}</td>
              <td>{{ duplicate._count.id }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else>
        <p v-if="duplicates.length === 0 && duplicatesChecked">No duplicate names found.</p>
      </div>

      <a v-if="duplicatesChecked" @click="() => { duplicates = []; duplicatesChecked = false; }">
        Hide Results
      </a>

    </div>

    <!-- Get User by ID Section -->
    <!-- <div>
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
    </div> -->

    <!-- Users By Position -->
    <div class="card">
      <h3>Users By Position</h3>
      <h5>(In your organization)</h5>
      
      <!-- Select field for position -->
      <div>
        <select v-model="position" id="position" required>
          <option value="" disabled>Select a position</option>
          <option value="User">User</option>
          <option value="Manager">Manager</option>
          <option value="All">All</option>
        </select>
      </div>
      
      <!-- Button to fetch users -->
      <button @click="getUsersByPositionAndOrganization">Get Users</button>

      <!-- Displaying the table of users -->
      <div v-if="usersInOrg.length > 0">
        <table border="1" cellspacing="0" cellpadding="8">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Position</th>
              <th>Organization</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usersInOrg" :key="user.id">
              <td>{{ user.first_name }}</td>
              <td>{{ user.last_name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.position }}</td>
              <td>{{ user.organization }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Message when no users are found -->
      <div v-else>
        <p v-if="usersInOrg.length === 0 && position && organization && positionChecked">
          No users found for the given position.
        </p>
      </div>

      <a v-if="positionChecked" @click="() => { usersInOrg = []; positionChecked = false; }">
        Hide Results
      </a>

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
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 2px solid #444;
    padding: 10px;
    margin: 15px;
    border-radius: 20px;
    background-color: #3C3C3C;
  }
  button {
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid #478FC2;
    color: white;
    background-color: #478FC2;
    cursor: pointer;
  }
  button:hover {
    background-color: rgb(61, 123, 167);
  }
  .upbutton {
    margin-right: 10px;
  }
  .cancel {
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid gray;
    color: white;
    background-color: gray;
    cursor: pointer;
    margin-right: 10px;
  }
  .cancel:hover {
    background-color: #888;
  }
  h3 {
    margin-top: 10px;
  }
  table {
    margin: 10px;
  }
  .card a {
    color: #478FC2;
    text-decoration: none;
    cursor: pointer;
  }
  .card a:hover {
    color: rgb(61, 123, 167);
  }
  select {
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid #ddd;
    margin-bottom: 10px
  }
  h5 {
    margin-bottom: 10px;
    margin-top: -10px;
  }
  .duplicate input {
    width: 95%;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid #ddd;
    margin-bottom: 10px
  }
  .update input {
    width: 95%;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid #ddd;
    margin-bottom: 10px
  }
  .update .position {
    width: 100%;
  }
  .update div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .update .active {
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin-bottom: 20px;
    margin-left: 27%
  }
  .update .active input {
    width: 20%;
    margin-bottom: 5px;
  }
  .checkbox {
    transform: scale(1.5);
    /* margin-left: 10px; */
  }
</style>