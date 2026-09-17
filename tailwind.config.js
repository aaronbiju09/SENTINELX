/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#05070A',
        carbon: '#090C11',
        panel: '#0E1219',
        raise: '#141922',
        line: '#1E2531',
        edge: '#2A3342',
        steel: {
          700: '#3E4757',
          600: '#525C6D',
          500: '#6B7687',
          400: '#8C97A8',
          300: '#AEB8C7',
          200: '#CBD3DE',
        },
        paper: '#E9EDF4',
        system: {
          DEFAULT: '#22D3E0',
          dim: 'rgba(34,211,224,0.14)',
          line: 'rgba(34,211,224,0.35)',
        },
        warn: {
          DEFAULT: '#F0A93B',
          dim: 'rgba(240,169,59,0.14)',
        },
        crit: {
          DEFAULT: '#F3474F',
          dim: 'rgba(243,71,79,0.14)',
        },
        verify: {
          DEFAULT: '#2FCB86',
          dim: 'rgba(47,203,134,0.14)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        tech: '0.18em',
        wide2: '0.28em',
      },
      backgroundImage: {
        'grid-fine':
          'linear-gradient(rgba(110,122,140,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(110,122,140,0.045) 1px, transparent 1px)',
        'grid-coarse':
          'linear-gradient(rgba(110,122,140,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(110,122,140,0.055) 1px, transparent 1px)',
        vignette:
          'radial-gradient(ellipse at 50% 42%, transparent 35%, rgba(5,7,10,0.72) 100%)',
      },
      backgroundSize: {
        grid: '32px 32px',
        gridlg: '128px 128px',
      },
      keyframes: {
        'risk-pulse': {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '0.25', transform: 'scale(1.35)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'dash-travel': { to: { strokeDashoffset: '-28' } },
        'caret-blink': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        sheen: {
          '0%': { backgroundPosition: '-320px 0' },
          '100%': { backgroundPosition: '320px 0' },
        },
      },
      animation: {
        'risk-pulse': 'risk-pulse 2.4s ease-in-out infinite',
        'scan-line': 'scan-line 2.2s linear infinite',
        'dash-travel': 'dash-travel 1.1s linear infinite',
        'caret-blink': 'caret-blink 1.1s step-end infinite',
        sheen: 'sheen 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
