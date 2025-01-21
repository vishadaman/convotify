import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConversionOptions } from '../components/ConversionOptions';
import { ConversionResultView } from '../components/ConversionResult';
import { ImageInfo } from '../components/ImageInfo';
import { LoadingAnimation } from '../components/LoadingAnimation';
import { ColorPaletteModal } from '../components/ColorPaletteModal';
import { FilterModal } from '../components/FilterModal';
import { AdBlock } from '../components/AdBlock';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import type { ConversionFormat, ConversionResult, UploadedImage, ImageFilter } from '../types';
import { extractTextFromImage, convertToVector, convertToEmojiArt, convertToAsciiArt, convertToBraille, extractColorPalette, applyImageFilter } from '../utils/imageUtils';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ConvertPage: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ConversionFormat | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  useEffect(() => {
    const storedImage = sessionStorage.getItem('uploadedImage');
    if (!storedImage) {
      navigate('/');
      return;
    }

    try {
      const imageData = JSON.parse(storedImage);
      if (!imageData.url) {
        throw new Error('Invalid image data');
      }
      setUploadedImage(imageData);
    } catch (error) {
      console.error('Failed to parse stored image:', error);
      toast.error('Failed to load image data');
      navigate('/');
    }
  }, [navigate]);

  const handleExtractColors = async () => {
    if (!uploadedImage?.url) return;
    
    try {
      setIsConverting(true);
      const colors = await extractColorPalette(uploadedImage.url);
      setExtractedColors(colors);
      setShowColorPalette(true);
    } catch (error) {
      console.error('Failed to extract colors:', error);
      toast.error('Failed to extract color palette');
    } finally {
      setIsConverting(false);
    }
  };

  const handleApplyFilter = async (filter: ImageFilter) => {
    if (!uploadedImage?.url) return;
    
    try {
      setIsConverting(true);
      const filteredImageUrl = await applyImageFilter(uploadedImage.url, filter);
      
      const result: ConversionResult = {
        format: 'filter',
        url: filteredImageUrl,
        filename: `${uploadedImage.name}-${filter}.png`,
        filter
      };
      
      setConversionResult(result);
      setShowFilterModal(false);
      toast.success(`Applied ${filter} filter successfully!`);
    } catch (error) {
      console.error('Failed to apply filter:', error);
      toast.error('Failed to apply image filter');
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvert = async (format: ConversionFormat) => {
    if (!uploadedImage?.url) {
      toast.error('No image selected');
      return;
    }

    setSelectedFormat(format);
    setIsConverting(true);

    try {
      let result: ConversionResult;

      switch (format) {
        case 'ocr':
          const text = await extractTextFromImage(uploadedImage.url);
          const textBlob = new Blob([text], { type: 'text/plain' });
          result = {
            format: 'ocr',
            url: URL.createObjectURL(textBlob),
            filename: `${uploadedImage.name}-text.txt`,
            text
          };
          break;

        case 'vector':
          const svg = await convertToVector(uploadedImage.url);
          const vectorBlob = new Blob([svg], { type: 'image/svg+xml' });
          result = {
            format: 'vector',
            url: URL.createObjectURL(vectorBlob),
            filename: `${uploadedImage.name}-vector.svg`,
            data: svg
          };
          break;

        case 'emoji':
          const emojiArt = await convertToEmojiArt(uploadedImage.url);
          const emojiBlob = new Blob([emojiArt], { type: 'text/plain' });
          result = {
            format: 'emoji',
            url: URL.createObjectURL(emojiBlob),
            filename: `${uploadedImage.name}-emoji.txt`,
            text: emojiArt
          };
          break;

        case 'ascii':
          const asciiArt = await convertToAsciiArt(uploadedImage.url);
          const asciiBlob = new Blob([asciiArt], { type: 'text/plain' });
          result = {
            format: 'ascii',
            url: URL.createObjectURL(asciiBlob),
            filename: `${uploadedImage.name}-ascii.txt`,
            text: asciiArt
          };
          break;

        case 'braille':
          const brailleArt = await convertToBraille(uploadedImage.url);
          const brailleBlob = new Blob([brailleArt], { type: 'text/plain' });
          result = {
            format: 'braille',
            url: URL.createObjectURL(brailleBlob),
            filename: `${uploadedImage.name}-braille.txt`,
            text: brailleArt
          };
          break;

        case 'pdf':
          const pdf = new jsPDF();
          const imgProps = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = () => reject(new Error('Failed to load image for PDF conversion'));
            img.src = uploadedImage.url;
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.addImage(uploadedImage.url, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          const pdfBlob = pdf.output('blob');
          result = {
            format: 'pdf',
            url: URL.createObjectURL(pdfBlob),
            filename: `${uploadedImage.name}.pdf`
          };
          break;

        case 'svg':
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <image href="${uploadedImage.url}" width="100%" height="100%" />
          </svg>`;
          const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
          result = {
            format: 'svg',
            url: URL.createObjectURL(svgBlob),
            filename: `${uploadedImage.name}.svg`,
            data: svgContent
          };
          break;

        case 'base64':
          result = {
            format: 'base64',
            url: uploadedImage.url,
            filename: `${uploadedImage.name}.txt`,
            data: uploadedImage.url
          };
          break;

        case 'thumbnail':
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const thumbnailSize = 48;
          canvas.width = thumbnailSize;
          canvas.height = thumbnailSize;

          const thumbnailImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
            img.src = uploadedImage.url;
          });

          if (ctx) {
            ctx.drawImage(thumbnailImg, 0, 0, thumbnailSize, thumbnailSize);
            const thumbnailBlob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => resolve(blob!), 'image/png');
            });

            result = {
              format: 'thumbnail',
              url: URL.createObjectURL(thumbnailBlob),
              filename: `${uploadedImage.name}-thumbnail.png`
            };
          } else {
            throw new Error('Failed to create thumbnail context');
          }
          break;

        default:
          throw new Error('Unsupported conversion format');
      }

      setConversionResult(result);
      toast.success('Conversion completed successfully!');
    } catch (error) {
      console.error('Conversion failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to convert the image');
    } finally {
      setIsConverting(false);
    }
  };

  if (!uploadedImage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-800/50 border-b border-secondary-100 dark:border-secondary-700 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <h1 className="text-xl font-semibold text-secondary-800 dark:text-secondary-200">Convert Image</h1>
            </motion.div>

            {/* Conversion Result Buttons */}
            {conversionResult && <ConversionResultView result={conversionResult} />}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Banner Ad */}
        <div className="mb-6">
          <AdBlock type="banner" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Image Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3"
          >
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-secondary-800/50 rounded-xl shadow-sm dark:shadow-secondary-900/30 overflow-hidden">
                <div className="relative group">
                  <div className="aspect-square overflow-hidden bg-secondary-50 dark:bg-secondary-900/30">
                    <img
                      src={uploadedImage.url}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 dark:bg-secondary-800/90 hover:bg-white dark:hover:bg-secondary-700 shadow-sm text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
                  <ImageInfo 
                    image={uploadedImage}
                    onExtractColors={handleExtractColors}
                    onApplyFilter={() => setShowFilterModal(true)}
                  />
                </div>
              </div>

              {/* Sidebar Ad */}
              <AdBlock type="sidebar" />
            </div>
          </motion.div>

          {/* Right Column - Conversion Options */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-2/3"
          >
            <div className="space-y-6">
              <div className="bg-white dark:bg-secondary-800/50 rounded-xl shadow-sm dark:shadow-secondary-900/30 p-6">
                <h2 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200 mb-6">
                  Choose Format
                </h2>
                <ConversionOptions
                  onConvert={handleConvert}
                  selectedFormat={selectedFormat}
                  disabled={isConverting}
                  isConverting={isConverting}
                />
              </div>

              {/* Native Ad */}
              <div className="max-w-md mx-auto">
                <AdBlock type="native" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Preview */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <img
              src={uploadedImage.url}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Palette Modal */}
      <AnimatePresence>
        {showColorPalette && (
          <ColorPaletteModal
            colors={extractedColors}
            onClose={() => setShowColorPalette(false)}
          />
        )}
      </AnimatePresence>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <FilterModal
            onApply={handleApplyFilter}
            onClose={() => setShowFilterModal(false)}
          />
        )}
      </AnimatePresence>

      {isConverting && <LoadingAnimation />}
    </div>
  );
};

export default ConvertPage;