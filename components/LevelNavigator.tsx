'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Level, LEVELS } from '@/types/sentient';
import { Mic, Sparkles, Eye, Network, Brain, Circle } from 'lucide-react';

interface LevelNavigatorProps {
  currentLevel: Level;
  onLevelChange: (level: Level) => void;
  isListening: boolean;
  onVoiceToggle: () => void;
}

const levelIcons: Record<Level, ReactNode> = {
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
  onVoiceToggle,
}: LevelNavigatorProps) {
  const levels: Level[] = ['void', 'voice', 'generate', 'preview', 'network', 'self'];

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
    >
      <div className="bg-white/10 backdrop-blur-lg mx-4 mb-4 rounded-2xl p-2">
        <div className="flex items-center justify-around">
          {levels.map((level) => {
            const isActive = currentLevel === level;
            const config = LEVELS.find((l) => l.id === level);

            return (
              <motion.button
                key={level}
                onClick={() => (level === 'voice' ? onVoiceToggle() : onLevelChange(level))}
                className={`flex flex-col items-center p-3 rounded-xl ${isActive ? 'bg-white/20' : ''}`}
              >
                {levelIcons[level]}
                <span className="text-xs mt-1">{config?.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
