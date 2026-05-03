/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Loader2, Copy, Check } from 'lucide-react';
import { generateImage, generateDescription } from './services/geminiService';

export default function App() {
  const [query, setQuery] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ image: string; text: string; aspectRatio: string } | null>(null);
  const [history, setHistory] = useState<{ query: string; image: string; text: string; aspectRatio: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const [imageRes, textRes] = await Promise.all([
        generateImage(query, aspectRatio),
        generateDescription(query)
      ]);
      const newResult = { image: imageRes, text: textRes, aspectRatio };
      setResult(newResult);
      setHistory(prev => [ { query, ...newResult }, ...prev].slice(0, 5));
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
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row shadow-sm">
            <input
              type="text"
              placeholder="Enter object name (e.g., 'Vintage Camera')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isGenerating}
              className="w-full h-14 px-6 border-x border-y sm:border-r-0 border-[#E5E7EB] text-lg outline-none focus:border-[#1A1A1A] transition-colors disabled:bg-gray-50 flex-grow"
            />
            <div className="flex border-x sm:border-l-0 border-b sm:border-y border-[#E5E7EB]">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                disabled={isGenerating}
                className="h-14 px-4 bg-white text-[#1A1A1A] text-sm font-semibold uppercase tracking-widest outline-none border-r border-[#E5E7EB] transition-colors appearance-none cursor-pointer hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="1:1">Square</option>
                <option value="16:9">Wide</option>
                <option value="9:16">Tall</option>
              </select>
              <button
                type="submit"
                disabled={isGenerating || !query.trim()}
                className="h-14 px-8 bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors hover:bg-[#333]"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
              </button>
            </div>
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
          <div className={`col-span-1 md:col-span-7 bg-[#F3F4F6] relative overflow-hidden flex items-center justify-center group border-b md:border-b-0 md:border-r border-[#E5E7EB] transition-all duration-500 ${!result || result.aspectRatio === '1:1' ? 'aspect-square' : result.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}>
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
                    <div className="relative group/copy">
                      <p className="text-[#4B5563] text-lg leading-relaxed pr-8">
                        {result.text}
                      </p>
                      <button
                        onClick={handleCopy}
                        className="absolute top-0 right-0 p-1.5 text-gray-400 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur rounded-md"
                        title="Copy description"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
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

        {/* History Section */}
        {history.length > 0 && (
          <div className="w-full max-w-5xl mt-12 mb-8">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] font-bold mb-6">Recent Archives</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {history.map((item, idx) => (
                <div 
                  key={idx} 
                  className="group cursor-pointer border border-[#E5E7EB] bg-white hover:border-[#1A1A1A] transition-colors"
                  onClick={() => {
                    setQuery(item.query);
                    setAspectRatio(item.aspectRatio);
                    setResult({ image: item.image, text: item.text, aspectRatio: item.aspectRatio });
                  }}
                >
                  <div className={`w-full overflow-hidden bg-[#F3F4F6] ${item.aspectRatio === '1:1' ? 'aspect-square' : item.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}>
                    <img 
                      src={item.image} 
                      alt={item.query} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-3 border-t border-[#E5E7EB]">
                    <p className="text-xs font-semibold uppercase tracking-wide truncate">{item.query}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
