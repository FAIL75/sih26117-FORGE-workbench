"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RagWorkbench from "../../components/RagWorkbench";
import VisionWorkbench from "../../components/VisionWorkbench";
import CodeWorkbench from "../../components/CodeWorkbench";

// The Master Controller component
function OmniWorkbenchCore() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- STATE MANAGEMENT ---
  const [prompt, setPrompt] = useState(searchParams.get("initialPrompt") || "");
  const [phase, setPhase] = useState<"idle" | "routing" | "processing" | "complete">("idle");
  const [activeModule, setActiveModule] = useState<"chat" | "rag" | "vision" | "code">("chat");
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  
  // --- ANIMATION STATE ---
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [currentFrame, setCurrentFrame] = useState(9); // Start frame (skipping black intro)
  const totalFrames = 240;

  // 1. Preload the image sequence safely into memory on mount
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    for (let i = 9; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/sequence/ezgif-frame-${i.toString().padStart(3, "0")}.jpg`;
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // 2. Draw the current frame to the canvas
  useEffect(() => {
    if (images.length > 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = images[currentFrame - 9]; // Offset because we start at 9
      if (img && ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [currentFrame, images]);

  // 3. Playback Logic: Trigger the vault animation ONLY when complete
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "complete" && currentFrame < totalFrames) {
      // Play at ~30 FPS (33ms) to keep GPU usage smooth
      timer = setTimeout(() => setCurrentFrame((prev) => prev + 1), 33);
    }
    return () => clearTimeout(timer);
  }, [phase, currentFrame]);

  // --- RESET LOGIC ---
  const handleReset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPhase("idle");
    setPrompt("");
    setActiveModule("chat");
    setTelemetryLogs((prev) => [...prev, "[System] VRAM cleared. Awaiting new instructions..."]);
    setCurrentFrame(9); // Resets the vault animation to the beginning
  };

  // --- AGENT ROUTING LOGIC ---
  const handleExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || phase !== "idle") return;

    setPhase("routing");
    setTelemetryLogs((prev) => [...prev, "[System] Initializing Qwen-0.5B Router..."]);
    
    // Simulate routing delay for the demo narrative before mounting the live component
    setTimeout(() => {
      const q = prompt.toLowerCase();
      let route: "rag" | "vision" | "code" = "rag";
      
      if (q.match(/\b(scan|image|schematic|visual|p&id)\b/)) route = "vision";
      else if (q.match(/\b(calculate|math|code|simulate)\b/)) route = "code";

      setTelemetryLogs((prev) => [
        ...prev, 
        `[Router] Intent classified: ${route.toUpperCase()}`,
        `[System] Swapping VRAM: Loading target module...`
      ]);
      
      setActiveModule(route);
      setPhase("processing");
      
      // The child component now handles its own API call and will trigger completion visually
      // We simulate the sidebar catching the completion after an estimated wait for the demo flow
      setTimeout(() => {
        setPhase("complete");
        setTelemetryLogs((prev) => [...prev, "[System] Task complete. Securing data in vault."]);
      }, 15000); 

    }, 1500);
  };

  // Auto-execute if landing page passed a prompt
  useEffect(() => {
    if (searchParams.get("initialPrompt") && phase === "idle") {
      handleExecute();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col bg-base text-primary overflow-hidden font-sans">
      
      {/* BACKGROUND: Image Sequence Canvas */}
      <canvas 
        ref={canvasRef} 
        width={1920} 
        height={1080} 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />
      {/* FROSTED OVERLAY: Dims the background so the UI is readable */}
      <div className="absolute inset-0 bg-[#0B0C0E]/85 z-0 backdrop-blur-[2px]" />

      {/* HEADER */}
      <header className="relative z-10 h-14 border-b border-line bg-panel/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-muted hover:text-primary transition-colors font-mono text-xs">
            ← EXIT FORGE
          </button>
          <div className="h-4 w-[1px] bg-line" />
          <span className="font-display font-bold text-sm tracking-wide text-primary">FORGE // ENCLAVE</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-riskLow bg-riskLow/10 px-2.5 py-1 rounded border border-riskLow/20">
          <span className="w-1.5 h-1.5 rounded-full bg-riskLow animate-pulse" />
          <span>EGRESS: 0 KB/s</span>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="relative z-10 flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* LEFT SIDEBAR: Live Telemetry */}
        <aside className="w-80 bg-panel/90 backdrop-blur-xl border border-line rounded-xl flex flex-col shrink-0 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-line bg-panel">
            <h3 className="font-display font-semibold text-primary text-sm">System Telemetry</h3>
            <p className="text-[11px] font-mono text-muted">VRAM Allocation & Routing</p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-muted space-y-2">
            {telemetryLogs.map((log, i) => (
              <div key={i} className={`animate-slide-in ${log.includes("complete") ? "text-riskLow" : log.includes("Intent") ? "text-copper" : "text-muted"}`}>
                {log}
              </div>
            ))}
            {phase === "routing" && <span className="text-copper animate-pulse">_</span>}
          </div>
        </aside>

        {/* RIGHT WORKSPACE: Dynamic Module Injection */}
        <section className="flex-1 flex flex-col bg-panel/90 backdrop-blur-xl border border-line rounded-xl overflow-hidden shadow-2xl">
          
          {/* Dynamic Component Mount */}
          <div className="flex-1 overflow-hidden">
            {activeModule === "chat" && (
              <div className="h-full flex items-center justify-center font-mono text-sm text-muted">
                FORGE Secure Terminal Ready. Awaiting Instruction...
              </div>
            )}
            {activeModule === "rag" && <RagWorkbench prompt={prompt} />}
            {activeModule === "vision" && <VisionWorkbench prompt={prompt} />}
            {activeModule === "code" && <CodeWorkbench prompt={prompt} />}
          </div>

          {/* Master Input Bar */}
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              phase === "complete" ? handleReset() : handleExecute(); 
            }} 
            className="p-4 border-t border-line bg-panel shrink-0 flex gap-3"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={phase === "routing" || phase === "processing"} 
              placeholder="Enter a secure task prompt..."
              className="flex-1 bg-base border border-line rounded-lg px-4 py-3 text-sm text-primary placeholder-muted2 font-mono focus:outline-none focus:border-copper transition-colors disabled:opacity-50"
            />
            
            {phase === "complete" ? (
              <button
                type="button"
                onClick={handleReset}
                className="bg-riskLow/20 border border-riskLow text-riskLow hover:bg-riskLow/30 font-mono font-semibold px-6 py-3 rounded-lg text-xs transition-colors"
              >
                NEW TASK
              </button>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim() || phase !== "idle"}
                className="bg-copper hover:bg-copper/90 text-base font-mono font-semibold px-6 py-3 rounded-lg text-xs transition-colors disabled:opacity-40"
              >
                EXECUTE
              </button>
            )}
          </form>
        </section>

      </main>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-base text-copper flex items-center justify-center font-mono">Mounting FORGE...</div>}>
      <OmniWorkbenchCore />
    </Suspense>
  );
}