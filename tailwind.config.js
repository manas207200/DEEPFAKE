/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#070B14",
        panel: "#121A2A",
        line: "#243049",
        mint: "#34D399",
        warn: "#FBBF24",
        danger: "#F87171",
        sky: "#38BDF8",
      },
    },
  },
  plugins: [],
};
