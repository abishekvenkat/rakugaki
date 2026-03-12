import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          "system-ui",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          '"Fira Code"',
          '"Cascadia Code"',
          "ui-monospace",
          "monospace",
        ],
        serif: ['"New York"', "Georgia", "serif"],
      },
      colors: {
        macos: {
          bg: "var(--macos-bg)",
          surface: "var(--macos-surface)",
          sidebar: "var(--macos-sidebar)",
          border: "var(--macos-border)",
          text: "var(--macos-text)",
          "text-secondary": "var(--macos-text-secondary)",
          accent: "var(--macos-accent)",
          "tab-active": "var(--macos-tab-active)",
        },
      },
      backdropBlur: {
        macos: "20px",
      },
    },
  },
  plugins: [typography],
};

export default config;
