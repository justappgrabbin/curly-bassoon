'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Intent } from '@/types/sentient';

interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useVoice(onResult?: (intent: Intent) => void): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome/Edge.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          maxConfidence = Math.max(maxConfidence, result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      setConfidence(maxConfidence);
      
      if (finalTranscript && onResult) {
        const intent = parseIntent(finalTranscript, maxConfidence);
        onResult(intent);
      }
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      recognition.stop();
    };
  }, [isListening, onResult]);
  
  const parseIntent = (text: string, conf: number): Intent => {
    const lower = text.toLowerCase();
    
    let category: Intent['category'] = 'query';
    
    if (lower.includes('build') || lower.includes('create') || lower.includes('make')) {
      category = 'create';
    } else if (lower.includes('change') || lower.includes('modify') || lower.includes('update')) {
      category = 'modify';
    } else if (lower.includes('deploy') || lower.includes('publish') || lower.includes('share')) {
      category = 'deploy';
    } else if (lower.includes('connect') || lower.includes('sync') || lower.includes('network')) {
      category = 'connect';
    } else if (lower.includes('learn') || lower.includes('remember') || lower.includes('improve')) {
      category = 'learn';
    }
    
    const parameters: Record<string, any> = {};
    
    if (lower.includes('app')) parameters.type = 'app';
    if (lower.includes('game')) parameters.type = 'game';
    if (lower.includes('page')) parameters.type = 'page';
    if (lower.includes('component')) parameters.type = 'component';
    
    if (lower.includes('dark')) parameters.theme = 'dark';
    if (lower.includes('light')) parameters.theme = 'light';
    
    if (lower.includes('simple')) parameters.complexity = 'low';
    if (lower.includes('complex')) parameters.complexity = 'high';
    
    return {
      raw: text,
      embedding: [],
      confidence: conf,
      category,
      parameters,
    };
  };
  
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('');
      setError(null);
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, []);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  }, []);
  
  return {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    error,
  };
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
