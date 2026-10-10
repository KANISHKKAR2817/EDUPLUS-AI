/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#050811',
          900: '#080D1A',
          850: '#0C1324',
          800: '#111A30',
          750: '#16223E',
          700: '#1E2C4F',
          600: '#2A3C69',
        },
        electric: {
          blue: '#60A5FA',
          violet: '#A78BFA',
          cyan: '#22D3EE',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#102a43',
          900: '#0b1d3a',
          950: '#060f1e',
        },
        brand: {
          teal: '#0d9488',
          tealLight: '#14b8a6',
          emerald: '#10b981',
          emeraldDark: '#047857',
          cyan: '#06b6d4',
          blue: '#2563eb',
          violet: '#7c3aed',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-light': '0 8px 30px 0 rgba(148, 163, 184, 0.15)',
        'glow-blue': '0 0 25px -5px rgba(96, 165, 250, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.35)',
        'glow-violet': '0 0 25px -5px rgba(167, 139, 250, 0.35)',
      }
    },
  },
  plugins: [],
}
