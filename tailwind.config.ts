import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#f6f8fb",
          subtle: "#eef2f7",
          muted: "#e2e8f0"
        },
        accent: {
          DEFAULT: "#22c55e",
          soft: "#d9f99d"
        }
      },
      boxShadow: {
        card: "0 20px 45px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
