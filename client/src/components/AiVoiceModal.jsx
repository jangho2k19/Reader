import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Key,
  Globe,
  Sliders,
  Check,
  Play,
  Volume2,
  Lock,
  Eye,
  EyeOff,
  Cpu,
  Cookie,
  Music,
  Zap
} from 'lucide-react';

const FALLBACK_TIKTOK_VOICES = [
  { id: 'en_us_002', name: 'Jessie (Popular Viral Female)', lang: 'en-US' },
  { id: 'en_us_001', name: 'English US (Classic Female)', lang: 'en-US' },
  { id: 'en_us_006', name: 'Joey (Casual Male)', lang: 'en-US' },
  { id: 'en_us_007', name: 'Professor (Authoritative Male)', lang: 'en-US' },
  { id: 'en_us_009', name: 'Scientist (Narrator Male)', lang: 'en-US' },
  { id: 'en_us_010', name: 'Confidence (Deep Male)', lang: 'en-US' },
  { id: 'en_male_narration', name: 'Storyteller (Documentary Male)', lang: 'en-US' },
  { id: 'en_female_emotional', name: 'Peaceful (Soft Female)', lang: 'en-US' },
  { id: 'en_male_funny', name: 'Wacky (Comic Voice)', lang: 'en-US' },
  { id: 'en_male_cody', name: 'Cody (Energetic Male)', lang: 'en-US' },
  { id: 'en_us_ghostface', name: 'Ghostface (Scream)', lang: 'en-US' },
  { id: 'en_us_c3po', name: 'C-3PO (Star Wars)', lang: 'en-US' },
  { id: 'en_us_stitch', name: 'Stitch (Cute Alien)', lang: 'en-US' },
  { id: 'en_us_stormtrooper', name: 'Stormtrooper (Empire)', lang: 'en-US' },
  { id: 'en_us_rocket', name: 'Rocket (Guardians)', lang: 'en-US' },
  { id: 'fr_001', name: 'French (Male)', lang: 'fr' },
  { id: 'de_001', name: 'German (Female)', lang: 'de' },
  { id: 'jp_001', name: 'Japanese (Female)', lang: 'ja' }
];

const FALLBACK_GEMINI_VOICES = [
  // Vietnamese Dedicated Google Cloud Voices
  { id: 'vi-VN-Neural2-A', name: 'Google Neural2 A (Nữ Studio cao cấp - VN)', lang: 'vi-VN' },
  { id: 'vi-VN-Neural2-D', name: 'Google Neural2 D (Nam Studio cao cấp - VN)', lang: 'vi-VN' },
  { id: 'vi-VN-Wavenet-A', name: 'Google WaveNet A (Nữ tự nhiên - VN)', lang: 'vi-VN' },
  { id: 'vi-VN-Wavenet-B', name: 'Google WaveNet B (Nam tự nhiên - VN)', lang: 'vi-VN' },
  { id: 'vi-VN-Wavenet-C', name: 'Google WaveNet C (Nữ truyền cảm - VN)', lang: 'vi-VN' },
  { id: 'vi-VN-Wavenet-D', name: 'Google WaveNet D (Nam trầm ấm - VN)', lang: 'vi-VN' },
  { id: 'gtts-vi', name: 'Google Voice VN (Chuẩn Google Tiếng Việt - Free)', lang: 'vi-VN' },

  // Gemini Multimodal Native Voices (Fluent in Vietnamese & English)
  { id: 'Aoede', name: 'Aoede (Nữ truyền cảm - VN / Global)', lang: 'vi/en' },
  { id: 'Kore', name: 'Kore (Nữ nhẹ nhàng kể chuyện - VN / Global)', lang: 'vi/en' },
  { id: 'Puck', name: 'Puck (Nam hoạt bát, sinh động - VN / Global)', lang: 'vi/en' },
  { id: 'Charon', name: 'Charon (Nam trầm ấm điện ảnh - VN / Global)', lang: 'vi/en' },
  { id: 'Fenrir', name: 'Fenrir (Nam hào hùng, lôi cuốn - VN / Global)', lang: 'vi/en' },

  // Google Journey / Neural2 US
  { id: 'en-US-Journey-F', name: 'Journey F (Natural Female)', lang: 'en-US' },
  { id: 'en-US-Journey-D', name: 'Journey D (Natural Male)', lang: 'en-US' }
];

