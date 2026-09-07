import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const plexSans = IBM_Plex_Sans({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-plex-sans" });
const plexMono = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: "Forge | Sovereign Workbench",
  description: "SIH26117 - Air-gapped agentic AI workbench.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable}`}>
      {/* CHANGED: h-screen to min-h-screen */}
      <body className="flex flex-col min-h-screen font-sans selection:bg-copper selection:text-base">
        
        {/* Global Navigation */}
        <header className="h-[72px] border-b border-line bg-base flex items-center justify-between px-8 shrink-0 z-50 sticky top-0">
          <div className="flex items-center gap-6 font-mono text-[11px] tracking-[0.02em]">
            <Link href="/" className="font-sans font-semibold text-[14px] hover:text-copper transition-colors">
              FORGE // WORKBENCH
            </Link>
            <div className="h-4 w-px bg-line"></div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-riskHigh animate-pulse shadow-[0_0_8px_#C24A3A]"></div>
              <span className="text-muted">MRPL TERMINAL // AIR-GAPPED</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-6 font-mono text-[11px] text-muted">
             <Link href="/" className="hover:text-primary transition-colors">OVERVIEW</Link>
             <Link href="/demo" className="px-5 py-2.5 border border-line hover:border-copper hover:text-copper rounded-full transition-colors flex items-center gap-2">
                LAUNCH DEMO <span className="text-[14px] leading-none">→</span>
             </Link>
          </nav>
        </header>

        {/* CHANGED: removed overflow-hidden */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

      </body>
    </html>
  );
}