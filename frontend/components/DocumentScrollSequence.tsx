"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SmartPromptBar from "./SmartPromptBar";

export default function DocumentScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [scrollFraction, setScrollFraction] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // UPDATE THIS NUMBER if your video extraction yields a different amount of frames
  const frameCount = 240; 

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let counter = 0;
    
    // START AT FRAME 9 TO SKIP THE BLACK BARS
    const startFrame = 9;
    const totalFramesToLoad = frameCount - startFrame + 1;

    for (let i = startFrame; i <= frameCount; i++) {
      const img = new Image();
      img.src = `/sequence/ezgif-frame-${i.toString().padStart(3, "0")}.jpg`;
      img.onload = () => {
        counter++;
        setLoadedCount(counter);
        
        // Draw the first clean frame immediately
        if (i === startFrame && canvasRef.current) {
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

        {/* LAYER 1: HERO, PROMPT BAR & SIDEBAR */}
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
              <button onClick={() => setIsSidebarOpen(false)} className="text-white/50 hover:text-white transition-colors">✕</button>
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

        {/* LAYER 2: 3x3 GRID ARCHITECTURE OVERLAY */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 z-20 ${isFullyScrolled ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          
          {/* Aligned specifically to overlay the papers in the new video render */}
          <div className="relative w-[65%] max-w-[1000px] aspect-[16/9] grid grid-cols-3 grid-rows-3 gap-6 mt-8">
            
            {/* ROW 1 */}
            <div className="group relative rounded-xl cursor-default flex flex-col items-center justify-center">
              <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col justify-center">
                <span className="font-mono text-[9px] text-emerald-400 tracking-widest uppercase mb-1 block">Module 01</span>
                <h3 className="text-white font-display font-semibold text-sm mb-1.5">Network Security</h3>
                <p className="text-white/70 text-[10px] font-sans leading-tight">100% offline local GPUs with verifiable 0 KB/s outbound WAN traffic to protect trade secrets.</p>
              </div>
            </div>

            <div className="group relative rounded-xl cursor-default flex flex-col items-center justify-center">
              <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col justify-center">
                <span className="font-mono text-[9px] text-amber-400 tracking-widest uppercase mb-1 block">Module 02</span>
                <h3 className="text-white font-display font-semibold text-sm mb-1.5">Secure Sandbox</h3>
                <p className="text-white/70 text-[10px] font-sans leading-tight">ReAct orchestrator executes deterministic math inside a strict --network=none Docker container.</p>
              </div>
            </div>

            <div className="group relative rounded-xl cursor-default flex flex-col items-center justify-center">
              <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col justify-center">
                <span className="font-mono text-[9px] text-blue-400 tracking-widest uppercase mb-1 block">Module 03</span>
                <h3 className="text-white font-display font-semibold text-sm mb-1.5">Task Routing</h3>
                <p className="text-white/70 text-[10px] font-sans leading-tight">Auto-dispatches tasks with sequential VRAM swapping, conserving 75% memory (&lt;3.9GB peak).</p>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="group relative rounded-xl cursor-default flex flex-col items-center justify-center">
              <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col justify-center">
                <span className="font-mono text-[9px] text-purple-400 tracking-widest uppercase mb-1 block">Module 04</span>
                <h3 className="text-white font-display font-semibold text-sm mb-1.5">Vision OCR</h3>
                <p className="text-white/70 text-[10px] font-sans leading-tight">Local Vision-Language Models parse complex P&ID blueprints and handwritten inspection logs entirely on-premise.</p>
              </div>
            </div>

            <div className="group relative rounded-xl cursor-default flex flex-col items-center justify-center">
              <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col justify-center">
                <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase mb-1 block">Module 05</span>
                <h3 className="text-white font-display font-semibold text-sm mb-1.5">CPU-Optimized RAG</h3>
                <p className="text-white/70 text-[10px] font-sans leading-tight">Local ChromaDB embeds confidential SOPs via CPU, preventing hallucinations while saving GPU compute.</p>
              </div>
            </div>

            <div className="group relative rounded-xl cursor-default flex flex-col items-center justify-center">
              <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col justify-center">
                <span className="font-mono text-[9px] text-green-400 tracking-widest uppercase mb-1 block">Module 06</span>
                <h3 className="text-white font-display font-semibold text-sm mb-1.5">Native Exports</h3>
                <p className="text-white/70 text-[10px] font-sans leading-tight">Condenses 6-hour workflows into 2 minutes, exporting outputs directly to Word (.docx) and Excel (.xlsx).</p>
              </div>
            </div>

            {/* ROW 3 */}
            <div className="group relative rounded-xl cursor-default flex flex-col items-center justify-center">
              <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col justify-center">
                <span className="font-mono text-[9px] text-red-400 tracking-widest uppercase mb-1 block">Module 07</span>
                <h3 className="text-white font-display font-semibold text-sm mb-1.5">Cryptographic Audit</h3>
                <p className="text-white/70 text-[10px] font-sans leading-tight">Continuous JSONL audit trails secured by SHA-256 hash-chaining to satisfy strict CVC compliance requirements.</p>
              </div>
            </div>

            <div className="group relative rounded-xl cursor-default flex flex-col items-center justify-center">
              <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col justify-center">
                <span className="font-mono text-[9px] text-gray-300 tracking-widest uppercase mb-1 block">Module 08</span>
                <h3 className="text-white font-display font-semibold text-sm mb-1.5">Forge Framework</h3>
                <p className="text-white/70 text-[10px] font-sans leading-tight">Complete open-source deployment architecture bridging the Next.js frontend and FastAPI orchestrator.</p>
              </div>
            </div>

            <div className="group relative rounded-xl cursor-default flex flex-col items-center justify-center">
              <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute inset-0 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col justify-center">
                <span className="font-mono text-[9px] text-indigo-400 tracking-widest uppercase mb-1 block">Module 09</span>
                <h3 className="text-white font-display font-semibold text-sm mb-1.5">Team Vanguard</h3>
                <p className="text-white/70 text-[10px] font-sans leading-tight">Solving SIH26117 (Smart Automation) to eliminate severe operational bottlenecks at MRPL and PSUs.</p>
              </div>
            </div>

          </div>

          {/* LAYER 3: SECURE TERMINAL FOOTER */}
          <footer className="absolute bottom-0 w-full border-t border-white/10 bg-black/60 backdrop-blur-xl py-4 px-8 flex flex-col md:flex-row justify-between items-center text-white/40 font-mono text-[10px] uppercase tracking-widest z-30">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <span className="text-white/70">Forge Framework v2.0.4 // Build 7734</span>
              <span>© 2026 Team Vanguard • SIH26117</span>
            </div>

            <div className="flex gap-6 mt-4 md:mt-0 border-x border-white/10 px-6">
              <button className="hover:text-white transition-colors">Access Audit Logs</button>
              <button className="hover:text-white transition-colors">CVC Guidelines</button>
              <button className="hover:text-white transition-colors">System Metrics</button>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0 text-emerald-400 font-semibold bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
              NODE: BOM-01 // AIR-GAPPED
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}