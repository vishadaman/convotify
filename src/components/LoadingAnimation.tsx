import React from 'react';
import Lottie from 'lottie-react';
import convertingAnimation from '../assets/converting-animation.json';

export const LoadingAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="w-32 h-32">
        <Lottie animationData={convertingAnimation} loop />
      </div>
    </div>
  );
};