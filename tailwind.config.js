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
        // Palette inspirée des images (vert menthe, blanc cassé, doré, marbre)
        marble: {
          50: '#f8fffe',
          100: '#f0fffe',
          200: '#d4f4f2',
          300: '#b8e9e6',
          400: '#9cddd8',
          500: '#7dd3d1',  // Vert menthe principal
          600: '#5fb8b6',
          700: '#4a9b9a',
          800: '#387d7c',
          900: '#2a5f5f',
        },
        cream: {
          50: '#fefefe',
          100: '#fdfcfc',
          200: '#faf8f6',  // Blanc cassé principal
          300: '#f5f2ef',
          400: '#f0ebe6',
          500: '#e8e1d9',
          600: '#d9cfc3',
          700: '#c4b5a6',
          800: '#a89688',
          900: '#8a7768',
        },
        gold: {
          50: '#fffef7',
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#f59e0b',  // Doré principal
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        aqua: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',  // Aqua principal
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.25)',
          dark: 'rgba(255, 255, 255, 0.1)',
          marble: 'rgba(125, 211, 209, 0.15)',  // Effet verre avec teinte marbre
          cream: 'rgba(250, 248, 246, 0.25)',   // Effet verre avec teinte crème
          border: {
            light: 'rgba(255, 255, 255, 0.18)',
            dark: 'rgba(255, 255, 255, 0.2)',
            marble: 'rgba(125, 211, 209, 0.3)',
            cream: 'rgba(250, 248, 246, 0.4)',
          }
        }
      }
    },
  },
  plugins: [],
}