
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, FileIcon, VideoIcon, ImageIcon } from './icons';

interface DropzoneProps {
  files: File[] | null;
  setFiles: (files: File[] | null) => void;
  title: string;
  description: string;
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith('video/')) return <VideoIcon className="w-6 h-6 text-purple-400" />;
  if (file.type.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-green-400" />;
  return <FileIcon className="w-6 h-6 text-gray-400" />;
};

export const Dropzone: React.FC<DropzoneProps> = ({ files, setFiles, title, description }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  }, [setFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const acceptedFormats = ".mp4, .webm, .mov, .gif, .png, .jpg, .jpeg";

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="text-sm text-gray-400 mb-2">{description}</p>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`flex-grow flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
          isDragActive ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-700/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleChange}
          accept={acceptedFormats}
        />
        {!files || files.length === 0 ? (
          <>
            <UploadIcon className="w-10 h-10 text-gray-500 mb-3" />
            <p className="text-center text-gray-400">
              <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">Video, GIF, or image sequence</p>
          </>
        ) : (
          <div className="w-full text-left">
            <h4 className="font-semibold text-gray-300 mb-2">Selected file(s):</h4>
            <ul className="space-y-2 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <li key={index} className="flex items-center gap-3 bg-gray-700/50 p-2 rounded">
                  {getFileIcon(file)}
                  <span className="text-sm text-gray-300 truncate">{file.name}</span>
                </li>
              ))}
            </ul>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setFiles(null);
                }}
                className="text-xs text-red-400 hover:text-red-300 mt-3 w-full text-center"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
