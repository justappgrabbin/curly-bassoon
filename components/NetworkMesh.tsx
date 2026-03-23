'use client';

import { motion } from 'framer-motion';
import { Level, LEVELS } from '@/types/sentient';
import { Mic, Sparkles, Eye, Network, Brain, Circle } from 'lucide-react';

interface LevelNavigatorProps {
  currentLevel: Level;
  onLevelChange: (level: Level) => void;
  isListening: boolean;
  onVoiceToggle: () => void;
}

const levelIcons: Record<Level, React.ReactNode> = {
  void: <Circle className="w-5 h-5" />,
  voice: <Mic className="w-5 h-5" />,
  generate: <Sparkles className="w-5 h-5" />,
  preview: <Eye className="w-5 h-5" />,
  network: <Network className="w-5 h-5" />,
  self: <Brain className="w-5 h-5" />,
};

export function LevelNavigator({ 
  currentLevel, 
  onLevelChange, 
  isListening,
  onVoiceToggle 
}: LevelNavigatorProps) {
  const levels: Level[] = ['void', 'voice', 'generate', 'preview', 'network', 'self'];
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring' }}
    >
      <div className="glass-strong mx-4 mb-4 rounded-2xl p-2 safe-bottom">
        <div className="flex items-center justify-around">
          {levels.map((level) => {
            const isActive = currentLevel === level;
            const config = LEVELS.find(l => l.id === level);
            
            return (
              <motion.button
                key={level}
                onClick={() => {
                  if (level === 'voice') {
                    onVoiceToggle();
                  } else {
                    onLevelChange(level);
                  }
                }}
                className={`
                  relative flex flex-col items-center justify-center 
                  p-3 rounded-xl transition-colors touch-target
                  ${isActive ? 'text-white' : 'text-white/50'}
                `}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className={`relative z-10 ${isListening && level === 'voice' ? 'text-self animate-pulse' : ''}`}>
                  {levelIcons[level]}
                </div>
                
                <span className="relative z-10 text-xs mt-1 font-medium">
                  {config?.name}
                </span>
                
                {isListening && level === 'voice' && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(233, 69, 96, 0)',
                        '0 0 0 8px rgba(233, 69, 96, 0.3)',
                        '0 0 0 0 rgba(233, 69, 96, 0)',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
