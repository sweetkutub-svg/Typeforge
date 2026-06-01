/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0a0a0f',
        surface:  '#12121a',
        'surface-2': '#1a1a26',
        border:   '#1e1e2e',
        accent:   '#00ff9f',
        'accent-dim': '#00cc7a',
        'accent-blue': '#00d4ff',
        'accent-purple': '#a78bfa',
        'text-primary': '#f0f0f8',
        'text-secondary': '#666680',
        'text-muted': '#3a3a55',
        error:    '#ff4d6d',
        warning:  '#ffd060',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow':    '0 0 25px rgba(0,255,159,0.3)',
        'glow-lg': '0 0 50px rgba(0,255,159,0.4)',
        'glow-sm': '0 0 12px rgba(0,255,159,0.15)',
        'glow-blue': '0 0 25px rgba(0,212,255,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'float-up':    'floatUp 1s ease-out forwards',
        'streak-fire': 'streakFire 1.2s ease-in-out infinite alternate',
        'slide-in':    'slideIn 0.4s ease-out',
        'fade-in':     'fadeIn 0.3s ease-out',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 10px rgba(0,255,159,0.2)' },
          '50%':     { boxShadow: '0 0 30px rgba(0,255,159,0.6)' },
        },
        floatUp: {
          '0%':   { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(-60px)' },
        },
        streakFire: {
          '0%':   { filter: 'hue-rotate(0deg) brightness(1)' },
          '100%': { filter: 'hue-rotate(25deg) brightness(1.4)' },
        },
        slideIn: {
          '0%':   { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle, #1e1e2e 1px, transparent 1px)',
        'gradient-accent': 'linear-gradient(135deg, #00ff9f, #00d4ff)',
      },
    },
  },
  plugins: [],
};
