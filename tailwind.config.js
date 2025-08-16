export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'glass-shimmer': 'glass-shimmer 3s ease-in-out infinite',
        'morphism-glow': 'morphism-glow 4s ease-in-out infinite',
        'float-spheres': 'float-spheres 20s ease-in-out infinite',
      },
      keyframes: {
        'glass-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'morphism-glow': {
          '0%, 100%': { 
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
          },
        },
        'float-spheres': {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px)',
          },
          '50%': {
            transform: 'translateY(-20px) translateX(10px)',
          },
        },
      },
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.25)',
          dark: 'rgba(255, 255, 255, 0.1)',
          border: {
            light: 'rgba(255, 255, 255, 0.18)',
            dark: 'rgba(255, 255, 255, 0.2)',
          }
        }
      }
    },
  },
  plugins: [],
}