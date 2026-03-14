/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#B9FF4B',
          dim:    '#8FCC2A',
          glow:   '#D4FF80',
          dark:   '#4A6618',
        },
        void:   '#050505',
        ink:    '#0A0A0A',
        panel:  '#0F0F0F',
        surface:'#141414',
        edge:   '#1E1E1E',
        muted:  '#2A2A2A',
        ash:    '#888888',
        fog:    '#555555',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      animation: {
        'pulse-lime': 'pulse-lime 2s ease-in-out infinite',
        'scan':       'scan 3s linear infinite',
        'flicker':    'flicker 4s ease-in-out infinite',
        'ticker':     'ticker 20s linear infinite',
        'glow-in':    'glow-in 0.6s ease forwards',
        'slide-up':   'slide-up 0.5s ease forwards',
        'count-up':   'count-up 1s ease forwards',
        'blink':      'blink 1.2s step-end infinite',
      },
      keyframes: {
        'pulse-lime': {
          '0%,100%': { opacity: 1, boxShadow: '0 0 8px #B9FF4B44' },
          '50%':      { opacity: 0.7, boxShadow: '0 0 24px #B9FF4B99' },
        },
        'scan': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%,95%,100%': { opacity: 1 },
          '96%':         { opacity: 0.85 },
          '97%':         { opacity: 1 },
          '98%':         { opacity: 0.9 },
        },
        'ticker': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'glow-in': {
          from: { opacity: 0, filter: 'blur(8px)' },
          to:   { opacity: 1, filter: 'blur(0)' },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        'blink': {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0 },
        },
      },
      backgroundImage: {
        'grid-lime': `linear-gradient(rgba(185,255,75,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(185,255,75,0.03) 1px, transparent 1px)`,
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    }
  },
  plugins: []
};
