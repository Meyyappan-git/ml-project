/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#f0f4ff',   // very light blue-tinted background
          100: '#e8edf8',  // slightly deeper tint
          200: '#d6dff0',  // borders / dividers
          300: '#b8c5dc',  // muted accents
        },
        brand: {
          700: '#1d4ed8',
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
          200: '#bfdbfe',
          100: '#dbeafe',
          50: '#eff6ff',
        }
      }
    },
  },
  plugins: [],
}
