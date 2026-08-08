/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF',
        secondary: '#6B7280',
        accent: '#2563EB',
        dark: '#0A0A0A',
        card: '#111111'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
        display: ['Satoshi', 'sans-serif'],
        drama: ['Cormorant Garamond', 'serif']
      }
    },
  },
  plugins: [],
}
