import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        con: {
          red: "#cc0000",
          "red-dark": "#990000",
          rust: "#c45522",
          black: "#000000",
          "off-black": "#1a1a1a",
          charcoal: "#2d2d2d",
          steel: "#6b6b6b",
          white: "#ffffff",
          "off-white": "#f2f0eb",
          cream: "#e8e0d0",
        },
        brand: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#cc0000",
          600: "#990000",
          700: "#7f1d1d",
        },
        obsidian: {
          950: "#000000",
          900: "#1a1a1a",
          800: "#2d2d2d",
          700: "#3d3d3d",
        }
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "Bebas Neue", "Impact", "sans-serif"],
        condensed: ["var(--font-condensed)", "Roboto Condensed", "sans-serif"],
        mono: ["var(--font-mono)", "Menlo", "Consolas", "Courier New", "monospace"],
        sans: ["var(--font-condensed)", "Roboto Condensed", "-apple-system", "sans-serif"],
      }
    },
  },
  plugins: [],
};
export default config;
