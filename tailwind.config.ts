import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#06B6D4', dark: '#0891B2', light: '#67E8F9' }, // Cyan
        gold: { DEFAULT: '#FBBF24', dark: '#D97706', light: '#FCD34D' }, // Gold
        accent: { DEFAULT: '#A855F7', dark: '#7E22CE', light: '#D8B4FE' }, // Purple
        coral: { DEFAULT: '#FB7185', dark: '#E63946', light: '#FCA5AC' }, // Coral
        ink: { DEFAULT: '#0F172A', 2: '#111827', 3: '#1E293B' }, // Deep dark blues
        surface: { DEFAULT: '#111827', 2: '#1E293B', 3: '#334155' }, // Dark surfaces
        success: { DEFAULT: '#06B6D4', dark: '#0891B2' }, // Cyan for success
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Playfair Display', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
