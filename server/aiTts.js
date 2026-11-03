import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import { Readable } from 'stream';

// HTTPS agent with expanded header size limit for Google/Gemini endpoints
const httpsAgent = new https.Agent({
  maxHeaderSize: 131072
});

// Helper to auto-read credentials if available from local workspace or environment
function getStoredAgentCredentials() {
  try {
    const credPath = 'F:/AI/agents/output/credentials.json';
    if (fs.existsSync(credPath)) {
      return JSON.parse(fs.readFileSync(credPath, 'utf8'));
    }
  } catch (e) {}
  return {};
}

// Curated top-quality Microsoft Edge Neural voices (Azure Cognitive)
export const EDGE_NEURAL_VOICES = [
  // Vietnamese Dedicated Voices (Top Quality & Expressive Styles)
  { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Việt Nam - Nữ dịu dàng miền Bắc)', lang: 'vi-VN', gender: 'Female' },
  { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Việt Nam - Nam truyền cảm miền Bắc)', lang: 'vi-VN', gender: 'Male' },
  { id: 'vi-VN-HoaiMyNeural-story', name: 'Hoài My Kể Chuyện (Việt Nam - Nữ êm đềm, chậm rãi)', lang: 'vi-VN', gender: 'Female' },
  { id: 'vi-VN-NamMinhNeural-story', name: 'Nam Minh Thuyết Minh (Việt Nam - Nam sâu lắng, ấm áp)', lang: 'vi-VN', gender: 'Male' },
  { id: 'vi-VN-HoaiMyNeural-energetic', name: 'Hoài My Hoạt Bát (Việt Nam - Nữ vui tươi, sinh động)', lang: 'vi-VN', gender: 'Female' },
  { id: 'vi-VN-NamMinhNeural-heroic', name: 'Nam Minh Khí Thế (Việt Nam - Nam mạnh mẽ, dứt khoát)', lang: 'vi-VN', gender: 'Male' },
  { id: 'gtts-vi', name: 'Google Voice VN (Việt Nam - Nữ chuẩn Google TTS)', lang: 'vi-VN', gender: 'Female' },

  // US English
  { id: 'en-US-JennyNeural', name: 'Jenny (US Female - Natural)', lang: 'en-US', gender: 'Female' },
  { id: 'en-US-GuyNeural', name: 'Guy (US Male - Natural)', lang: 'en-US', gender: 'Male' },
  { id: 'en-US-AriaNeural', name: 'Aria (US Female - Conversational)', lang: 'en-US', gender: 'Female' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher (US Male - Storyteller)', lang: 'en-US', gender: 'Male' },
  { id: 'en-US-EricNeural', name: 'Eric (US Male - Clear)', lang: 'en-US', gender: 'Male' },
  { id: 'en-US-MichelleNeural', name: 'Michelle (US Female - Friendly)', lang: 'en-US', gender: 'Female' },
  // UK English
  { id: 'en-GB-SoniaNeural', name: 'Sonia (UK Female)', lang: 'en-GB', gender: 'Female' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (UK Male)', lang: 'en-GB', gender: 'Male' },
  // Australian & Canadian
  { id: 'en-AU-NatashaNeural', name: 'Natasha (AU Female)', lang: 'en-AU', gender: 'Female' },
  { id: 'en-CA-LiamNeural', name: 'Liam (CA Male)', lang: 'en-CA', gender: 'Male' },
  // Multilingual
  { id: 'es-ES-ElviraNeural', name: 'Elvira (Spanish)', lang: 'es-ES', gender: 'Female' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise (French)', lang: 'fr-FR', gender: 'Female' },
  { id: 'de-DE-KatjaNeural', name: 'Katja (German)', lang: 'de-DE', gender: 'Female' },
  { id: 'ja-JP-NanamiNeural', name: 'Nanami (Japanese)', lang: 'ja-JP', gender: 'Female' },
  { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao (Chinese)', lang: 'zh-CN', gender: 'Female' }
];

export const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy (Balanced)', lang: 'en', gender: 'Neutral' },
  { id: 'echo', name: 'Echo (Warm Male)', lang: 'en', gender: 'Male' },
  { id: 'fable', name: 'Fable (British Accent)', lang: 'en', gender: 'Neutral' },
  { id: 'onyx', name: 'Onyx (Deep Authoritative)', lang: 'en', gender: 'Male' },
  { id: 'nova', name: 'Nova (Energetic Female)', lang: 'en', gender: 'Female' },
  { id: 'shimmer', name: 'Shimmer (Soft & Expressive)', lang: 'en', gender: 'Female' }
];

export const ELEVENLABS_DEFAULT_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Calm & Authentic)', lang: 'en' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Empathetic)', lang: 'en' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Warm Narrative)', lang: 'en' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Smooth Storyteller)', lang: 'en' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Deep Conversational)', lang: 'en' }
];

