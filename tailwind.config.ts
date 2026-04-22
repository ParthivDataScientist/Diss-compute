import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        surface: "#fafafa",
        ink: "#0a0a0a",
        muted: "#737373",
        line: "#e5e5e5",
        accent: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8"
        },
        status: {
          red: { 50: "#fef2f2", 200: "#fecaca", 600: "#dc2626", 700: "#b91c1c" },
          orange: { 50: "#fff7ed", 200: "#fed7aa", 600: "#ea580c", 700: "#c2410c" },
          blue: { 50: "#eff6ff", 200: "#bfdbfe", 600: "#2563eb", 700: "#1d4ed8" },
          green: { 50: "#f0fdf4", 200: "#bbf7d0", 600: "#16a34a", 700: "#15803d" },
          gray: { 50: "#f9fafb", 200: "#e5e5e5", 600: "#525252", 700: "#404040" }
        }
      },
      boxShadow: {
        panel: "0 10px 40px -10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        dropdown: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
