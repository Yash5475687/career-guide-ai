/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0E17",
          2: "#111726",
          3: "#171F33",
          border: "#232C42",
        },
        paper: {
          DEFAULT: "#F7F5F0",
          2: "#FFFFFF",
          border: "#E4E0D6",
        },
        growth: {
          50: "#EAFBF3",
          200: "#A7F0CD",
          400: "#3FDE9A",
          500: "#22C983",
          600: "#149F68",
          700: "#0F7A51",
        },
        amber: {
          300: "#FBCB7A",
          400: "#F5A623",
          500: "#E08E0B",
        },
        sky: {
          400: "#6C9BF2",
          500: "#4C7EE0",
        },
        coral: {
          400: "#F2755F",
          500: "#E0553D",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "trail-gradient": "linear-gradient(180deg, #22C983 0%, #4C7EE0 50%, #F5A623 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,201,131,0.25), 0 0 24px rgba(34,201,131,0.15)",
      },
    },
  },
  plugins: [],
};