export const GEMINI_VOICES = [
  // Vietnamese Dedicated Google Cloud Voices
  { id: 'vi-VN-Neural2-A', name: 'Google Neural2 A (Nữ Studio cao cấp - VN)', lang: 'vi-VN', type: 'gcloud' },
  { id: 'vi-VN-Neural2-D', name: 'Google Neural2 D (Nam Studio cao cấp - VN)', lang: 'vi-VN', type: 'gcloud' },
  { id: 'vi-VN-Wavenet-A', name: 'Google WaveNet A (Nữ tự nhiên - VN)', lang: 'vi-VN', type: 'gcloud' },
  { id: 'vi-VN-Wavenet-B', name: 'Google WaveNet B (Nam tự nhiên - VN)', lang: 'vi-VN', type: 'gcloud' },
  { id: 'vi-VN-Wavenet-C', name: 'Google WaveNet C (Nữ truyền cảm - VN)', lang: 'vi-VN', type: 'gcloud' },
  { id: 'vi-VN-Wavenet-D', name: 'Google WaveNet D (Nam trầm ấm - VN)', lang: 'vi-VN', type: 'gcloud' },
  { id: 'gtts-vi', name: 'Google Voice VN (Chuẩn Google Tiếng Việt - Free)', lang: 'vi-VN', type: 'gcloud' },

  // Gemini Multimodal Native Voices (Fluent in Vietnamese & English)
  { id: 'Aoede', name: 'Aoede (Nữ truyền cảm - VN / Global)', lang: 'vi/en', type: 'gemini' },
  { id: 'Kore', name: 'Kore (Nữ nhẹ nhàng kể chuyện - VN / Global)', lang: 'vi/en', type: 'gemini' },
  { id: 'Puck', name: 'Puck (Nam hoạt bát, sinh động - VN / Global)', lang: 'vi/en', type: 'gemini' },
  { id: 'Charon', name: 'Charon (Nam trầm ấm điện ảnh - VN / Global)', lang: 'vi/en', type: 'gemini' },
  { id: 'Fenrir', name: 'Fenrir (Nam hào hùng, lôi cuốn - VN / Global)', lang: 'vi/en', type: 'gemini' },

  // Google Journey / Neural2 US
  { id: 'en-US-Journey-F', name: 'Journey F (Natural Female)', lang: 'en-US', type: 'gcloud' },
  { id: 'en-US-Journey-D', name: 'Journey D (Natural Male)', lang: 'en-US', type: 'gcloud' },
  { id: 'en-US-Neural2-F', name: 'Neural2 F (Studio Female)', lang: 'en-US', type: 'gcloud' },
  { id: 'en-US-Neural2-D', name: 'Neural2 D (Studio Male)', lang: 'en-US', type: 'gcloud' }
];

export const TIKTOK_VOICES = [
  // English Voices (Verified Active)
  { id: 'en_us_001', name: 'English US (Classic Female)', lang: 'en-US' },
  { id: 'en_us_002', name: 'Jessie (Popular Viral Female)', lang: 'en-US' },
  { id: 'en_us_006', name: 'Joey (Casual Male)', lang: 'en-US' },
  { id: 'en_us_007', name: 'Professor (Authoritative Male)', lang: 'en-US' },
  { id: 'en_us_009', name: 'Scientist (Narrator Male)', lang: 'en-US' },
  { id: 'en_us_010', name: 'Confidence (Deep Male)', lang: 'en-US' },
  { id: 'en_male_narration', name: 'Storyteller (Documentary Male)', lang: 'en-US' },
  { id: 'en_female_emotional', name: 'Peaceful (Soft Female)', lang: 'en-US' },
  { id: 'en_male_funny', name: 'Wacky (Comic Voice)', lang: 'en-US' },
  { id: 'en_male_cody', name: 'Cody (Energetic Male)', lang: 'en-US' },
  // Iconic Character Voices (Verified Active)
  { id: 'en_us_ghostface', name: 'Ghostface (Scream)', lang: 'en-US' },
  { id: 'en_us_c3po', name: 'C-3PO (Star Wars)', lang: 'en-US' },
  { id: 'en_us_stitch', name: 'Stitch (Cute Alien)', lang: 'en-US' },
  { id: 'en_us_stormtrooper', name: 'Stormtrooper (Empire)', lang: 'en-US' },
  { id: 'en_us_rocket', name: 'Rocket (Guardians)', lang: 'en-US' },
  // Multilingual (Verified Active on TikTok)
  { id: 'fr_001', name: 'French (Male)', lang: 'fr' },
  { id: 'de_001', name: 'German (Female)', lang: 'de' },
  { id: 'jp_001', name: 'Japanese (Female)', lang: 'ja' }
];

