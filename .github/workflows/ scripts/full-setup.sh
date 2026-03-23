#!/bin/bash
set -e

echo "🌊 TRIDENT SENTIENT - Full GitHub/Netlify Setup"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check we're in a Next.js project
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No package.json found. Run this in your project root.${NC}"
    exit 1
fi

# 1. CREATE ALL DIRECTORIES
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p .github/workflows
mkdir -p netlify/functions
mkdir -p scripts
mkdir -p types
mkdir -p lib
mkdir -p hooks
mkdir -p components
mkdir -p app

# 2. CREATE ALL CONFIG FILES

# next.config.js (static export for Netlify)
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
EOF

# netlify.toml
cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "20"
  NEXT_TELEMETRY_DISABLED = "1"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
EOF

# tailwind.config.ts
cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0a',
        voice: '#1a1a2e',
        generate: '#16213e',
        preview: '#0f3460',
        network: '#533483',
        self: '#e94560',
      },
    },
  },
  plugins: [],
}

export default config
EOF

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# 3. CREATE GITHUB WORKFLOW
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to Netlify

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npx tsc --noEmit
      
      - run: npm run build
      
      - uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: out/

  deploy-preview:
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/download-artifact@v4
        with:
          name: build-files
          path: out/
      
      - uses: nwtgck/actions-netlify@v3.0
        with:
          publish-dir: './out'
          production-deploy: false
          github-token: ${{ secrets.GITHUB_TOKEN }}
          enable-pull-request-comment: true
          overwrites-pull-request-comment: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/download-artifact@v4
        with:
          name: build-files
          path: out/
      
      - uses: nwtgck/actions-netlify@v3.0
        with:
          publish-dir: './out'
          production-deploy: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: 🌊 Trident Sentient v${{ github.run_number }}
          body: |
            Auto-deployed to Netlify
            
            Changes: ${{ github.event.head_commit.message }}
          draft: false
          prerelease: false
EOF

# 4. CREATE SOURCE FILES (minimal working versions)

# types/sentient.ts
cat > types/sentient.ts << 'EOF'
export type Level = 'void' | 'voice' | 'generate' | 'preview' | 'network' | 'self';

export interface Intent {
  raw: string;
  confidence: number;
  category: 'create' | 'modify' | 'deploy' | 'query' | 'connect' | 'learn';
  parameters: Record<string, any>;
}

export interface Generation {
  id: string;
  intent: Intent;
  code: string;
  timestamp: number;
  reward: number;
}

export const LEVELS = [
  { id: 'void', name: 'Void', color: '#0a0a0a' },
  { id: 'voice', name: 'Listen', color: '#1a1a2e' },
  { id: 'generate', name: 'Create', color: '#16213e' },
  { id: 'preview', name: 'Preview', color: '#0f3460' },
  { id: 'network', name: 'Network', color: '#533483' },
  { id: 'self', name: 'Self', color: '#e94560' },
] as const;
EOF

# lib/level-state.ts (simplified)
cat > lib/level-state.ts << 'EOF'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Level, Intent, Generation } from '@/types/sentient';

interface LevelState {
  currentLevel: Level;
  activeIntent: Intent | null;
  activeGeneration: Generation | null;
  setLevel: (level: Level) => void;
  setIntent: (intent: Intent | null) => void;
  setGeneration: (gen: Generation | null) => void;
}

export const useLevelStore = create<LevelState>()(
  persist(
    (set) => ({
      currentLevel: 'void',
      activeIntent: null,
      activeGeneration: null,
      setLevel: (level) => set({ currentLevel: level }),
      setIntent: (intent) => set({ activeIntent: intent }),
      setGeneration: (gen) => set({ activeGeneration: gen }),
    }),
    { name: 'trident-storage' }
  )
);
EOF

# hooks/useVoice.ts (simplified)
cat > hooks/useVoice.ts << 'EOF'
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Intent } from '@/types/sentient';

export function useVoice(onResult?: (intent: Intent) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      setTranscript(final);
      if (final && onResult) {
        onResult({
          raw: final,
          confidence: 0.9,
          category: 'create',
          parameters: {},
        });
      }
    };

    recognitionRef.current = recognition;
  }, [onResult]);

  const startListening = useCallback(() => {
    setTranscript('');
    setIsListening(true);
    recognitionRef.current?.start();
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    recognitionRef.current?.stop();
  }, []);

  return { isListening, transcript, startListening, stopListening, error: null };
}
EOF

