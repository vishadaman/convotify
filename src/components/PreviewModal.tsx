import React from 'react';
import { X, Copy, Download, Share2, Check } from 'lucide-react';
import type { ConversionResult } from '../types';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface PreviewModalProps {
  result: ConversionResult;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      if (result.data) {
        await navigator.clipboard.writeText(result.data);
      } else if (result.text) {
        await navigator.clipboard.writeText(result.text);
      } else {
        throw new Error('No content to copy');
      }
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleShare = async () => {
    try {
      // Create a temporary blob URL for sharing
      const response = await fetch(result.url);
      const blob = await response.blob();
      const file = new File([blob], result.filename, { type: blob.type });

      if (navigator.share) {
        await navigator.share({
          title: `Convertify - ${result.format.toUpperCase()} Conversion`,
          text: 'Check out this converted image!',
          files: [file]
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback to copy share URL
        const shareUrl = window.location.href;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled share
        return;
      }
      toast.error('Failed to share');
    }
  };

  const renderPreview = () => {
    switch (result.format) {
      case 'vector':
      case 'svg':
        return (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex-1 min-h-0 bg-secondary-50 dark:bg-secondary-900/50 rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
              <div className="w-full h-full flex items-center justify-center p-4">
                {result.data ? (
                  <div 
                    className="max-w-full max-h-full"
                    dangerouslySetInnerHTML={{ __html: result.data }}
                  />
                ) : (
                  <img
                    src={result.url}
                    alt={`${result.format.toUpperCase()} Preview`}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
            </div>
            {result.data && (
              <div className="flex-shrink-0 h-48 bg-secondary-50 dark:bg-secondary-900/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
                <div className="h-full p-4 overflow-y-auto">
                  <pre className="text-sm text-secondary-700 dark:text-secondary-300 font-mono whitespace-pre-wrap">
                    {result.data}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );

      case 'ocr':
      case 'emoji':
      case 'ascii':
      case 'braille':
        return (
          <div className="h-full bg-secondary-50 dark:bg-secondary-900/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
            <div className="h-full p-6">
              <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
                {result.format === 'ocr' && 'Extracted Text'}
                {result.format === 'emoji' && 'Emoji Art'}
                {result.format === 'ascii' && 'ASCII Art'}
                {result.format === 'braille' && 'Braille Pattern'}
              </h3>
              <div className={`whitespace-pre-wrap font-mono text-secondary-600 dark:text-secondary-400 text-sm ${
                ['emoji', 'ascii', 'braille'].includes(result.format) ? 'leading-none' : ''
              }`}>
                {result.text}
              </div>
            </div>
          </div>
        );

      case 'base64':
        return (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex-1 min-h-0 bg-secondary-50 dark:bg-secondary-900/50 rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={result.data}
                  alt="Base64 Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            <div className="flex-shrink-0 h-48 bg-secondary-50 dark:bg-secondary-900/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
              <div className="h-full p-4 overflow-y-auto">
                <code className="text-sm text-secondary-700 dark:text-secondary-300 font-mono break-all whitespace-pre-wrap">
                  {result.data}
                </code>
              </div>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="h-full bg-secondary-50 dark:bg-secondary-900/50 rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
            <iframe
              src={result.url}
              title="PDF Preview"
              className="w-full h-full"
            />
          </div>
        );

      case 'thumbnail':
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-secondary-50 dark:bg-secondary-900/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
            <div className="bg-white dark:bg-secondary-800 rounded-lg p-4 shadow-sm">
              <img
                src={result.url}
                alt="Thumbnail Preview"
                className="w-12 h-12 object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-secondary-500 dark:text-secondary-400">
              48x48 Thumbnail Preview
            </p>
          </div>
        );

      case 'filter':
        return (
          <div className="h-full bg-secondary-50 dark:bg-secondary-900/50 rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={result.url}
                alt={`${result.filter} Filter Preview`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center text-center p-8 text-secondary-500 dark:text-secondary-400">
            No preview available for this format
          </div>
        );
    }
  };

  const canCopy = Boolean(result.data || result.text);
  const canShare = Boolean(result.url) && (navigator.share || navigator.clipboard);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-secondary-900/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0">
        <div className="min-h-full p-4 flex items-center justify-center">
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-5xl bg-white dark:bg-secondary-800 rounded-xl shadow-xl dark:shadow-secondary-900/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-100 dark:border-secondary-700">
              <h2 className="text-xl font-semibold text-secondary-800 dark:text-secondary-200">
                {result.format.toUpperCase()} Preview
              </h2>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {canCopy && (
                  <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-300 text-sm transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </motion.button>
                )}

                <motion.button
                  onClick={handleDownload}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-300 text-sm transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </motion.button>

                {canShare && (
                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-300 text-sm transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </motion.button>
                )}

                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {renderPreview()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};