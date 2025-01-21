import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Link, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Toast } from './Toast';

interface ImageUploaderProps {
  onImageUpload: (image: File) => void;
  onUrlSubmit: (url: string) => void;
  isLoading?: boolean;
}

const SUPPORTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  onUrlSubmit,
  isLoading = false 
}) => {
  const [toastInfo, setToastInfo] = useState<{ message: string; fileType: string; } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (isLoading) return;

    const file = acceptedFiles[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    // Check if the file type is supported
    const isSupported = Object.entries(SUPPORTED_FORMATS).some(([mimeType, extensions]) => {
      return fileType === mimeType || extensions.includes(extension);
    });

    if (isSupported) {
      onImageUpload(file);
    } else {
      setToastInfo({
        message: "Unsupported file format",
        fileType: file.type || `*.${file.name.split('.').pop()}`
      });
    }
  }, [onImageUpload, isLoading]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: Object.entries(SUPPORTED_FORMATS).reduce((acc, [mimeType, extensions]) => {
      acc[mimeType] = extensions;
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: 10485760, // 10MB
    disabled: isLoading,
    multiple: false
  });

  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const formData = new FormData(e.currentTarget);
    const url = formData.get('imageUrl') as string;
    
    if (url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        
        if (contentType && Object.keys(SUPPORTED_FORMATS).includes(contentType.toLowerCase())) {
          onUrlSubmit(url);
          e.currentTarget.reset();
        } else {
          setToastInfo({
            message: "Unsupported file format from URL",
            fileType: contentType || 'unknown'
          });
        }
      } catch (error) {
        setToastInfo({
          message: "Failed to validate image URL",
          fileType: 'unknown'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${isDragActive && !isDragReject
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
            : isDragReject
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : isLoading
                ? "border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/30 cursor-not-allowed"
                : "border-secondary-200 dark:border-secondary-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 cursor-pointer"
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-12 w-12 ${
          isDragActive && !isDragReject
            ? 'text-primary-500 dark:text-primary-400'
            : isDragReject
              ? 'text-red-500 dark:text-red-400'
              : isLoading 
                ? 'text-secondary-300 dark:text-secondary-600' 
                : 'text-secondary-400 dark:text-secondary-500'
        }`} />
        <p className="mt-4 text-lg font-semibold text-secondary-700 dark:text-secondary-300">
          {isLoading 
            ? 'Processing...' 
            : isDragReject
              ? 'This file type is not supported'
              : isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image here, or click to select'
          }
        </p>
        <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
          Supports {Object.values(SUPPORTED_FORMATS).flat().join(', ')} - max 10MB
        </p>
      </motion.div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-secondary-200 dark:border-secondary-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-secondary-800/50 text-secondary-500 dark:text-secondary-400">Or</span>
        </div>
      </div>

      <form onSubmit={handleUrlSubmit} className="flex gap-3">
        <div className="flex-1">
          <input
            type="url"
            name="imageUrl"
            placeholder="Paste image URL here"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-white dark:bg-secondary-800/30 border border-secondary-200 dark:border-secondary-700 rounded-lg text-secondary-700 dark:text-secondary-300 placeholder-secondary-400 dark:placeholder-secondary-500 focus:border-primary-500 dark:focus:border-primary-600 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30 transition-all duration-300 disabled:bg-secondary-50 dark:disabled:bg-secondary-800/50 disabled:cursor-not-allowed"
            required
          />
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          className={`
            flex items-center gap-2 px-6 py-2 font-semibold rounded-lg transition-all duration-300 shadow-glow dark:shadow-primary-500/20
            ${isLoading 
              ? 'bg-secondary-400 dark:bg-secondary-600 cursor-not-allowed' 
              : 'bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600'
            } text-white
          `}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Link className="h-5 w-5" />
          )}
          {isLoading ? 'Loading...' : 'Upload URL'}
        </motion.button>
      </form>

      <Toast
        message={toastInfo?.message || ''}
        fileType={toastInfo?.fileType || ''}
        isVisible={!!toastInfo}
        onClose={() => setToastInfo(null)}
      />
    </div>
  );
};