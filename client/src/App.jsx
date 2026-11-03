import React, { useState, useEffect, useCallback } from 'react';
import InputView from './components/InputView';
import ReaderView from './components/ReaderView';
import AppearanceModal from './components/AppearanceModal';
import AiVoiceModal from './components/AiVoiceModal';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useAiAudioPlayer } from './hooks/useAiAudioPlayer';
import { ErrorBoundary } from './components/ErrorBoundary';

const STORAGE_KEY_PREFS = 'reader_user_preferences_v1';
const STORAGE_KEY_ARTICLES = 'reader_saved_articles_v1';
const STORAGE_KEY_AI = 'reader_ai_tts_config_v1';

export default function App() {
  // Appearance & Reader Configuration (persisted)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      return saved ? JSON.parse(saved).theme || 'sepia' : 'sepia';
    } catch {
      return 'sepia';
    }
  });

  const [fontFamily, setFontFamily] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      return saved ? JSON.parse(saved).fontFamily || 'serif' : 'serif';
    } catch {
      return 'serif';
    }
  });

  const [fontSize, setFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      return saved ? JSON.parse(saved).fontSize || 18 : 18;
    } catch {
      return 18;
    }
  });

  const [lineHeight, setLineHeight] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      return saved ? JSON.parse(saved).lineHeight || 1.75 : 1.75;
    } catch {
      return 1.75;
    }
  });

  const [maxWidth, setMaxWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      return saved ? JSON.parse(saved).maxWidth || 760 : 760;
    } catch {
      return 760;
    }
  });

  const [bionicReading, setBionicReading] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      return saved ? Boolean(JSON.parse(saved).bionicReading) : false;
    } catch {
      return false;
    }
  });

  const [textAlign, setTextAlign] = useState('left');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // AI TTS Engine & Configuration
  const [engineType, setEngineType] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AI);
      return saved ? JSON.parse(saved).engineType || 'ai' : 'ai';
    } catch {
      return 'ai';
    }
  });

  const [aiConfig, setAiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AI);
      return saved ? JSON.parse(saved).aiConfig || { provider: 'edge', voice: 'en-US-JennyNeural' } : { provider: 'edge', voice: 'en-US-JennyNeural' };
    } catch {
      return { provider: 'edge', voice: 'en-US-JennyNeural' };
    }
  });

  // Active Reading Content
  const [currentArticle, setCurrentArticle] = useState(null);

  // Saved Articles Library
  const [savedArticles, setSavedArticles] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ARTICLES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // Keep theme class updated on body
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // Persist user preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_PREFS,
        JSON.stringify({ theme, fontFamily, fontSize, lineHeight, maxWidth, bionicReading })
      );
    } catch (e) {
      console.warn('Could not save prefs', e);
    }
  }, [theme, fontFamily, fontSize, lineHeight, maxWidth, bionicReading]);

  // Persist AI TTS configuration
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_AI,
        JSON.stringify({ engineType, aiConfig })
      );
    } catch (e) {
      console.warn('Could not save AI config', e);
    }
  }, [engineType, aiConfig]);

  // Persist articles library
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(savedArticles));
    } catch (e) {
      console.warn('Could not save articles to storage', e);
    }
  }, [savedArticles]);

  // Both TTS engines
  const browserTts = useSpeechSynthesis(currentArticle?.sentences || []);
  const aiTts = useAiAudioPlayer(currentArticle?.sentences || [], aiConfig);

  // Active TTS instance based on engineType
  const activeTts = engineType === 'ai' ? aiTts : browserTts;

  // When loading an article (optionally jumping to a resume sentence)
  const handleLoadArticle = (articleData, resumeSentenceIndex = 0) => {
    const articleWithId = {
      ...articleData,
      id: articleData.id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      savedAt: new Date().toISOString()
    };

    browserTts.stop();
    aiTts.stop();
    setCurrentArticle(articleWithId);
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (resumeSentenceIndex > 0) {
      setTimeout(() => {
        activeTts.jumpToSentence(resumeSentenceIndex, false);
      }, 100);
    }

    // Save or update in library
    setSavedArticles(prev => {
      const existsIndex = prev.findIndex(item => item.id === articleWithId.id || (item.url && item.url === articleWithId.url));
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...articleWithId };
        return updated;
      }
      return [articleWithId, ...prev.slice(0, 49)];
    });
  };

  // Save live reading sentence progress & highlights back to library
  const handleSaveProgress = useCallback((articleId, sentenceIndex, highlights) => {
    setSavedArticles(prev => {
      return prev.map(item => {
        if (item.id === articleId) {
          return {
            ...item,
            lastSentenceIndex: sentenceIndex,
            highlights: highlights || item.highlights || []
          };
        }
        return item;
      });
    });
  }, []);

  // Back to input/library
  const handleBackToInput = () => {
    browserTts.stop();
    aiTts.stop();
    setCurrentArticle(null);
  };

  // Delete article from library
  const handleDeleteSaved = (id) => {
    setSavedArticles(prev => prev.filter(item => item.id !== id));
  };

  // Clear library
  const handleClearLibrary = () => {
    if (window.confirm('Are you sure you want to clear your saved library?')) {
      setSavedArticles([]);
    }
  };

  return (
    <div className={`font-${fontFamily}`} style={{ minHeight: '100vh' }}>
      {currentArticle ? (
        <ErrorBoundary onReset={handleBackToInput}>
          <ReaderView
            article={currentArticle}
            onBack={handleBackToInput}
            onOpenAppearance={() => setIsAppearanceOpen(true)}
            onOpenAiSettings={() => setIsAiModalOpen(true)}
            theme={theme}
            fontFamily={fontFamily}
            fontSize={fontSize}
            lineHeight={lineHeight}
            maxWidth={maxWidth}
            textAlign={textAlign}
            autoScroll={autoScroll}
            bionicReading={bionicReading}
            engineType={engineType}
            aiConfig={aiConfig}
            tts={activeTts}
            onSaveProgress={handleSaveProgress}
          />
        </ErrorBoundary>
      ) : (
        <InputView
          onLoadArticle={handleLoadArticle}
          onOpenAppearance={() => setIsAppearanceOpen(true)}
          onOpenAiSettings={() => setIsAiModalOpen(true)}
          savedArticles={savedArticles}
          onDeleteSaved={handleDeleteSaved}
          onClearLibrary={handleClearLibrary}
          engineType={engineType}
          aiConfig={aiConfig}
        />
      )}

      {/* Reader Appearance Modal */}
      <AppearanceModal
        isOpen={isAppearanceOpen}
        onClose={() => setIsAppearanceOpen(false)}
        theme={theme}
        setTheme={setTheme}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        maxWidth={maxWidth}
        setMaxWidth={setMaxWidth}
        textAlign={textAlign}
        setTextAlign={setTextAlign}
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        bionicReading={bionicReading}
        setBionicReading={setBionicReading}
      />

      {/* AI Voice & Provider Settings Modal (Gemini, TikTok, Edge, OpenAI, ElevenLabs) */}
      <AiVoiceModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        aiConfig={aiConfig}
        setAiConfig={setAiConfig}
        engineType={engineType}
        setEngineType={setEngineType}
      />
    </div>
  );
}
