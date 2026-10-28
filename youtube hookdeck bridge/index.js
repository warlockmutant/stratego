const { google } = require('googleapis');
const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const HOOKDECK_SOURCE_URL = process.env.HOOKDECK_SOURCE_URL;

// FORCE A BROAD SEARCH QUERY FOR TESTING
const SEARCH_QUERY = 'Stratego board game'; 

async function fetchAndPostVideos() {
  const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });
  
  // Look back 30 days instead of 15 minutes to guarantee we find videos for the test
  const publishedAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: SEARCH_QUERY,
      type: 'video',
      order: 'date',
      publishedAfter: publishedAfter,
      maxResults: 3 // Let's just grab the top 3 recent videos
    });

    const items = response.data.items || [];
    console.log(`--- YOUTUBE SEARCH RESULTS ---`);
    console.log(`Found ${items.length} videos for "${SEARCH_QUERY}" since ${publishedAfter}`);
    
    if (items.length === 0) {
      console.log("No videos found. Nothing was sent to Hookdeck.");
    }

    for (const item of items) {
      console.log(`Sending to Hookdeck: ${item.snippet.title}`);
      
      // Fire the webhook payload
      await axios.post(HOOKDECK_SOURCE_URL, {
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle
      });
    }
    console.log(`------------------------------`);
  } catch (error) {
    console.error('Execution failed:', error.message);
    process.exit(1);
  }
}

fetchAndPostVideos();
