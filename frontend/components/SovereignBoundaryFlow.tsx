"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface DocCard {
  id: string;
  tag: string;
  filename: string;
  featureTitle: string;
  featureDesc: string;
  targetTool: string;
  demoMode: string;
}

const DOCS: DocCard[] = [
  {
    id: "doc-1",
    tag: "RAW SOP",
    filename: "mrpl_safety_sop_v2.4.txt",
    featureTitle: "Agentic RAG & DocGen",
    featureDesc: "Grounds queries in local vector DB and outputs formal .docx approval notes.",
    targetTool: "search_knowledge_base",
    demoMode: "rag",
  },
  {
    id: "doc-2",
    tag: "SCANNED DRAWING",
    filename: "pipeline_inspection_v2.png",
    featureTitle: "Multimodal Vision OCR",
    featureDesc: "On-device OCR extracts measurements and anomalies from schematics.",
    targetTool: "analyze_image",
    demoMode: "vision",
  },
  {
    id: "doc-3",
    tag: "MATH & FORMULAS",
    filename: "hoop_stress_calc.py",
    featureTitle: "Isolated Code Sandbox",
    featureDesc: "Executes Python in an ephemeral container with strict CPU/memory and --network none.",
    targetTool: "execute_python_code",
    demoMode: "code",
  },
];

export default function SovereignBoundaryFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress between 0 and 1 through this section
      const totalDist = rect.height - windowHeight;
      const currentDist = -rect.top;
      const progress = Math.min(Math.max(currentDist / totalDist, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Stage flags based on scroll
  const isInsideFence = scrollProgress > 0.35;
  const isMorphed = scrollProgress > 0.7;

  return (
    <div ref={containerRef} className="relative h-[280vh] w-full bg-base">
      {/* Sticky viewport frame */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-8">
        
        {/* Status indicator */}
        <div className="absolute top-24 z-20 flex items-center gap-3 font-mono text-xs tracking-wider bg-panel border border-line px-4 py-2 rounded-full">
          <span className="text-muted">STATUS:</span>
          {!isInsideFence ? (
            <span className="text-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted animate-pulse"></span>
              INGESTING EXTERNAL DOCUMENTS
            </span>
          ) : (
            <span className="text-riskLow flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-riskLow animate-pulse"></span>
              ENCLOSED // 0 B/s EGRESS ENFORCED
            </span>
          )}
        </div>

        {/* The Sovereign Enclosure (Boundary Wall) */}
        <div 
          className={`relative w-full max-w-5xl h-[65vh] rounded-2xl border-2 transition-all duration-700 flex flex-col justify-between p-8 overflow-hidden ${
            isInsideFence 
              ? "border-copper/70 bg-panel/80 shadow-[0_0_50px_rgba(194,121,58,0.12)]" 
              : "border-line/40 bg-panel/30 border-dashed"
          }`}
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C2793A_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          {/* Fence Header */}
          <div className="flex justify-between items-center z-10 font-mono text-[11px] text-muted">
            <div className="flex items-center gap-2">
              <span className="text-copper font-bold">AIR-GAP PERIMETER</span>
              <span>//</span>
              <span>DEV PROFILE (4GB VRAM)</span>
            </div>
            <div className="text-riskHigh font-semibold">
              DROP ALL OUTBOUND TRAFFIC
            </div>
          </div>

          {/* Cards Area: Ingestion → Morph into Feature Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-auto z-10">
            {DOCS.map((doc, idx) => {
              // Calculate vertical drop simulation
              const yOffset = !isInsideFence ? (idx + 1) * -70 : 0;
              const opacity = !isInsideFence ? 0.4 + idx * 0.2 : 1;

              return (
                <div
                  key={doc.id}
                  style={{
                    transform: `translateY(${yOffset}px)`,
                    opacity: opacity,
                  }}
                  className={`border transition-all duration-500 rounded-xl p-6 flex flex-col justify-between min-h-[220px] ${
                    isMorphed
                      ? "bg-base border-copper/80 shadow-[0_0_20px_rgba(194,121,58,0.15)]"
                      : "bg-base/70 border-line"
                  }`}
                >
                  {/* Top bar of card */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-[10px] tracking-widest text-muted uppercase">
                      {!isMorphed ? doc.tag : "MODULE READY"}
                    </span>
                    <span className="font-mono text-[10px] text-copper">
                      {isMorphed ? doc.targetTool : "SEALED"}
                    </span>
                  </div>

                  {/* Body: Filename transforms to Feature Name */}
                  <div>
                    {!isMorphed ? (
                      <div>
                        <div className="font-mono text-xs text-primary truncate mb-1">
                          📄 {doc.filename}
                        </div>
                        <p className="text-[11px] text-muted2 font-mono">
                          Raw plant input file
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-display font-semibold text-lg text-primary mb-2">
                          {doc.featureTitle}
                        </h4>
                        <p className="text-xs text-muted leading-relaxed">
                          {doc.featureDesc}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Action trigger once morphed */}
                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted2">
                      {isMorphed ? "LOCAL EXECUTION" : "EGRESS: 0 BYTES"}
                    </span>
                    {isMorphed && (
                      <Link
                        href={`/demo?scenario=${doc.demoMode}`}
                        className="font-mono text-[11px] text-copper hover:underline flex items-center gap-1"
                      >
                        RUN <span className="text-xs">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fence Footer */}
          <div className="flex justify-between items-center z-10 font-mono text-[10px] text-muted2 pt-4 border-t border-line/40">
            <span>ISOLATION: CONTAINER ROOTLESS / NAMESPACE BOUND</span>
            <span>PROVABLE SOVEREIGNTY</span>
          </div>
        </div>

        {/* Scroll helper prompt */}
        <div className="mt-6 font-mono text-[11px] text-muted2">
          {scrollProgress < 0.9 ? "SCROLL TO WITNESS AIR-GAP SEAL & MORPH ↓" : "SEALED. SELECT A CAPABILITY ABOVE TO ENTER WORKBENCH."}
        </div>
      </div>
    </div>
  );
}