import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface ColorPaletteModalProps {
  colors: string[];
  onClose: () => void;
}

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({ colors, onClose }) => {
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null);

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      toast.success(`Copied ${color} to clipboard!`);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (error) {
      toast.error('Failed to copy color code');
    }
  };

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
          <h2 className="text-lg font-semibold text-secondary-800">Color Palette</h2>
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
            {colors.map((color, index) => (
              <motion.button
                key={color}
                onClick={() => handleCopyColor(color)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex flex-col items-center p-4 rounded-lg border border-secondary-200 hover:border-primary-300 transition-colors"
              >
                <div 
                  className="w-full h-20 rounded-md mb-2"
                  style={{ backgroundColor: color }}
                />
                <div className="flex items-center gap-2 text-sm">
                  {copiedColor === color ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-secondary-400 group-hover:text-primary-500" />
                  )}
                  <span className="font-mono text-secondary-700">{color}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};