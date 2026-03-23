import * as tf from '@tensorflow/tfjs';
import { Intent, Generation, LearningSample } from '@/types/sentient';

export class LearningEngine {
  private model: tf.LayersModel | null = null;
  private embeddingDim = 64;
  private vocabSize = 10000;
  private maxLen = 50;
  
  async initialize() {
    this.model = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: this.vocabSize,
          outputDim: this.embeddingDim,
          inputLength: this.maxLen,
        }),
        tf.layers.conv1d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
        }),
        tf.layers.conv1d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
        }),
        tf.layers.globalMaxPooling1d(),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'sigmoid' }),
      ],
    });
    
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
    });
    
    console.log('Learning engine initialized');
    return this;
  }
  
  private textToEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/).slice(0, this.maxLen);
    const embedding = new Array(this.maxLen).fill(0);
    
    words.forEach((word, i) => {
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(j);
        hash = hash & hash;
      }
      embedding[i] = Math.abs(hash) % this.vocabSize;
    });
    
    return embedding;
  }
  
  async predict(intent: Intent): Promise<number[]> {
    if (!this.model) throw new Error('Model not initialized');
    
    const embedding = this.textToEmbedding(intent.raw);
    const input = tf.tensor2d([embedding], [1, this.maxLen]);
    
    const prediction = this.model.predict(input) as tf.Tensor;
    const values = await prediction.data();
    
    input.dispose();
    prediction.dispose();
    
    return Array.from(values);
  }
  
  async learn(sample: LearningSample): Promise<void> {
    if (!this.model) throw new Error('Model not initialized');
    
    const embedding = this.textToEmbedding(sample.input.raw);
    const xs = tf.tensor2d([embedding], [1, this.maxLen]);
    
    const target = [
      sample.output.code.length / 1000,
      sample.reward,
      sample.output.iterations / 10,
      sample.input.confidence,
      sample.input.category === 'create' ? 1 : 0,
      sample.input.category === 'modify' ? 1 : 0,
      sample.input.category === 'deploy' ? 1 : 0,
      sample.reward > 0.5 ? 1 : 0,
    ];
    
    const ys = tf.tensor2d([target], [1, 8]);
    
    await this.model.fit(xs, ys, {
      epochs: 1,
      verbose: 0,
    });
    
    xs.dispose();
    ys.dispose();
    
    console.log('Learned from sample:', sample.input.raw.slice(0, 30));
  }
  
  async save(): Promise<void> {
    if (!this.model) return;
    await this.model.save('indexeddb://trident-learning-model');
    console.log('Model saved');
  }
  
  async load(): Promise<boolean> {
    try {
      this.model = await tf.loadLayersModel('indexeddb://trident-learning-model');
      console.log('Model loaded from storage');
      return true;
    } catch {
      console.log('No saved model found');
      return false;
    }
  }
  
  async getWeights(): Promise<Float32Array> {
    if (!this.model) return new Float32Array();
    
    const weights = this.model.getWeights();
    const flattened = weights.map(w => w.dataSync() as Float32Array);
    
    let totalLength = 0;
    flattened.forEach(arr => totalLength += arr.length);
    
    const result = new Float32Array(totalLength);
    let offset = 0;
    flattened.forEach(arr => {
      result.set(arr, offset);
      offset += arr.length;
    });
    
    return result;
  }
}

export const learningEngine = new LearningEngine();
