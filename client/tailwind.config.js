/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#141420',
          card: '#1E1E2E',
          cardHover: '#2A2A3C',
          border: '#2C2C3E',
        },
        primary: {
          DEFAULT: '#8BC34A',
          hover: '#9CCC65',
          glow: 'rgba(139, 195, 74, 0.4)',
        },
        secondary: {
          DEFAULT: '#7C4DFF',
          hover: '#906BFF',
        },
        info: '#2196F3',
        risk: '#F44336',
        riskGlow: 'rgba(244, 67, 54, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(139, 195, 74, 0.3)',
        'glow-risk': '0 0 15px rgba(244, 67, 54, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

