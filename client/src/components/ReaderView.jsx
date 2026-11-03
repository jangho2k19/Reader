import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Sliders,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  Clock,
  Headphones,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Star,
  X,
  Sparkles
} from 'lucide-react';
import AudioPlayerDock from './AudioPlayerDock';

export default function ReaderView({
  article,
  onBack,
  onOpenAppearance,
  onOpenAiSettings,
  theme,
  fontFamily,
  fontSize,
  lineHeight,
  maxWidth,
  textAlign,
  autoScroll,
  bionicReading,
  engineType,
  aiConfig,
  tts,
  onSaveProgress
}) {
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [savedHighlights, setSavedHighlights] = useState(() => {
    return article.highlights || [];
  });
  const [showHighlightsDrawer, setShowHighlightsDrawer] = useState(false);

  const sentenceRefs = useRef({});

  const {
    currentSentenceIndex,
    activeWordCharIndex,
    jumpToSentence,
    isPlaying,
    isPaused
  } = tts;

  // Track and notify reading progress
  useEffect(() => {
    if (onSaveProgress && currentSentenceIndex >= 0) {
      onSaveProgress(article.id, currentSentenceIndex, savedHighlights);
    }
  }, [currentSentenceIndex, savedHighlights, article.id, onSaveProgress]);

  // Track window scroll progress for top progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll to currently spoken sentence when it changes
  useEffect(() => {
    if (!autoScroll || !isPlaying) return;

    const activeEl = sentenceRefs.current[currentSentenceIndex];
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentSentenceIndex, autoScroll, isPlaying]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        tts.togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        tts.skipNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        tts.skipPrev();
      } else if (e.code === 'Escape') {
        tts.stop();
        setShowHighlightsDrawer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tts]);

  // Toggle highlight / star for a sentence
  const toggleHighlight = (e, sent) => {
    e.stopPropagation();
    setSavedHighlights(prev => {
      const exists = prev.some(h => h.id === sent.id);
      if (exists) {
        return prev.filter(h => h.id !== sent.id);
      } else {
        return [...prev, { id: sent.id, text: sent.text, timestamp: new Date().toISOString() }];
      }
    });
  };

  // Copy full article plain text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(article.textContent || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Download as Markdown or TXT
  const handleDownload = (format = 'md') => {
    const title = article.title || 'article';
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)}.${format}`;

    let content = '';
    if (format === 'md') {
      content = `# ${article.title}\n\n`;
      if (article.byline) content += `**Author:** ${article.byline}\n`;
      if (article.url) content += `**Source:** ${article.url}\n\n`;
      if (savedHighlights.length > 0) {
        content += `### Key Highlights\n` + savedHighlights.map(h => `> ${h.text}\n`).join('\n') + `\n---\n\n`;
      }
      content += article.textContent + '\n';
    } else {
      content = `${article.title}\n${'='.repeat(article.title.length)}\n\n`;
      if (article.byline) content += `Author: ${article.byline}\n`;
      if (article.url) content += `Source: ${article.url}\n\n`;
      content += article.textContent;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format a word for Bionic Reading
  const formatBionicWord = (word) => {
    if (!word || word.trim().length <= 1) return word;
    const match = word.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9]+)([^a-zA-Z0-9]*)$/);
    if (!match) return word;

    const [, prefix, core, suffix] = match;
    const fixLength = Math.max(1, Math.ceil(core.length * 0.45));
    const boldPart = core.slice(0, fixLength);
    const normalPart = core.slice(fixLength);

    return (
      <>
        {prefix}
        <strong>{boldPart}</strong>
        {normalPart}
        {suffix}
      </>
    );
  };

  // Render sentence with word-level highlight or Bionic Reading
  const renderSentence = (sent) => {
    if (!sent) return null;
    const isActive = sent.id === currentSentenceIndex;
    const isHighlighted = (savedHighlights || []).some(h => h.id === sent.id);

    // If active and we have charIndex, split into words for precise word glow
    if (isActive && typeof activeWordCharIndex === 'number' && sent.text) {
      const words = sent.text.split(/(\s+)/);
      let cumulativeChar = 0;

      return (
        <span
          key={sent.id}
          ref={el => (sentenceRefs.current[sent.id] = el)}
          className={`reader-sentence ${isActive ? 'is-active' : ''} ${isHighlighted ? 'is-bookmarked' : ''}`}
          onClick={() => jumpToSentence(sent.id, true)}
          style={{
            backgroundColor: isHighlighted && !isActive ? 'rgba(250, 204, 21, 0.25)' : undefined,
            borderBottom: isHighlighted ? '2px solid #facc15' : undefined
          }}
          title="Click to listen from this sentence"
        >
          {words.map((word, wIdx) => {
            const startChar = cumulativeChar;
            cumulativeChar += word.length;
            const isWordActive = activeWordCharIndex >= startChar && activeWordCharIndex < cumulativeChar;

            return (
              <span
                key={wIdx}
                className={`reader-word ${isWordActive ? 'is-word-active' : ''}`}
              >
                {bionicReading && !isWordActive ? formatBionicWord(word) : word}
              </span>
            );
          })}{' '}
        </span>
      );
    }

    // Default or Bionic sentence rendering
    if (bionicReading && sent.text) {
      const words = sent.text.split(/(\s+)/);
      return (
        <span
          key={sent.id}
          ref={el => (sentenceRefs.current[sent.id] = el)}
          className={`reader-sentence ${isActive ? 'is-active' : ''}`}
          onClick={() => jumpToSentence(sent.id, true)}
          style={{
            backgroundColor: isHighlighted ? 'rgba(250, 204, 21, 0.25)' : undefined,
            borderBottom: isHighlighted ? '2px solid #facc15' : undefined
          }}
          title="Click to listen from this sentence"
        >
          {words.map((word, wIdx) => (
            <React.Fragment key={wIdx}>
              {formatBionicWord(word)}
            </React.Fragment>
          ))}{' '}
        </span>
      );
    }

    return (
      <span
        key={sent.id}
        ref={el => (sentenceRefs.current[sent.id] = el)}
        className={`reader-sentence ${isActive ? 'is-active' : ''}`}
        onClick={() => jumpToSentence(sent.id, true)}
        style={{
          backgroundColor: isHighlighted ? 'rgba(250, 204, 21, 0.25)' : undefined,
          borderBottom: isHighlighted ? '2px solid #facc15' : undefined
        }}
        title="Click to listen from this sentence"
      >
        {sent.text}{' '}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '140px' }}>
      {/* Top Reading Progress Bar */}
      <div className="reading-progress-track">
        <div className="reading-progress-fill" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Floating / Sticky Navigation Header */}
      <header
        className="glass-panel"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        {/* Left: Back button & source tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 500
            }}
            title="Return to input"
          >
            <ArrowLeft size={16} />
            <span>Library / New</span>
          </button>

          {article.domain && (
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {article.domain}
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center' }}
                  title="Open original webpage"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Highlights drawer button */}
          <button
            onClick={() => setShowHighlightsDrawer(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: savedHighlights.length > 0 ? 'rgba(250, 204, 21, 0.2)' : 'var(--bg-hover)',
              color: savedHighlights.length > 0 ? '#b45309' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 600
            }}
            title="View saved highlights & key quotes"
          >
            <Star size={14} fill={savedHighlights.length > 0 ? '#f59e0b' : 'none'} color="#f59e0b" />
            <span>Highlights ({savedHighlights.length})</span>
          </button>

          {/* Copy Plain Text */}
          <button
            onClick={handleCopyText}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-hover)',
              color: copied ? '#10b981' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 500
            }}
            title="Copy plain text"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download Markdown */}
          <button
            onClick={() => handleDownload('md')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 500
            }}
            title="Download clean Markdown"
          >
            <Download size={14} />
            <span className="hidden-sm">Export .md</span>
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-muted)',
              fontSize: '12px'
            }}
            title="Print or Save as PDF"
          >
            <Printer size={14} />
          </button>

          {/* AI Voice Settings */}
          <button
            onClick={onOpenAiSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              color: '#a855f7',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid rgba(168, 85, 247, 0.25)'
            }}
            title="Configure Gemini, TikTok, Edge, OpenAI, or ElevenLabs voices"
          >
            <Sparkles size={14} />
            <span>AI Voices</span>
          </button>

          {/* Appearance Settings */}
          <button
            onClick={onOpenAppearance}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              fontSize: '13px',
              fontWeight: 600
            }}
            title="Customize themes and typography"
          >
            <Sliders size={15} />
            <span>Customize</span>
          </button>
        </div>
      </header>

      {/* Highlights Side Drawer */}
      {showHighlightsDrawer && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            right: '20px',
            width: '360px',
            maxHeight: 'calc(100vh - 180px)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 140,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>Saved Highlights ({savedHighlights.length})</span>
            </div>
            <button onClick={() => setShowHighlightsDrawer(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: '14px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {savedHighlights.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Bookmark size={24} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                Click on any sentence in the article and click the star to save memorable quotes here!
              </div>
            ) : (
              savedHighlights.map(h => (
                <div
                  key={h.id}
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    borderLeft: '3px solid #facc15',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    jumpToSentence(h.id, true);
                    setShowHighlightsDrawer(false);
                  }}
                  title="Jump to this quote"
                >
                  <p style={{ margin: 0 }}>"{h.text}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Article Content Container */}
      <main
        style={{
          width: '100%',
          maxWidth: `${maxWidth}px`,
          margin: '0 auto',
          padding: '40px 24px 80px',
          flex: 1
        }}
      >
        {/* Article Meta Header */}
        <div style={{ marginBottom: '36px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: 1.25,
              color: 'var(--text-main)',
              marginBottom: '16px',
              fontFamily: fontFamily === 'serif' ? 'Merriweather, serif' : 'inherit'
            }}
          >
            {article.title || 'Untitled Article'}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '16px',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}
          >
            {article.byline && (
              <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                By {article.byline}
              </span>
            )}
            {article.siteName && (
              <span>• {article.siteName}</span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} />
              <span>{article.estimatedReadingTime} min read</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Headphones size={13} />
              <span>{article.estimatedListeningTime} min audio</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={13} />
              <span>{article.wordCount} words</span>
            </div>
          </div>
        </div>

        {/* Cover Image if available */}
        {article.coverImage && (
          <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden', maxHeight: '420px' }}>
            <img
              src={article.coverImage}
              alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Article Body with Sentences */}
        <article
          className={`font-${fontFamily}`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            textAlign: textAlign,
            color: 'var(--text-main)'
          }}
        >
          {article.paragraphs && article.paragraphs.length > 0 ? (
            article.paragraphs.map((para, pIdx) => (
              <p
                key={pIdx}
                style={{
                  marginBottom: `${fontSize * 1.1}px`
                }}
              >
                {para.sentences && para.sentences.length > 0
                  ? para.sentences.map(sent => renderSentence(sent))
                  : para.rawText}
              </p>
            ))
          ) : (
            <p>{article.textContent}</p>
          )}
        </article>
      </main>

      {/* Persistent Audio Player Dock */}
      <AudioPlayerDock
        tts={tts}
        totalSentences={article.sentences ? article.sentences.length : 0}
        currentSentenceIndex={currentSentenceIndex}
        onSeekSentence={(idx) => jumpToSentence(idx, isPlaying && !isPaused)}
        engineType={engineType}
        aiConfig={aiConfig}
        onOpenAiSettings={onOpenAiSettings}
      />
    </div>
  );
}
