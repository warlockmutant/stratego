const { google } = require('googleapis');
const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const HOOKDECK_SOURCE_URL = process.env.HOOKDECK_SOURCE_URL;

const SEARCH_QUERY = 'Stratego -trumpster -marketing -zagrajmy -aki'; 

async function fetchAndPostVideos() {
  const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });
  
  // Looking back 30 days for this definitive test
  const publishedAfter = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  try {
    console.log(`Connecting to YouTube API to look for: "${SEARCH_QUERY}"...`);
    
    const response = await youtube.search.list({
      part: 'snippet',
      q: SEARCH_QUERY,
      type: 'video',
      order: 'date',
      publishedAfter: publishedAfter,
      maxResults: 10
    });

    const items = response.data.items || [];
    console.log(`Successfully found ${items.length} total videos matching your terms.`);
    
    for (const item of items) {
      const realVideoId = item.id.videoId;
      
      // Explicitly combining the exact text strings with their correct forward slashes
      const cleanEmbedUrl = "https://youtube.com/embed/" + realVideoId;
      
      console.log("Forwarding clean payload for: " + cleanEmbedUrl);

      await axios.post(HOOKDECK_SOURCE_URL, {
        username: "Stratego Bot",
        avatar_url: "https://images.newscientist.com/wp-content/uploads/2018/03/23111650/strategus2.jpg?width=837",
        content: "A New Stratego Video\n" + cleanEmbedUrl
      });
    }
  } catch (error) {
    console.error('Execution failed completely:', error.message);
    process.exit(1);
  }
}

fetchAndPostVideos();
