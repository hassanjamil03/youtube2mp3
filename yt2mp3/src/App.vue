<template>
  <div class="container">
    <h1>Enter songs names seperated by newline. If you would like to provide the youtube link for the song instead, it must start with "https:"</h1>
    <div>
      <textarea v-model="searchTerm">test</textarea>
    </div>
    <button @click="search">Search</button>

    <div v-if="state === 'LOADING'">
      Loading...
    </div>

    <div v-else-if="state === 'SUCCESS'">
      <div class="results" v-if="searchResults">
        <h2>Search Results</h2>
        <ul>
          <li v-for="result in searchResults" :key="result.link">
            {{ result.title }}
            <a :href="result.link" :download="title">
              <button>Download</button>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div v-else-if="state === 'FAIL'">
      Data failed to load
    </div>

    <div v-else>
      No data to display
    </div>
    
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      searchTerm: '',
      searchResults: [],
      state: ''
    };
  },
  methods: {
    async search() {
      this.state = 'LOADING'

      try {
        const searchTerms = this.searchTerm.split('\n')

        await Promise.all(searchTerms.forEach(async (term) => {
          var link = ''
          const match = term.match(/\bhttps:\/\/\S+/g)
          console.log(match);
          if (match) {
            link = match[0]
          }

          var response = await axios.get("http://localhost:3000/search", {
            params: {
              q : term,
              l : link
            }
          });
          console.log(response.data);

          this.searchResults.push({
            'link' : response.data['link']['link'],
            'title' : response.data['link']['title'] + '.mp3'
          })

          this.state = response.data['STATE']
        }))
        
        
      } catch (error) {
        this.state = 'FAIL'
        console.error('Error searching:', error);
        // Handle error
      }
    },
  },
};
</script>