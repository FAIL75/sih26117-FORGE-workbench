import DocumentScrollSequence from "../components/DocumentScrollSequence";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full bg-[#82B3E8]">
      {/* Intro Hero */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative z-10 text-center px-4">
        <span className="font-mono text-xs tracking-widest uppercase text-white/80 mb-4">
          Problem Statement 26117 // Sovereign On-Premise AI
        </span>
        <h1 className="font-display font-bold text-5xl md:text-7xl text-white tracking-tight drop-shadow-md">
          Sovereign Enclave
        </h1>
        <p className="max-w-xl text-white/90 text-base md:text-lg mt-4 leading-relaxed font-sans">
          Air-gapped document intelligence. Zero egress to external networks, fully contained on-premise.
        </p>
        <div className="mt-12 font-mono text-xs text-white/70 uppercase tracking-wider animate-bounce">
          Scroll to run ingestion sequence ↓
        </div>
      </section>

      {/* Frame Sequence Canvas Scrubber */}
      <DocumentScrollSequence />
    </main>
  );
}