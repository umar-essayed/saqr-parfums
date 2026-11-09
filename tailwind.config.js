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
        saqr: {
          base: '#08080A',
          card: '#0F0F12',
          surface: '#15151A',
          border: '#23232A',
          gold: '#C5A059',
          goldLight: '#DFC082',
          goldMuted: '#967B44',
          gray: '#86868B',
          grayLight: '#D2D2D7',
          grayDark: '#3A3A3C',
          appleLight: '#F5F5F7'
        }
      },
      fontFamily: {
        sans: ['Cairo', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
