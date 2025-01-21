import React from 'react';
import { Download, Copy, Check, Eye } from 'lucide-react';
import type { ConversionResult } from '../types';
import { motion } from 'framer-motion';
import { PreviewModal } from './PreviewModal';
import { toast } from 'react-toastify';

interface ConversionResultProps {
  result: ConversionResult | null;
}

export const ConversionResultView: React.FC<ConversionResultProps> = ({ result }) => {
  const [copied, setCopied] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  if (!result) return null;

  const handleCopy = async () => {
    if (result.data) {
      try {
        await navigator.clipboard.writeText(result.data);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  const copyLabel = result.format === 'base64' ? 'Copy Base64' : 'Copy SVG';

  return (
    <>
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => setShowPreview(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-100/80 hover:bg-secondary-200/80 backdrop-blur-sm text-secondary-700 rounded-lg text-sm transition-colors"
        >
          <Eye className="h-4 w-4" />
          Preview
        </motion.button>

        {result.data && (
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-100/80 hover:bg-secondary-200/80 backdrop-blur-sm text-secondary-700 rounded-lg text-sm transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : copyLabel}
          </motion.button>
        )}

        <motion.a
          href={result.url}
          download={result.filename}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600/90 hover:bg-primary-700/90 backdrop-blur-sm text-white rounded-lg text-sm transition-colors"
        >
          <Download className="h-4 w-4" />
          Download
        </motion.a>
      </div>

      {showPreview && result && (
        <PreviewModal
          result={result}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};