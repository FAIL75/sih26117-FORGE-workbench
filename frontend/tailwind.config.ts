import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0B0C0E",
        panel: "#111214",
        line: "#202225",
        primary: "#F3F1EC",
        muted: "#77797E",
        muted2: "#4B4D52",
        copper: "#C2793A",
        riskLow: "#4A9B6E",
        riskHigh: "#C24A3A"
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;