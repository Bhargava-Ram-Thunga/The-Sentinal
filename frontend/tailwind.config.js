/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.1)", filter: "brightness(1.5)" },
        },
        subtlePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
      animation: {
        blob: "blob 7s infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-slow": "fadeIn 1s ease-out",
        "pulse-glow": "pulseGlow 15s ease-in-out infinite",
        "subtle-pulse": "subtlePulse 4s ease-in-out infinite",
      },
      backgroundImage: {
        "radial-gradient":
          "radial-gradient(ellipse at center, rgba(30,58,138,0.5) 0%, rgba(17,24,39,0) 70%)",
      },
    },
  },
  plugins: [],
};
