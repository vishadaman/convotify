import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="h-16 w-16">
          <div className="absolute h-16 w-16 rounded-full border-4 border-gray-100"></div>
          <div className="absolute h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-white"></div>
        </div>
      </div>
    </div>
  );
};