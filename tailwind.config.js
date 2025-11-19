/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#00e34a',
          dark: '#0f1724'
        }
      }
    },
  },
  plugins: [],
}

