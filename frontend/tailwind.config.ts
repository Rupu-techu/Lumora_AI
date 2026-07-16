import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7c3aed",
          "purple-light": "#a78bfa",
          blue: "#2563eb",
          "blue-light": "#60a5fa",
          dark: "#0d0d1a",
          "dark-2": "#13132b",
          "dark-3": "#1a1a38",
          "dark-card": "#1e1e3f",
        },
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
        "gradient-hero":
          "linear-gradient(135deg, #0d0d1a 0%, #13132b 50%, #1a1a38 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-in-out",
        "slide-up":   "slideUp 0.6s ease-out",
        "float":      "float 6s ease-in-out infinite",
        "float-slow": "floatSlow 9s ease-in-out infinite",
        "spin-slow":  "spinSlow 20s linear infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "shimmer":    "shimmer 4s linear infinite",
        "ticker":     "ticker 28s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-18px) rotate(1.5deg)" },
          "66%":      { transform: "translateY(-8px) rotate(-1deg)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%":      { transform: "translateY(-28px) scale(1.04)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.3)" },
          "50%":      { boxShadow: "0 0 50px rgba(124,58,237,0.7), 0 0 80px rgba(37,99,235,0.3)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: " 200% center" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      transitionTimingFunction: {
        "spring":      "cubic-bezier(0.22, 1, 0.36, 1)",
        "bounce-out":  "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [],
};

export default config;
