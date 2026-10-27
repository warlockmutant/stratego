const { google } = require('googleapis');
const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const HOOKDECK_SOURCE_URL = process.env.HOOKDECK_SOURCE_URL;
const SEARCH_QUERY = process.env.SEARCH_QUERY || 'cat videos'; // Fallback query

async function fetchAndPostVideos() {
  const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });
  
  // Look back 15 minutes (aligns with our GitHub automation schedule)
  const publishedAfter = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: SEARCH_QUERY,
      type: 'video',
      order: 'date',
      publishedAfter: publishedAfter,
      maxResults: 10
    });

    const items = response.data.items || [];
    console.log(`Found ${items.length} new videos since ${publishedAfter}`);
    
    for (const item of items) {
      await axios.post(HOOKDECK_SOURCE_URL, {
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle
      });
      console.log(`Dispatched to Hookdeck: ${item.snippet.title}`);
    }
  } catch (error) {
    console.error('Execution failed:', error.message);
    process.exit(1);
  }
}

fetchAndPostVideos();
