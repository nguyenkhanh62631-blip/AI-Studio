
export type AspectRatio = '1:1' | '16:9' | '9:16';
export type Quality = '2K' | '4K' | '8K';

export interface StylistOptions {
  background: string;
  pose: string;
  photoStyle: string;
  numImages: number;
  quality: Quality;
  aspectRatio: AspectRatio;
  description: string;
}

export interface GenerationResult {
  url: string;
  timestamp: number;
}
