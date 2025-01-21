import React from 'react';
import { formatBytes } from '../utils/imageUtils';
import type { UploadedImage } from '../types';
import { Palette, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageInfoProps {
  image: UploadedImage;
  onExtractColors: () => void;
  onApplyFilter: () => void;
}

export const ImageInfo: React.FC<ImageInfoProps> = ({ image, onExtractColors, onApplyFilter }) => {
  return (
    <div className="space-y-4">
      <dl className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <dt className="text-secondary-500 dark:text-secondary-400 flex-shrink-0">Name</dt>
          <dd className="text-secondary-700 dark:text-secondary-300 font-medium break-all">{image.name}</dd>
        </div>
        
        {image.dimensions && (
          <div className="flex items-center justify-between">
            <dt className="text-secondary-500 dark:text-secondary-400">Dimensions</dt>
            <dd className="text-secondary-700 dark:text-secondary-300 font-medium">
              {image.dimensions.width} × {image.dimensions.height}px
            </dd>
          </div>
        )}
        
        {image.size && (
          <div className="flex items-center justify-between">
            <dt className="text-secondary-500 dark:text-secondary-400">Current Size</dt>
            <dd className="text-secondary-700 dark:text-secondary-300 font-medium">{formatBytes(image.size)}</dd>
          </div>
        )}
        
        {image.originalSize && image.originalSize !== image.size && (
          <div className="flex items-center justify-between">
            <dt className="text-secondary-500 dark:text-secondary-400">Original Size</dt>
            <dd className="text-secondary-700 dark:text-secondary-300 font-medium">{formatBytes(image.originalSize)}</dd>
          </div>
        )}
      </dl>

      <div className="border-t border-secondary-100 dark:border-secondary-700 pt-4 flex gap-2">
        <motion.button
          onClick={onExtractColors}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary-100 dark:bg-secondary-700/50 hover:bg-secondary-200 dark:hover:bg-secondary-600/50 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm transition-colors"
        >
          <Palette className="h-4 w-4" />
          Extract Colors
        </motion.button>

        <motion.button
          onClick={onApplyFilter}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary-100 dark:bg-secondary-700/50 hover:bg-secondary-200 dark:hover:bg-secondary-600/50 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm transition-colors"
        >
          <Filter className="h-4 w-4" />
          Apply Filter
        </motion.button>
      </div>
    </div>
  );
};