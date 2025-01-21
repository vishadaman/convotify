import React from 'react';
import { motion } from 'framer-motion';

interface AdBlockProps {
  type: 'sidebar' | 'banner' | 'native';
  className?: string;
}

export const AdBlock: React.FC<AdBlockProps> = ({ type, className = '' }) => {
  const getAdDimensions = () => {
    switch (type) {
      case 'banner':
        return 'h-[90px] min-w-[728px] max-w-full';
      case 'sidebar':
        return 'w-[300px] h-[600px] max-w-full';
      case 'native':
        return 'w-full aspect-[4/3] max-w-[600px]';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`ad-container ${className}`}
    >
      <div className={`
        relative overflow-hidden ${getAdDimensions()}
        bg-gradient-to-br from-secondary-50/80 to-secondary-100/80
        dark:from-secondary-800/30 dark:to-secondary-700/30
        border border-secondary-100 dark:border-secondary-700
        rounded-lg backdrop-blur-sm
        transition-colors duration-200
      `}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="w-2/3 h-2 bg-secondary-200/50 dark:bg-secondary-600/50 rounded-full mb-2 animate-pulse" />
          <div className="w-1/2 h-2 bg-secondary-200/50 dark:bg-secondary-600/50 rounded-full" />
          <p className="absolute bottom-2 text-xs text-secondary-400 dark:text-secondary-500">
            Advertisement
          </p>
        </div>
      </div>
    </motion.div>
  );
};