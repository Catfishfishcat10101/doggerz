/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      keyframes: {
        dogWalk: {
          '0%': { transform: 'translateX(0) scaleY(1)' },
          '25%': { transform: 'translateX(calc(var(--walk-distance)/2)) scaleY(1.05)' },
          '50%': { transform: 'translateX(var(--walk-distance)) scaleY(1)' },
          '75%': { transform: 'translateX(calc(var(--walk-distance)/2)) scaleY(0.95)' },
          '100%': { transform: 'translateX(0) scaleY(1)' },
        },
        ripple: {
          to: { transform: 'scale(4)', opacity: '0' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 }
        }
      },
      animation: {
        dogWalk: 'dogWalk 2s linear infinite',
        ripple: 'ripple 0.6s ease-out',
        fadeIn: 'fadeIn 0.5s ease forwards',
        slideUp: 'slideUp 0.6s ease forwards',
      }
    },
  },
  plugins: [],
};
