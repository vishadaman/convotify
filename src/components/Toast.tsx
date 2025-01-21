import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileWarning, X } from 'lucide-react';

interface ToastProps {
  message: string;
  fileType: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, fileType, isVisible, onClose }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <FileWarning className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-secondary-900">{message}</p>
                  <p className="mt-1 text-sm text-secondary-500">
                    File type: <span className="font-mono">{fileType}</span>
                  </p>
                  <p className="mt-2 text-xs text-primary-600">
                    We're working on adding support for this format. Check back soon!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-secondary-100 text-secondary-400 hover:text-secondary-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="h-1 bg-amber-500 animate-[shrink_3s_linear]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};