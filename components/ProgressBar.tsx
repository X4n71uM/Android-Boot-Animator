
import React from 'react';

interface ProgressBarProps {
  progress: number;
  message: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => {
  return (
    <div className="w-full max-w-md">
      <p className="text-center text-cyan-300 mb-2 font-medium">{message}</p>
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600">
        <div
          className="bg-cyan-500 h-4 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-center text-gray-400 mt-2 text-lg font-bold">{Math.round(progress)}%</p>
    </div>
  );
};
