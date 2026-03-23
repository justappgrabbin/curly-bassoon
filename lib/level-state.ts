import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Level, Intent, Generation, LearningSample, SentientNode, OntologicalAddress } from '@/types/sentient';

interface LevelState {
  currentLevel: Level;
  previousLevel: Level;
  transitionProgress: number;
  activeIntent: Intent | null;
  activeGeneration: Generation | null;
  generationHistory: Generation[];
  memory: LearningSample[];
  modelWeights: Float32Array | null;
  peers: Map<string, SentientNode>;
  myAddress: OntologicalAddress | null;
  isConnected: boolean;
  isListening: boolean;
  isGenerating: boolean;
  showNetwork: boolean;
  
  setLevel: (level: Level) => void;
  setIntent: (intent: Intent | null) => void;
  setGeneration: (generation: Generation | null) => void;
  addToMemory: (sample: LearningSample) => void;
  updateModelWeights: (weights: Float32Array) => void;
  setListening: (listening: boolean) => void;
  setGenerating: (generating: boolean) => void;
  addPeer: (node: SentientNode) => void;
  removePeer: (id: string) => void;
  setMyAddress: (address: OntologicalAddress) => void;
  toggleNetwork: () => void;
}

export const useLevelStore = create<LevelState>()(
  persist(
    (set, get) => ({
      currentLevel: 'void',
      previousLevel: 'void',
      transitionProgress: 0,
      activeIntent: null,
      activeGeneration: null,
      generationHistory: [],
      memory: [],
      modelWeights: null,
      peers: new Map(),
      myAddress: null,
      isConnected: false,
      isListening: false,
      isGenerating: false,
      showNetwork: false,
      
      setLevel: (level) => set((state) => ({
        previousLevel: state.currentLevel,
        currentLevel: level,
        transitionProgress: 0,
      })),
      
      setIntent: (intent) => set({ activeIntent: intent }),
      
      setGeneration: (generation) => set((state) => {
        if (generation) {
          return {
            activeGeneration: generation,
            generationHistory: [...state.generationHistory, generation],
          };
        }
        return { activeGeneration: null };
      }),
      
      addToMemory: (sample) => set((state) => ({
        memory: [...state.memory.slice(-999), sample],
      })),
      
      updateModelWeights: (weights) => set({ modelWeights: weights }),
      
      setListening: (listening) => set({ isListening: listening }),
      
      setGenerating: (generating) => set({ isGenerating: generating }),
      
      addPeer: (node) => set((state) => {
        const newPeers = new Map(state.peers);
        newPeers.set(node.id, node);
        return { peers: newPeers, isConnected: true };
      }),
      
      removePeer: (id) => set((state) => {
        const newPeers = new Map(state.peers);
        newPeers.delete(id);
        return { peers: newPeers, isConnected: newPeers.size > 0 };
      }),
      
      setMyAddress: (address) => set({ myAddress: address }),
      
      toggleNetwork: () => set((state) => ({ showNetwork: !state.showNetwork })),
    }),
    {
      name: 'trident-sentient-storage',
      partialize: (state) => ({
        memory: state.memory,
        modelWeights: state.modelWeights,
        myAddress: state.myAddress,
        generationHistory: state.generationHistory,
      }),
    }
  )
);
