"use client";

import React, { useState } from 'react';

type VisionPhase = 'idle' | 'scanning' | 'extracting' | 'complete';

interface ExtractedData {
  id: string;
  label: string;
  value: string;
  status: 'nominal' | 'warning' | 'critical';
}

export default function VisionWorkbench() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<VisionPhase>('idle');
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [streamedText, setStreamedText] = useState("");

  const finalDraft = "Visual analysis complete. The structural integrity of Unit 4A is intact. However, I have detected a micro-fracture warning on the secondary pressure valve based on the thermal shading in the provided schematic. I recommend physical inspection within 24 hours.";

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || phase !== 'idle') return;

    setPhase('scanning');
    setExtractedData([]);
    setStreamedText("");

    // Phase 1: Scanning (Scanner bar moves across image)
    await sleep(2500);
    
    // Phase 2: Extracting (Data pops into the sidebar)
    setPhase('extracting');
    setExtractedData([
      { id: "VLV-01", label: "Primary Intake", value: "OPEN", status: "nominal" },
      { id: "PRS-04", label: "Secondary Pressure", value: "145 PSI", status: "warning" },
      { id: "TMP-99", label: "Core Temp", value: "340°C", status: "nominal" }
    ]);
    await sleep(1500);

    // Phase 3: Synthesizing the final text
    setPhase('complete');
    for (let i = 0; i <= finalDraft.length; i++) {
      setStreamedText(finalDraft.substring(0, i));
      await sleep(25); 
    }
  };

  return (
    <div className="flex-1 flex h-full w-full bg-[#82B3E8] p-6 gap-6 font-sans">
      
      {/* LEFT: Extraction Sidebar */}
      <aside className="w-[420px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-200/50 bg-white/50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold text-gray-800 text-lg">Visual Extraction</h3>
            <span className="text-[10px] font-mono px-2 py-1 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
              QWEN-VL (LOCAL)
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Entities and measurements extracted directly from schematic pixels.
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-4">
          
          {phase === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-12 h-12 mb-4 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">👁️</div>
              <p className="text-sm font-medium text-gray-600">Awaiting analysis</p>
            </div>
          )}

          {phase === 'scanning' && (
            <div className="flex items-center gap-3 text-sm font-medium text-purple-600 animate-pulse bg-purple-50 p-4 rounded-xl border border-purple-100">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              Processing visual tensors...
            </div>
          )}

          {/* Extracted Data Cards */}
          {extractedData.map((data, index) => (
            <div 
              key={data.id} 
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 animate-slide-in flex justify-between items-center"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div>
                <div className="font-mono text-[10px] text-gray-400 mb-1">{data.id}</div>
                <div className="text-sm font-semibold text-gray-800">{data.label}</div>
              </div>
              <div className="text-right">
                <div className={`font-mono text-sm font-bold ${
                  data.status === 'nominal' ? 'text-emerald-600' : 'text-amber-500'
                }`}>
                  {data.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT: Main Viewer Area */}
      <section className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col overflow-hidden relative">
        
        <div className="h-16 border-b border-gray-200/50 flex justify-between items-center px-8 bg-white/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-gray-800">Multimodal Vision OCR</span>
            <span className="font-mono text-[10px] text-gray-400 px-2 py-0.5 bg-gray-100 rounded">SOVEREIGN WORKBENCH</span>
          </div>
          
          <button 
            disabled={phase !== 'complete'}
            className={`font-mono text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              phase === 'complete'
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg cursor-pointer" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            ↓ EXPORT JSON PAYLOAD
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-6">
           
           {/* The Image Viewer Container */}
           <div className="relative w-full max-w-2xl mx-auto h-[300px] bg-slate-900 rounded-2xl border-4 border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
             
             {/* Mock Blueprint Schematic (Using CSS Grid for aesthetic) */}
             <div className="absolute inset-0 opacity-30" style={{
               backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)',
               backgroundSize: '20px 20px'
             }}></div>
             
             {/* Schematic Elements */}
             <div className="relative z-10 w-32 h-32 border-4 border-white/50 rounded-full flex items-center justify-center">
                <div className="w-16 h-4 bg-white/50"></div>
             </div>
             
             <div className="absolute top-4 left-4 font-mono text-[10px] text-white/50">P&ID_UNIT_4A.PNG</div>

             {/* THE SCAN-LINE ANIMATION */}
             {phase === 'scanning' && (
               <div className="absolute left-0 right-0 h-1 bg-purple-500 shadow-[0_0_20px_4px_rgba(168,85,247,0.8)] animate-scanline z-20"></div>
             )}
             
             {/* Overlay highlighting when extraction is done */}
             {(phase === 'extracting' || phase === 'complete') && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-amber-500/80 bg-amber-500/10 rounded-full z-20 transition-all duration-1000 animate-pulse">
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-amber-400 bg-black/80 px-2 py-0.5 rounded">WARNING</div>
               </div>
             )}
           </div>

           {/* Output Stream */}
           <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-end">
               <div className="mb-4 font-mono text-xs flex flex-col gap-2 text-gray-500">
                  <div className={`transition-opacity duration-300 ${phase === 'scanning' ? 'text-purple-600 font-semibold' : 'opacity-50'}`}>
                    [1] Loading image into vision model VRAM... {phase !== 'scanning' && '✓'}
                  </div>
                  {(phase === 'extracting' || phase === 'complete') && (
                    <div className={`transition-opacity duration-300 ${phase === 'extracting' ? 'text-purple-600 font-semibold animate-pulse' : 'opacity-50'}`}>
                      [2] Mapping spatial features and extracting text... {phase === 'complete' && '✓'}
                    </div>
                  )}
               </div>

               {/* The LLM Response Stream */}
               {(phase === 'extracting' || phase === 'complete') && streamedText && (
                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-800 text-sm leading-relaxed shadow-sm">
                   {streamedText}
                   {phase !== 'complete' && <span className="inline-block w-1.5 h-4 ml-1 bg-purple-600 animate-blink align-middle"></span>}
                 </div>
               )}
           </div>
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-gray-50/80 border-t border-gray-200/50 shrink-0">
          <form onSubmit={handleQuery} className="max-w-4xl mx-auto relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={phase !== 'idle' && phase !== 'complete'}
              placeholder="E.g., Scan schematic for pressure anomalies in Unit 4A..."
              className="w-full bg-white border border-gray-300 rounded-xl py-4 pl-4 pr-32 text-sm text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button 
              type="submit"
              disabled={!query.trim() || (phase !== 'idle' && phase !== 'complete')}
              className="absolute right-2 top-2 bottom-2 bg-gray-900 hover:bg-black text-white px-6 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
              Scan Image
            </button>
          </form>
        </div>

      </section>
    </div>
  );
}