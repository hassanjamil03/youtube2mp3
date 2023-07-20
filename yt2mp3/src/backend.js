const express = require('express');
const axios = require('axios');
const cors = require('cors');
const puppeteer = require('puppeteer')

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Define route handler for GET requests to "/<search>"
app.get('/search', async (req, res) => {
  try {
    var videoLink = ''
    console.log(req.query["l"]);
    
    if (req.query["l"]) {
      console.log('link nonempty');
      videoLink = req.query["l"]
    } else {
      console.log('link empty');
      const searchTerm = req.query["q"];
      const url = `https://www.youtube.com/results?search_query=${searchTerm}`;
      videoLink = await getVideo(url)
    }

    console.log(videoLink);

    const options = {
      method: 'GET',
      url: 'https://youtube-mp36.p.rapidapi.com/dl',
      params: {id: extractVideoId(videoLink)},
      headers: {
        'X-RapidAPI-Key': '1c33969475msh9155c9d298c9068p1c16d7jsn0d7c8c89b4ac',
        'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
      }
    };
    
    const response = await axios.request(options);
    console.log(response.data);
    
    res.send({ 'STATE' : 'SUCCESS',
                'link' : response.data })

  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



function extractVideoId(url) {
  const videoUrl = new URL(url);
  const searchParams = new URLSearchParams(videoUrl.search);
  const videoId = searchParams.get('v');
  
  if (videoId) {
    return videoId;
  } else {
    console.error('Invalid YouTube URL');
    return null;
  }
}

async function getVideo(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector('#contents');

  const videos = await page.evaluate(() => {
    const videoElements = Array.from(document.querySelectorAll('#contents ytd-video-renderer'));
    
    return Promise.all(videoElements.map(async (element) => {
      const vidLinkElement = element.querySelector('#thumbnail');
      const vidLink = vidLinkElement ? vidLinkElement.href : '';

      const response = await fetch(vidLink);
      const html = await response.text();
      const rawViewCount = html?.split('viewCount":"')?.[1]?.split('"')?.[0];
      const viewCount = rawViewCount ? parseInt(rawViewCount) : ""
      
      return { vidLink, viewCount };
    }));
  });

  console.log('in getVideo, url:'+url);

  var finalVidLink = "";
  var finalVidViewCount = 0

  videos.forEach((obj) => {
    if (obj.viewCount > finalVidViewCount) {
      finalVidLink = obj.vidLink
      finalVidViewCount = obj.viewCount
    }
  })

  return finalVidLink
}