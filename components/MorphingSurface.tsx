'use client';

import { motion } from 'framer-motion';
import { Level, LEVELS } from '@/types/sentient';
import { ReactNode } from 'react';

interface MorphingSurfaceProps {
  level: Level;
  children: ReactNode;
  isGenerating: boolean;
}

export function MorphingSurface({ level, children, isGenerating }: MorphingSurfaceProps) {
  const levelConfig = LEVELS.find(l => l.id === level) || LEVELS[0];
  
  return (
    <motion.div
      layout
      className="absolute inset-0 flex flex-col items-center justify-center p-6"
      animate={{
        background: `radial-gradient(ellipse at ${getGradientPosition(level)}, ${levelConfig.color}40 0%, transparent 70%)`,
      }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.div
        layoutId="central-orb"
        className="absolute w-64 h-64 rounded-full"
        animate={{
          scale: isGenerating ? [1, 1.2, 1] : 1,
          opacity: 0.3,
          background: `radial-gradient(circle, ${levelConfig.color} 0%, transparent 70%)`,
        }}
        transition={{
          scale: { duration: 2, repeat: isGenerating ? Infinity : 0 },
          background: { duration: 0.5 },
        }}
        style={{ filter: 'blur(40px)' }}
      />
      
      <motion.div
        layout
        className="relative z-10 w-full max-w-4xl"
        animate={{
          y: level === 'void' ? 0 : level === 'voice' ? -20 : 0,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {children}
      </motion.div>
      
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: level === 'network' || level === 'self' ? 1 : 0.3,
        }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            animate={{
              width: [200 + i * 100, 250 + i * 100, 200 + i * 100],
              height: [200 + i * 100, 250 + i * 100, 200 + i * 100],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 10 + i * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function getGradientPosition(level: Level): string {
  switch (level) {
    case 'void': return 'bottom';
    case 'voice': return 'center';
    case 'generate': return 'center';
    case 'preview': return 'top';
    case 'network': return 'center';
    case 'self': return 'center';
    default: return 'center';
  }
}
