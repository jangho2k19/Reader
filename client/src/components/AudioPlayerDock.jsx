import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  Sliders,
  ChevronUp,
  Gauge,
  Search,
  Sparkles,
  Loader2,
  Zap,
  Music,
  Bot
} from 'lucide-react';

export default function AudioPlayerDock({
  tts,
  totalSentences,
  currentSentenceIndex,
  onSeekSentence,
  engineType = 'ai',
  aiConfig = {},
  onOpenAiSettings
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceList, setShowVoiceList] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState('');

  const {
    voices = [],
    selectedVoiceURI = '',
    setSelectedVoiceURI = () => {},
    rate = 1.0,
    setRate = () => {},
    pitch = 1.0,
    setPitch = () => {},
    volume = 1.0,
    setVolume = () => {},
    isPlaying = false,
    isPaused = false,
    isLoadingAudio = false,
    audioError = null,
    clearAudioError = () => {},
    togglePlayPause = () => {},
    stop = () => {},
    skipNext = () => {},
    skipPrev = () => {},
    replayCurrent = () => {}
  } = tts || {};

  const rates = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const cycleRate = () => {
    const currentIndex = rates.indexOf(rate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setRate(rates[nextIndex]);
  };

  const safeVoices = Array.isArray(voices) ? voices : [];
  const selectedVoice = safeVoices.find(v => v?.voiceURI === selectedVoiceURI);
  const percentComplete = totalSentences > 0 ? Math.round(((Math.max(0, currentSentenceIndex) + 1) / totalSentences) * 100) : 0;

  // Filter voices for browser engine
  const filteredVoices = useMemo(() => {
    return safeVoices.filter(v => {
      if (!v || !v.name) return false;
      if (!voiceSearch.trim()) return true;
      const q = voiceSearch.toLowerCase();
      return v.name.toLowerCase().includes(q) || (v.lang && v.lang.toLowerCase().includes(q));
    });
  }, [safeVoices, voiceSearch]);

  // AI Voice Label formatting
  const getAiVoiceLabel = () => {
    const provider = aiConfig?.provider || 'edge';
    const rawVoice = typeof aiConfig?.voice === 'string' ? aiConfig.voice : '';

    if (provider === 'gemini') {
      const mode = aiConfig?.geminiAuthMode === 'cookie' ? ' (Cookie)' : '';
      let gVoice = rawVoice || 'Puck';
      if (gVoice === 'gtts-vi') gVoice = 'Google Voice VN';
      else if (gVoice.startsWith('vi-VN-Neural2-A')) gVoice = 'Neural2 A (Nữ VN)';
      else if (gVoice.startsWith('vi-VN-Neural2-D')) gVoice = 'Neural2 D (Nam VN)';
      else if (gVoice.startsWith('vi-VN-Wavenet-A')) gVoice = 'WaveNet A (Nữ VN)';
      else if (gVoice.startsWith('vi-VN-Wavenet-B')) gVoice = 'WaveNet B (Nam VN)';
      return { label: `Gemini: ${gVoice}${mode}`, icon: Sparkles, color: '#a855f7' };
    }
    if (provider === 'tiktok') {
      const cleanName = rawVoice.replace(/^en_us_/, '').replace(/^en_/, '');
      return { label: `TikTok: ${cleanName || 'Jessie'}`, icon: Music, color: '#ec4899' };
    }
    if (provider === 'openai') {
      return { label: `OpenAI: ${rawVoice || 'Alloy'}`, icon: Bot, color: '#10b981' };
    }
    if (provider === 'elevenlabs') {
      return { label: 'ElevenLabs', icon: Volume2, color: '#f59e0b' };
    }
    if (provider === 'custom') {
      return { label: 'Custom AI', icon: Sparkles, color: '#6366f1' };
    }

    // Edge voices
    if (rawVoice.startsWith('vi-') || rawVoice.includes('HoaiMy') || rawVoice.includes('NamMinh') || rawVoice === 'gtts-vi') {
      let vnLabel = 'Hoài My (VN)';
      if (rawVoice === 'gtts-vi') vnLabel = 'Google Voice VN';
      else if (rawVoice.includes('HoaiMyNeural-story')) vnLabel = 'Hoài My Kể Chuyện';
      else if (rawVoice.includes('NamMinhNeural-story')) vnLabel = 'Nam Minh Thuyết Minh';
      else if (rawVoice.includes('HoaiMyNeural-energetic')) vnLabel = 'Hoài My Hoạt Bát';
      else if (rawVoice.includes('NamMinhNeural-heroic')) vnLabel = 'Nam Minh Khí Thế';
      else if (rawVoice.includes('NamMinh')) vnLabel = 'Nam Minh (VN)';
      return {
        label: `Edge: ${vnLabel}`,
        icon: Zap,
        color: '#10b981'
      };
    }

    const cleanEdge = rawVoice.replace(/^en-US-/, '').replace(/Neural$/, '');
    return {
      label: `Edge: ${cleanEdge || 'Jenny'}`,
      icon: Zap,
      color: '#3b82f6'
    };
  };

  const aiVoiceInfo = getAiVoiceLabel();
  const AiIcon = aiVoiceInfo.icon;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '94%',
        maxWidth: '850px',
        zIndex: 150
      }}
    >
      {/* Audio Error Alert Banner */}
      {audioError && (
        <div
          style={{
            marginBottom: '10px',
            borderRadius: '12px',
            padding: '10px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.95)',
            border: '1px solid #dc2626',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span>{audioError}</span>
          </div>
          <button
            onClick={() => {
              clearAudioError();
              onOpenAiSettings();
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Change Voice
          </button>
        </div>
      )}

      {/* Audio Settings Panel (Expanded Popover) */}
      {showSettings && (
        <div
          className="glass-panel"
          style={{
            marginBottom: '10px',
            borderRadius: '16px',
            padding: '18px 24px',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
              Playback & Voice Tuning
            </span>
            <button
              onClick={() => setShowSettings(false)}
              style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 500 }}
            >
              Done
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Speed slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Reading Speed ({rate}x)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.25"
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-color)' }}
              />
            </div>

            {/* Volume slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Volume ({Math.round(volume * 100)}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-color)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Browser Voice Drawer (if in browser mode) */}
      {showVoiceList && engineType === 'browser' && (
        <div
          className="glass-panel"
          style={{
            marginBottom: '10px',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Select System Voice ({voices.length} detected)
            </span>
            <button
              onClick={() => setShowVoiceList(false)}
              style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 500 }}
            >
              Close
            </button>
          </div>

          {/* Voice Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              padding: '6px 10px'
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter by name or language (e.g. natural, en-US)..."
              value={voiceSearch}
              onChange={e => setVoiceSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '12px',
                color: 'var(--text-main)',
                width: '100%'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
            {filteredVoices.map(v => {
              const isSelected = selectedVoiceURI === v.voiceURI;
              const isNatural = v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online');

              return (
                <button
                  key={v.voiceURI}
                  onClick={() => {
                    setSelectedVoiceURI(v.voiceURI);
                    setShowVoiceList(false);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                    color: isSelected ? 'var(--primary-color)' : 'var(--text-main)',
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: '13px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isNatural && <Sparkles size={12} color="#f59e0b" title="Enhanced Natural Voice" />}
                    <span>{v.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '4px' }}>
                    {v.lang}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Glass Control Dock */}
      <div
        className="glass-panel"
        style={{
          borderRadius: '20px',
          padding: '12px 20px',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Scrubber track and sentence status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="range"
            min="0"
            max={Math.max(0, totalSentences - 1)}
            value={currentSentenceIndex}
            onChange={e => onSeekSentence(Number(e.target.value))}
            style={{
              flex: 1,
              height: '5px',
              accentColor: 'var(--primary-color)',
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
              {totalSentences > 0 ? `${currentSentenceIndex + 1}/${totalSentences}` : '0/0'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '6px' }}>
              {percentComplete}%
            </span>
          </div>
        </div>

        {/* Buttons Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {/* Left: Active Voice Badge / Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {engineType === 'ai' ? (
              <button
                onClick={onOpenAiSettings}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  color: aiVoiceInfo.color,
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  fontSize: '12px',
                  fontWeight: 600,
                  maxWidth: '220px'
                }}
                title="Click to configure Gemini, TikTok, Edge, OpenAI, or ElevenLabs settings"
              >
                <AiIcon size={14} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {aiVoiceInfo.label}
                </span>
                <span style={{ fontSize: '10px', color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                  AI
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowVoiceList(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 500,
                  maxWidth: '180px'
                }}
                title="Change Browser Voice"
              >
                <Volume2 size={14} color="var(--primary-color)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedVoice ? selectedVoice.name.replace(/Microsoft |Google |Apple /, '') : 'Default Voice'}
                </span>
                <ChevronUp size={12} style={{ transform: showVoiceList ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>
            )}

            {/* Quick Speed Cycle Button */}
            <button
              onClick={cycleRate}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Click to cycle playback speed"
            >
              <Gauge size={13} />
              {rate}x
            </button>
          </div>

          {/* Central Transport Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Replay */}
            <button
              onClick={replayCurrent}
              style={{
                padding: '8px',
                borderRadius: '50%',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Replay sentence"
            >
              <RotateCcw size={15} />
            </button>

            {/* Prev Sentence */}
            <button
              onClick={skipPrev}
              disabled={currentSentenceIndex <= 0}
              style={{
                padding: '8px',
                borderRadius: '50%',
                color: currentSentenceIndex <= 0 ? 'var(--text-dim)' : 'var(--text-main)',
                backgroundColor: 'var(--bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentSentenceIndex <= 0 ? 'default' : 'pointer'
              }}
              title="Previous sentence [← Left Arrow]"
            >
              <SkipBack size={17} />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={togglePlayPause}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: engineType === 'ai' ? '#a855f7' : 'var(--primary-color)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: engineType === 'ai' ? '0 4px 14px rgba(168, 85, 247, 0.45)' : '0 4px 12px rgba(59, 130, 246, 0.4)',
                transform: isPlaying && !isPaused ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s ease'
              }}
              title={isPlaying && !isPaused ? 'Pause [Space]' : 'Play [Space]'}
            >
              {isLoadingAudio ? (
                <Loader2 size={22} className="animate-spin" />
              ) : isPlaying && !isPaused ? (
                <Pause size={22} />
              ) : (
                <Play size={22} style={{ marginLeft: '2px' }} />
              )}
            </button>

            {/* Next Sentence */}
            <button
              onClick={skipNext}
              disabled={currentSentenceIndex >= totalSentences - 1}
              style={{
                padding: '8px',
                borderRadius: '50%',
                color: currentSentenceIndex >= totalSentences - 1 ? 'var(--text-dim)' : 'var(--text-main)',
                backgroundColor: 'var(--bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentSentenceIndex >= totalSentences - 1 ? 'default' : 'pointer'
              }}
              title="Next sentence [→ Right Arrow]"
            >
              <SkipForward size={17} />
            </button>

            {/* Stop Button */}
            <button
              onClick={stop}
              style={{
                padding: '8px',
                borderRadius: '50%',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Stop [Esc]"
            >
              <Square size={15} />
            </button>
          </div>

          {/* Right Extras */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* AI Voices Button */}
            <button
              onClick={onOpenAiSettings}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                color: '#a855f7',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}
              title="Switch or configure AI Voices (Gemini, TikTok, Edge, OpenAI, ElevenLabs)"
            >
              <Sparkles size={13} />
              <span>AI Voices</span>
            </button>

            {/* Tuning Settings */}
            <button
              onClick={() => setShowSettings(prev => !prev)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: showSettings ? 'var(--primary-light)' : 'var(--bg-hover)',
                color: showSettings ? 'var(--primary-color)' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Audio tuning (speed, volume)"
            >
              <Sliders size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