/**
 * Synthesize speech audio using Gemini Web cookie session (__Secure-1PSID)
 * via Google's internal batchexecute RPC (rpcid: XqA3Ic)
 */
async function synthesizeGeminiWebCookie(text, cookie) {
  if (!cookie || !cookie.trim()) {
    throw new Error('Gemini cookie is required. Please paste your __Secure-1PSID cookie in AI Voice Settings.');
  }

  const cleanCookie = cookie.trim();
  const cookieHeader = cleanCookie.includes('=')
    ? cleanCookie
    : `__Secure-1PSID=${cleanCookie}; __Secure-1PSIDTS=${cleanCookie}`;

  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  // 1. Fetch SNlM0e nonce from gemini.google.com/app
  let snlm0e = '';
  try {
    const pageResp = await axios.get('https://gemini.google.com/app', {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      httpsAgent,
      maxRedirects: 0,
      validateStatus: () => true,
      timeout: 10000
    });

    if (pageResp.status >= 300 && pageResp.status < 400) {
      console.warn('[Gemini Cookie] Redirect detected from gemini.google.com/app to:', pageResp.headers.location);
    } else if (pageResp.data && typeof pageResp.data === 'string') {
      const match = pageResp.data.match(/"SNlM0e":"([^"]+)"/) || pageResp.data.match(/SNlM0e\\":\\"([^\\"]+)\\"/);
      if (match && match[1]) {
        snlm0e = match[1];
      }
    }
  } catch (err) {
    console.warn('[Gemini Cookie] Could not retrieve SNlM0e nonce directly:', err.message);
  }

  // Detect Vietnamese text to set correct language code for natural synthesis
  const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
  const langCode = isVietnamese ? 'vi' : 'en-US';

  // 2. Call batchexecute with RPC XqA3Ic
  const innerData = JSON.stringify([null, text, langCode, null, 2]);
  const reqData = [[['XqA3Ic', innerData, null, 'generic']]];

  const formData = new URLSearchParams();
  formData.append('f.req', JSON.stringify(reqData));
  if (snlm0e) {
    formData.append('at', snlm0e);
  }

  const rpcUrl = 'https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=XqA3Ic';

  let ttsResp;
  try {
    ttsResp = await axios.post(rpcUrl, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Cookie': cookieHeader,
        'User-Agent': userAgent,
        'Origin': 'https://gemini.google.com',
        'Referer': 'https://gemini.google.com/'
      },
      httpsAgent,
      maxRedirects: 0,
      validateStatus: () => true,
      timeout: 18000
    });
  } catch (postErr) {
    throw new Error(`Gemini connection error: ${postErr.message}`);
  }

  if (ttsResp.status >= 300 && ttsResp.status < 400) {
    const loc = ttsResp.headers.location || '';
    if (loc.includes('sorry') || loc.includes('accounts.google.com') || loc.includes('signin')) {
      throw new Error(
        'Gemini Cookie session expired or invalid. Google is redirecting to login. Please copy a fresh __Secure-1PSID cookie from gemini.google.com, or switch to Edge Neural (Free & No Quota) in AI Voice Settings.'
      );
    }
    throw new Error(`Gemini redirected unexpectedly (HTTP ${ttsResp.status}). Cookie session may have expired.`);
  }

  const body = ttsResp.data;
  if (!body || typeof body !== 'string') {
    throw new Error('Received empty response from Gemini Web TTS endpoint.');
  }

  let audioBase64 = null;
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('XqA3Ic') && trimmed.includes('wrb.fr')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed[0] && parsed[0][2]) {
          const inner = JSON.parse(parsed[0][2]);
          if (inner && inner[0]) {
            audioBase64 = inner[0];
            break;
          }
        }
      } catch (e) {}
    }
  }

  if (!audioBase64) {
    const b64Match = body.match(/"(T2dnUw[A-Za-z0-9+/=]{100,})"/);
    if (b64Match) {
      audioBase64 = b64Match[1];
    }
  }

  if (!audioBase64) {
    throw new Error(
      'Gemini Web Cookie session was rejected or expired. Please verify your __Secure-1PSID cookie in AI Voice Settings.'
    );
  }

  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const readable = new Readable();
  readable.push(audioBuffer);
  readable.push(null);

  const isOgg = audioBuffer.slice(0, 4).toString() === 'OggS';

  return {
    stream: readable,
    contentType: isOgg ? 'audio/ogg' : 'audio/mpeg'
  };
}

