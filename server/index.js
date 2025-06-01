import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Language configuration
const languageConfig = {
  javascript: {
    language: 'javascript',
    version: '18.15.0'
  },
  python: {
    language: 'python',
    version: '3.10.0'
  },
  html: {
    language: 'html',
    version: '5.0.0'
  },
  css: {
    language: 'css',
    version: '3.0.0'
  },
  sql: {
    language: 'sql',
    version: '3.0.0'
  }
};

// Helper function to format transcript
const formatTranscript = (transcript) => {
  return transcript.map(item => ({
    start: item.start,
    text: item.text,
    duration: item.duration
  }));
};

// Helper function to get language name from code
const getLanguageName = (code) => {
  const languages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    // Add more languages as needed
  };
  return languages[code] || code.toUpperCase();
};

// Get available languages for a video
app.get('/api/transcript/:videoId/languages', async (req, res) => {
  try {
    const { videoId } = req.params;

    // Get available captions
    const captionsResponse = await youtube.captions.list({
      part: 'snippet',
      videoId: videoId
    });

    const captions = captionsResponse.data.items;
    if (!captions || captions.length === 0) {
      return res.status(404).json({ error: 'No captions available for this video' });
    }

    // Format languages
    const languages = captions.map(caption => ({
      languageCode: caption.snippet.language,
      languageName: getLanguageName(caption.snippet.language)
    }));

    res.json({ languages });

  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch available languages',
      details: error.message 
    });
  }
});

// Update the transcript endpoint to handle language selection
app.get('/api/transcript/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { lang = 'en' } = req.query;

    // First, get available captions
    const captionsResponse = await youtube.captions.list({
      part: 'snippet',
      videoId: videoId
    });

    const captions = captionsResponse.data.items;
    if (!captions || captions.length === 0) {
      return res.status(404).json({ error: 'No captions available for this video' });
    }

    // Find the requested language caption
    const caption = captions.find(c => c.snippet.language === lang) || captions[0];

    // Get the actual transcript
    const transcriptResponse = await youtube.captions.download({
      id: caption.id,
      tfmt: 'srt' // SubRip format
    });

    // Parse and format the transcript
    const transcript = parseSRT(transcriptResponse.data);
    
    res.json({
      language: caption.snippet.language,
      languageName: getLanguageName(caption.snippet.language),
      transcript: formatTranscript(transcript)
    });

  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transcript',
      details: error.message 
    });
  }
});

// Helper function to parse SRT format
function parseSRT(srtContent) {
  const blocks = srtContent.trim().split('\n\n');
  return blocks.map(block => {
    const [index, time, ...text] = block.split('\n');
    const [start, end] = time.split(' --> ').map(t => {
      const [h, m, s] = t.split(':');
      return (parseInt(h) * 3600) + (parseInt(m) * 60) + parseFloat(s.replace(',', '.'));
    });
    
    return {
      start,
      duration: end - start,
      text: text.join(' ').trim()
    };
  });
}

// Execute code endpoint
app.post('/api/execute', async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const config = languageConfig[language];
    if (!config) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // For HTML, handle it differently
    if (language === 'html') {
      return res.json({
        output: 'HTML rendered successfully',
        executionTime: 0
      });
    }

    // For other languages, use Piston API
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: config.language,
      version: config.version,
      files: [{
        content: code
      }]
    });

    const result = response.data;
    
    return res.json({
      output: result.run.stdout || '',
      error: result.run.stderr || null,
      executionTime: result.run.time || 0
    });

  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({
      error: 'Failed to execute code',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 