"use client";

import React, { useState, useEffect } from "react";

export default function VisionWorkbench({ prompt }: { prompt: string }) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "extracting" | "complete">("idle");
  const [extractedData, setExtractedData] = useState<{id: string, label: string, value: string, status: string}[]>([]);
  const [streamedText, setStreamedText] = useState("");

  useEffect(() => {
    const executeLiveTask = async () => {
      setPhase("scanning");
      
      try {
        const response = await fetch("http://localhost:8000/api/task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt }) 
        });
        
        const data = await response.json();
        
        setPhase("extracting");
        // We mock the telemetry visual cards to keep the UI engaging while backend processes
        setExtractedData([
          { id: "VLV-01", label: "Primary Intake", value: "OPEN", status: "nominal" },
          { id: "PRS-04", label: "Secondary Pressure", value: "145 PSI", status: "warning" },
        ]);
        
        if (data.status === "success") {
          setStreamedText(data.response);
        } else {
          setStreamedText(`[Error]: ${data.message}`);
        }
      } catch (error) {
        setStreamedText("[Fatal]: Failed to reach the secure FastAPI node.");
      } finally {
        setPhase("complete");
      }
    };

    if (prompt) executeLiveTask();
  }, [prompt]);

  return (
    <div className="flex-1 flex h-full w-full gap-4 font-sans overflow-hidden">
      {/* LEFT: Extraction Sidebar */}
      <aside className="w-80 bg-base border-r border-line flex flex-col shrink-0 overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {phase === "scanning" && (
            <div className="flex items-center gap-3 text-xs font-mono text-copper animate-pulse bg-copper/10 p-4 rounded-lg border border-copper/20">
              <div className="w-3 h-3 border-2 border-copper border-t-transparent rounded-full animate-spin"></div>
              Processing visual tensors...
            </div>
          )}

          {extractedData.map((data, index) => (
            <div key={data.id} className="border-l-2 border-l-copper bg-panel border border-line p-3 rounded-lg font-mono text-xs animate-slide-in flex justify-between items-center">
              <div>
                <div className="text-muted2 mb-1">{data.id}</div>
                <div className="font-semibold text-primary">{data.label}</div>
              </div>
              <div className={`font-bold ${data.status === "nominal" ? "text-riskLow" : "text-amber-500"}`}>
                {data.value}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT: Main Viewer Area */}
      <section className="flex-1 flex flex-col overflow-hidden bg-base p-4 gap-4">
        <div className="relative w-full max-w-lg mx-auto h-[250px] bg-panel rounded-xl border border-line overflow-hidden shadow-inner flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#C2793A 1px, transparent 1px), linear-gradient(90deg, #C2793A 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="absolute top-4 left-4 font-mono text-[10px] text-muted">P&ID_UNIT_4A.PNG</div>
          
          {phase === "scanning" && (
            <div className="absolute left-0 right-0 h-0.5 bg-copper shadow-[0_0_15px_3px_rgba(194,121,58,0.8)] animate-scanline z-20"></div>
          )}
        </div>

        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-end">
          {streamedText && (
            <div className="bg-panel border border-line rounded-lg p-4 text-primary font-mono text-xs leading-relaxed">
              {streamedText}
              {phase !== "complete" && <span className="inline-block w-1.5 h-3 ml-1 bg-copper animate-blink align-middle"></span>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}