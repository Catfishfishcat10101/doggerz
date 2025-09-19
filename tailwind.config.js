// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Swap/augment as you like; keeps system stack as fallback.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 6px rgba(0,0,0,0.08)',
      },
      keyframes: {
        // for navbar/mobile menu
        'enter-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'enter-slide-in-from-top-2': {
          '0%': { transform: 'translateY(-0.5rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // shimmer used by CleanlinessBar
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // a subtle float for splash accents or badges
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'in': 'enter-fade-in var(--tw-enter-duration,150ms) ease-out both',
        'slide-in-from-top-2': 'enter-slide-in-from-top-2 var(--tw-enter-duration,150ms) ease-out both',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        float: 'float 2.8s ease-in-out infinite',
      },
      backgroundImage: {
        // handy grid you used in the lush world
        'grid-64':
          'linear-gradient(0deg,#99f0ae 0 1px,transparent 1px), linear-gradient(90deg,#99f0ae 0 1px,transparent 1px)',
      },
    },
  },

  // These utilities are generated dynamically by your app logic;
  // keep them from being purged in production builds.
  safelist: [
    // progress bars / moods / badges
    'bg-emerald-500', 'bg-emerald-400', 'bg-emerald-100', 'text-emerald-900', 'text-emerald-800',
    'border-emerald-300', 'border-emerald-500/30', 'bg-emerald-500/10', 'text-emerald-200',
    'bg-amber-500', 'bg-amber-400', 'bg-amber-50', 'text-amber-800', 'border-amber-300',
    'bg-rose-600', 'bg-rose-500', 'bg-rose-50', 'text-rose-800', 'border-rose-300',
    'bg-white', 'bg-slate-50', 'text-slate-800',
    // navbar states
    'bg-slate-700', 'bg-slate-800/40', 'text-slate-200',
    // animate helpers used in NavBar mobile drawer
    'animate-in', 'fade-in', 'slide-in-from-top-2',
  ],

  // Inline micro-plugin to provide the small animation utility classes you’re using.
  plugins: [
    function ({ addUtilities, addVariant, theme }) {
      addUtilities({
        '.animate-in': {
          animationDuration: 'var(--tw-enter-duration,150ms)',
          animationFillMode: 'both',
        },
        '.fade-in': {
          animationName: theme('keyframes.enter-fade-in'),
        },
        '.slide-in-from-top-2': {
          animationName: theme('keyframes.enter-slide-in-from-top-2'),
        },
      });

      // Optional: hover-supported variant for devices that actually hover
      addVariant('hover-capable', '@media (hover:hover)');
    },
  ],
};
