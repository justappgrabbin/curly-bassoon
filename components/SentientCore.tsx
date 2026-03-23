'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelStore } from '@/lib/level-state';
import { useVoice } from '@/hooks/useVoice';
import { useLearning } from '@/hooks/useLearning';
import { MorphingSurface } from './MorphingSurface';
import { VoiceInterface } from './VoiceInterface';
import { LevelNavigator } from './LevelNavigator';
import { NetworkMesh } from './NetworkMesh';
import { Intent, Generation, LearningSample, Level } from '@/types/sentient';

export function SentientCore() {
  const [mounted, setMounted] = useState(false);
  
  const {
    currentLevel,
    setLevel,
    setIntent,
    setGeneration,
    activeIntent,
    memory,
    generationHistory,
  } = useLevelStore();
  
  const { isReady: learningReady, predict, learn } = useLearning();
  
  const handleVoiceResult = async (intent: Intent) => {
    setIntent(intent);
    setLevel('generate');
    await generateFromIntent(intent);
  };
  
  const { isListening, transcript, startListening, stopListening } = useVoice(handleVoiceResult);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const generateFromIntent = async (intent: Intent) => {
    const params = await predict(intent);
    const code = generateMockCode(intent, params);
    
    const generation: Generation = {
      id: Math.random().toString(36).substring(2, 15),
      intent,
      code,
      preview: code,
      timestamp: Date.now(),
      reward: 0,
      iterations: 1,
    };
    
    setGeneration(generation);
    setTimeout(() => setLevel('preview'), 1000);
  };
  
  const generateMockCode = (intent: Intent, params: number[]): string => {
    const componentName = intent.raw.split(' ').slice(0, 3).join('').replace(/[^a-zA-Z]/g, '') || 'Component';
    
    return `import React from 'react';
import { motion } from 'framer-motion';

export function ${componentName}() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 rounded-2xl glass"
    >
      <h2 className="text-xl font-semibold mb-4">${intent.raw}</h2>
      <p className="text-white/70">
        Generated with confidence: ${(intent.confidence * 100).toFixed(1)}%
      </p>
      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-self rounded-lg text-sm">
          Action
        </button>
        <button className="px-4 py-2 glass rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}`;
  };
  
  const handleFeedback = async (reward: number) => {
    if (!activeIntent) return;
    
    const sample: LearningSample = {
      input: activeIntent,
      output: {
        id: Math.random().toString(36).substring(2, 15),
        intent: activeIntent,
        code: '',
        preview: '',
        timestamp: Date.now(),
        reward,
        iterations: 1,
      },
      reward,
      timestamp: Date.now(),
      context: currentLevel,
    };
    
    await learn(sample);
  };
  
  if (!mounted) return null;
  
  return (
    <div className={`relative w-full h-screen overflow-hidden level-${currentLevel}`}>
      <NetworkMesh />
      
      <MorphingSurface level={currentLevel} isGenerating={false}>
        <AnimatePresence mode="wait">
          {currentLevel === 'void' && (
            <motion.div
              key="void"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-self/30 to-network/30 blur-xl"
              />
              <p className="mt-8 text-white/50 text-sm">Tap and speak to begin</p>
            </motion.div>
          )}
          
          {currentLevel === 'voice' && (
            <VoiceInterface 
              key="voice"
              isListening={isListening}
              transcript={transcript}
              onStart={startListening}
              onStop={stopListening}
            />
          )}
          
          {currentLevel === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <div className="w-16 h-16 border-2 border-self/50 border-t-self rounded-full animate-spin" />
              <p className="mt-4 text-white/70">Generating...</p>
              {activeIntent && (
                <p className="mt-2 text-white/50 text-sm max-w-md text-center">
                  {activeIntent.raw}
                </p>
              )}
            </motion.div>
          )}
          
          {currentLevel === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full p-6"
            >
              <div className="glass-strong rounded-2xl p-6 max-w-2xl w-full">
                <h3 className="text-lg font-semibold mb-4">Generated Component</h3>
                <pre className="text-xs text-white/70 overflow-auto max-h-64 p-4 bg-black/30 rounded-lg">
                  {useLevelStore.getState().activeGeneration?.code || 'No code generated'}
                </pre>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => handleFeedback(1)}
                    className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-colors"
                  >
                    ✓ Good
                  </button>
                  <button 
                    onClick={() => handleFeedback(0.5)}
                    className="flex-1 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-colors"
                  >
                    ~ Edit
                  </button>
                  <button 
                    onClick={() => handleFeedback(0)}
                    className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                  >
                    ✗ Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {currentLevel === 'network' && (
            <motion.div
              key="network"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <h2 className="text-2xl font-bold mb-4">Network Status</h2>
              <div className="glass rounded-xl p-6">
                <p className="text-white/70">Learning Engine: {learningReady ? '✓ Ready' : '○ Initializing'}</p>
                <p className="text-white/70 mt-2">Memory Samples: {memory.length}</p>
                <p className="text-white/70 mt-2">Generations: {generationHistory.length}</p>
              </div>
            </motion.div>
          )}
          
          {currentLevel === 'self' && (
            <motion.div
              key="self"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <h2 className="text-2xl font-bold mb-4">Self Awareness</h2>
              <div className="glass rounded-xl p-6 max-w-md">
                <p className="text-white/70">Current Level: {currentLevel}</p>
                <p className="text-white/70 mt-2">Learning Active: {learningReady ? 'Yes' : 'No'}</p>
                <p className="text-white/70 mt-2">Total Memories: {memory.length}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MorphingSurface>
      
      <LevelNavigator 
        currentLevel={currentLevel}
        onLevelChange={setLevel}
        isListening={isListening}
        onVoiceToggle={isListening ? stopListening : startListening}
      />
    </div>
  );
}
