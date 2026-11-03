import express from 'express';
import cors from 'cors';
import { extractArticle, processRawText } from './extractor.js';
import {
  synthesizeAiAudio,
  EDGE_NEURAL_VOICES,
  OPENAI_VOICES,
  ELEVENLABS_DEFAULT_VOICES,
  GEMINI_VOICES,
  TIKTOK_VOICES
} from './aiTts.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Reader & TTS Service', timestamp: new Date() });
});

// Sample articles for immediate 1-click testing
const SAMPLES = [
  {
    id: 'sample-voyager',
    title: 'The Golden Record and the Journey Beyond the Stars',
    siteName: 'Cosmic Archives',
    byline: 'NASA Jet Propulsion Laboratory & Carl Sagan Committee',
    excerpt: 'Carried aboard Voyager 1 and 2, the Golden Record contains sounds and images selected to portray the diversity of life and culture on Earth...',
    text: `Carried aboard Voyager 1 and 2, the Golden Record contains sounds and images selected to portray the diversity of life and culture on Earth. Launched in 1977, both spacecraft have now ventured into interstellar space, farther from our sun than any human-made object in history.

The contents of the record were selected for NASA by a committee chaired by Carl Sagan of Cornell University. Dr. Sagan and his associates assembled 115 images and a variety of natural sounds, such as those made by surf, wind, thunder, and animal songs, including birds and whales. To this they added musical selections from different cultures and eras, spoken greetings in fifty-five languages, and printed messages from President Jimmy Carter and UN Secretary General Kurt Waldheim.

Each record is encased in a protective aluminum jacket, together with a cartridge and a needle. Instructions, in symbolic language, explain the origin of the spacecraft and indicate how the record is to be played. The 115 images are encoded in analog form. The remainder of the record is audio, designed to be played at 16-2/3 revolutions per minute.

As President Carter noted in his written message: "This is a present from a small, distant world, a token of our sounds, our science, our images, our music, our thoughts and our feelings. We are attempting to survive our time so we may live into yours."

Long after the Earth and its civilizations have evolved or faded, these twin probes will drift silently across the cosmos, carrying our eternal greeting to whoever might encounter them.`
  },
  {
    id: 'sample-ai-future',
    title: 'The Architecture of Human-Agent Collaboration',
    siteName: 'AI Research Horizons',
    byline: 'Elena Rostova, Cognitive Systems Lab',
    excerpt: 'The true paradigm shift in software is not the replacement of human intelligence, but the creation of fluid, high-bandwidth communication loops...',
    text: `The true paradigm shift in modern computing is not the unilateral replacement of human agency, but the emergence of fluid, bidirectional collaboration between human intent and autonomous intelligence.

For decades, computers operated as deterministic instruments. Every action required deliberate keystrokes, explicit parameters, and exhaustive specification. Today, the synthesis of large multimodal models and tool-calling execution engines transforms software from passive utility to active co-pilot.

In this emerging model, human creators transition from micro-managing implementations to conducting high-level outcomes. The human articulates intent, provides emotional intuition, defines taste, and applies ethical boundaries. In turn, the artificial agent explores possibilities, evaluates permutations, summarizes massive textual knowledge, and generates scaffolding in seconds.

However, high bandwidth interaction demands ergonomic design. If agents produce text faster than human eyes can parse, we create cognitive overload rather than clarity. Features such as synchronized voice playback, progressive distraction-free reading, and sentence-level interaction bridge the biological gap, enabling us to absorb ideas at the speed of thought.`
  },
  {
    id: 'sample-nature',
    title: 'How Trees Communicate: The Hidden Wood Wide Web',
    siteName: 'Botanical Discoveries',
    byline: 'Dr. Suzanne Simard & Forest Ecologists',
    excerpt: 'Beneath the forest floor lies a vast fungal network that connects individual trees, allowing them to share carbon, water, nutrients, and warning signals...',
    text: `Beneath the serene canopy of ancient forests lies a complex subterranean network that challenges our traditional notions of plant competition. Known colloquially as the "Wood Wide Web," this symbiotic alliance between mycorrhizal fungi and tree roots allows trees to actively communicate and cooperate.

Through these fungal threads, mature "mother trees" detect the health of surrounding seedlings and channel crucial carbon sugars and water to younger plants struggling in the deep shade. When attacked by insect pests such as bark beetles, trees send chemical warning pulses through the network, alerting neighboring trees to produce defensive tannins before the infestation arrives.

Rather than competing blindly for sunlight and soil nutrients, a healthy forest functions as a single super-organism. Research reveals that biodiversity enhances the stability of this underground communication grid. When we protect old-growth forests, we are not merely saving individual trees, but preserving an intricate biological internet that has sustained life on Earth for hundreds of millions of years.`
  }
];

app.get('/api/sample-articles', (req, res) => {
  res.json({ samples: SAMPLES });
});

// Extract from URL
app.post('/api/extract-url', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid web address (URL).' });
  }

  try {
    const articleData = await extractArticle(url);
    res.json({ success: true, data: articleData });
  } catch (err) {
    console.error('Extraction error for URL:', url, err.message);
    const isNetwork = err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT';
    const errorMessage = isNetwork
      ? 'Unable to connect to this website. Please check the URL or your internet connection.'
      : (err.message || 'Failed to extract readable article content from this page.');

    res.status(422).json({
      error: errorMessage,
      details: err.message
    });
  }
});

// Process pasted text
app.post('/api/process-text', (req, res) => {
  const { text, title } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text content cannot be empty.' });
  }

  try {
    const docData = processRawText(text, title);
    res.json({ success: true, data: docData });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to process text.' });
  }
});

// AI TTS Voice Catalog
app.get('/api/tts/voices', (req, res) => {
  res.json({
    edge: EDGE_NEURAL_VOICES,
    gemini: GEMINI_VOICES,
    tiktok: TIKTOK_VOICES,
    openai: OPENAI_VOICES,
    elevenlabs: ELEVENLABS_DEFAULT_VOICES
  });
});

// AI TTS Speech Synthesis streaming endpoint
app.post('/api/tts/synthesize', async (req, res) => {
  const { text, provider = 'edge', config = {} } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text to synthesize cannot be empty.' });
  }

  try {
    const { stream, contentType } = await synthesizeAiAudio(text, { provider, config });
    res.setHeader('Content-Type', contentType || 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache identical audio segments for fast replay

    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('Audio stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Audio synthesis failed during streaming.' });
      }
    });
  } catch (err) {
    console.error('TTS synthesis error:', err.message);
    const statusCode = err.response?.status || 500;
    const msg = err.response?.data?.error?.message || err.message || 'Failed to synthesize speech audio.';
    res.status(statusCode).json({ error: msg });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
