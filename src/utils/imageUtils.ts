import { createWorker } from 'tesseract.js';
import type { ImageFilter } from '../types';
import Potrace from 'potrace';

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const extractColorPalette = async (imageUrl: string): Promise<string[]> => {
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const colors = new Map<string, number>();

          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            colors.set(hex, (colors.get(hex) || 0) + 1);
          }

          const sortedColors = Array.from(colors.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([color]) => color);

          resolve(sortedColors);
        } catch (error) {
          reject(new Error('Failed to process image colors'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image for color extraction'));
      img.src = imageUrl;
    });
  } catch (error) {
    throw new Error('Failed to extract colors: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const applyImageFilter = async (imageUrl: string, filter: ImageFilter): Promise<string> => {
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.filter = getFilterString(filter);
          ctx.drawImage(img, 0, 0);
          
          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(new Error('Failed to apply filter to image'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image for filtering'));
      img.src = imageUrl;
    });
  } catch (error) {
    throw new Error('Failed to apply filter: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

const getFilterString = (filter: ImageFilter): string => {
  switch (filter) {
    case 'grayscale':
      return 'grayscale(100%)';
    case 'invert':
      return 'invert(100%)';
    case 'sepia':
      return 'sepia(100%)';
    case 'blur':
      return 'blur(5px)';
    case 'brightness':
      return 'brightness(150%)';
    case 'contrast':
      return 'contrast(150%)';
    default:
      return 'none';
  }
};

export const extractTextFromImage = async (imageUrl: string): Promise<string> => {
  const worker = await createWorker();
  try {
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image for OCR'));
      image.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context for OCR');
    }

    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    const { data: { text } } = await worker.recognize(dataUrl);
    
    await worker.terminate();
    return text || 'No text found in image';
  } catch (error) {
    await worker.terminate();
    throw new Error('Failed to extract text: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const convertToVector = async (imageUrl: string): Promise<string> => {
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          const bwCanvas = document.createElement('canvas');
          const bwCtx = bwCanvas.getContext('2d');
          bwCanvas.width = canvas.width;
          bwCanvas.height = canvas.height;
          
          if (!bwCtx) {
            throw new Error('Failed to get B&W canvas context');
          }

          const bwImageData = bwCtx.createImageData(canvas.width, canvas.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            const value = brightness < 128 ? 0 : 255;
            bwImageData.data[i] = value;
            bwImageData.data[i + 1] = value;
            bwImageData.data[i + 2] = value;
            bwImageData.data[i + 3] = 255;
          }
          
          bwCtx.putImageData(bwImageData, 0, 0);

          Potrace.trace(bwCanvas.toDataURL(), (err: Error | null, svg: string) => {
            if (err) {
              reject(new Error('Failed to trace image to vector'));
              return;
            }
            
            const cleanedSvg = svg
              .replace(/width="\d+"/, 'width="100%"')
              .replace(/height="\d+"/, 'height="100%"')
              .replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"');
            
            resolve(cleanedSvg);
          });
        } catch (error) {
          reject(new Error('Failed to process image for vector conversion'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image for vector conversion'));
      img.src = imageUrl;
    });
  } catch (error) {
    throw new Error('Failed to convert to vector: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const convertToEmojiArt = async (imageUrl: string): Promise<string> => {
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = 30;
          canvas.width = size;
          canvas.height = size * (img.height / img.width);
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const emojiPalette = ['⚫', '🔵', '🟣', '🟢', '🟡', '⚪'];
          let emojiArt = '';
          
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const idx = (y * canvas.width + x) * 4;
              const brightness = (
                imageData.data[idx] +
                imageData.data[idx + 1] +
                imageData.data[idx + 2]
              ) / 3;
              const emojiIndex = Math.floor((brightness / 255) * (emojiPalette.length - 1));
              emojiArt += emojiPalette[emojiIndex];
            }
            emojiArt += '\n';
          }
          
          resolve(emojiArt);
        } catch (error) {
          reject(new Error('Failed to process image for emoji conversion'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image for emoji conversion'));
      img.src = imageUrl;
    });
  } catch (error) {
    throw new Error('Failed to convert to emoji art: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const convertToAsciiArt = async (imageUrl: string): Promise<string> => {
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const width = 100;
          const height = Math.floor(width * (img.height / img.width) * 0.5);
          canvas.width = width;
          canvas.height = height;
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const asciiChars = '@%#*+=-:. ';
          let asciiArt = '';
          
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const idx = (y * width + x) * 4;
              const brightness = (
                imageData.data[idx] +
                imageData.data[idx + 1] +
                imageData.data[idx + 2]
              ) / 3;
              const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
              asciiArt += asciiChars[charIndex];
            }
            asciiArt += '\n';
          }
          
          resolve(asciiArt);
        } catch (error) {
          reject(new Error('Failed to process image for ASCII conversion'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image for ASCII conversion'));
      img.src = imageUrl;
    });
  } catch (error) {
    throw new Error('Failed to convert to ASCII art: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const convertToBraille = async (imageUrl: string): Promise<string> => {
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const width = 60;
          const height = Math.floor(width * (img.height / img.width) * 0.5);
          canvas.width = width;
          canvas.height = height;
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }

          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          
          const braillePatterns = Array.from({ length: 256 }, (_, i) => 
            String.fromCharCode(0x2800 + i)
          );
          
          let brailleArt = '';
          
          for (let y = 0; y < height; y += 4) {
            for (let x = 0; x < width; x += 2) {
              let dots = 0;
              
              for (let dy = 0; dy < 4; dy++) {
                for (let dx = 0; dx < 2; dx++) {
                  if (y + dy < height && x + dx < width) {
                    const idx = ((y + dy) * width + (x + dx)) * 4;
                    const brightness = (
                      imageData.data[idx] +
                      imageData.data[idx + 1] +
                      imageData.data[idx + 2]
                    ) / 3;
                    
                    if (brightness < 128) {
                      const bitIndex = dy + (dx * 4);
                      dots |= 1 << bitIndex;
                    }
                  }
                }
              }
              brailleArt += braillePatterns[dots];
            }
            brailleArt += '\n';
          }
          
          resolve(brailleArt);
        } catch (error) {
          reject(new Error('Failed to process image for Braille conversion'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image for Braille conversion'));
      img.src = imageUrl;
    });
  } catch (error) {
    throw new Error('Failed to convert to Braille: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};