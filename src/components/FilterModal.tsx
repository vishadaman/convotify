import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ImageFilter } from '../types';

interface FilterModalProps {
  onApply: (filter: ImageFilter) => void;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ onApply, onClose }) => {
  const filters: { type: ImageFilter; label: string }[] = [
    { type: 'grayscale', label: 'Grayscale' },
    { type: 'invert', label: 'Invert' },
    { type: 'sepia', label: 'Sepia' },
    { type: 'blur', label: 'Blur' },
    { type: 'brightness', label: 'Brightness' },
    { type: 'contrast', label: 'Contrast' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-lg max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-800">Apply Filter</h2>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-full hover:bg-secondary-100 text-secondary-500"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {filters.map(({ type, label }) => (
              <motion.button
                key={type}
                onClick={() => onApply(type)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <span className="text-secondary-700 font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};