const FALLBACK_EDGE_VOICES = [
  // Vietnamese Dedicated Voices (Top Quality & Expressive Styles)
  { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Việt Nam - Nữ dịu dàng miền Bắc)', lang: 'vi-VN', gender: 'Female' },
  { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Việt Nam - Nam truyền cảm miền Bắc)', lang: 'vi-VN', gender: 'Male' },
  { id: 'vi-VN-HoaiMyNeural-story', name: 'Hoài My Kể Chuyện (Việt Nam - Nữ êm đềm, chậm rãi)', lang: 'vi-VN', gender: 'Female' },
  { id: 'vi-VN-NamMinhNeural-story', name: 'Nam Minh Thuyết Minh (Việt Nam - Nam sâu lắng, ấm áp)', lang: 'vi-VN', gender: 'Male' },
  { id: 'vi-VN-HoaiMyNeural-energetic', name: 'Hoài My Hoạt Bát (Việt Nam - Nữ vui tươi, sinh động)', lang: 'vi-VN', gender: 'Female' },
  { id: 'vi-VN-NamMinhNeural-heroic', name: 'Nam Minh Khí Thế (Việt Nam - Nam mạnh mẽ, dứt khoát)', lang: 'vi-VN', gender: 'Male' },
  { id: 'gtts-vi', name: 'Google Voice VN (Việt Nam - Nữ chuẩn Google TTS)', lang: 'vi-VN', gender: 'Female' },

  // US English
  { id: 'en-US-JennyNeural', name: 'Jenny (US Female - Natural)', lang: 'en-US' },
  { id: 'en-US-GuyNeural', name: 'Guy (US Male - Natural)', lang: 'en-US' },
  { id: 'en-US-AriaNeural', name: 'Aria (US Female - Conversational)', lang: 'en-US' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher (US Male - Storyteller)', lang: 'en-US' },
  { id: 'en-US-EricNeural', name: 'Eric (US Male - Clear)', lang: 'en-US' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (UK Female)', lang: 'en-GB' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (UK Male)', lang: 'en-GB' }
];

export default function AiVoiceModal({
  isOpen,
  onClose,
  aiConfig,
  setAiConfig,
  engineType, // 'ai' | 'browser'
  setEngineType
}) {
  const [activeProvider, setActiveProvider] = useState(aiConfig.provider || 'edge');
  const [apiKey, setApiKey] = useState(aiConfig.apiKey || '');
  const [cookie, setCookie] = useState(aiConfig.cookie || '');
  const [geminiAuthMode, setGeminiAuthMode] = useState(aiConfig.geminiAuthMode || (aiConfig.cookie && !aiConfig.apiKey ? 'cookie' : 'api'));
  const [voice, setVoice] = useState(aiConfig.voice || 'en-US-JennyNeural');
  const [model, setModel] = useState(aiConfig.model || 'tts-1');
  const [endpoint, setEndpoint] = useState(aiConfig.endpoint || '');
  const [showKey, setShowKey] = useState(false);
  const [showCookie, setShowCookie] = useState(false);
  const [voicesCatalog, setVoicesCatalog] = useState({
    edge: FALLBACK_EDGE_VOICES,
    gemini: FALLBACK_GEMINI_VOICES,
    tiktok: FALLBACK_TIKTOK_VOICES,
    openai: [],
    elevenlabs: []
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load voice catalog from server
  useEffect(() => {
    fetch('/api/tts/voices')
      .then(res => res.json())
      .then(data => {
        if (data && data.edge) {
          setVoicesCatalog(prev => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch(err => console.warn('Could not load voice catalog', err));
  }, []);

  // Synchronize modal state whenever modal opens or aiConfig changes
  useEffect(() => {
    if (isOpen) {
      const p = aiConfig?.provider || 'edge';
      setActiveProvider(p);
      setApiKey(aiConfig?.apiKey || '');
      setCookie(aiConfig?.cookie || '');
      setGeminiAuthMode(aiConfig?.geminiAuthMode || (aiConfig?.cookie && !aiConfig?.apiKey ? 'cookie' : 'api'));
      setModel(aiConfig?.model || 'tts-1');
      setEndpoint(aiConfig?.endpoint || '');
      setTestError('');

      const rawVoice = aiConfig?.voice || '';
      if (p === 'tiktok') {
        const list = voicesCatalog.tiktok?.length ? voicesCatalog.tiktok : FALLBACK_TIKTOK_VOICES;
        const valid = list.some(v => v.id === rawVoice);
        setVoice(valid ? rawVoice : 'en_us_002');
      } else if (p === 'gemini') {
        const list = voicesCatalog.gemini?.length ? voicesCatalog.gemini : FALLBACK_GEMINI_VOICES;
        const valid = list.some(v => v.id === rawVoice);
        setVoice(valid ? rawVoice : 'vi-VN-Neural2-A');
      } else if (p === 'edge') {
        const list = voicesCatalog.edge?.length ? voicesCatalog.edge : FALLBACK_EDGE_VOICES;
        const valid = list.some(v => v.id === rawVoice);
        setVoice(valid ? rawVoice : 'vi-VN-HoaiMyNeural');
      } else if (p === 'openai') {
        const valid = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(rawVoice);
        setVoice(valid ? rawVoice : 'alloy');
      } else {
        setVoice(rawVoice || 'vi-VN-HoaiMyNeural');
      }
    }
  }, [isOpen, aiConfig, voicesCatalog]);

  // Ensure valid voice is selected whenever provider changes
  useEffect(() => {
    if (activeProvider === 'tiktok') {
      const tiktokList = voicesCatalog.tiktok?.length ? voicesCatalog.tiktok : FALLBACK_TIKTOK_VOICES;
      if (!tiktokList.some(v => v.id === voice)) {
        setVoice('en_us_002');
      }
    } else if (activeProvider === 'gemini') {
      const geminiList = voicesCatalog.gemini?.length ? voicesCatalog.gemini : FALLBACK_GEMINI_VOICES;
      if (!geminiList.some(v => v.id === voice)) {
        setVoice('vi-VN-Neural2-A');
      }
    } else if (activeProvider === 'edge') {
      const edgeList = voicesCatalog.edge?.length ? voicesCatalog.edge : FALLBACK_EDGE_VOICES;
      if (!edgeList.some(v => v.id === voice)) {
        setVoice('vi-VN-HoaiMyNeural');
      }
    } else if (activeProvider === 'openai') {
      if (!['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(voice)) {
        setVoice('alloy');
      }
    }
  }, [activeProvider, voice, voicesCatalog]);

  // Update voice default when switching provider
  const handleProviderChange = (newProvider) => {
    setActiveProvider(newProvider);
    if (newProvider === 'edge') {
      setVoice('vi-VN-HoaiMyNeural');
    } else if (newProvider === 'gemini') {
      setVoice('vi-VN-Neural2-A');
    } else if (newProvider === 'tiktok') {
      setVoice('en_us_002'); // Jessie
    } else if (newProvider === 'openai') {
      setVoice('alloy');
      setModel('tts-1');
    } else if (newProvider === 'elevenlabs') {
      setVoice('21m00Tcm4TlvDq8ikWAM');
      setModel('eleven_turbo_v2_5');
    }
  };

  // Helper to resolve a valid voice id for provider
  const resolveTargetVoice = () => {
    if (activeProvider === 'tiktok') {
      const list = voicesCatalog.tiktok?.length ? voicesCatalog.tiktok : FALLBACK_TIKTOK_VOICES;
      return list.some(v => v.id === voice) ? voice : 'en_us_002';
    }
    if (activeProvider === 'gemini') {
      const list = voicesCatalog.gemini?.length ? voicesCatalog.gemini : FALLBACK_GEMINI_VOICES;
      return list.some(v => v.id === voice) ? voice : 'vi-VN-Neural2-A';
    }
    if (activeProvider === 'edge') {
      const list = voicesCatalog.edge?.length ? voicesCatalog.edge : FALLBACK_EDGE_VOICES;
      return list.some(v => v.id === voice) ? voice : 'vi-VN-HoaiMyNeural';
    }
    if (activeProvider === 'openai') {
      return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(voice) ? voice : 'alloy';
    }
    return voice || 'vi-VN-HoaiMyNeural';
  };

  // Test current configuration with a sample audio greeting
  const handleTestVoice = async () => {
    setIsTesting(true);
    setTestError('');

    const targetVoice = resolveTargetVoice();
    const isVnVoice = targetVoice.startsWith('vi-') || targetVoice.includes('HoaiMy') || targetVoice.includes('NamMinh') || targetVoice === 'gtts-vi';
    const testText = isVnVoice
      ? 'Xin chào! Đây là đoạn âm thanh thử nghiệm của giọng đọc tiếng Việt.'
      : 'Hello! This is a test of your selected AI voice. Everything is working.';

    try {
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          provider: activeProvider,
          config: {
            apiKey: apiKey.trim(),
            cookie: cookie.trim(),
            geminiAuthMode,
            voice: targetVoice,
            model,
            endpoint: endpoint.trim(),
            speed: 1.0,
            isTesting: true
          }
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Synthesis failed (HTTP ${response.status})`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsTesting(false);
      audio.onerror = () => {
        setIsTesting(false);
        setTestError('Failed to play synthesized audio preview.');
      };
      await audio.play();
    } catch (err) {
      setIsTesting(false);
      setTestError(err.message || 'Error synthesizing test audio.');
    }
  };

  // Save configuration
  const handleSave = () => {
    const targetVoice = resolveTargetVoice();

    setAiConfig({
      provider: activeProvider,
      geminiAuthMode,
      apiKey: apiKey.trim(),
      cookie: cookie.trim(),
      voice: targetVoice,
      model,
      endpoint: endpoint.trim()
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  const providers = [
    { id: 'edge', name: 'Edge Neural', badge: 'Free', icon: Zap },
    { id: 'gemini', name: 'Google Gemini', badge: 'API / Cookie', icon: Sparkles },
    { id: 'tiktok', name: 'TikTok', badge: 'Cookie', icon: Music },
    { id: 'openai', name: 'OpenAI', badge: 'API Key', icon: Bot },
    { id: 'elevenlabs', name: 'ElevenLabs', badge: 'Key/Cookie', icon: Volume2 },
    { id: 'custom', name: 'Custom AI', badge: 'Webhook', icon: Globe }
  ];

  const currentTiktokVoices = voicesCatalog.tiktok?.length ? voicesCatalog.tiktok : FALLBACK_TIKTOK_VOICES;
  const currentGeminiVoices = voicesCatalog.gemini?.length ? voicesCatalog.gemini : FALLBACK_GEMINI_VOICES;
  const currentEdgeVoices = voicesCatalog.edge?.length ? voicesCatalog.edge : FALLBACK_EDGE_VOICES;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                AI Voice & API Settings
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Google Gemini, TikTok, Edge Neural, OpenAI & ElevenLabs
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Engine Switcher: AI Neural vs Browser Speech */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
            Active Speech Engine
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => setEngineType('ai')}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: engineType === 'ai' ? '2px solid #a855f7' : '1px solid var(--border-color)',
                backgroundColor: engineType === 'ai' ? 'rgba(168, 85, 247, 0.08)' : 'var(--bg-app)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left'
              }}
            >
              <Cpu size={20} color={engineType === 'ai' ? '#a855f7' : 'var(--text-muted)'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>AI Neural Voices</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gemini, TikTok, Edge, OpenAI</div>
              </div>
            </button>

            <button
              onClick={() => setEngineType('browser')}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: engineType === 'browser' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                backgroundColor: engineType === 'browser' ? 'var(--primary-light)' : 'var(--bg-app)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left'
              }}
            >
              <Bot size={20} color={engineType === 'browser' ? 'var(--primary-color)' : 'var(--text-muted)'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Browser Voices</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Local offline speech</div>
              </div>
            </button>
          </div>
        </div>

        {/* Provider Tabs */}
        {engineType === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
                Select AI Voice Provider
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {providers.map(p => {
                  const Icon = p.icon;
                  const isSelected = activeProvider === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => handleProviderChange(p.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #a855f7' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'var(--bg-app)',
                        color: 'var(--text-main)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Icon size={14} color={isSelected ? '#a855f7' : 'var(--text-muted)'} />
                        <span>{p.name}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Configuration Forms */}

            {/* 1. GOOGLE GEMINI */}
            {activeProvider === 'gemini' && (
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  ✨ <strong>Google Gemini Speech:</strong> Connect using your free <strong>Google AI Studio API Key</strong> or your <strong>Gemini Web Cookie</strong> (<code>__Secure-1PSID</code> from <code>gemini.google.com</code>).
                </div>

                {/* Gemini Auth Method Switcher */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
                    Gemini Connection Mode
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setGeminiAuthMode('api')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: geminiAuthMode === 'api' ? '2px solid #a855f7' : '1px solid var(--border-color)',
                        backgroundColor: geminiAuthMode === 'api' ? 'rgba(168, 85, 247, 0.12)' : 'var(--bg-card)',
                        color: geminiAuthMode === 'api' ? '#a855f7' : 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Key size={13} />
                      <span>API Key (AI Studio)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGeminiAuthMode('cookie')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: geminiAuthMode === 'cookie' ? '2px solid #a855f7' : '1px solid var(--border-color)',
                        backgroundColor: geminiAuthMode === 'cookie' ? 'rgba(168, 85, 247, 0.12)' : 'var(--bg-card)',
                        color: geminiAuthMode === 'cookie' ? '#a855f7' : 'var(--text-main)',
                        fontWeight: 600,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Cookie size={13} />
                      <span>Cookie (__Secure-1PSID)</span>
                    </button>
                  </div>
                </div>

                {/* API Key Form */}
                {geminiAuthMode === 'api' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                      Google Gemini API Key
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <input
                        type={showKey ? 'text' : 'password'}
                        placeholder="AIzaSy..."
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '13px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }}
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                      Get a free key instantly from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#a855f7' }}>Google AI Studio</a>.
                    </span>
                  </div>
                )}

                {/* Web Cookie Form */}
                {geminiAuthMode === 'cookie' && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                      Gemini <code>__Secure-1PSID</code> Cookie
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <input
                        type={showCookie ? 'text' : 'password'}
                        placeholder="Paste __Secure-1PSID cookie string (e.g. g.a000...)"
                        value={cookie}
                        onChange={e => setCookie(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '13px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCookie(!showCookie)}
                        style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }}
                      >
                        {showCookie ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                      Extract <code>__Secure-1PSID</code> from browser devtools (Application &gt; Cookies &gt; gemini.google.com).
                    </span>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    Gemini Voice
                  </label>
                  <select
                    value={voice}
                    onChange={e => setVoice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  >
                    <optgroup label="🇻🇳 Tiếng Việt (Vietnamese)">
                      {currentGeminiVoices.filter(v => v.lang?.startsWith('vi') || v.id === 'gtts-vi').map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="🌐 English & Multilingual (Hỗ trợ đọc tiếng Việt)">
                      {currentGeminiVoices.filter(v => !v.lang?.startsWith('vi') && v.id !== 'gtts-vi').map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            )}

            {/* 2. TIKTOK TTS (COOKIE-BASED) */}
            {activeProvider === 'tiktok' && (
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  🎵 <strong>TikTok Viral Voices:</strong> Access classic TikTok narrator voices (Jessie, Professor, Storyteller, Ghostface, C-3PO, and Stitch) using your session cookie.
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    TikTok <code>sessionid</code> Cookie
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <input
                      type={showCookie ? 'text' : 'password'}
                      placeholder="Paste sessionid cookie string (e.g. 74812a...)"
                      value={cookie}
                      onChange={e => setCookie(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCookie(!showCookie)}
                      style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }}
                    >
                      {showCookie ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                    Extract <code>sessionid</code> from browser devtools (Application &gt; Cookies &gt; tiktok.com).
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    TikTok Voice
                  </label>
                  <select
                    value={voice}
                    onChange={e => setVoice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  >
                    {currentTiktokVoices.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.lang})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 3. EDGE NEURAL (FREE) */}
            {activeProvider === 'edge' && (
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  🎉 <strong>Free Azure Neural Voices:</strong> Powered by Microsoft Edge Read Aloud. No API keys or registration required.
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Select Voice</label>
                  <select
                    value={voice}
                    onChange={e => setVoice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  >
                    <optgroup label="🇻🇳 Tiếng Việt (Miễn phí 100% & Không giới hạn)">
                      {currentEdgeVoices.filter(v => v.lang?.startsWith('vi') || v.id === 'gtts-vi').map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌐 English & Multilingual">
                      {currentEdgeVoices.filter(v => !v.lang?.startsWith('vi') && v.id !== 'gtts-vi').map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            )}

            {/* 4. OPENAI TTS */}
            {activeProvider === 'openai' && (
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>OpenAI API Key</label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-proj-..."
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Voice</label>
                    <select
                      value={voice}
                      onChange={e => setVoice(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '13px'
                      }}
                    >
                      {(voicesCatalog.openai || []).map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Model</label>
                    <select
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '13px'
                      }}
                    >
                      <option value="tts-1">tts-1 (Fast & Crisp)</option>
                      <option value="tts-1-hd">tts-1-hd (High Definition)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 5. ELEVENLABS */}
            {activeProvider === 'elevenlabs' && (
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    ElevenLabs API Key
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="xi-api-key..."
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    Optional Cookie String
                  </label>
                  <input
                    type="text"
                    placeholder="session=..."
                    value={cookie}
                    onChange={e => setCookie(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    Voice ID
                  </label>
                  <select
                    value={voice}
                    onChange={e => setVoice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  >
                    {(voicesCatalog.elevenlabs || []).map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 6. CUSTOM ENDPOINT & COOKIE */}
            {activeProvider === 'custom' && (
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    API Endpoint URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://api.yourtts.com/v1/audio/speech"
                    value={endpoint}
                    onChange={e => setEndpoint(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    Cookie Header String (e.g. sessionid=...)
                  </label>
                  <input
                    type="text"
                    placeholder="sessionid=abc123xyz; token=..."
                    value={cookie}
                    onChange={e => setCookie(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                    Optional Bearer API Key
                  </label>
                  <input
                    type="text"
                    placeholder="Bearer token (optional)"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Test Error Message */}
            {testError && (
              <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#dc2626', fontSize: '13px', lineHeight: 1.4 }}>
                <div style={{ fontWeight: 600, marginBottom: '3px' }}>Synthesis Notice:</div>
                <div>{testError}</div>
                {activeProvider === 'gemini' && (
                  <button
                    type="button"
                    onClick={() => handleProviderChange('edge')}
                    style={{ marginTop: '8px', padding: '5px 12px', borderRadius: '6px', backgroundColor: '#dc2626', color: '#fff', fontSize: '12px', fontWeight: 600 }}
                  >
                    Switch to Edge Neural (100% Free & No Quota)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
          {engineType === 'ai' ? (
            <button
              type="button"
              onClick={handleTestVoice}
              disabled={isTesting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                opacity: isTesting ? 0.7 : 1
              }}
            >
              <Volume2 size={16} color="#a855f7" />
              <span>{isTesting ? 'Synthesizing...' : 'Test Voice Audio'}</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                borderRadius: '10px',
                backgroundColor: savedSuccess ? '#10b981' : '#a855f7',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'background-color 0.2s ease'
              }}
            >
              {savedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
