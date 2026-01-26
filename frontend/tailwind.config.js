/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        // Industrial Luxury fonts
        'display': ['Playfair Display', 'Georgia', 'serif'],
        'geist-sans': ['Geist Sans', 'Inter', 'sans-serif'],
        'geist-mono': ['Geist Mono', 'monospace'],
      },
      colors: {
        // Industrial palette
        zinc: {
          950: '#09090b',
        }
      },
    },
  },
  plugins: [],
}
