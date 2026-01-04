// tailwind.config.cjs
const twColors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './public/**/*.{html,js,ts,jsx,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto'],
      },

      // Merge brand palette with explicit Tailwind palettes to ensure utilities exist.
      colors: Object.assign(
        {},
        {
          zinc: twColors.zinc,
          emerald: twColors.emerald,
        },
        {
          doggerz: {
            paw: '#f1f2f5ff',
            sky: '#38bdf8',
            leaf: '#22c55e',
            treat: '#fbbf24',
            mange: '#9ca3af',
            bone: '#f9fafb',
            // back-compat shorter keys used earlier
            bg: '#0b1020',
            neon: '#00d61994',
            neonSoft: '#1cb30cff',
          },
        }
      ),

      // Reusable card shadow
      boxShadow: {
        card: '0 8px 24px rgba(0, 0, 0, 0.25)',
      },

      // Typographic tweak for logo / brand text
      fontSize: {
        logo: ['2.25rem', { lineHeight: '2.5rem' }], // ~text-3xl but dedicated
      },

      // Sprite + float animations for the pup
      keyframes: {
        'sprite-walk': {
          '0%': { backgroundPosition: '0 0' },
          '100%': {
            backgroundPosition:
              'calc(var(--sprite-size) * -1 * (var(--sprite-frames) - 1)) 0',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },

      animation: {
        // Uses CSS token defined in src/styles.css
        'sprite-walk':
          'sprite-walk steps(var(--sprite-frames)) calc(1000ms / var(--sprite-fps-normal)) infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },

  // Safelist dynamic classes applied at runtime or via template strings.
  safelist: [
    'animate-sprite-walk',
    'animate-float',
    { pattern: /text-doggerz-.*?/ },
    { pattern: /bg-doggerz-.*?/ },
  ],

  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
