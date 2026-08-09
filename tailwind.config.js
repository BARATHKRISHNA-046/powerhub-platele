/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2752dd',
          slate: '#324158',
          gold: '#f59e0b',
          bg: '#f8fafc',
        },
        pastel: {
          peach: '#fbe9d1',
          blue: '#cae6fe',
          yellow: '#fffcd1',
          cyan: '#c9f6fc',
          periwinkle: '#c8d6fd',
          green: '#cbf5c7',
          brightgreen: '#9ff384',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
      animation: {
        'grid-pulse': 'gridPulse 4s ease-in-out infinite',
      },
      keyframes: {
        gridPulse: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        }
      }
    },
  },
  plugins: [],
}
