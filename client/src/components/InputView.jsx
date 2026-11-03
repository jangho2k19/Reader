import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  FileText,
  Upload,
  Bookmark,
  Sparkles,
  Link2,
  ArrowRight,
  Trash2,
  Clock,
  BookOpen,
  Search,
  ExternalLink,
  Sliders,
  Check,
  ClipboardPaste,
  AlertCircle,
  PlayCircle,
  FileUp
} from 'lucide-react';

export default function InputView({
  onLoadArticle,
  onOpenAppearance,
  onOpenAiSettings,
  savedArticles = [],
  onDeleteSaved,
  onClearLibrary,
  engineType = 'ai',
  aiConfig = {}
}) {
  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'text' | 'file' | 'library'
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sampleArticles, setSampleArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch samples from server on mount
  useEffect(() => {
    fetch('/api/sample-articles')
      .then(res => res.json())
      .then(data => {
        if (data.samples) setSampleArticles(data.samples);
      })
      .catch(err => console.warn('Could not load samples', err));
  }, []);

  // Handle URL Extract submission
  const handleUrlSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setErrorMessage('Please enter a valid website URL or link.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract article content.');
      }

      onLoadArticle(data.data);
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred while fetching the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Raw Text Submission
  const handleTextSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) {
      setErrorMessage('Please paste or enter some text to read.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textInput,
          title: titleInput.trim() || 'Custom Document'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process text.');
      }

      onLoadArticle(data.data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process text.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process File Upload (.txt, .md)
  const handleFileProcess = async (file) => {
    if (!file) return;

    const validExtensions = ['.txt', '.md', '.markdown'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMessage('Please upload a plain text (.txt) or Markdown (.md) document.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const fileText = await file.text();
      if (!fileText.trim()) {
        throw new Error('The selected file appears to be empty.');
      }

      // Format document title from filename without extension
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fileText,
          title: cleanTitle
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process document text.');
      }

      onLoadArticle(data.data);
    } catch (err) {
      setErrorMessage(err.message || 'Error reading uploaded file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sample Article Click
  const handleLoadSample = async (sample) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sample.text,
          title: sample.title
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error('Failed to load sample article.');
      }

      const article = {
        ...data.data,
        byline: sample.byline,
        siteName: sample.siteName
      };

      onLoadArticle(article);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (text.startsWith('http://') || text.startsWith('https://')) {
          setUrlInput(text);
          setActiveTab('url');
        } else {
          setTextInput(text);
          setActiveTab('text');
        }
      }
    } catch (err) {
      console.warn('Clipboard read error', err);
    }
  };

  // Filter saved library
  const filteredLibrary = savedArticles.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.siteName && item.siteName.toLowerCase().includes(q)) ||
      (item.domain && item.domain.toLowerCase().includes(q))
    );
  });

  const wordCount = textInput.split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '40px 20px 80px', width: '100%' }}>
      {/* Top Brand Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Reader & Voice Studio
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Distraction-free web reader & synchronized natural speech
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenAiSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              color: '#a855f7',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}
            title="Configure Gemini, TikTok, Edge, OpenAI, or ElevenLabs voices"
          >
            <Sparkles size={15} />
            <span>AI Voices ({aiConfig?.provider ? aiConfig.provider.toUpperCase() : 'EDGE'})</span>
          </button>

          <button
            onClick={onOpenAppearance}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid var(--border-color)'
            }}
            title="Reader settings"
          >
            <Sliders size={15} />
            <span>Appearance</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          padding: '4px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}
      >
        <button
          onClick={() => { setActiveTab('url'); setErrorMessage(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: activeTab === 'url' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'url' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease'
          }}
        >
          <Globe size={15} />
          <span>Web Link</span>
        </button>

        <button
          onClick={() => { setActiveTab('text'); setErrorMessage(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: activeTab === 'text' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'text' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={15} />
          <span>Paste Text</span>
        </button>

        <button
          onClick={() => { setActiveTab('file'); setErrorMessage(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: activeTab === 'file' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'file' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease'
          }}
        >
          <Upload size={15} />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => { setActiveTab('library'); setErrorMessage(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: activeTab === 'library' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'library' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.15s ease'
          }}
        >
          <Bookmark size={15} />
          <span>Library ({savedArticles.length})</span>
        </button>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '14px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '14px'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>{errorMessage}</div>
        </div>
      )}

      {/* TAB 1: URL Input */}
      {activeTab === 'url' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
              Enter Webpage or Article Link
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Paste any article link (e.g. Wikipedia, Medium, Substack, news site, or blog) to extract clean text.
            </p>

            <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  padding: '4px 6px 4px 14px',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <Link2 size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
                <input
                  type="text"
                  placeholder="https://en.wikipedia.org/wiki/Voyager_Golden_Record"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '15px',
                    color: 'var(--text-main)',
                    outline: 'none',
                    padding: '8px 0'
                  }}
                />
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 500,
                    marginRight: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Paste from clipboard"
                >
                  <ClipboardPaste size={13} />
                  <span>Paste</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !urlInput.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    opacity: isLoading || !urlInput.trim() ? 0.6 : 1,
                    cursor: isLoading || !urlInput.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {isLoading ? (
                    <span>Extracting...</span>
                  ) : (
                    <>
                      <span>Read & Listen</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick 1-Click Samples */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={16} color="var(--primary-color)" />
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                Or Try A Sample Document (1-Click)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {sampleArticles.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      {sample.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {sample.excerpt}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--primary-color)', fontWeight: 500 }}>
                    <span>{sample.siteName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Load Article <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Direct Text Input */}
      {activeTab === 'text' && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
            Paste or Write Text
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Paste book chapters, study notes, emails, essays, or transcripts to read and listen aloud.
          </p>

          <form onSubmit={handleTextSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="text"
              placeholder="Document Title (e.g. Physics Summary, Chapter 3)"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                fontSize: '14px',
                color: 'var(--text-main)'
              }}
            />

            <textarea
              rows={12}
              placeholder="Paste your text here..."
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {wordCount} words • {textInput.length} characters
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  Paste from Clipboard
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !textInput.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    opacity: isLoading || !textInput.trim() ? 0.6 : 1,
                    cursor: isLoading || !textInput.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>Start Reading & Listening</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: File Upload */}
      {activeTab === 'file' && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '36px 28px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
            Upload Local Document
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Drop or browse any plain text (<code>.txt</code>) or Markdown (<code>.md</code>) file to read and listen immediately.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept=".txt,.md,.markdown"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            style={{ display: 'none' }}
          />

          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileProcess(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--border-strong)'}`,
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              backgroundColor: isDragging ? 'var(--primary-light)' : 'var(--bg-app)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-color)'
              }}
            >
              <FileUp size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                {isLoading ? 'Processing document...' : 'Click to upload or drag & drop'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Supports Markdown (.md) and Plain Text (.txt) files
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Saved Library */}
      {activeTab === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search bar and clear all */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                padding: '8px 14px'
              }}
            >
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search saved articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '13px',
                  width: '100%'
                }}
              />
            </div>

            {savedArticles.length > 0 && (
              <button
                onClick={onClearLibrary}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-hover)',
                  color: '#ef4444',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* List of articles */}
          {filteredLibrary.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <Bookmark size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                {searchQuery ? 'No matching articles found' : 'Your library is empty'}
              </h3>
              <p style={{ fontSize: '13px' }}>
                {searchQuery ? 'Try a different search term.' : 'Articles and texts you read are saved here for quick offline access.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredLibrary.map(item => {
                const totalSents = item.sentences?.length || 1;
                const lastIdx = item.lastSentenceIndex || 0;
                const progressPct = Math.min(100, Math.round(((lastIdx + 1) / totalSents) * 100));

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div
                      style={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => onLoadArticle(item, lastIdx)}
                    >
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {item.title}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <span>{item.domain || item.siteName || 'Custom Document'}</span>
                        <span>• {item.wordCount} words</span>
                        <span>• {item.estimatedReadingTime} min read</span>
                        {item.highlights && item.highlights.length > 0 && (
                          <span style={{ color: '#f59e0b', fontWeight: 500 }}>
                            ★ {item.highlights.length} highlight{item.highlights.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Reading Progress Indicator */}
                      {lastIdx > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '280px' }}>
                          <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: 'var(--primary-color)' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Sentence {lastIdx + 1}/{totalSents} ({progressPct}%)
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => onLoadArticle(item, lastIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary-color)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        {lastIdx > 0 ? (
                          <>
                            <PlayCircle size={14} />
                            <span>Resume</span>
                          </>
                        ) : (
                          <span>Read</span>
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteSaved(item.id)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-dim)'
                        }}
                        title="Delete from library"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
