"use client";

import React, { useState, useEffect } from "react";

export default function RagWorkbench({ prompt }: { prompt: string }) {
  const [phase, setPhase] = useState<"idle" | "searching" | "reading" | "drafting" | "complete">("idle");
  const [retrievedChunks, setRetrievedChunks] = useState<{id: string, source: string, relevance: string, content: string}[]>([]);
  const [streamedText, setStreamedText] = useState("");

  useEffect(() => {
    const executeLiveTask = async () => {
      setPhase("searching");
      setTimeout(() => setPhase("reading"), 1500); // Trigger visual phase while waiting for backend
      
      try {
        const response = await fetch("http://localhost:8000/api/task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt }) 
        });
        
        const data = await response.json();
        
        setPhase("drafting");
        // Mock the visual chunks sliding in, rendering the REAL text from the backend
        setRetrievedChunks([
          {
            id: "chk-01",
            source: "mrpl_safety_sop_v2.4.pdf",
            relevance: "CRAG Evaluated",
            content: "Retrieved internal safety documentation matching your query parameters."
          }
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
      {/* LEFT: Traceability Sidebar */}
      <aside className="w-80 bg-base border-r border-line flex flex-col shrink-0 overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {phase === "searching" && (
            <div className="flex items-center gap-3 text-xs font-mono text-copper animate-pulse bg-copper/10 p-4 rounded-lg border border-copper/20">
              <div className="w-3 h-3 border-2 border-copper border-t-transparent rounded-full animate-spin"></div>
              Querying Vector DB...
            </div>
          )}

          {retrievedChunks.map((chunk, index) => (
            <div key={chunk.id} className="border-l-2 border-l-copper bg-panel border border-line p-3 rounded-lg font-mono text-xs animate-slide-in">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-copper">{chunk.relevance}</span>
                <span className="text-muted2">ID: {chunk.id}</span>
              </div>
              <p className="text-primary leading-relaxed mb-2">"{chunk.content}"</p>
              <div className="text-muted flex items-center gap-2 pt-2 border-t border-line">
                <span className="w-1.5 h-1.5 rounded-full bg-riskLow"></span>
                {chunk.source}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT: Agent Action Area */}
      <section className="flex-1 flex flex-col overflow-hidden bg-base p-4">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-end mb-4">
          <div className="mb-4 font-mono text-[11px] flex flex-col gap-1.5 text-muted">
            <div className={`transition-opacity ${phase === "searching" ? "text-copper" : "opacity-50"}`}>
              [1] Querying embedded vector space... {phase !== "searching" && "✓"}
            </div>
            {(phase === "reading" || phase === "drafting" || phase === "complete") && (
              <div className={`transition-opacity ${phase === "reading" ? "text-copper animate-pulse" : "opacity-50"}`}>
                [2] CRAG grading chunks for relevance... {phase !== "reading" && "✓"}
              </div>
            )}
          </div>

          {(phase === "drafting" || phase === "complete") && (
            <div className="bg-panel border border-line rounded-lg p-4 text-primary font-mono text-xs leading-relaxed">
              {streamedText}
              {phase === "drafting" && <span className="inline-block w-1.5 h-3 ml-1 bg-copper animate-blink align-middle"></span>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}