/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta tomada del logo
        petal: {
          50: '#FFF4F7',
          100: '#FFE6EC',
          200: '#FFD5E0',
          300: '#F6B1C3',
          400: '#F192AD',
          500: '#D9658A',
          600: '#B8396A',
        },
        ink: '#4A1530',
      },
      fontFamily: {
        title: ['Chewy', 'Fredoka', 'cursive'],
        body: ['Fredoka', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        spinslow: {
          to: { transform: 'rotate(360deg)' },
        },
        pop: {
          '0%': { transform: 'scale(.8) translateY(10px)', opacity: 0 },
          '100%': { transform: 'scale(1) translateY(0)', opacity: 1 },
        },
      },
      animation: {
        wiggle: 'wiggle 2.4s ease-in-out infinite',
        floaty: 'floaty 3.2s ease-in-out infinite',
        spinslow: 'spinslow 60s linear infinite',
        pop: 'pop .25s ease-out both',
      },
    },
  },
  plugins: [],
};
