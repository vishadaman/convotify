import React from 'react';
import { FileType2, FileText, Code, Type, Projector as Vectors, Smile, Terminal, Image, Brain as Braille } from 'lucide-react';
import { ConversionFormat } from '../types';
import { motion } from 'framer-motion';

interface ConversionOptionsProps {
  onConvert: (format: ConversionFormat) => void;
  selectedFormat: ConversionFormat | null;
  disabled?: boolean;
  isConverting?: boolean;
}

interface ConversionOption {
  format: ConversionFormat;
  icon: React.ElementType;
  label: string;
  description: string;
}

interface CategoryGroup {
  title: string;
  description: string;
  options: ConversionOption[];
}

export const ConversionOptions: React.FC<ConversionOptionsProps> = ({
  onConvert,
  selectedFormat,
  disabled,
  isConverting
}) => {
  const categories: CategoryGroup[] = [
    {
      title: "Vector Formats",
      description: "Convert to scalable graphics formats",
      options: [
        { 
          format: 'vector' as ConversionFormat, 
          icon: Vectors, 
          label: 'Vector',
          description: 'Convert to scalable vector graphics'
        },
        { 
          format: 'svg' as ConversionFormat, 
          icon: FileType2, 
          label: 'SVG',
          description: 'Convert to SVG format'
        }
      ]
    },
    {
      title: "Document Formats",
      description: "Convert to document and text formats",
      options: [
        { 
          format: 'pdf' as ConversionFormat, 
          icon: FileText, 
          label: 'PDF',
          description: 'Convert to PDF format'
        },
        { 
          format: 'ocr' as ConversionFormat, 
          icon: Type, 
          label: 'Extract Text',
          description: 'Extract text from image using OCR'
        }
      ]
    },
    {
      title: "Art & Creative",
      description: "Convert to artistic representations",
      options: [
        { 
          format: 'emoji' as ConversionFormat, 
          icon: Smile, 
          label: 'Emoji Art',
          description: 'Create an emoji-based version'
        },
        {
          format: 'ascii' as ConversionFormat,
          icon: Terminal,
          label: 'ASCII Art',
          description: 'Convert to text-based art'
        },
        {
          format: 'braille' as ConversionFormat,
          icon: Braille,
          label: 'Braille',
          description: 'Convert to tactile representation'
        }
      ]
    },
    {
      title: "Technical Formats",
      description: "Convert to technical formats",
      options: [
        { 
          format: 'base64' as ConversionFormat, 
          icon: Code, 
          label: 'Base64',
          description: 'Convert to Base64 format'
        },
        {
          format: 'thumbnail' as ConversionFormat,
          icon: Image,
          label: 'Thumbnail',
          description: 'Create 48x48 icon version'
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {categories.map((category, index) => (
        <div key={index} className="space-y-4">
          <div className="border-b border-secondary-100 dark:border-secondary-700 pb-2">
            <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200">
              {category.title}
            </h3>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              {category.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.options.map(({ format, icon: Icon, label, description }) => {
              const isSelected = selectedFormat === format;
              const isProcessing = isConverting && isSelected;

              return (
                <motion.button
                  key={format}
                  onClick={() => !disabled && !isProcessing && onConvert(format)}
                  disabled={disabled || isProcessing}
                  whileHover={{ scale: disabled || isProcessing ? 1 : 1.02 }}
                  whileTap={{ scale: disabled || isProcessing ? 1 : 0.98 }}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-300
                    ${isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-glow dark:shadow-primary-500/20'
                      : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-secondary-50 dark:hover:bg-secondary-800/50'
                    }
                    ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    dark:bg-secondary-800/30
                  `}
                >
                  <Icon className={`mx-auto h-6 w-6 ${
                    isSelected 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-secondary-400 dark:text-secondary-500'
                  }`} />
                  <p className={`mt-2 text-base font-semibold ${
                    isSelected 
                      ? 'text-primary-700 dark:text-primary-300' 
                      : 'text-secondary-700 dark:text-secondary-300'
                  }`}>
                    {isProcessing ? 'Converting...' : label}
                  </p>
                  <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-400 line-clamp-2">
                    {description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};