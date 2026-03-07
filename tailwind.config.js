/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FFD54F',
          light: '#FFE082',
          dark: '#FFB300',
        }
      }
    },
  },
  plugins: [],
}
