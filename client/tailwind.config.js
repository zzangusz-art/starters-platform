/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#080808',
          dark: '#0f0f0f',
          card: '#141414',
          border: '#1f1f1f',
          green: '#22c55e',
          'green-hover': '#16a34a',
          'green-dim': '#15803d',
          'green-glow': 'rgba(34,197,94,0.15)',
          'green-muted': 'rgba(34,197,94,0.08)',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 60%)',
        'card-gradient': 'linear-gradient(135deg, #141414 0%, #0f0f0f 100%)',
      },
    },
  },
  plugins: [],
};
