/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'scout-blue': '#4A90E2',
        'doctor-green': '#2ECC71',
        'auditor-orange': '#E67E22',
        'screenshot-purple': '#9B59B6',
        'backend-gray': '#34495E',
        'frontend-cyan': '#1ABC9C',
        'nurse-pink': '#EC7063',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(74, 144, 226, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(74, 144, 226, 0.8)' },
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