# components/SentientCore.tsx (simplified working version)
cat > components/SentientCore.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLevelStore } from '@/lib/level-state';
import { useVoice } from '@/hooks/useVoice';
import { Intent, Generation } from '@/types/sentient';

export function SentientCore() {
  const [mounted, setMounted] = useState(false);
  const { currentLevel, setLevel, setIntent, setGeneration, activeGeneration } = useLevelStore();

  const handleVoice = (intent: Intent) => {
    setIntent(intent);
    setLevel('generate');
    setTimeout(() => {
      const gen: Generation = {
        id: Math.random().toString(36).slice(2),
        intent,
        code: `// Generated: ${intent.raw}`,
        timestamp: Date.now(),
        reward: 0,
      };
      setGeneration(gen);
      setLevel('preview');
    }, 1500);
  };

  const { isListening, transcript, startListening, stopListening } = useVoice(handleVoice);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const levels = ['void', 'voice', 'generate', 'preview', 'network', 'self'] as const;

  return (
    <div className="relative w-full h-screen bg-void text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-64 h-64 rounded-full bg-gradient-to-br from-self/30 to-network/30 blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {currentLevel === 'void' && (
            <motion.div
              key="void"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">Trident Sentient</h1>
              <p className="text-white/50">Tap to speak</p>
            </motion.div>
          )}

          {currentLevel === 'voice' && (
            <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="w-32 h-32 rounded-full bg-self/20 flex items-center justify-center mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-lg">{transcript || 'Listening...'}</p>
            </motion.div>
          )}

          {currentLevel === 'generate' && (
            <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="w-16 h-16 border-4 border-self/30 border-t-self rounded-full animate-spin mb-4" />
              <p>Generating...</p>
            </motion.div>
          )}

          {currentLevel === 'preview' && activeGeneration && (
            <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-lg w-full">
              <h3 className="text-xl font-semibold mb-4">Generated</h3>
              <pre className="text-sm text-white/70 bg-black/30 p-4 rounded-lg overflow-auto">
                {activeGeneration.code}
              </pre>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setLevel('void')} className="flex-1 py-2 bg-green-500/20 rounded-lg text-green-400">✓ Keep</button>
                <button onClick={() => setLevel('voice')} className="flex-1 py-2 bg-white/10 rounded-lg">Again</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 flex justify-around">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => level === 'voice' ? (isListening ? stopListening() : startListening()) : setLevel(level)}
              className={`p-3 rounded-xl ${currentLevel === level ? 'bg-white/20' : ''} ${isListening && level === 'voice' ? 'animate-pulse text-self' : ''}`}
            >
              <span className="text-xs capitalize">{level}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
EOF

# app/layout.tsx
cat > app/layout.tsx << 'EOF'
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trident Sentient',
  description: 'Multi-leveled autonomous morphing interface',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
EOF

# app/page.tsx
cat > app/page.tsx << 'EOF'
'use client';

import { SentientCore } from '@/components/SentientCore';

export default function Home() {
  return (
    <main className="w-full h-screen bg-void">
      <SentientCore />
    </main>
  );
}
EOF

# app/globals.css
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --void: #0a0a0a;
  --voice: #1a1a2e;
  --generate: #16213e;
  --preview: #0f3460;
  --network: #533483;
  --self: #e94560;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background: var(--void);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.bg-void { background: var(--void); }
.text-self { color: var(--self); }
EOF

# 5. UPDATE package.json
echo -e "${BLUE}📦 Updating package.json...${NC}"
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.dependencies = pkg.dependencies || {};
pkg.devDependencies = pkg.devDependencies || {};

// Add required deps
const deps = ['framer-motion', 'zustand', 'lucide-react'];
deps.forEach(d => {
  if (!pkg.dependencies[d]) pkg.dependencies[d] = 'latest';
});

// Add scripts
pkg.scripts = pkg.scripts || {};
pkg.scripts['type-check'] = 'tsc --noEmit';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# 6. CREATE .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Build
.next/
out/
build
dist

# Environment
.env
.env.local
.env.*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode
.idea
*.swp

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF

# 7. CREATE README
cat > README.md << 'EOF'
# 🌊 Trident Sentient

Multi-leveled autonomous morphing interface with voice control and embedded learning.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/trident-sentient)

## Quick Start

```bash
npm install
npm run dev
