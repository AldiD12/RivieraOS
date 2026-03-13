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
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Courier New', 'monospace'],
        // Industrial Luxury fonts
        'display': ['Playfair Display', 'Anton', 'Georgia', 'serif'],
        'geist-sans': ['Geist Sans', 'Inter', 'sans-serif'],
        'geist-mono': ['Geist Mono', 'monospace'],
      },
      colors: {
        primary: "#10FF88",
        'xixa-green': '#10FF88',
        "background-dark": "#09090B", // Zinc-950
        "surface-dark": "#18181B", // Zinc-900
        "border-dark": "#27272A", // Zinc-800
        // Industrial palette
        zinc: {
          950: '#09090b',
          800: '#27272a',
          700: '#3f3f46',
        }
      },
    },
  },
  plugins: [],
}
