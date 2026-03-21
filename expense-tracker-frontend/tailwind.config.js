/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          850: "#1f2937",  // slightly lighter than gray-900
          950: "#0b1220",  // deeper dark background (optional)
        },
      },
    },
  },
  plugins: [],
}