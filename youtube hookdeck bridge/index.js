const { google } = require('googleapis');
const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const HOOKDECK_SOURCE_URL = process.env.HOOKDECK_SOURCE_URL;

const BLOCKED_CHANNEL_IDS = [
  'UCBNXuc03LLBOnpAp35BPp1A', // Example ID placeholder
  'UCfAtOwhoabzNiWBtkz-UL-Q',
  'UCTCzp0bi93bj6j4bWIliBuQ'
];

async function fetchAndPostVideos() {
  const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });
  
  // Looking back 30 days for this definitive test
  const publishedAfter = new Date(Date.now() - 60 * 60 * 1000).toISOString();

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
      const channelId = item.snippet.channelId;
      const channelTitle = item.snippet.channelTitle;
      
      // 🔒 Match strictly by the unique Channel ID
      if (BLOCKED_CHANNEL_IDS.includes(channelId)) {
        console.log(`🚫 ID Filter: Skipped video from blocked channel ID: "${channelId}" (${channelTitle})`);
        continue; 
      }

      const realVideoId = item.id.videoId;
      const cleanEmbedUrl = "https://youtube.com" + realVideoId;
      
      console.log(`Forwarding clean payload for: ${cleanEmbedUrl} (Channel: ${channelTitle})`);

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
