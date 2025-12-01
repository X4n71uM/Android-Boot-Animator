
import React from 'react';
import { useAnimationGenerator } from './hooks/useAnimationGenerator';
import type { AnimationMode } from './types';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { Dropzone } from './components/Dropzone';
import { ProgressBar } from './components/ProgressBar';
import { XantiumIcon } from './components/icons';

export default function App() {
  const {
    config,
    setConfig,
    introFiles,
    setIntroFiles,
    loopFiles,
    setLoopFiles,
    processingState,
    generateAnimation,
  } = useAnimationGenerator();

  const isGenerateDisabled =
    !config.width ||
    !config.height ||
    !config.fps ||
    processingState.isProcessing ||
    (config.mode === 'standard' && (!loopFiles || loopFiles.length === 0)) ||
    (config.mode === 'intro_loop' && ((!introFiles || introFiles.length === 0) || (!loopFiles || loopFiles.length === 0)));


  const handleModeChange = (mode: AnimationMode) => {
    setConfig((prev) => ({ ...prev, mode }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <XantiumIcon className="w-12 h-12 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Xantium's Core Animator</h1>
            <p className="text-gray-400">Create uncompressed Android boot animations with zero friction.</p>
          </div>
        </header>

        <main className="space-y-8">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">1. Configuration</h2>
            <ConfigurationPanel config={config} onConfigChange={setConfig} onModeChange={handleModeChange} />
          </div>

          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">2. Source Media</h2>
            <div className={`grid gap-6 ${config.mode === 'intro_loop' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {config.mode === 'intro_loop' && (
                <Dropzone
                  files={introFiles}
                  setFiles={setIntroFiles}
                  title="Intro Sequence (part0)"
                  description="Plays once at the beginning."
                />
              )}
              <Dropzone
                files={loopFiles}
                setFiles={setLoopFiles}
                title={config.mode === 'standard' ? "Animation Sequence (part0)" : "Loop Sequence (part1)"}
                description={config.mode === 'standard' ? "Loops indefinitely." : "Loops after the intro."}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center mt-8">
            {processingState.isProcessing ? (
              <ProgressBar progress={processingState.progress} message={processingState.message} />
            ) : (
              <button
                onClick={generateAnimation}
                disabled={isGenerateDisabled}
                className="w-full max-w-md bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-cyan-500/30 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
              >
                Generate & Download bootanimation.zip
              </button>
            )}
            {processingState.error && <p className="text-red-400 mt-4 text-center">{processingState.error}</p>}
          </div>
        </main>
      </div>
    </div>
  );
}
