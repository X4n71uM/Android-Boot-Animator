
import React from 'react';
import type { AnimationConfig, AnimationMode } from '../types';

interface ConfigurationPanelProps {
  config: AnimationConfig;
  onConfigChange: React.Dispatch<React.SetStateAction<AnimationConfig>>;
  onModeChange: (mode: AnimationMode) => void;
}

const InputField: React.FC<{ label: string; value: number; onChange: (value: number) => void; placeholder: string; unit: string; }> = 
  ({ label, value, onChange, placeholder, unit }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
      placeholder={placeholder}
      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
      min="1"
    />
    <span className="absolute right-3 top-8 text-gray-500 text-sm">{unit}</span>
  </div>
);

const SliderField: React.FC<{ label: string; value: number; onChange: (value: number) => void; }> =
  ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-1">{label} <span className="text-white font-semibold">{Math.round(value * 100)}%</span></label>
    <input
      type="range"
      min="0.1"
      max="1"
      step="0.05"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);


const ModeButton: React.FC<{ label: string; active: boolean; onClick: () => void; }> =
  ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors w-full ${
      active ? 'bg-cyan-500 text-white shadow' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
    }`}
  >
    {label}
  </button>
);


export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config, onConfigChange, onModeChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 items-end">
      <InputField
        label="Width"
        value={config.width}
        onChange={(val) => onConfigChange(c => ({...c, width: val}))}
        placeholder="e.g., 1080"
        unit="px"
      />
      <InputField
        label="Height"
        value={config.height}
        onChange={(val) => onConfigChange(c => ({...c, height: val}))}
        placeholder="e.g., 1920"
        unit="px"
      />
      <InputField
        label="Framerate"
        value={config.fps}
        onChange={(val) => onConfigChange(c => ({...c, fps: val}))}
        placeholder="e.g., 30"
        unit="fps"
      />
      <div className="sm:col-span-1">
         <SliderField
            label="Frame Quality"
            value={config.quality}
            onChange={(val) => onConfigChange(c => ({ ...c, quality: val }))}
        />
      </div>
      <div className="sm:col-span-2 md:col-span-1">
        <label className="block text-sm font-medium text-gray-400 mb-1">Mode</label>
        <div className="flex bg-gray-800 rounded-lg p-1 space-x-1">
            <ModeButton label="Standard" active={config.mode === 'standard'} onClick={() => onModeChange('standard')} />
            <ModeButton label="Intro + Loop" active={config.mode === 'intro_loop'} onClick={() => onModeChange('intro_loop')} />
        </div>
      </div>
    </div>
  );
};