/**
 * Free, fast, high-reliability Google Translate TTS with automatic chunking for long texts.
 * No API key or session cookie required.
 */
async function synthesizeGtts(text, lang = 'vi') {
  const clean = text.replace(/[\r\n]+/g, ' ').trim();
  const chunks = [];
  const maxLen = 180;
  let remaining = clean;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let splitIdx = remaining.lastIndexOf('. ', maxLen);
    if (splitIdx === -1) splitIdx = remaining.lastIndexOf(', ', maxLen);
    if (splitIdx === -1) splitIdx = remaining.lastIndexOf('; ', maxLen);
    if (splitIdx === -1) splitIdx = remaining.lastIndexOf(' ', maxLen);
    if (splitIdx === -1) splitIdx = maxLen;

    chunks.push(remaining.substring(0, splitIdx + 1).trim());
    remaining = remaining.substring(splitIdx + 1).trim();
  }

  const buffers = [];
  for (const chunk of chunks) {
    if (!chunk) continue;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      responseType: 'arraybuffer',
      timeout: 10000
    });
    buffers.push(Buffer.from(res.data));
  }

  const fullAudio = Buffer.concat(buffers);
  const readable = new Readable();
  readable.push(fullAudio);
  readable.push(null);

  return {
    stream: readable,
    contentType: 'audio/mpeg'
  };
}

/**
 * Synthesize speech audio using selected AI provider.
 * Returns { stream, contentType }
 */
