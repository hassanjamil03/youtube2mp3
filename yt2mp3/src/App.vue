<template>
  <div class="container">
    <h1>API Search</h1>
    <div class="search-container">
      <input v-model="searchTerm" type="text" placeholder="Enter your search term" />
      <button @click="search">Search</button>
    </div>
    <div class="results" v-if="searchResults">
      <h2>Search Results</h2>
      <ul>
        <li v-for="result in searchResults" :key="result.id">
          {{ result.title }}
          <button @click="download(result.id)">Download</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      searchTerm: '',
      searchResults: null,
    };
  },
  methods: {
    async search() {
      try {
        const response = await axios.get(`/${this.searchTerm}`);
        this.searchResults = response.data.results;
      } catch (error) {
        console.error('Error searching:', error);
        // Handle error
      }
    },
    async download(id) {
      try {
        const response = await axios.get(`/${id}`, {
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'audio.mp3');
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error('Error downloading:', error);
        // Handle error
      }
    },
  },
};
</script>