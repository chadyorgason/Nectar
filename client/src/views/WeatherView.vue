<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';

  // Using ref for reactivity in Composition API
  const states = ref<{ [key: string]: string }>({});
  const stateCoordinates = ref<{ [key: string]: { lat: number; lon: number } }>({});
  const periods = ref<any[]>([]);
  const forecastChecked = ref<boolean>(false);

  const router = useRouter();

  // Fetch countries from the JSON file
  const fetchStates = async () => {
    try {
      const response = await axios.get('/states.json');
      states.value = response.data;
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  // Fetch countries from the JSON file
  const fetchStateCoordinates = async () => {
    try {
      const response = await axios.get('/stateCoordinates.json');
      stateCoordinates.value = response.data;
    } catch (error) {
      console.error('Error fetching state coordinates:', error);
    }
  };

  // https://api.weather.gov/points/39.7456,-97.0892
  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(`https://api.weather.gov/points/${stateCoordinates.value[stateWeather.value.state].lat},${stateCoordinates.value[stateWeather.value.state].lon}`, {
          headers: {
              'Content-Type': 'application/json',
              'accept': '*/*'
          },
        });
      console.log('Weather for: ', response.data.properties.relativeLocation.properties.state)
      console.log('Weather json:', response)
      const weatherAPI = response.data.properties.forecast
      const response2 = await axios.get(`${weatherAPI}`, {
          headers: {
              'Content-Type': 'application/json',
              'accept': '*/*'
          },
        });

      periods.value = response2.data.properties.periods;  // Adjust based on your response structure
      
      forecastChecked.value = true;  // Mark that data has been fetched
      console.log(`${states.value[stateWeather.value.state]} forecast fetched:`, response2.data.properties.periods);
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
    }
  }

  // Check the session variable when the page loads
  onMounted(() => {
    fetchStates();
    fetchStateCoordinates();
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

  // Store the selected state
  const stateWeather = ref({
    state: "UT",
  });
</script>

<template>
  <!-- Weather Forecast Section -->
  <div class="background-container">
    <h3>Weather Forecast:</h3>
    <div class="left">
      <button @click="fetchWeatherData">Get Weather Data For: {{ stateWeather.state }}</button>
      <div class="column">
        <label for="state">Choose a state:</label>
        <select v-model="stateWeather.state" id="state" required>
          <option value="" disabled>Select a state</option>
          <option v-for="(name, code) in states" :key="code" :value="code">
            {{ name }} ({{ code }})
          </option>
        </select>
      </div>
    </div>
    <div>
      <div v-if="periods.length > 0">
        <!-- Flex Container for Weather Forecast -->
        <div class="forecast-grid">
          <div v-for="(period, index) in periods.slice(0, 10)" :key="index" class="forecast-item">
            <div class="day">
              <strong>{{ period.name }}</strong>
            </div>
            <div>
              <img :src="period.icon" :alt="period.name" />
            </div>
            <div>
              <p :style="{ color: period.isDaytime ? '#FF4500' : '#53A2E8' }">
                {{ period.isDaytime ? 'High' : 'Low' }}: {{ period.temperature }}&deg;{{ period.temperatureUnit }}
              </p>
            </div>
            <div>
              <em>{{ period.shortForecast }}</em>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else>
        <p v-if="periods.length === 0 && forecastChecked">No weather forecast available.</p>
      </div>
    </div>
  </div>
</template>


<style scoped>
  .background-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 85vh;
    background-color: #333; /* Darker gray background */
    width: 78%;
  }
  /* Flex Grid for Weather Forecast */
  .forecast-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr); /* 7 equal-width columns */
    grid-template-rows: repeat(2, auto);  /* 2 rows with automatic height based on content */
    gap: 16px; /* Space between the items */
    padding: 10px;
  }

  .forecast-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 2px solid #444;
    padding: 10px;
    border-radius: 20px;
    background-color: #3C3C3C;
  }

  .forecast-item img {
    width: 190px;
    height: 190px;
    object-fit: cover;
    border-radius: 20px;
  }

  button {
    margin-right: 20px;
    margin-left: 20px;
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

  .day {
    padding: 15px;
  }

  .left {
    align-self: flex-start;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    margin-bottom: 20px;
  }

  .left select {
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border: 1px solid #ddd;
  }

  .column {
    font-size: 12px;
  }

  @media (max-width: 1450px) {
    .forecast-item img {
      width: 170px;
      height: 170px;
    }
  }

  @media (max-width: 1315px) {
    .forecast-item img {
      width: 140px;
      height: 140px;
    }
  }

  @media (max-width: 1160px) {
    .forecast-item img {
      width: 120px;
      height: 120px;
    }
  }
</style>