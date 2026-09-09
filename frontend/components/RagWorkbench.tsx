"use client";

import React, { useState, useEffect } from "react";

export default function RagWorkbench() {
  const [phase, setPhase] = useState<"idle" | "searching" | "reading" | "drafting" | "complete">("idle");
  const [retrievedChunks, setRetrievedChunks] = useState<{id: string, source: string, relevance: string, content: string}[]>([]);
  const [streamedText, setStreamedText] = useState("");

  const finalDraft = "Based on the retrieved SOP v2.4, any pressure anomaly in Unit 4A requires immediate sealing of manual override valves. I have generated the formal compliance report (.docx).";
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const runRagSequence = async () => {
      setPhase("searching");
      await sleep(1000);
      
      setPhase("reading");
      setRetrievedChunks([
        {
          id: "chk-01",
          source: "mrpl_safety_sop_v2.4.pdf",
          relevance: "94% Match",
          content: "In the event of a pressure anomaly in Unit 4A, all manual override valves must be sealed before initiating the digital cooldown sequence."
        }
      ]);
      await sleep(1500);

      setPhase("drafting");
      for (let i = 0; i <= finalDraft.length; i++) {
        setStreamedText(finalDraft.substring(0, i));
        await sleep(25);
      }
      setPhase("complete");
    };

    runRagSequence();
  }, []);

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