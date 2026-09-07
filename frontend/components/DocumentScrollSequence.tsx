"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

export default function DocumentScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isFullyScrolled, setIsFullyScrolled] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const frameCount = 240;

  // Preload all 240 frames into memory
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let counter = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `/sequence/frame_${i.toString().padStart(3, "0")}.jpg`;
      img.onload = () => {
        counter++;
        setLoadedCount(counter);
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Frame rendering logic
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

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || images.length === 0) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollProgress = -rect.top / (rect.height - window.innerHeight);
      const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);

      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(clampedProgress * (frameCount - 1))
      );

      renderFrame(frameIndex);
      setIsFullyScrolled(clampedProgress > 0.92);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial draw
    if (images.length > 0) renderFrame(0);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [images, renderFrame]);

  return (
    <div ref={containerRef} className="relative h-[450vh] w-full bg-[#82B3E8]">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Preload Status */}
        {loadedCount < frameCount && (
          <div className="absolute top-8 z-30 font-mono text-xs text-white/80 bg-black/40 px-4 py-2 rounded-full backdrop-blur border border-white/10">
            BUFFERING SOVEREIGN ENCLAVE: {Math.round((loadedCount / frameCount) * 100)}%
          </div>
        )}

        {/* Video Canvas */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* INVISIBLE HITBOX OVERLAY */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
            isFullyScrolled
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Status Badge */}
          <div className="absolute top-[20%] font-mono text-[11px] font-semibold uppercase tracking-widest text-white/90 bg-black/40 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
            Perimeter Sealed // 0 B/s Egress Enforced
          </div>

          {/* The Hitbox Grid */}
          <div className="relative w-[75%] max-w-[1200px] h-[45%] flex gap-4 md:gap-8 mt-12">
            
            {/* Hitbox 1: Maintenance Manual (Agentic RAG) */}
            <Link
              href="/demo?mode=rag"
              className="flex-1 group relative rounded-lg transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-[2px] border border-transparent hover:border-white/30 cursor-pointer flex flex-col justify-end p-6"
              title="Launch Agentic RAG"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-amber-400 font-mono text-xs px-4 py-2 rounded-full whitespace-nowrap border border-white/10">
                LAUNCH AGENTIC RAG →
              </div>
            </Link>

            {/* Hitbox 2: P&ID Schematic (Vision OCR) */}
            <Link
              href="/demo?mode=vision"
              className="flex-1 group relative rounded-lg transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-[2px] border border-transparent hover:border-white/30 cursor-pointer flex flex-col justify-end p-6"
              title="Launch Multimodal Vision OCR"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-amber-400 font-mono text-xs px-4 py-2 rounded-full whitespace-nowrap border border-white/10">
                LAUNCH VISION OCR →
              </div>
            </Link>

            {/* Hitbox 3: System Commands (Code Sandbox) */}
            <Link
              href="/demo?mode=code"
              className="flex-1 group relative rounded-lg transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-[2px] border border-transparent hover:border-white/30 cursor-pointer flex flex-col justify-end p-6"
              title="Launch Code Sandbox"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-amber-400 font-mono text-xs px-4 py-2 rounded-full whitespace-nowrap border border-white/10">
                LAUNCH CODE SANDBOX →
              </div>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}