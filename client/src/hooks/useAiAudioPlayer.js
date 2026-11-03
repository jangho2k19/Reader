import { useState, useEffect, useRef, useCallback } from 'react';

export function useAiAudioPlayer(sentences = [], aiConfig = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  const audioRef = useRef(null);
  const cacheRef = useRef(new Map()); // audio URL cache by sentence id + provider + voice + speed
  const currentIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const sentencesRef = useRef(sentences);
  const aiConfigRef = useRef(aiConfig);
  const rateRef = useRef(rate);
  const volumeRef = useRef(volume);

  sentencesRef.current = sentences;
  aiConfigRef.current = aiConfig;
  rateRef.current = rate;
  volumeRef.current = volume;
  currentIndexRef.current = currentSentenceIndex;

  // Initialize HTML5 Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      // Revoke any blob URLs in cache
      for (const url of cacheRef.current.values()) {
        try { URL.revokeObjectURL(url); } catch (e) {}
      }
      cacheRef.current.clear();
    };
  }, []);

  // Fetch synthesized audio blob URL for a specific sentence text
  const fetchSentenceAudio = useCallback(async (sentenceObj) => {
    if (!sentenceObj || !sentenceObj.text) return null;

    const provider = aiConfigRef.current.provider || 'edge';
    const voice = aiConfigRef.current.voice || 'en-US-JennyNeural';
    const cacheKey = `${provider}_${voice}_${sentenceObj.id}`;

    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    try {
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sentenceObj.text,
          provider,
          config: {
            ...aiConfigRef.current,
            speed: rateRef.current
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `TTS synthesis failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      cacheRef.current.set(cacheKey, audioUrl);

      return audioUrl;
    } catch (err) {
      console.error('Failed to fetch AI audio for sentence:', err);
      throw err;
    }
  }, []);

  // Pre-fetch next sentence in background for gapless playback
  const prefetchNext = useCallback((nextIndex) => {
    const sList = sentencesRef.current;
    if (nextIndex < sList.length) {
      fetchSentenceAudio(sList[nextIndex]).catch(() => {});
    }
  }, [fetchSentenceAudio]);

  // Core playback for a sentence index
  const playSentenceAt = useCallback(async (index) => {
    const sList = sentencesRef.current;
    if (!sList || index < 0 || index >= sList.length) {
      setIsPlaying(false);
      setIsPaused(false);
      isPlayingRef.current = false;
      isPausedRef.current = false;
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    setCurrentSentenceIndex(index);
    currentIndexRef.current = index;
    setIsLoadingAudio(true);

    try {
      setAudioError(null);
      const audioUrl = await fetchSentenceAudio(sList[index]);
      if (!audioUrl) {
        setIsLoadingAudio(false);
        setIsPlaying(false);
        isPlayingRef.current = false;
        return;
      }

      // Ensure user hasn't cancelled while fetching
      if (!isPlayingRef.current) {
        setIsLoadingAudio(false);
        return;
      }

      audio.src = audioUrl;
      audio.playbackRate = rateRef.current;
      audio.volume = volumeRef.current;

      audio.onended = () => {
        if (!isPlayingRef.current || isPausedRef.current) return;
        const nextIdx = currentIndexRef.current + 1;
        if (nextIdx < sentencesRef.current.length) {
          playSentenceAt(nextIdx);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          isPlayingRef.current = false;
        }
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error', e);
        setIsLoadingAudio(false);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setAudioError('Audio playback failed in browser.');
      };

      await audio.play();
      setIsLoadingAudio(false);

      // Pre-fetch the upcoming sentence so next sentence plays instantly
      prefetchNext(index + 1);
    } catch (err) {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
      const errMsg = err.message || 'Error synthesizing audio.';
      console.warn('Playback error for sentence index', index, errMsg);
      setAudioError(errMsg);
    }
  }, [fetchSentenceAudio, prefetchNext]);

  // Play
  const play = useCallback((fromIndex = null) => {
    if (!sentencesRef.current || sentencesRef.current.length === 0) return;

    const targetIndex = fromIndex !== null ? fromIndex : currentIndexRef.current;
    isPlayingRef.current = true;
    isPausedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);

    playSentenceAt(targetIndex);
  }, [playSentenceAt]);

  // Pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    isPausedRef.current = true;
    setIsPaused(true);
  }, []);

  // Resume
  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(() => {
        playSentenceAt(currentIndexRef.current);
      });
    } else {
      playSentenceAt(currentIndexRef.current);
    }
    isPausedRef.current = false;
    setIsPaused(false);
    setIsPlaying(true);
  }, [playSentenceAt]);

  // Toggle
  const togglePlayPause = useCallback(() => {
    if (!isPlaying) {
      play(currentSentenceIndex);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPlaying, isPaused, play, resume, pause, currentSentenceIndex]);

  // Stop
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    isPlayingRef.current = false;
    isPausedRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentenceIndex(0);
    currentIndexRef.current = 0;
  }, []);

  // Skip Next
  const skipNext = useCallback(() => {
    const nextIdx = Math.min(currentIndexRef.current + 1, sentencesRef.current.length - 1);
    setCurrentSentenceIndex(nextIdx);
    currentIndexRef.current = nextIdx;
    if (isPlaying && !isPaused) {
      playSentenceAt(nextIdx);
    }
  }, [isPlaying, isPaused, playSentenceAt]);

  // Skip Prev
  const skipPrev = useCallback(() => {
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    setCurrentSentenceIndex(prevIdx);
    currentIndexRef.current = prevIdx;
    if (isPlaying && !isPaused) {
      playSentenceAt(prevIdx);
    }
  }, [isPlaying, isPaused, playSentenceAt]);

  // Replay
  const replayCurrent = useCallback(() => {
    playSentenceAt(currentIndexRef.current);
  }, [playSentenceAt]);

  // Jump to sentence
  const jumpToSentence = useCallback((index, startPlaying = true) => {
    setCurrentSentenceIndex(index);
    currentIndexRef.current = index;
    if (startPlaying) {
      isPlayingRef.current = true;
      isPausedRef.current = false;
      setIsPlaying(true);
      setIsPaused(false);
      playSentenceAt(index);
    } else {
      if (audioRef.current) audioRef.current.pause();
    }
  }, [playSentenceAt]);

  // Change playback speed
  const updateRate = (newRate) => {
    setRate(newRate);
    rateRef.current = newRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  // Change volume
  const updateVolume = (newVol) => {
    setVolume(newVol);
    volumeRef.current = newVol;
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  // Clear cache if voice/provider configuration changes
  useEffect(() => {
    for (const url of cacheRef.current.values()) {
      try { URL.revokeObjectURL(url); } catch (e) {}
    }
    cacheRef.current.clear();
  }, [aiConfig?.provider, aiConfig?.voice, aiConfig?.model, aiConfig?.apiKey, aiConfig?.cookie]);

  return {
    isPlaying,
    isPaused,
    isLoadingAudio,
    audioError,
    clearAudioError: () => setAudioError(null),
    currentSentenceIndex,
    activeWordCharIndex: null,
    voices: [],
    selectedVoiceURI: '',
    setSelectedVoiceURI: () => {},
    rate,
    setRate: updateRate,
    pitch: 1.0,
    setPitch: () => {},
    volume,
    setVolume: updateVolume,
    play,
    pause,
    resume,
    togglePlayPause,
    stop,
    skipNext,
    skipPrev,
    replayCurrent,
    jumpToSentence
  };
}

