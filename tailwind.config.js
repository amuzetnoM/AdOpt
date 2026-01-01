/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./index.tsx",
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Vivid accent colors for dark mode - more saturated purple/indigo
        'accent-vivid': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
      },
      boxShadow: {
        'neo-raised': '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
        'neo-inset': 'inset 8px 8px 16px #d1d9e6, inset -8px -8px 16px #ffffff',
        'neo-flat': '4px 4px 12px rgba(0, 0, 0, 0.08), -4px -4px 12px rgba(255, 255, 255, 0.8)',
        'neo-hover': '-10px -10px 20px rgba(255, 255, 255, 0.9), 10px 10px 20px rgba(0, 0, 0, 0.15)',
        'neo-dark-raised': '8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neo-dark-inset': 'inset 8px 8px 16px rgba(0, 0, 0, 0.4), inset -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neo-dark-flat': '4px 4px 12px rgba(0, 0, 0, 0.5), -4px -4px 12px rgba(255, 255, 255, 0.03)',
        'neo-dark-hover': '-10px -10px 20px rgba(255, 255, 255, 0.08), 10px 10px 20px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
