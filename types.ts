
export type AnimationMode = 'standard' | 'intro_loop';

export interface AnimationConfig {
  width: number;
  height: number;
  fps: number;
  mode: AnimationMode;
  quality: number; // Represents JPEG quality from 0.1 to 1.0
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  message: string;
  error: string | null;
}