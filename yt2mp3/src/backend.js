const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Define route handler for GET requests to "/<search>"
app.get('/:search', async (req, res) => {
  try {
    const searchTerm = req.params.search;
    const url = `https://www.youtube.com/results?search_query=${searchTerm}`;

    // Send GET request to YouTube search page
    const response = await axios.get(url);
    const htmlContent = response.data;
    const $ = cheerio.load(htmlContent);

    // Locate video links and view counts using Cheerio selectors
    const videoLinks = [];
    const viewCounts = [];

    $('a#video-title').each((index, element) => {
      const videoLink = $(element).attr('href');
      const viewCount = $(element).parent().find('span').text();
      videoLinks.push(videoLink);
      viewCounts.push(viewCount);
    });

    // Find the index of the video with the highest view count
    const maxViewCountIndex = viewCounts.findIndex((count) => count === Math.max(...viewCounts));
    const maxViewCountLink = `https://www.youtube.com${videoLinks[maxViewCountIndex]}`;


    // After finding link for video, send it to 
    const options = {
        method: 'GET',
        url: maxViewCountIndex,
        params: {id: 'UxxajLWwzqY'},
        headers: {
          'X-RapidAPI-Key': '1c33969475msh9155c9d298c9068p1c16d7jsn0d7c8c89b4ac',
          'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
        }
      };
      
    response = await axios.request(options);
    console.log(response.data);

    res.set('Content-Disposition', 'attachment; filename="audio.mp3"');
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.data);

  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
