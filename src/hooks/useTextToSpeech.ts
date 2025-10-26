import { useState, useEffect, useRef } from 'react';
import { Emotion } from './useZoraChat';

export const useTextToSpeech = (language: string = 'en-US') => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = (text: string, emotion: Emotion = 'calm') => {
    if (!synthRef.current || !isSupported) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Adjust voice parameters based on emotion
    switch (emotion) {
      case 'excited':
        utterance.rate = 1.2;
        utterance.pitch = 1.3;
        utterance.volume = 1;
        break;
      case 'happy':
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        utterance.volume = 1;
        break;
      case 'sad':
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.volume = 0.8;
        break;
      case 'thoughtful':
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        break;
      default: // calm
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
    }

    // Get available voices and select based on language
    const voices = synthRef.current.getVoices();
    
    // Try to find a voice that matches the selected language
    let preferredVoice = voices.find(voice => voice.lang.startsWith(language.split('-')[0]));
    
    // Fallback to any female/friendly voice for the language
    if (!preferredVoice) {
      preferredVoice = voices.find(
        (voice) => voice.lang.startsWith(language.split('-')[0]) && 
                   (voice.name.includes('Female') || voice.name.includes('Google'))
      );
    }
    
    // Final fallback to any voice in that language
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => voice.lang === language);
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = language;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
};
