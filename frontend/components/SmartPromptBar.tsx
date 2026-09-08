"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SmartPromptBar() {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);

    // Simulate backend LLM classification latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const q = query.toLowerCase();
    
    // 1. Check for Multimodal Vision intent
    if (q.match(/\b(scan|image|schematic|p&id|blueprint|visual|picture|see)\b/)) {
      router.push('/demo?mode=vision');
    } 
    // 2. Check for Code/Math Sandbox intent
    else if (q.match(/\b(calculate|math|simulate|simulation|code|portfolio|monte carlo|compute)\b/)) {
      router.push('/demo?mode=code');
    } 
    // 3. Default fallback to Agentic RAG / DocGen
    else {
      router.push('/demo?mode=rag');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 relative z-20">
      <form 
        onSubmit={handleSubmit}
        className={`relative flex items-center transition-all duration-300 bg-black/40 backdrop-blur-xl border rounded-2xl shadow-2xl ${
          isAnalyzing ? 'border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.2)]' : 'border-white/20 hover:border-white/40'
        }`}
      >
        <div className="pl-6 text-white/50 text-xl">
          {isAnalyzing ? (
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "✧"
          )}
        </div>
        
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isAnalyzing}
          placeholder="E.g., 'Scan this schematic' or 'Calculate portfolio variance'..."
          className="w-full bg-transparent border-none py-5 pl-4 pr-32 text-white placeholder-white/40 focus:outline-none focus:ring-0 text-lg disabled:opacity-50"
        />
        
        <button 
          type="submit"
          disabled={!query.trim() || isAnalyzing}
          className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-xl font-semibold text-sm transition-all hover:bg-gray-200 hover:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isAnalyzing ? "Routing..." : "Execute"}
        </button>
      </form>

      {/* Helper tags below the prompt */}
      <div className="flex justify-center gap-3 mt-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 bg-black/20 px-3 py-1 rounded-full border border-white/10">
          Agentic Router Active
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 bg-black/20 px-3 py-1 rounded-full border border-white/10">
          Multimodal Switching
        </span>
      </div>
    </div>
  );
}