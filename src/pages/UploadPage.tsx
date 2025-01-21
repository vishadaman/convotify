import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '../components/ImageUploader';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);

      // Get image dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = objectUrl;
      });

      // Store image data in session storage
      sessionStorage.setItem('uploadedImage', JSON.stringify({
        url: objectUrl,
        name: file.name,
        size: file.size,
        dimensions,
        file // This will be needed for HEIC/RAW conversions
      }));

      // Navigate to convert page
      navigate('/convert');
    } catch (error) {
      console.error('Failed to process image:', error);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (url: string) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate URL
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Please enter a valid HTTP or HTTPS URL');
      }

      // First try direct fetch
      let response: Response;
      try {
        response = await fetch(url, { mode: 'cors' });
      } catch (corsError) {
        // If direct fetch fails, try with proxy
        response = await fetchWithProxy(url);
      }

      if (!response.ok) {
        throw new Error(`Failed to load image (HTTP ${response.status})`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.toLowerCase().startsWith('image/')) {
        throw new Error('The URL does not point to a valid image');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Get image dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = objectUrl;
      });

      // Store image data
      sessionStorage.setItem('uploadedImage', JSON.stringify({
        url: objectUrl,
        name: url.split('/').pop()?.split('?')[0] || 'image.jpg',
        size: blob.size,
        dimensions
      }));

      // Navigate to convert page
      navigate('/convert');
    } catch (error) {
      console.error('Failed to load image from URL:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Unable to load image. The URL might be invalid or the server is not responding.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to load image. Please try another URL or upload directly.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWithProxy = async (url: string) => {
    // Try different proxy services in case one fails
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];

    for (const proxyUrl of proxyUrls) {
      try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.warn(`Proxy failed: ${proxyUrl}`, error);
        continue;
      }
    }
    throw new Error('Unable to access the image. Please try a different URL or upload the image directly.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-secondary-800/50 rounded-xl shadow-soft dark:shadow-secondary-900/30 p-6"
    >
      <ImageUploader
        onImageUpload={handleImageUpload}
        onUrlSubmit={handleUrlSubmit}
        isLoading={isLoading}
      />
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-red-700 dark:text-red-300 text-sm">{error}</div>
        </motion.div>
      )}
    </motion.div>
  );
};