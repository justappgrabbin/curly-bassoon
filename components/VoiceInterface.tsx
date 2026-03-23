'use client';

import { motion } from 'framer-motion';

interface VoiceInterfaceProps {
  isListening: boolean;
  transcript: string;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceInterface({ isListening, transcript, onStart, onStop }: VoiceInterfaceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center"
    >
      <motion.button
        onClick={isListening ? onStop : onStart}
        className="relative w-32 h-32 rounded-full glass-strong flex items-center justify-center touch-target"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isListening 
            ? ['0 0 0 0 rgba(233, 69, 96, 0)', '0 0 0 20px rgba(233, 69, 96, 0.3)', '0 0 0 0 rgba(233, 69, 96, 0)']
            : '0 0 0 0 rgba(233, 69, 96, 0)',
        }}
        transition={{
          boxShadow: { duration: 1.5, repeat: isListening ? Infinity : 0 },
        }}
      >
        <motion.div
          className="absolute inset-4 rounded-full bg-self/20"
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
            opacity: isListening ? [0.5, 1, 0.5] : 0.3,
          }}
          transition={{
            duration: 0.8,
            repeat: isListening ? Infinity : 0,
          }}
        />
        
        <svg 
          className="w-12 h-12 text-white relative z-10" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </motion.button>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-center"
      >
        {transcript ? (
          <p className="text-white/90 text-lg max-w-md">{transcript}</p>
        ) : (
          <p className="text-white/50 text-sm">
            {isListening ? 'Listening...' : 'Tap to speak'}
          </p>
        )}
      </motion.div>
      
      {isListening && (
        <div className="flex items-center gap-1 mt-6 h-8">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-self rounded-full"
              animate={{
                height: [4, 16 + Math.random() * 16, 4],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
