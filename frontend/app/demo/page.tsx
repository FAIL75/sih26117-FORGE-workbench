"use client";

import React, { useState } from 'react';

export default function DemoWorkbench() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="h-[calc(100vh-72px)] flex overflow-hidden w-full">
      
      {/* LEFT SIDEBAR: Audit & Trace */}
      <aside className="w-[340px] border-r border-line bg-base flex flex-col shrink-0 relative z-0">
        <div className="p-8 border-b border-line">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-display font-semibold text-lg tracking-tight">Egress Audit</h3>
            <span className="text-[10px] font-mono px-2 py-1 border border-riskLow/30 bg-riskLow/10 text-riskLow rounded-full">SECURE</span>
          </div>
          <div className="h-28 border border-line bg-panel flex flex-col items-center justify-center relative overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#7C8089_1px,transparent_1px)] [background-size:12px_12px]"></div>
            <div className="text-4xl font-display font-bold text-riskLow drop-shadow-[0_0_8px_rgba(74,155,110,0.3)] relative z-10">0 B/s</div>
            <div className="text-[10px] font-mono text-muted mt-2 relative z-10">EXTERNAL PACKETS</div>
          </div>
          <div className="mt-4 text-[10px] font-mono text-muted leading-relaxed space-y-1">
            <p className="text-riskHigh">&gt; iptables DROP 0.0.0.0/0</p>
            <p>&gt; Localhost (127.0.0.1) ALLOWED</p>
          </div>
        </div>
        
        <div className="flex-1 p-8 flex flex-col overflow-hidden">
          <h3 className="font-display font-semibold text-lg tracking-tight mb-6">Agent Trace</h3>
          <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-4 pr-3">
             {/* Static placeholder trace */}
            <div className="flex gap-3 text-primary">
              <span className="opacity-40 shrink-0">16:12:00</span>
              <span className="flex-1 leading-relaxed">System initialized. Awaiting input...</span>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN: Chat & Output */}
      <section className="flex-1 flex flex-col bg-panel relative z-0">
        <div className="flex-1 overflow-y-auto p-12 space-y-10">
          {/* Static placeholder for Chat will go here */}
        </div>
        
        <div className="p-8 border-t border-line bg-base">
          <div className="max-w-4xl mx-auto">
            <div className="border border-line bg-panel p-2 flex items-end focus-within:border-copper transition-colors">
              <textarea 
                rows={2} 
                className="w-full bg-transparent resize-none outline-none p-3 font-sans text-[15px] text-primary placeholder-muted" 
                placeholder="Instruct the Forge Agent..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className="mt-3 flex gap-4 text-[10px] font-mono text-muted2">
              <span>PROFILE: DEV (4GB VRAM)</span> | <span>TOOLS: [execute_python, search_kb, generate_docx, vision_ocr]</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}