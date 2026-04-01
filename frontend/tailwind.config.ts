import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc6c6",
          300: "#ff9e9e",
          400: "#ff6666",
          500: "#ff3b3b",
          600: "#e11d2e",
          700: "#c41225",
          800: "#9b1322",
          900: "#7d1521"
        },
        ink: "#111111",
        mist: "#f8f8fa"
      },
      boxShadow: {
        glow: "0 24px 70px rgba(225, 29, 46, 0.12)",
        soft: "0 12px 40px rgba(17, 17, 17, 0.08)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(225,29,46,0.18), transparent 32%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.9), transparent 28%), radial-gradient(circle at bottom right, rgba(255,102,102,0.12), transparent 30%)"
      },
      animation: {
        float: "float 12s ease-in-out infinite",
        pulseSoft: "pulseSoft 8s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: [],
} satisfies Config;

