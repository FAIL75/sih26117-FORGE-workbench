"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SmartPromptBar from "./SmartPromptBar";

export default function DocumentScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [scrollFraction, setScrollFraction] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  
  // New state for the sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const frameCount = 240;

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let counter = 0;
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `/sequence/frame_${i.toString().padStart(3, "0")}.jpg`;
      img.onload = () => {
        counter++;
        setLoadedCount(counter);
        if (i === 1 && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  const renderFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !images[index]) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(images[index], 0, 0, canvas.width, canvas.height);
    },
    [images]
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || images.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollProgress = -rect.top / (rect.height - window.innerHeight);
      const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);
      
      setScrollFraction(clampedProgress);

      // Auto-close sidebar if they start scrolling
      if (clampedProgress > 0.05 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }

      const frameIndex = Math.min(frameCount - 1, Math.floor(clampedProgress * (frameCount - 1)));
      renderFrame(frameIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [images, renderFrame, isSidebarOpen]);

  const isFullyScrolled = scrollFraction > 0.92;

  return (
    <div ref={containerRef} className="relative h-[450vh] w-full bg-[#82B3E8]">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {loadedCount < frameCount && (
          <div className="absolute top-8 z-30 font-mono text-xs text-white/80 bg-black/40 px-4 py-2 rounded-full backdrop-blur border border-white/10">
            BUFFERING SOVEREIGN ENCLAVE: {Math.round((loadedCount / frameCount) * 100)}%
          </div>
        )}

        <canvas ref={canvasRef} width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover z-0" />

        {/* 
          =============================================
          LAYER 1: HERO, PROMPT BAR & SIDEBAR
          =============================================
        */}
        <div 
          className="absolute inset-0 z-10 transition-opacity duration-300"
          style={{ opacity: Math.max(1 - scrollFraction * 5, 0), pointerEvents: scrollFraction > 0.1 ? 'none' : 'auto' }}
        >
          {/* Sidebar Toggle Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-8 left-8 p-3 rounded-full bg-black/20 hover:bg-black/40 border border-white/20 backdrop-blur-md transition-all text-white/80 z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* The Slide-out Sidebar */}
          <div className={`absolute top-0 left-0 h-full w-80 bg-black/60 backdrop-blur-2xl border-r border-white/10 z-30 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            
            <div className="p-6 border-b border-white/10 flex justify-between items-start">
              <div>
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-3">
                  <span className="font-mono font-bold text-lg">OP</span>
                </div>
                <h3 className="text-white font-display font-semibold">Operator 7734</h3>
                <p className="font-mono text-[10px] text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  CLEARANCE: SOVEREIGN
                </p>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-white/50 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 block mb-4">Local Transcripts</span>
              <div className="space-y-2">
                {["Unit 4A Pressure Logs", "Monte Carlo 30Y Simulation", "P&ID Schematic Scan", "Safety SOP Retrieval"].map((chat, i) => (
                  <button key={i} className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group flex items-center gap-3 text-white/80 text-sm">
                    <span className="text-white/30 group-hover:text-white/60">💬</span>
                    <span className="truncate">{chat}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-white/10 font-mono text-[10px] text-white/40">
              SECURE OFFLINE NODE <br/>
              v2.0.4 // LOCAL HOST
            </div>
          </div>

          {/* Hero Content (Centered) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 -z-10">
            <span className="font-mono text-xs tracking-widest uppercase text-white/90 mb-4 drop-shadow-md">
              Problem Statement 26117 // Sovereign On-Premise AI
            </span>
            <h1 className="font-display font-bold text-5xl md:text-7xl text-white tracking-tight drop-shadow-lg shadow-black">
              Sovereign Enclave
            </h1>
            <p className="max-w-xl text-white/90 text-base md:text-lg mt-4 leading-relaxed font-sans mb-8 drop-shadow-md text-center">
              Air-gapped document intelligence. Zero egress to external networks, fully contained on-premise.
            </p>
            <SmartPromptBar />
            <div className="absolute bottom-12 font-mono text-xs text-white/80 uppercase tracking-wider animate-bounce drop-shadow-md">
              Scroll to view architecture ↓
            </div>
          </div>
        </div>

        {/* 
          =============================================
          LAYER 2: END FRAME ARCHITECTURE
          =============================================
        */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 z-20 ${isFullyScrolled ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div className="absolute top-[18%] font-mono text-[11px] font-semibold uppercase tracking-widest text-white/90 bg-black/40 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
            System Architecture & Features
          </div>
          <div className="relative w-[75%] max-w-[1200px] h-[45%] flex gap-4 md:gap-8 mt-12">
            <div className="flex-1 group relative rounded-lg cursor-default flex flex-col justify-end p-6">
              <div className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute inset-x-0 bottom-4 bg-black/85 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                <span className="font-mono text-[10px] text-amber-400 tracking-widest uppercase mb-2 block">Module 01</span>
                <h3 className="text-white font-display font-semibold text-lg mb-2">Agentic RAG</h3>
                <ul className="text-white/70 text-xs font-sans space-y-1.5 list-disc pl-4">
                  <li>Local ChromaDB Vector Indexing</li>
                  <li>SOP & Compliance Grounding</li>
                  <li>Automated .DOCX Report Generation</li>
                </ul>
              </div>
            </div>
            <div className="flex-1 group relative rounded-lg cursor-default flex flex-col justify-end p-6">
              <div className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute inset-x-0 bottom-4 bg-black/85 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                <span className="font-mono text-[10px] text-purple-400 tracking-widest uppercase mb-2 block">Module 02</span>
                <h3 className="text-white font-display font-semibold text-lg mb-2">Multimodal OCR</h3>
                <ul className="text-white/70 text-xs font-sans space-y-1.5 list-disc pl-4">
                  <li>Local Qwen-VL Inference</li>
                  <li>P&ID Schematic Analysis</li>
                  <li>Spatial Anomaly Detection</li>
                </ul>
              </div>
            </div>
            <div className="flex-1 group relative rounded-lg cursor-default flex flex-col justify-end p-6">
              <div className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute inset-x-0 bottom-4 bg-black/85 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                <span className="font-mono text-[10px] text-emerald-400 tracking-widest uppercase mb-2 block">Module 03</span>
                <h3 className="text-white font-display font-semibold text-lg mb-2">Code Sandbox</h3>
                <ul className="text-white/70 text-xs font-sans space-y-1.5 list-disc pl-4">
                  <li>Rootless Docker Execution</li>
                  <li>Strict --network none Enforcement</li>
                  <li>Deterministic Math Verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}