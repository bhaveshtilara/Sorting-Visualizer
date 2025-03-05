"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

const SortingVisualizer = dynamic(() => import('@/components/SortingVisualizer'), { ssr: false });

export default function Home() {
  const [theme, setTheme] = useState<'space' | 'default' | 'tree'>('default');
  const [algorithm, setAlgorithm] = useState<'bubble' | 'quick' | 'merge' | 'heap' | 'selection' | 'insertion'>('bubble');
  const [speed, setSpeed] = useState(10);
  const [size, setSize] = useState(50);
  const [start, setStart] = useState(false);
  const [reset, setReset] = useState(false);

  const handleResetComplete = () => {
    setReset(false);
    setStart(false); // Ensure start is false after reset
  };

  const complexities = {
    bubble: { time: 'O(n²)', space: 'O(1)' },
    quick: { time: 'O(n log n) avg, O(n²) worst', space: 'O(log n)' },
    merge: { time: 'O(n log n)', space: 'O(n)' },
    heap: { time: 'O(n log n)', space: 'O(1)' },
    selection: { time: 'O(n²)', space: 'O(1)' },
    insertion: { time: 'O(n²)', space: 'O(1)' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="w-full py-4 sm:py-6 bg-gradient-to-r from-cyan-600 to-purple-600 bg-opacity-90 backdrop-blur-lg shadow-xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white">
          Sorting Odyssey
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col items-center gap-6 sm:gap-8">
        {/* Controls */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-gray-900 bg-opacity-95 rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-gradient-to-r from-cyan-500 to-purple-500 transform hover:scale-[1.02] transition-transform">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="theme-select" className="block text-sm font-bold text-cyan-400 mb-2 tracking-wide">Theme</label>
              <select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as typeof theme)}
                className="w-full p-3 rounded-xl bg-gray-800 border-2 border-cyan-600 text-white focus:ring-4 focus:ring-cyan-400 focus:outline-none transition-all hover:bg-gray-700"
              >
                <option value="default">Default (Bars)</option>
                <option value="space">Space (Circles)</option>
                <option value="tree">Tree (Forest)</option>
              </select>
            </div>
            <div>
              <label htmlFor="algo-select" className="block text-sm font-bold text-cyan-400 mb-2 tracking-wide">Algorithm</label>
              <select
                id="algo-select"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)}
                className="w-full p-3 rounded-xl bg-gray-800 border-2 border-cyan-600 text-white focus:ring-4 focus:ring-cyan-400 focus:outline-none transition-all hover:bg-gray-700"
              >
                <option value="bubble">Bubble Sort</option>
                <option value="quick">Quick Sort</option>
                <option value="merge">Merge Sort</option>
                <option value="heap">Heap Sort</option>
                <option value="selection">Selection Sort</option>
                <option value="insertion">Insertion Sort</option>
              </select>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="speed-slider" className="block text-sm font-bold text-cyan-400 mb-2 tracking-wide">Speed: {speed}</label>
              <input
                id="speed-slider"
                type="range"
                min="1"
                max="30"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
              />
            </div>
            <div>
              <label htmlFor="size-slider" className="block text-sm font-bold text-cyan-400 mb-2 tracking-wide">Size: {size}</label>
              <input
                id="size-slider"
                type="range"
                min="10"
                max="100"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
              />
            </div>
          </div>
          <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-4 justify-center mt-4 sm:mt-0">
            <button
              onClick={() => setStart(true)}
              disabled={start}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl shadow-lg hover:from-cyan-600 hover:to-teal-600 transform hover:scale-105 transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start
            </button>
            <button
              onClick={() => setReset(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl shadow-lg hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all w-full sm:w-auto"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Complexity Box */}
        <div className="w-full max-w-md bg-gray-900 bg-opacity-95 rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-purple-600 animate-fade-in-up">
          <h2 className="text-xl sm:text-2xl font-extrabold text-center text-purple-400 mb-4">Complexity</h2>
          <div className="flex flex-col sm:flex-row justify-between text-sm sm:text-base gap-2 sm:gap-0">
            <p className="text-cyan-400"><span className="font-semibold">Time:</span> {complexities[algorithm].time}</p>
            <p className="text-cyan-400"><span className="font-semibold">Space:</span> {complexities[algorithm].space}</p>
          </div>
        </div>

        {/* Visualizer */}
        <div className="w-full relative">
          <SortingVisualizer
            theme={theme}
            algorithm={algorithm}
            speed={speed}
            size={size}
            start={start}
            reset={reset}
            onResetComplete={handleResetComplete}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent to-cyan-500 opacity-20 rounded-xl"></div>
        </div>
      </main>

      {/* Creative Footer */}
      <footer className="w-full py-6 bg-gradient-to-r from-gray-800 via-indigo-900 to-purple-900 bg-opacity-90 backdrop-blur-lg text-center text-cyan-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent animate-pulse-slow"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
          <p className="text-sm font-medium">Created by <span className="text-cyan-200 font-bold">Bhavesh Tilara</span></p>
          <div className="flex gap-6">
            <a href="https://github.com/topics/login" className="text-cyan-400 hover:text-cyan-200 transform hover:scale-110 hover:rotate-6 transition-all duration-300">GitHub</a>
            <a href="https://x.com/bhaveshhhh_03" className="text-cyan-400 hover:text-cyan-200 transform hover:scale-110 hover:rotate-6 transition-all duration-300">Twitter</a>
            <a href="www.linkedin.com/in/bhaveshtilara03" className="text-cyan-400 hover:text-cyan-200 transform hover:scale-110 hover:rotate-6 transition-all duration-300">Linkedin</a>
          </div>
        </div>
      </footer>

      {/* Custom Tailwind Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #00ffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #00ffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}