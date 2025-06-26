const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());

mongoose.connect('mongodb://localhost:27017/bridgelab_shorts', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const videoSchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  title: String,
  thumbnail: String,
  channelName: String,
  channelId: String,
  publishedAt: Date,
  views: Number,
});

const Video = mongoose.model('Video', videoSchema);

// Replace YOUR_API_KEY with your actual YouTube Data API key
const YOUTUBE_API_KEY = 'AIzaSyBj1dq2xjLxJrULbyIP5xgGagVSfI0ZvqQ'; 

const CHANNEL_IDS = [
  "UCvX5fXy9Q2t2a6rQKzv9h7A", "UCwX8v7X1c4J3G2kJH9rD9qA", "UCpGk1rjQ3f9l7eKZr1pY5Fg",
  "UCQv9Yl1Q1r9h2p3c9b2d8gA", "UCsNxI4WJgP0s8gqB6h0h7iA", "UCvTj9kD2e1f0g3h4i5j6k7lA",
  "UCp6a5j7i8k9l0m1n2o3p4q5r", "UC1c8e9f7g6h5i4j3k2l1m0nO", "UC9vLdyHatOhRrCwQXqz4ZKw",
  "UC1c8e9f7g6h5i4j3k2l1m0n", "UCf3m4mR7T5h6g7v9k8l0q1wA", "UC3jv2kL7n8m9o0p1q2r3s4tA",
  "UCcefcZRL2oaA_uBNeo5UOWg", "UCctXZh8aS7uQ6h4P8Z8aX3w", "UCAuUUnT6oDeKwE6v1NGQxug",
  "UCXc8a8b9c7d6e5f4g3h2i1jA", "UCa5a8m7k9l0p1q2r3s4t5u6v", "UCx0s8xk9l1m2n3o4p5q6r7sA",
  "UC5a6b7c8d9e0f1g2h3i4j5k6l"
];

function parseISODuration(duration) {
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  const minutes = match && match[1] ? parseInt(match[1], 10) : 0;
  const seconds = match && match[2] ? parseInt(match[2], 10) : 0;
  return minutes * 60 + seconds;
}

// API endpoint to get shorts
app.get('/api/shorts', async (req, res) => {
  try {
    let allShorts = [];
    for (const channelId of CHANNEL_IDS) {
      // Fetch latest videos from the channel with #shorts in the title/description
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            maxResults: 5,
            channelId,
            q: '#shorts',
            type: 'video',
            key: 'AIzaSyBj1dq2xjLxJrULbyIP5xgGagVSfI0ZvqQ'
          }
        }
      );
      const videoIds = response.data.items.map(item => item.id.videoId).join(',');
      if (!videoIds) continue;
      const detailsResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails,statistics',
            id: videoIds,
            key: 'AIzaSyBj1dq2xjLxJrULbyIP5xgGagVSfI0ZvqQ'
          }
        }
      );
      const shorts = detailsResponse.data.items
        .filter(item => {
          const seconds = parseISODuration(item.contentDetails.duration);
          return seconds > 0 && seconds <= 60;
        })
        .map(item => ({
          videoId: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          channelName: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          views: item.statistics.viewCount
        }));
      allShorts = allShorts.concat(shorts);
    }
    // Optionally, sort by published date (newest first)
    allShorts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    res.json(allShorts);
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    res.status(500).json({ error: 'Failed to fetch shorts from YouTube' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});