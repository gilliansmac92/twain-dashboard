/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          900: '#4a2200',
          800: '#7a4010',
          700: '#a05820',
          600: '#c07830',
          500: '#d09040',
          400: '#b07040',
        },
        warm: {
          bg: '#f8f5ef',
          card: '#ffffff',
          hover: '#f0e8de',
          border: '#e5e7eb',
          muted: '#888888',
          subtle: '#555555',
        }
      }
    },
  },
  plugins: [],
}
