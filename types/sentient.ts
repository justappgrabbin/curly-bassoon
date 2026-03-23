export type Level = 'void' | 'voice' | 'generate' | 'preview' | 'network' | 'self';

export interface OntologicalAddress {
  gate: number;
  line: number;
  color: number;
  tone: number;
  base: number;
  degree: number;
  minute: number;
  second: number;
  arc: number;
  zodiac: string;
  house: number;
  planet: string;
  dimension: number;
}

export interface SentientNode {
  id: string;
  address: OntologicalAddress;
  publicKey: string;
  lastSeen: number;
  capabilities: string[];
  latency: number;
}

export interface Intent {
  raw: string;
  embedding: number[];
  confidence: number;
  category: 'create' | 'modify' | 'deploy' | 'query' | 'connect' | 'learn';
  parameters: Record<string, any>;
}

export interface Generation {
  id: string;
  intent: Intent;
  code: string;
  preview: string;
  timestamp: number;
  reward: number;
  iterations: number;
}

export interface LearningSample {
  input: Intent;
  output: Generation;
  reward: number;
  timestamp: number;
  context: Level;
}

export interface LevelConfig {
  id: Level;
  name: string;
  color: string;
  icon: string;
  allowVoice: boolean;
  allowGeneration: boolean;
  allowNetwork: boolean;
}

export const LEVELS: LevelConfig[] = [
  { id: 'void', name: 'Void', color: '#0a0a0a', icon: 'Circle', allowVoice: true, allowGeneration: false, allowNetwork: false },
  { id: 'voice', name: 'Listen', color: '#1a1a2e', icon: 'Mic', allowVoice: true, allowGeneration: false, allowNetwork: false },
  { id: 'generate', name: 'Create', color: '#16213e', icon: 'Sparkles', allowVoice: true, allowGeneration: true, allowNetwork: false },
  { id: 'preview', name: 'Preview', color: '#0f3460', icon: 'Eye', allowVoice: true, allowGeneration: true, allowNetwork: false },
  { id: 'network', name: 'Network', color: '#533483', icon: 'Network', allowVoice: true, allowGeneration: true, allowNetwork: true },
  { id: 'self', name: 'Self', color: '#e94560', icon: 'Brain', allowVoice: true, allowGeneration: true, allowNetwork: true },
];
