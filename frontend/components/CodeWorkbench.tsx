"use client";

import React, { useState, useEffect } from "react";

export default function CodeWorkbench({ prompt }: { prompt: string }) {
  const [phase, setPhase] = useState<"idle" | "writing" | "locking" | "executing" | "complete">("idle");
  const [streamedCode, setStreamedCode] = useState("");
  const [terminalOut, setTerminalOut] = useState<string[]>([]);

  useEffect(() => {
    const executeLiveTask = async () => {
      setPhase("writing");
      setStreamedCode("# Sending instructions to isolated environment...\n");
      
      setTimeout(() => setPhase("locking"), 1000);
      setTimeout(() => setPhase("executing"), 2000);
      
      try {
        const response = await fetch("http://localhost:8000/api/task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt }) 
        });
        
        const data = await response.json();
        
        if (data.status === "success") {
          setStreamedCode("# Script generated and executed by Qwen-Coder.");
          setTerminalOut((prev) => [
            ...prev,
            "$ docker run --rm --network none --memory 256m --cpus 0.5 -v /workspace python:3.11-slim python task.py",
            `> ${data.response}`,
            "Process exited with code 0. Container destroyed."
          ]);
        } else {
          setTerminalOut((prev) => [...prev, `[Error]: ${data.message}`]);
        }
      } catch (error) {
        setTerminalOut((prev) => [...prev, "[Fatal]: Failed to reach the secure FastAPI node."]);
      } finally {
        setPhase("complete");
      }
    };

    if (prompt) executeLiveTask();
  }, [prompt]);

  const isLocked = phase === "locking" || phase === "executing" || phase === "complete";

  return (
    <div className="flex-1 flex h-full w-full gap-4 font-sans overflow-hidden">
      {/* LEFT: Sandbox Telemetry Pane */}
      <aside className="w-80 bg-base border-r border-line flex flex-col shrink-0 overflow-hidden">
        <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
          <div className={`w-24 h-24 rounded-full border flex items-center justify-center transition-all duration-500 ${isLocked ? "border-copper bg-copper/10 shadow-[0_0_25px_rgba(194,121,58,0.2)]" : "border-line bg-panel"}`}>
            <span className="text-2xl">{isLocked ? "🔒" : "🔓"}</span>
          </div>

          <div className="w-full space-y-2 font-mono text-xs">
            <div className="flex justify-between p-2.5 rounded bg-panel border border-line">
              <span className="text-muted">EGRESS</span>
              <span className={isLocked ? "text-riskLow font-semibold" : "text-muted2"}>
                {isLocked ? "--network none" : "DISABLED"}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-panel border border-line">
              <span className="text-muted">MEMORY LIMIT</span>
              <span className="text-primary">256 MB</span>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT: Agent Execution & Terminal */}
      <section className="flex-1 flex flex-col p-4 gap-4 overflow-hidden bg-base">
        <div className="flex-1 bg-panel border border-line rounded-lg p-4 font-mono text-xs text-primary overflow-y-auto whitespace-pre">
          {streamedCode}
        </div>

        <div className="h-44 bg-[#050607] border border-line rounded-lg p-4 font-mono text-xs text-muted overflow-y-auto space-y-1">
          <div className="text-muted2 mb-2 pb-1 border-b border-line flex justify-between">
            <span>SANDBOX STDERR/STDOUT</span>
            <span>PID 1</span>
          </div>
          {terminalOut.map((log, i) => (
            <div key={i} className={log.startsWith("$") ? "text-copper" : "text-primary"}>
              {log}
            </div>
          ))}
          {phase === "executing" && <span className="text-copper animate-pulse">▋</span>}
        </div>
      </section>
    </div>
  );
}