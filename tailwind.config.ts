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
  --glow: rgba(233, 69, 96, 0.5);
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  background: var(--void);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  touch-action: manipulation;
}

.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.morph-container {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.morph-surface {
  transition: 
    background-color 0.8s ease,
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.4s ease;
}

@keyframes waveform {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

.waveform-bar {
  animation: waveform 0.5s ease-in-out infinite;
  transform-origin: bottom;
}

@keyframes neural-pulse {
  0% { 
    box-shadow: 0 0 0 0 rgba(233, 69, 96, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 20px 10px rgba(233, 69, 96, 0.2);
    transform: scale(1.02);
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(233, 69, 96, 0);
    transform: scale(1);
  }
}

.neural-active {
  animation: neural-pulse 2s ease-in-out infinite;
}

.level-void { background: radial-gradient(ellipse at bottom, #1a1a2e 0%, #0a0a0a 100%); }
.level-voice { background: radial-gradient(ellipse at center, #16213e 0%, #1a1a2e 100%); }
.level-generate { background: radial-gradient(ellipse at center, #0f3460 0%, #16213e 100%); }
.level-preview { background: radial-gradient(ellipse at top, #533483 0%, #0f3460 100%); }
.level-network { background: radial-gradient(ellipse at center, #e94560 0%, #533483 100%); }
.level-self { background: radial-gradient(ellipse at center, #ff6b6b 0%, #e94560 50%, #533483 100%); }

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.touch-target {
  min-height: 44px;
  min-width: 44px;
}

@keyframes code-stream {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.code-char {
  animation: code-stream 0.05s ease-out forwards;
  opacity: 0;
}

@keyframes node-pulse {
  0%, 100% { 
    opacity: 0.4;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.2);
  }
}

.network-node {
  animation: node-pulse 3s ease-in-out infinite;
}

.resonance-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
