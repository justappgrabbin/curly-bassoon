'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { learningEngine } from '@/lib/tf-bridge';
import { Intent, Generation, LearningSample } from '@/types/sentient';
import { useLevelStore } from '@/lib/level-state';

interface UseLearningReturn {
  isReady: boolean;
  isLearning: boolean;
  predict: (intent: Intent) => Promise<number[]>;
  learn: (sample: LearningSample) => Promise<void>;
  saveModel: () => Promise<void>;
  loadModel: () => Promise<boolean>;
}

export function useLearning(): UseLearningReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const initRef = useRef(false);
  
  const { addToMemory, updateModelWeights } = useLevelStore();
  
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    const init = async () => {
      await learningEngine.initialize();
      const loaded = await learningEngine.load();
      if (!loaded) {
        await learningEngine.save();
      }
      setIsReady(true);
    };
    
    init();
  }, []);
  
  const predict = useCallback(async (intent: Intent): Promise<number[]> => {
    if (!isReady) return new Array(8).fill(0.5);
    return await learningEngine.predict(intent);
  }, [isReady]);
  
  const learn = useCallback(async (sample: LearningSample) => {
    if (!isReady) return;
    
    setIsLearning(true);
    addToMemory(sample);
    await learningEngine.learn(sample);
    const weights = await learningEngine.getWeights();
    updateModelWeights(weights);
    setIsLearning(false);
  }, [isReady, addToMemory, updateModelWeights]);
  
  const saveModel = useCallback(async () => {
    if (!isReady) return;
    await learningEngine.save();
  }, [isReady]);
  
  const loadModel = useCallback(async (): Promise<boolean> => {
    if (!isReady) return false;
    return await learningEngine.load();
  }, [isReady]);
  
  return {
    isReady,
    isLearning,
    predict,
    learn,
    saveModel,
    loadModel,
  };
}
