/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#070b16",
          900: "#0b1120",
          800: "#111a30",
          700: "#1a2542",
        },
      },
      boxShadow: {
        card: "0 20px 60px -15px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06) inset",
        glow: "0 0 0 1px rgba(129,140,248,.35), 0 8px 40px -8px rgba(99,102,241,.55)",
        "glow-cyan": "0 8px 40px -8px rgba(34,211,238,.5)",
      },
      keyframes: {
        drift: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(4%,-6%,0) scale(1.08)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        drift: "drift 18s ease-in-out infinite",
        "drift-slow": "drift 26s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};
