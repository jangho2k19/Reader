# 📖 Universal Reader & Voice Studio

A distraction-free web reader and natural Text-to-Speech (TTS) voice application designed to extract and read articles from any web link, local documents (`.txt`, `.md`), or pasted text.

![Universal Reader Preview](https://img.shields.io/badge/Status-Active-brightgreen)
![Node Version](https://img.shields.io/badge/Node-%3E%3D18-blue)
![React Version](https://img.shields.io/badge/React-19-cyan)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## ✨ Features

### 🌐 1. Smart Web Article Extraction
- **Link Extractor**: Powered by `@mozilla/readability` (the engine behind Firefox Reader View) and `cheerio`.
- **Decluttering**: Automatically strips ads, banners, navigational sidebars, popups, and intrusive scripts.
- **Rich Metadata**: Captures article title, author/byline, source domain, publication date, cover images, and word count.
- **Reading Time Metrics**: Displays estimated reading time (200 wpm) and listening time (140 wpm).

### 📁 2. File Upload & Direct Text Mode
- **Drag & Drop Upload**: Instant parsing of `.txt`, `.md`, and `.markdown` files.
- **Paste Text**: Input custom notes, book chapters, essays, or transcripts with live word/character counters.

### 🎧 3. Multi-Provider AI Voice & TTS Studio
- **Google Gemini 2.0 Speech**: Powered by Google Gemini 2.0 Flash Audio Generation with expressive prebuilt voices (`Puck`, `Charon`, `Kore`, `Fenrir`, `Aoede`, plus Google Cloud Journey/Neural voices).
- **TikTok Viral TTS (Cookie/Session)**: Uses authenticated session cookies (`sessionid`) to unlock iconic TikTok narrator voices (`Jessie`, `Classic Female`, `Joey`, `Professor`, `Scientist`, `Storyteller`, `Ghostface`, `Stitch`, `C-3PO`, `Rocket`, etc.).
- **Microsoft Edge Neural (Free, No Keys Needed)**: Instant access to over 15 studio-grade Azure Cognitive neural voices (`Jenny`, `Guy`, `Aria`, `Christopher`, `Michelle`, `Sonia`, `Ryan`, `Natasha`, etc.).
- **OpenAI TTS**: High-fidelity speech using your OpenAI API Key with `tts-1` / `tts-1-hd` and voices (`Alloy`, `Echo`, `Fable`, `Onyx`, `Nova`, `Shimmer`).
- **ElevenLabs API & Cookie**: Premium voice synthesis and voice cloning via API key or session cookie.
- **Custom AI Webhook & Cookie**: Connect any external AI TTS server, local Kokoro/XTTS model, or custom cookie-authenticated endpoint.
- **Gapless Pre-Buffering**: Pre-fetches upcoming sentences in the background for instant, seamless playback.
- **Test Voice Button**: Preview audio greetings with 1 click before reading.
- **Sentence-by-Sentence Synchronization**: Highlights each spoken sentence with real-time word tracking and click-to-read jumping.

### ⚡ 4. Bionic Reading Mode
- **Artificial Fixation Points**: Bolds the initial letters of each word to guide saccadic eye movements and increase reading speed and focus by 30-50%. Toggle on/off in Customize.

### 🎨 5. Customizable Reading Themes & Typography
- **5 Themes**: Sepia (warm paper), Light (crisp modern), Slate (dark mode), OLED (pure black), and Solarized.
- **4 Typography Styles**: Serif (Editorial / Georgia), Sans-Serif (Modern / Inter), Monospace (Code / JetBrains), and Dyslexic-Friendly.
- **Custom Geometry**: Sliders for font size (14px–28px), line spacing (1.4–2.3), and column width (550px–950px).
- **Text Alignment**: Left or Justified.

### 📚 6. Offline Library, Progress Memory & Highlights
- **Reading Progress & Resume**: Automatically remembers the exact sentence where you stopped; resume anytime with 1 click.
- **Sentence Highlights & Quotes**: Star favorite sentences, view them in the dedicated Highlights drawer, and include them in exports.
- **Local Library**: Stores up to 50 documents offline in `localStorage` with instant title/domain search.
- **Export Formats**: Export clean text with highlights to Markdown (`.md`), Plain Text (`.txt`), or Print / Save as PDF (`Ctrl + P`).

### ⌨️ 7. Keyboard Shortcuts
- `Space`: Play / Pause voice playback
- `←` (Left Arrow): Previous sentence
- `→` (Right Arrow): Next sentence
- `Esc`: Stop playback / Close drawer

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm install --prefix server
npm install --prefix client
```
*(Or simply run `npm run install:all`)*

### 2. Start Both Server & Client
```bash
npm run dev
```
*(Alternatively: `node start.js`)*

Open your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🏗️ Architecture

```
Reader/
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppearanceModal.jsx  # Theme, typography & Bionic Reading settings
│   │   │   ├── AudioPlayerDock.jsx  # Pinned glassmorphism playback bar & voice search
│   │   │   ├── InputView.jsx        # URL link, text paste, file upload & library
│   │   │   └── ReaderView.jsx       # Distraction-free article reader & highlights
│   │   ├── hooks/
│   │   │   └── useSpeechSynthesis.js# Resilient Web Speech API hook
│   │   ├── App.jsx                  # Main application state & library
│   │   ├── index.css                # Custom theme variables & glow styles
│   │   └── main.jsx                 # React root mount
│   ├── package.json
│   └── vite.config.js               # Dev server with proxy to :3001
│
├── server/                     # Express.js Backend
│   ├── extractor.js                 # Mozilla Readability & Cheerio scraper
│   ├── index.js                     # REST endpoints (/api/extract-url, etc.)
│   └── package.json
│
├── package.json                # Root package with concurrently dev script
├── start.js                    # Cross-platform runner script
└── README.md
```

---

## 📡 Backend API Endpoints

- `POST /api/extract-url`: Extracts clean article content, sentences, and metadata from a web URL.
- `POST /api/process-text`: Segments raw pasted or uploaded text into paragraphs and numbered sentences.
- `GET /api/sample-articles`: Returns curated sample articles for instant 1-click testing.
- `GET /api/health`: Service health status.
