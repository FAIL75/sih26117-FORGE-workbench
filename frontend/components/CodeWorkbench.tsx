"use client";

import React, { useState } from 'react';

type SandboxPhase = 'idle' | 'writing' | 'locking' | 'executing' | 'complete';

export default function CodeWorkbench() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<SandboxPhase>('idle');
  const [streamedCode, setStreamedCode] = useState("");
  const [terminalOut, setTerminalOut] = useState<string[]>([]);

  // The script the AI "writes"
  const pythonScript = `import numpy as np

def monte_carlo_simulation(initial_portfolio, years, mu, vol, sims=10000):
    # Enforced deterministic calculation inside sandbox
    returns = np.random.normal(loc=mu, scale=vol, size=(years, sims))
    price_paths = initial_portfolio * np.cumprod(1 + returns, axis=0)
    return np.percentile(price_paths[-1], [5, 50, 95])

result = monte_carlo_simulation(100000, 30, 0.07, 0.15)
print(f"5th Percentile (Worst): \${result[0]:,.2f}")
print(f"50th Percentile (Median): \${result[1]:,.2f}")
print(f"95th Percentile (Best): \${result[2]:,.2f}")`;

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || phase !== 'idle') return;

    setPhase('writing');
    setStreamedCode("");
    setTerminalOut([]);

    // Phase 1: AI writes the code (Streaming)
    for (let i = 0; i <= pythonScript.length; i += 3) {
      setStreamedCode(pythonScript.substring(0, i));
      await sleep(10); 
    }
    
    await sleep(500);

    // Phase 2: Locking the Sandbox
    setPhase('locking');
    await sleep(1500);

    // Phase 3: Executing in Terminal
    setPhase('executing');
    setTerminalOut(prev => [...prev, "$ docker run --network none --rm -v $(pwd):/app python:3.9 python /app/calc.py"]);
    await sleep(800);
    setTerminalOut(prev => [...prev, "> Starting Monte Carlo generation (10,000 paths)..."]);
    await sleep(1200);
    setTerminalOut(prev => [
      ...prev, 
      "> 5th Percentile (Worst): $184,320.15",
      "> 50th Percentile (Median): $761,235.90",
      "> 95th Percentile (Best): $3,145,890.45",
      "Process exited with code 0."
    ]);

    setPhase('complete');
  };

  const isLocked = phase === 'locking' || phase === 'executing' || phase === 'complete';

  return (
    <div className="flex-1 flex h-full w-full bg-[#82B3E8] p-6 gap-6 font-sans">
      
      {/* LEFT: Sandbox Lifecycle Sidebar */}
      <aside className="w-[420px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col overflow-hidden shrink-0">
        <div className="p-6 border-b border-gray-200/50 bg-white/50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold text-gray-800 text-lg">Container Lifecycle</h3>
            <span className="text-[10px] font-mono px-2 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
              DOCKER ENGINE
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Ephemeral execution environments with strictly enforced zero-egress routing.
          </p>
        </div>

        <div className="flex-1 p-8 flex flex-col items-center justify-center bg-gray-50/50">
          
          {/* Animated SVG Padlock */}
          <div className={`relative w-32 h-32 mb-8 rounded-full flex items-center justify-center transition-colors duration-700 ${isLocked ? 'bg-amber-100 shadow-[0_0_40px_rgba(251,191,36,0.3)]' : 'bg-gray-200'}`}>
            <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Lock Shackle (Moves up and down based on state) */}
              <path 
                d="M8 28V16C8 7.16344 15.1634 0 24 0C32.8366 0 40 7.16344 40 16V28" 
                stroke={isLocked ? "#d97706" : "#9ca3af"} 
                strokeWidth="8" 
                strokeLinecap="round"
                className={`transition-all duration-500 ${isLocked ? 'translate-y-2' : '-translate-y-4'}`}
              />
              {/* Lock Body */}
              <rect x="0" y="24" width="48" height="40" rx="8" fill={isLocked ? "#f59e0b" : "#d1d5db"} className="relative z-10" />
              {/* Keyhole */}
              <circle cx="24" cy="40" r="4" fill={isLocked ? "#b45309" : "#9ca3af"} className="relative z-10" />
              <path d="M22 42H26V52H22V42Z" fill={isLocked ? "#b45309" : "#9ca3af"} className="relative z-10" />
            </svg>
          </div>

          <div className="w-full space-y-3 font-mono text-[11px]">
            <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-gray-200">
              <span className="text-gray-500">NETWORK ROUTING</span>
              <span className={`font-bold ${isLocked ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isLocked ? '--network none' : 'HOST BRIDGE'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-gray-200">
              <span className="text-gray-500">CONTAINER STATE</span>
              <span className="font-bold text-gray-800">
                {phase === 'idle' || phase === 'writing' ? 'UNINITIALIZED' : ''}
                {phase === 'locking' ? 'MOUNTING...' : ''}
                {phase === 'executing' ? 'RUNNING PID 1' : ''}
                {phase === 'complete' ? 'DESTROYED (RM)' : ''}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT: Agent Workspace */}
      <section className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col overflow-hidden relative">
        
        <div className="h-16 border-b border-gray-200/50 flex justify-between items-center px-8 bg-white/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-gray-800">Isolated Sandbox</span>
            <span className="font-mono text-[10px] text-gray-400 px-2 py-0.5 bg-gray-100 rounded">SOVEREIGN WORKBENCH</span>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
           
           {/* Top Half: Code Generation */}
           <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-inner">
             <div className="h-8 bg-slate-950 flex items-center px-4 border-b border-slate-800">
               <span className="font-mono text-[10px] text-slate-400">agent_workspace/calc.py</span>
             </div>
             <div className="p-4 overflow-y-auto font-mono text-sm text-emerald-400/90 whitespace-pre">
                {phase === 'idle' ? (
                  <span className="text-slate-600"># Awaiting mathematical parameters...</span>
                ) : (
                  <>
                    {streamedCode}
                    {phase === 'writing' && <span className="inline-block w-2 h-4 bg-emerald-400 animate-blink align-middle ml-1"></span>}
                  </>
                )}
             </div>
           </div>

           {/* Bottom Half: Secure Terminal */}
           <div className="h-1/3 bg-black rounded-2xl border border-gray-800 overflow-hidden flex flex-col shadow-inner">
             <div className="h-8 bg-gray-900 flex items-center px-4 border-b border-gray-800">
               <span className="font-mono text-[10px] text-gray-400">root@sandbox-env:~#</span>
             </div>
             <div className="p-4 overflow-y-auto font-mono text-xs text-gray-300 space-y-2">
                {terminalOut.map((log, i) => (
                  <div key={i} className={`${log.startsWith('$') ? 'text-amber-400' : 'text-gray-300'}`}>
                    {log}
                  </div>
                ))}
                {phase === 'executing' && (
                  <div className="text-amber-400 animate-pulse">_</div>
                )}
             </div>
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
              placeholder="E.g., Run a Monte Carlo simulation for a $100k portfolio over 30 years..."
              className="w-full bg-white border border-gray-300 rounded-xl py-4 pl-4 pr-32 text-sm text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button 
              type="submit"
              disabled={!query.trim() || (phase !== 'idle' && phase !== 'complete')}
              className="absolute right-2 top-2 bottom-2 bg-gray-900 hover:bg-black text-white px-6 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
              Generate & Run
            </button>
          </form>
        </div>

      </section>
    </div>
  );
}