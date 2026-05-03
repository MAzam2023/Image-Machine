/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Loader2 } from 'lucide-react';
import { generateImage, generateDescription } from './services/geminiService';

export default function App() {
  const [query, setQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ image: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const [imageRes, textRes] = await Promise.all([
        generateImage(query),
        generateDescription(query)
      ]);
      setResult({ image: imageRes, text: textRes });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating content.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-[#1A1A1A] flex flex-col overflow-hidden">
      {/* Header Navigation */}
      <nav className="h-16 px-4 md:px-8 flex flex-shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span className="font-bold tracking-tight text-xl uppercase">ObjectLens</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-[#6B7280] hidden md:flex">
          <span className="text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-1 cursor-default">Generator</span>
          <span className="hover:text-[#1A1A1A] cursor-pointer transition-colors">Archive</span>
          <span className="hover:text-[#1A1A1A] cursor-pointer transition-colors">About</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center py-8 px-4 md:py-12 md:px-20 overflow-y-auto">
        {/* Search Section */}
        <div className="w-full max-w-2xl mb-8 md:mb-12">
          <form onSubmit={handleGenerate} className="relative flex items-center shadow-sm">
            <input
              type="text"
              placeholder="Enter object name (e.g., 'Vintage Camera')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isGenerating}
              className="w-full h-14 pl-6 pr-32 bg-white border border-[#E5E7EB] text-lg outline-none focus:border-[#1A1A1A] transition-colors disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={isGenerating || !query.trim()}
              className="absolute right-2 h-10 px-6 bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors hover:bg-[#333]"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
            </button>
          </form>
          {error && (
            <div className="mt-3 text-red-600 text-sm font-medium px-2">
              {error}
            </div>
          )}
        </div>

        {/* Content Display (Geometric Split) */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-0 border border-[#E5E7EB] bg-white shadow-sm transition-all duration-500">
          {/* Image Side */}
          <div className="col-span-1 md:col-span-7 aspect-square bg-[#F3F4F6] relative overflow-hidden flex items-center justify-center group border-b md:border-b-0 md:border-r border-[#E5E7EB]">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 opacity-50 z-0"></div>
            
            <AnimatePresence mode="wait">
              {result ? (
                <motion.img
                  key="result-image"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={result.image}
                  alt={query}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover z-10"
                />
              ) : (
                <motion.div
                  key="placeholder-image"
                  className="relative w-[80%] h-[80%] bg-[#E5E7EB] flex flex-col items-center justify-center z-10 shadow-inner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-[#9CA3AF] animate-spin mb-4" />
                      <span className="text-[#9CA3AF] font-mono text-xs uppercase tracking-widest animate-pulse">Processing</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-24 h-16 border-4 border-[#9CA3AF] rounded-md relative mb-3">
                        <div className="absolute -top-3 left-4 w-6 h-3 bg-[#9CA3AF]"></div>
                        <div className="absolute inset-0 m-auto w-8 h-8 rounded-full border-4 border-[#9CA3AF]"></div>
                      </div>
                      <span className="text-[#9CA3AF] font-mono text-xs uppercase tracking-widest">Object Preview</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Side */}
          <div className="col-span-1 md:col-span-5 p-8 md:p-12 flex flex-col justify-center bg-white min-h-[350px]">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result-info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] font-bold mb-2">Identity</p>
                    <h2 className="text-3xl md:text-4xl font-light tracking-tight capitalize">{query}</h2>
                  </div>

                  <div className="h-[1px] w-12 bg-[#1A1A1A]"></div>

                  <div className="space-y-4">
                    <p className="text-[#4B5563] text-lg leading-relaxed">
                      {result.text}
                    </p>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <a
                      href={result.image}
                      download={`${query.replace(/\s+/g, '-').toLowerCase()}.png`}
                      className="flex items-center gap-2 h-12 px-8 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`space-y-6 ${isGenerating ? 'opacity-60 animate-pulse' : 'opacity-30'}`}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] font-bold mb-3">Identity</p>
                    <div className="h-10 bg-gray-200 w-3/4"></div>
                  </div>

                  <div className="h-[1px] w-12 bg-[#1A1A1A] opacity-30"></div>

                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 w-full"></div>
                    <div className="h-4 bg-gray-200 w-5/6"></div>
                    <div className="h-4 bg-gray-200 w-4/6"></div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <div className="h-12 w-40 bg-gray-200"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Decorative Element */}
      <footer className="h-12 px-8 flex flex-shrink-0 items-center justify-between bg-white border-t border-[#E5E7EB] text-[10px] font-mono text-[#9CA3AF] uppercase tracking-widest hidden md:flex">
        <span>Status: {isGenerating ? 'Processing...' : 'Ready'}</span>
        <span>© 2024 ObjectLens Studio • v1.0.4</span>
        <span>{result ? 'Operation Complete' : 'Waiting for query'}</span>
      </footer>
    </div>
  );
}
