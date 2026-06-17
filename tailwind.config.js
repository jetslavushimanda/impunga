/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark intelligence tokens
        'bg-base':    '#080D18',
        'bg-surface': '#0F1623',
        'bg-elevated':'#161D2E',
        'bg-overlay': '#1C2438',
        'bg-hover':   '#212B40',

        // Product colours
        'c-business': '#4F8EF7',
        'c-skills':   '#9B72F5',
        'c-finance':  '#2DD4BF',
        'c-market':   '#F59E0B',
        'c-ai':       '#22D3EE',

        // Gold system
        'gold-bright': '#E8C547',
        'gold-mid':    '#D4AC0D',
        'gold-muted':  '#A68A00',

        // Text
        'text-primary':   '#F0F4FF',
        'text-secondary': '#8892A4',
        'text-muted':     '#4A5568',
        'text-inverse':   '#080D18',

        // Borders
        'border-subtle':  '#1A2235',
        'border-default': '#1F2D45',
        'border-strong':  '#2A3D5C',

        // Semantic
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger':  '#EF4444',
        'info':    '#4F8EF7',

        // Legacy (kept for backwards compat)
        primary: {
          DEFAULT: '#E8C547',
          light: '#F0D060',
          dark: '#D4AC0D',
        },
        accent: {
          green: '#10B981',
          gold: '#E8C547',
          orange: '#F59E0B',
          red: '#EF4444',
        },
        surface: {
          DEFAULT: '#0F1623',
          light: '#161D2E',
          blue: '#1C2438',
          green: '#0F2318',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'none',
        'slide-up': 'none',
        'bounce-once': 'none',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
