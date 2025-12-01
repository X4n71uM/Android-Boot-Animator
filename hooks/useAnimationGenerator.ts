
import { useState } from 'react';
import type { AnimationConfig, AnimationMode, ProcessingState } from '../types';

declare const JSZip: any;
declare const saveAs: any;

const initialConfig: AnimationConfig = {
  width: 1080,
  height: 1920,
  fps: 30,
  mode: 'standard',
  quality: 0.9, // Default JPEG quality
};

const initialProcessingState: ProcessingState = {
  isProcessing: false,
  progress: 0,
  message: '',
  error: null,
};

// Helper to pad frame numbers (e.g., 1 -> '0001')
const padFrameNumber = (num: number, length: number = 4) => String(num).padStart(length, '0');

// Helper to sort files numerically (e.g., 'frame10.png' after 'frame2.png')
const numericSort = (a: File, b: File) => {
    const numA = parseInt(a.name.replace(/[^0-9]/g, ''), 10);
    const numB = parseInt(b.name.replace(/[^0-9]/g, ''), 10);
    return numA - numB;
};

export function useAnimationGenerator() {
  const [config, setConfig] = useState<AnimationConfig>(initialConfig);
  const [introFiles, setIntroFiles] = useState<File[] | null>(null);
  const [loopFiles, setLoopFiles] = useState<File[] | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>(initialProcessingState);

  const updateProgress = (progress: number, message: string) => {
    setProcessingState((prev) => ({ ...prev, progress, message, error: null }));
  };

  const processSource = async (files: File[], targetWidth: number, targetHeight: number, targetFps: number, quality: number): Promise<Blob[]> => {
    if (!files || files.length === 0) return [];
    
    const firstFile = files[0];
    // Video/GIF processing
    if (files.length === 1 && (firstFile.type.startsWith('video/') || firstFile.type === 'image/gif')) {
      return extractFramesFromVideo(firstFile, targetWidth, targetHeight, targetFps, quality);
    }
    // Image sequence processing
    if (files.every(f => f.type.startsWith('image/'))) {
      return processImageSequence(files, targetWidth, targetHeight, quality);
    }

    throw new Error('Unsupported file combination. Please provide a single video/GIF or an image sequence.');
  };

  const processImageSequence = (files: File[], targetWidth: number, targetHeight: number, quality: number): Promise<Blob[]> => {
      return new Promise(async (resolve, reject) => {
          const sortedFiles = files.sort(numericSort);
          const frames: Blob[] = [];
          
          for (let i = 0; i < sortedFiles.length; i++) {
              try {
                  const file = sortedFiles[i];
                  updateProgress((i / sortedFiles.length) * 100, `Processing image ${i + 1}/${sortedFiles.length}`);
                  const bitmap = await createImageBitmap(file);
                  const resizedFrame = await resizeFrame(bitmap, targetWidth, targetHeight, quality);
                  frames.push(resizedFrame);
              } catch (err) {
                  reject(new Error(`Failed to process image ${sortedFiles[i].name}`));
                  return;
              }
          }
          resolve(frames);
      });
  };

  const extractFramesFromVideo = (file: File, targetWidth: number, targetHeight: number, targetFps: number, quality: number): Promise<Blob[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.muted = true;
      video.preload = 'auto';
      
      const frames: Blob[] = [];
      const objectURL = URL.createObjectURL(file);
      video.src = objectURL;
      
      const cleanup = () => {
          URL.revokeObjectURL(objectURL);
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
      };

      const onLoadedMetadata = async () => {
        try {
            const duration = video.duration;
            if (!isFinite(duration)) {
                throw new Error("Video duration is not available.");
            }
            const totalFrames = Math.floor(duration * targetFps);

            if (totalFrames <= 0) {
                cleanup();
                return resolve([]);
            }
            
            for (let i = 0; i < totalFrames; i++) {
                video.currentTime = i / targetFps;
                
                await new Promise<void>((res, rej) => {
                    const timeoutId = setTimeout(() => rej(new Error(`Video seek timed out at frame ${i}`)), 5000);
                    video.addEventListener('seeked', () => {
                        clearTimeout(timeoutId);
                        res();
                    }, { once: true });
                });

                const bitmap = await createImageBitmap(video);
                const resizedFrame = await resizeFrame(bitmap, targetWidth, targetHeight, quality);
                frames.push(resizedFrame);
                
                updateProgress(((i + 1) / totalFrames) * 100, `Extracting frame ${i + 1}/${totalFrames}`);
            }
            
            cleanup();
            resolve(frames);
        } catch (err: any) {
            cleanup();
            reject(new Error(`Failed to process video frames: ${err.message || err}`));
        }
      };
      
      const onError = () => {
        cleanup();
        reject(new Error('Failed to load video file. It might be corrupt or in an unsupported format.'));
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);
    });
  };

  const resizeFrame = (bitmap: ImageBitmap, targetWidth: number, targetHeight: number, quality: number): Promise<Blob> => {
      return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Could not get canvas context');

          // Letterboxing logic
          const sourceRatio = bitmap.width / bitmap.height;
          const targetRatio = targetWidth / targetHeight;
          let drawWidth = targetWidth;
          let drawHeight = targetHeight;
          let dx = 0;
          let dy = 0;

          if (sourceRatio > targetRatio) { // Source is wider
            drawHeight = targetWidth / sourceRatio;
            dy = (targetHeight - drawHeight) / 2;
          } else { // Source is taller or same ratio
            drawWidth = targetHeight * sourceRatio;
            dx = (targetWidth - drawWidth) / 2;
          }

          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(bitmap, dx, dy, drawWidth, drawHeight);

          canvas.toBlob(blob => {
              if (blob) resolve(blob);
              else reject('Failed to convert canvas to blob');
          }, 'image/jpeg', quality); // Use image/jpeg with quality setting
      });
  };

  const generateAnimation = async () => {
    setProcessingState({ ...initialProcessingState, isProcessing: true });

    try {
      let part0Frames: Blob[] = [];
      let part1Frames: Blob[] = [];

      const { width, height, fps, quality } = config;

      if (config.mode === 'standard') {
        if (loopFiles) {
           updateProgress(0, 'Processing standard loop...');
           part0Frames = await processSource(loopFiles, width, height, fps, quality);
        }
      } else {
        if (introFiles) {
          updateProgress(0, 'Processing intro sequence...');
          part0Frames = await processSource(introFiles, width, height, fps, quality);
        }
        if (loopFiles) {
          updateProgress(0, 'Processing loop sequence...');
          part1Frames = await processSource(loopFiles, width, height, fps, quality);
        }
      }
      
      updateProgress(95, 'Generating desc.txt and zipping files...');

      // Generate desc.txt
      let descTxt = `${config.width} ${config.height} ${config.fps}\n`;
      if (config.mode === 'standard') {
        descTxt += `p 0 0 part0\n`;
      } else {
        descTxt += `p 1 0 part0\n`;
        descTxt += `p 0 0 part1\n`;
      }

      // Create ZIP
      const zip = new JSZip();
      zip.file('desc.txt', descTxt);
      const part0 = zip.folder('part0');
      const part1 = zip.folder('part1');

      part0Frames.forEach((frame, i) => {
        part0.file(`${padFrameNumber(i)}.jpg`, frame); // Save as .jpg
      });
      part1Frames.forEach((frame, i) => {
        part1.file(`${padFrameNumber(i)}.jpg`, frame); // Save as .jpg
      });
      
      updateProgress(99, 'Finalizing download...');
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'STORE', // CRITICAL: No compression
      });

      saveAs(zipBlob, 'bootanimation.zip');
      setProcessingState({ ...initialProcessingState, isProcessing: false });

    } catch (error: any) {
      setProcessingState({ ...initialProcessingState, isProcessing: false, error: error.message || 'An unknown error occurred.' });
    }
  };

  return {
    config,
    setConfig,
    introFiles,
    setIntroFiles,
    loopFiles,
    setLoopFiles,
    processingState,
    generateAnimation,
  };
}
