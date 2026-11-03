import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechSynthesis(sentences = []) {
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [activeWordCharIndex, setActiveWordCharIndex] = useState(null);

  // References to handle async callbacks and avoid browser GC quirks
  const currentUtteranceRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const sentencesRef = useRef(sentences);
  const rateRef = useRef(rate);
  const pitchRef = useRef(pitch);
  const volumeRef = useRef(volume);
  const voiceURIRef = useRef(selectedVoiceURI);
  const heartbeatRef = useRef(null);

  // Keep refs synchronized
  sentencesRef.current = sentences;
  rateRef.current = rate;
  pitchRef.current = pitch;
  volumeRef.current = volume;
  voiceURIRef.current = selectedVoiceURI;
  currentIndexRef.current = currentSentenceIndex;

  // 1. Initialize and load system voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const synth = window.speechSynthesis;

    const updateVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices && availableVoices.length > 0) {
        setVoices(availableVoices);

        // Pick a good default voice if none selected
        setSelectedVoiceURI(prev => {
          if (prev && availableVoices.some(v => v.voiceURI === prev)) {
            return prev;
          }
          // Prefer English natural/Google/Microsoft/Apple voices if available
          const preferred =
            availableVoices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online'))) ||
            availableVoices.find(v => v.lang.startsWith('en')) ||
            availableVoices[0];
          return preferred ? preferred.voiceURI : '';
        });
      }
    };

    updateVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
    };
  }, []);

  // 2. Chrome heartbeat workaround to keep speech synthesis alive
  useEffect(() => {
    if (isPlaying && !isPaused) {
      heartbeatRef.current = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 5000);
    } else {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [isPlaying, isPaused]);

  // Clean stop helper
  const cancelSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
    setActiveWordCharIndex(null);
  }, []);

  // 3. Core function to speak a specific sentence by index
  const speakSentenceAt = useCallback((index) => {
    const sList = sentencesRef.current;
    if (!sList || index < 0 || index >= sList.length) {
      // Completed all sentences
      cancelSpeaking();
      setIsPlaying(false);
      setIsPaused(false);
      isSpeakingRef.current = false;
      isPausedRef.current = false;
      return;
    }

    cancelSpeaking();

    const sentenceObj = sList[index];
    const textToSpeak = sentenceObj.text;
    if (!textToSpeak) return;

    setCurrentSentenceIndex(index);
    currentIndexRef.current = index;
    setActiveWordCharIndex(null);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    currentUtteranceRef.current = utterance;

    // Set voice
    if (voiceURIRef.current) {
      const allVoices = window.speechSynthesis.getVoices();
      const matched = allVoices.find(v => v.voiceURI === voiceURIRef.current);
      if (matched) utterance.voice = matched;
    }

    utterance.rate = rateRef.current;
    utterance.pitch = pitchRef.current;
    utterance.volume = volumeRef.current;

    // Word boundary tracking for real-time word highlighting
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setActiveWordCharIndex(event.charIndex);
      }
    };

    // When sentence finishes speaking, smoothly advance to next
    utterance.onend = () => {
      if (!isSpeakingRef.current || isPausedRef.current) return;
      const nextIndex = currentIndexRef.current + 1;
      if (nextIndex < sentencesRef.current.length) {
        speakSentenceAt(nextIndex);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        isSpeakingRef.current = false;
      }
    };

    utterance.onerror = (event) => {
      // Ignore 'interrupted' or 'canceled' errors caused by user skipping
      if (event.error === 'interrupted' || event.error === 'canceled') return;
      console.warn('SpeechSynthesis error:', event.error);
    };

    window.speechSynthesis.speak(utterance);
  }, [cancelSpeaking]);

  // 4. Play action
  const play = useCallback((fromIndex = null) => {
    if (!sentencesRef.current || sentencesRef.current.length === 0) return;

    const targetIndex = fromIndex !== null ? fromIndex : currentIndexRef.current;
    isSpeakingRef.current = true;
    isPausedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);

    speakSentenceAt(targetIndex);
  }, [speakSentenceAt]);

  // 5. Pause action
  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    isPausedRef.current = true;
    setIsPaused(true);
  }, []);

  // 6. Resume action
  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        speakSentenceAt(currentIndexRef.current);
      }
    }
    isPausedRef.current = false;
    setIsPaused(false);
    setIsPlaying(true);
  }, [speakSentenceAt]);

  // 7. Toggle Play/Pause
  const togglePlayPause = useCallback(() => {
    if (!isPlaying) {
      play(currentSentenceIndex);
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPlaying, isPaused, play, resume, pause, currentSentenceIndex]);

  // 8. Stop action
  const stop = useCallback(() => {
    cancelSpeaking();
    setIsPlaying(false);
    setIsPaused(false);
    isSpeakingRef.current = false;
    isPausedRef.current = false;
    setCurrentSentenceIndex(0);
    currentIndexRef.current = 0;
  }, [cancelSpeaking]);

  // 9. Skip forward
  const skipNext = useCallback(() => {
    const nextIdx = Math.min(currentIndexRef.current + 1, sentencesRef.current.length - 1);
    setCurrentSentenceIndex(nextIdx);
    currentIndexRef.current = nextIdx;
    if (isPlaying && !isPaused) {
      speakSentenceAt(nextIdx);
    }
  }, [isPlaying, isPaused, speakSentenceAt]);

  // 10. Skip backward
  const skipPrev = useCallback(() => {
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    setCurrentSentenceIndex(prevIdx);
    currentIndexRef.current = prevIdx;
    if (isPlaying && !isPaused) {
      speakSentenceAt(prevIdx);
    }
  }, [isPlaying, isPaused, speakSentenceAt]);

  // 11. Replay current sentence
  const replayCurrent = useCallback(() => {
    speakSentenceAt(currentIndexRef.current);
  }, [speakSentenceAt]);

  // 12. Jump directly to sentence and play
  const jumpToSentence = useCallback((index, startPlaying = true) => {
    setCurrentSentenceIndex(index);
    currentIndexRef.current = index;
    if (startPlaying) {
      isSpeakingRef.current = true;
      isPausedRef.current = false;
      setIsPlaying(true);
      setIsPaused(false);
      speakSentenceAt(index);
    } else {
      cancelSpeaking();
    }
  }, [speakSentenceAt, cancelSpeaking]);

  // Update rate live
  const updateRate = (newRate) => {
    setRate(newRate);
    rateRef.current = newRate;
    if (isPlaying && !isPaused) {
      // Re-trigger current sentence with new rate
      speakSentenceAt(currentIndexRef.current);
    }
  };

  // Update voice live
  const updateVoice = (newVoiceURI) => {
    setSelectedVoiceURI(newVoiceURI);
    voiceURIRef.current = newVoiceURI;
    if (isPlaying && !isPaused) {
      speakSentenceAt(currentIndexRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelSpeaking();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [cancelSpeaking]);

  return {
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI: updateVoice,
    rate,
    setRate: updateRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    isPlaying,
    isPaused,
    currentSentenceIndex,
    activeWordCharIndex,
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

