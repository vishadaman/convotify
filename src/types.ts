export type ConversionFormat = 'svg' | 'pdf' | 'base64' | 'ocr' | 'vector' | 'emoji' | 'ascii' | 'thumbnail' | 'braille' | 'palette' | 'filter';

export type ImageFilter = 'grayscale' | 'invert' | 'sepia' | 'blur' | 'brightness' | 'contrast';

export interface ConversionResult {
  format: ConversionFormat;
  url: string;
  filename: string;
  data?: string;
  text?: string;
  colors?: string[];
  filter?: ImageFilter;
}

export interface UploadedImage {
  url: string;
  file?: File;
  name: string;
  size?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  originalSize?: number;
}