export async function synthesizeAiAudio(text, { provider = 'edge', config = {} }) {
  if (!text || !text.trim()) {
    throw new Error('No text provided for synthesis.');
  }

  const cleanText = text.trim();
  const storedCreds = getStoredAgentCredentials();

  // 1. Edge Neural TTS (Free Azure Cognitive Voices + Vietnamese Presets + Free Google VN)
  if (provider === 'edge') {
    const rawVoice = config.voice || 'vi-VN-HoaiMyNeural';

    // Direct Google Voice VN fallback
    if (rawVoice === 'gtts-vi' || rawVoice.startsWith('gtts')) {
      return synthesizeGtts(cleanText, 'vi');
    }

    let actualVoice = rawVoice;
    if (rawVoice.includes('-story')) {
      actualVoice = rawVoice.replace('-story', '');
    } else if (rawVoice.includes('-energetic')) {
      actualVoice = rawVoice.replace('-energetic', '');
    } else if (rawVoice.includes('-heroic')) {
      actualVoice = rawVoice.replace('-heroic', '');
    }

    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(actualVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(cleanText);

      // Collect audio buffer safely to prevent mid-stream connection drops and ensure 100% reliability
      const chunks = [];
      const audioBuffer = await new Promise((resolve, reject) => {
        audioStream.on('data', chunk => chunks.push(chunk));
        audioStream.on('end', () => resolve(Buffer.concat(chunks)));
        audioStream.on('error', err => {
          if (chunks.length > 0) {
            resolve(Buffer.concat(chunks));
          } else {
            reject(err);
          }
        });
      });

      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Edge TTS returned empty audio buffer');
      }

      const readable = new Readable();
      readable.push(audioBuffer);
      readable.push(null);

      return {
        stream: readable,
        contentType: 'audio/mpeg'
      };
    } catch (edgeErr) {
      console.warn(`[Edge TTS] Voice '${actualVoice}' notice: ${edgeErr.message}. Falling back to Google Voice VN...`);
      return synthesizeGtts(cleanText, 'vi');
    }
  }

  // 2. Google Gemini Speech API (Official API Key OR Web Cookie Session)
  if (provider === 'gemini') {
    const voiceName = config.voice || 'Aoede';

    // If Google Voice VN selected under Gemini, handle immediately
    if (voiceName === 'gtts-vi' || voiceName.startsWith('gtts')) {
      return synthesizeGtts(cleanText, 'vi');
    }

    const apiKey = config.apiKey || process.env.GEMINI_API_KEY || storedCreds.gemini_api_key;
    const cookie = config.cookie || storedCreds.gemini_cookie_psid || '';
    const authMode = config.geminiAuthMode || (cookie && !apiKey ? 'cookie' : 'api');

    // If Cookie mode is selected or Cookie is supplied without API Key
    if (authMode === 'cookie' || (!apiKey && cookie)) {
      try {
        return await synthesizeGeminiWebCookie(cleanText, cookie);
      } catch (geminiCookieErr) {
        if (config.isTesting) {
          throw geminiCookieErr;
        }
        console.warn(`[Gemini Cookie] ${geminiCookieErr.message}. Seamlessly falling back to Google Voice VN...`);
        return synthesizeGtts(cleanText, 'vi');
      }
    }

    // Otherwise use Official Gemini 2.0 Flash Audio API
    if (!apiKey) {
      throw new Error(
        'Google Gemini requires either an API Key (Google AI Studio) or a Web Cookie (__Secure-1PSID). Please configure one in AI Voice Settings.'
      );
    }

    const isGoogleCloudVoice = voiceName.includes('-');

    if (!isGoogleCloudVoice) {
      // Gemini 2.0 Flash Audio Generation
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(cleanText);
      const promptText = isVietnamese
        ? `Đọc to đoạn văn bản sau bằng tiếng Việt thật truyền cảm, tự nhiên và rõ ràng, không thêm lời dẫn nào: ${cleanText}`
        : `Read the following text out loud clearly and expressively without adding any commentary or intro: ${cleanText}`;

      const payload = {
        contents: [
          {
            parts: [
              {
                text: promptText
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          }
        }
      };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 25000
      });

      const part = response.data?.candidates?.[0]?.content?.parts?.[0];
      const inlineData = part?.inlineData;

      if (!inlineData || !inlineData.data) {
        throw new Error('Gemini API did not return audio data for this request.');
      }

      const audioBuffer = Buffer.from(inlineData.data, 'base64');
      const readable = new Readable();
      readable.push(audioBuffer);
      readable.push(null);

      return {
        stream: readable,
        contentType: inlineData.mimeType || 'audio/wav'
      };
    } else {
      // Google Cloud Text-to-Speech API
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
      const lang = voiceName.split('-').slice(0, 2).join('-');
      const payload = {
        input: { text: cleanText },
        voice: {
          languageCode: lang,
          name: voiceName
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: config.speed || 1.0
        }
      };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000
      });

      const audioContent = response.data?.audioContent;
      if (!audioContent) {
        throw new Error('Google Cloud TTS did not return audioContent.');
      }

      const audioBuffer = Buffer.from(audioContent, 'base64');
      const readable = new Readable();
      readable.push(audioBuffer);
      readable.push(null);

      return {
        stream: readable,
        contentType: 'audio/mpeg'
      };
    }
  }

  // 3. TikTok TTS (Cookie/Sessionid-based)
  if (provider === 'tiktok') {
    const rawCookie = config.cookie || '';
    const requestedVoice = config.voice || 'en_us_002';

    // Active verified TikTok voice IDs. If user has an outdated/retired voice (e.g. vi_001, kr_001, es_001),
    // safely route to classic Jessie (en_us_002) which is always active and reliable.
    const verifiedTikTokVoices = [
      'en_us_001', 'en_us_002', 'en_us_006', 'en_us_007', 'en_us_009', 'en_us_010',
      'en_male_narration', 'en_female_emotional', 'en_male_funny', 'en_male_cody',
      'en_us_ghostface', 'en_us_c3po', 'en_us_stitch', 'en_us_stormtrooper', 'en_us_rocket',
      'fr_001', 'de_001', 'jp_001'
    ];

    const voiceSpeaker = verifiedTikTokVoices.includes(requestedVoice) ? requestedVoice : 'en_us_002';
    const cookieHeader = rawCookie
      ? (rawCookie.includes('=') ? rawCookie : `sessionid=${rawCookie}; sessionid_ss=${rawCookie}`)
      : '';

    // Primary and fallback endpoints (fastest & most reliable first)
    const endpoints = [
      `https://api22-normal-c-useast1a.tiktokv.com/media/api/text/speech/invoke/?text_speaker=${voiceSpeaker}&req_text=${encodeURIComponent(cleanText)}&speaker_map_type=0&aid=1233`,
      `https://api16-normal-c-useast1a.tiktokv.com/media/api/text/speech/invoke/?text_speaker=${voiceSpeaker}&req_text=${encodeURIComponent(cleanText)}&speaker_map_type=0&aid=1233`,
      `https://api-va.tiktokv.com/media/api/text/speech/invoke/?text_speaker=${voiceSpeaker}&req_text=${encodeURIComponent(cleanText)}&speaker_map_type=0&aid=1233`,
      `https://api16-normal-v6.tiktokv.com/media/api/text/speech/invoke/?text_speaker=${voiceSpeaker}&req_text=${encodeURIComponent(cleanText)}&speaker_map_type=0&aid=1233`
    ];

    let lastError = null;
    for (const ep of endpoints) {
      try {
        const response = await axios.post(
          ep,
          {},
          {
            headers: {
              'User-Agent':
                'com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
              'Cookie': cookieHeader
            },
            timeout: 6000
          }
        );

        if (response.data && response.data.status_code === 0 && response.data.data?.v_str) {
          const audioBuffer = Buffer.from(response.data.data.v_str, 'base64');
          const readable = new Readable();
          readable.push(audioBuffer);
          readable.push(null);

          return {
            stream: readable,
            contentType: 'audio/mpeg'
          };
        }

        const rawMsg = response.data?.message || 'TikTok TTS rejected the request.';

        // If specific voice is reported unavailable by TikTok, fallback to classic Jessie
        if (rawMsg.toLowerCase().includes('unavailable') && voiceSpeaker !== 'en_us_002') {
          console.warn(`[TikTok TTS] Voice '${voiceSpeaker}' is unavailable; seamlessly falling back to Jessie (en_us_002)...`);
          return synthesizeAiAudio(cleanText, { provider: 'tiktok', config: { ...config, voice: 'en_us_002' } });
        }

        const msg = (rawMsg.toLowerCase().includes('speech') || rawMsg.toLowerCase().includes('load'))
          ? 'TikTok requires an active session. Please provide a valid TikTok sessionid cookie in AI Voice Settings.'
          : rawMsg;
        lastError = new Error(msg);
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(
      lastError?.message ||
      'TikTok TTS requires a valid sessionid cookie. Please provide your TikTok sessionid cookie in AI Voice Settings.'
    );
  }

  // 4. OpenAI TTS API
  if (provider === 'openai') {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API Key is required. Please add your API key in AI Voice Settings.');
    }

    const model = config.model || 'tts-1';
    const voice = config.voice || 'alloy';
    const speed = config.speed || 1.0;

    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model,
        input: cleanText,
        voice,
        speed
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream',
        timeout: 20000
      }
    );

    return {
      stream: response.data,
      contentType: 'audio/mpeg'
    };
  }

  // 5. ElevenLabs API / Cookie
  if (provider === 'elevenlabs') {
    const apiKey = config.apiKey || process.env.ELEVENLABS_API_KEY;
    const cookie = config.cookie || '';
    if (!apiKey && !cookie) {
      throw new Error('ElevenLabs API Key or session Cookie is required in AI Voice Settings.');
    }

    const voiceId = config.voice || '21m00Tcm4TlvDq8ikWAM';
    const modelId = config.model || 'eleven_turbo_v2_5';

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    };

    if (apiKey) headers['xi-api-key'] = apiKey;
    if (cookie) headers['Cookie'] = cookie;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: cleanText,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers,
        responseType: 'stream',
        timeout: 25000
      }
    );

    return {
      stream: response.data,
      contentType: 'audio/mpeg'
    };
  }

  // 6. Custom AI TTS Endpoint / Cookie
  if (provider === 'custom') {
    const endpoint = config.endpoint;
    if (!endpoint) {
      throw new Error('Custom API endpoint URL is required.');
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;
    if (config.cookie) headers['Cookie'] = config.cookie;

    const response = await axios.post(
      endpoint,
      {
        text: cleanText,
        voice: config.voice,
        speed: config.speed || 1.0,
        model: config.model
      },
      {
        headers,
        responseType: 'stream',
        timeout: 30000
      }
    );

    return {
      stream: response.data,
      contentType: response.headers['content-type'] || 'audio/mpeg'
    };
  }

  throw new Error(`Unsupported AI TTS provider: ${provider}`);
}
