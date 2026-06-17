/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
      colors: {
        'game-bg': '#0a0a0a',
        'card-surface': '#1a1a2e',
        'card-border': '#2a2a4e',
      },
    },
  },
  plugins: [],
}
