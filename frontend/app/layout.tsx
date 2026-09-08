import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
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
      <body className="flex flex-col min-h-screen font-sans selection:bg-copper selection:text-base bg-[#82B3E8]">
        
        {/* 
          The global header/nav has been completely removed.
          This allows the canvas animation in page.tsx to be perfectly fullscreen.
        */}
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>

      </body>
    </html>
  );
}