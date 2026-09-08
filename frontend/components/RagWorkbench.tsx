"use client";

import React, { useState, useEffect } from 'react';

interface Chunk {
  id: string;
  source: string;
  content: string;
  relevance: string;
}

type AgentPhase = 'idle' | 'searching' | 'reading' | 'drafting' | 'complete';

export default function RagWorkbench() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<AgentPhase>('idle');
  const [retrievedChunks, setRetrievedChunks] = useState<Chunk[]>([]);
  const [streamedText, setStreamedText] = useState("");

  const finalDraft = "Based on the retrieved SOP v2.4, any pressure anomaly in Unit 4A requires immediate sealing of manual override valves prior to the digital cooldown sequence. I have formatted these findings into an official compliance report. Click generate below to download the .docx file.";

  // Helper function for simulated delays
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || phase !== 'idle') return;

    // Reset states
    setPhase('searching');
    setRetrievedChunks([]);
    setStreamedText("");

    // Phase 1: Vector Search (Simulated Latency)
    await sleep(1200);
    
    // Phase 2: Retrieve Chunks & Read
    setRetrievedChunks([
      {
        id: "chk-01",
        source: "mrpl_safety_sop_v2.4.pdf (Page 12)",
        relevance: "94% Match",
        content: "In the event of a pressure anomaly in Unit 4A, all manual override valves must be sealed before initiating the digital cooldown sequence."
      },
      {
        id: "chk-02",
        source: "mrpl_safety_sop_v2.4.pdf (Page 14)",
        relevance: "88% Match",
        content: "The digital cooldown sequence requires authorization from the shift supervisor and must be logged in the primary air-gapped ledger."
      }
    ]);
    setPhase('reading');
    await sleep(1800); // Give the user time to see the chunks slide in

    // Phase 3: Drafting (Streaming the LLM response)
    setPhase('drafting');
    for (let i = 0; i <= finalDraft.length; i++) {
      setStreamedText(finalDraft.substring(0, i));
      await sleep(25); // Simulated token generation speed
    }

    // Phase 4: Complete
    setPhase('complete');
  };

  return (
    <div className="flex-1 flex h-full w-full bg-[#82B3E8] p-6 gap-6 font-sans">
      
      {/* LEFT: Traceability Sidebar */}
      <aside className="w-[420px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-200/50 bg-white/50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold text-gray-800 text-lg">Vector Retrieval</h3>
            <span className="text-[10px] font-mono px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
              LOCAL CHROMADB
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Source chunks used by the local LLM to ground its response.
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-4">
          
          {phase === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-12 h-12 mb-4 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">📄</div>
              <p className="text-sm font-medium text-gray-600">No context loaded</p>
            </div>
          )}

          {phase === 'searching' && (
            <div className="flex items-center gap-3 text-sm font-medium text-blue-600 animate-pulse bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Querying Vector DB...
            </div>
          )}

          {/* The Retrieved Chunks */}
          {retrievedChunks.map((chunk, index) => (
            <div 
              key={chunk.id} 
              className={`bg-white p-5 rounded-2xl shadow-sm border animate-slide-in transition-colors duration-500 ${
                phase === 'reading' ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]' : 'border-gray-200'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {chunk.relevance}
                </span>
                <span className="font-mono text-[10px] text-gray-400">ID: {chunk.id}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">"{chunk.content}"</p>
              <div className="font-mono text-[10px] text-gray-500 pt-3 border-t border-gray-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {chunk.source}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT: Agent Action Area */}
      <section className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-200/50 flex justify-between items-center px-8 bg-white/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-gray-800">Agentic DocGen</span>
            <span className="font-mono text-[10px] text-gray-400 px-2 py-0.5 bg-gray-100 rounded">SOVEREIGN WORKBENCH</span>
          </div>
          
          <button 
            disabled={phase !== 'complete'}
            className={`font-mono text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              phase === 'complete'
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg cursor-pointer" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            ↓ GENERATE .DOCX REPORT
          </button>
        </div>

        {/* Interaction Canvas */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col">
           
           {/* Upload Zone (Fades out when working) */}
           {phase === 'idle' && (
             <div className="w-full max-w-2xl mx-auto border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-8 text-center mb-8 hover:bg-blue-50 transition-colors">
               <div className="text-2xl mb-3">📂</div>
               <h4 className="font-medium text-gray-800 text-sm mb-1">Target Knowledge Base loaded</h4>
               <p className="font-mono text-xs text-gray-500">mrpl_safety_sop_v2.4.pdf (14.2 MB) // Indexed locally</p>
             </div>
           )}

           {/* Agent Status & Output Stream */}
           {phase !== 'idle' && (
             <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-end mb-8">
               
               {/* Human-like thought indicators */}
               <div className="mb-4 font-mono text-xs flex flex-col gap-2 text-gray-500">
                  <div className={`transition-opacity duration-300 ${phase === 'searching' ? 'text-blue-600 font-semibold' : 'opacity-50'}`}>
                    [1] Querying embedded vector space... {phase !== 'searching' && '✓'}
                  </div>
                  {(phase === 'reading' || phase === 'drafting' || phase === 'complete') && (
                    <div className={`transition-opacity duration-300 ${phase === 'reading' ? 'text-blue-600 font-semibold animate-pulse' : 'opacity-50'}`}>
                      [2] Reading context chunks and extracting guidelines... {phase !== 'reading' && '✓'}
                    </div>
                  )}
                  {(phase === 'drafting' || phase === 'complete') && (
                    <div className={`transition-opacity duration-300 ${phase === 'drafting' ? 'text-blue-600 font-semibold' : 'opacity-50'}`}>
                      [3] Synthesizing report... {phase === 'complete' && '✓'}
                    </div>
                  )}
               </div>

               {/* The LLM Response Stream */}
               {(phase === 'drafting' || phase === 'complete') && (
                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-800 text-sm leading-relaxed shadow-sm">
                   {streamedText}
                   {phase === 'drafting' && <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 animate-blink align-middle"></span>}
                 </div>
               )}

             </div>
           )}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-gray-50/80 border-t border-gray-200/50 shrink-0">
          <form onSubmit={handleQuery} className="max-w-4xl mx-auto relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={phase !== 'idle' && phase !== 'complete'}
              placeholder="E.g., What is the protocol for a Unit 4A pressure anomaly?"
              className="w-full bg-white border border-gray-300 rounded-xl py-4 pl-4 pr-32 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button 
              type="submit"
              disabled={!query.trim() || (phase !== 'idle' && phase !== 'complete')}
              className="absolute right-2 top-2 bottom-2 bg-gray-900 hover:bg-black text-white px-6 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
              Analyze
            </button>
          </form>
        </div>

      </section>
    </div>
  );
}