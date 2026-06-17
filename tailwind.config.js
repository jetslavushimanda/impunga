/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4F72',
          light: '#2E86C1',
          dark: '#154360',
        },
        accent: {
          green: '#1E8449',
          gold: '#B7950B',
          orange: '#D35400',
          red: '#C0392B',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          light: '#F4F6F7',
          blue: '#D6EAF8',
          green: '#D5F5E3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
