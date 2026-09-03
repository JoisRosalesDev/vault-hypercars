import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="corsa"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          base: "#09090b",
          surface: "#18181b",
          elevated: "#27272a",
        },
        titanium: {
          pure: "#fafafa",
          muted: "#a1a1aa",
          subtle: "#71717a",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          glow: "var(--color-accent-glow)",
          contrast: "var(--color-accent-contrast)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
      },
      boxShadow: {
        "telemetry-sm": "0 0 10px var(--color-accent-glow)",
        "telemetry-md": "0 0 15px var(--color-accent-glow)",
        "telemetry-lg": "0 0 25px var(--color-accent-glow)",
      },
    },
  },
  plugins: [],
};

export default config;
