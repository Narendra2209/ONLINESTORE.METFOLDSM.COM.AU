import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36adf6',
          500: '#0c93e7',
          600: '#0074c5',
          700: '#015d9f',
          800: '#064f83',
          900: '#0b426d',
          950: '#072a49',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffeed4',
          200: '#ffd9a8',
          300: '#ffbe71',
          400: '#ff9738',
          500: '#ff7a11',
          600: '#f05e06',
          700: '#c74507',
          800: '#9e370e',
          900: '#7f2f0f',
          950: '#451505',
        },
        steel: {
          50: '#f6f7f8',
          100: '#ebedf0',
          200: '#d3d7de',
          300: '#adb5c1',
          400: '#818d9f',
          500: '#627085',
          600: '#4e5a6d',
          700: '#404a59',
          800: '#37404c',
          900: '#313842',
          950: '#21252c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'aurora': {
          '0%': { backgroundPosition: '0% 50%, 50% 50%, 100% 50%' },
          '50%': { backgroundPosition: '100% 50%, 0% 50%, 50% 50%' },
          '100%': { backgroundPosition: '0% 50%, 50% 50%, 100% 50%' },
        },
        'light-streak': {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)', opacity: '0' },
          '20%': { opacity: '0.7' },
          '100%': { transform: 'translateX(200%) skewX(-15deg)', opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
        'slide-up-slow': {
          '0%': { opacity: '0', transform: 'translateY(60px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'card-float': {
          '0%, 100%': { transform: 'translateY(0px) rotateX(2deg) rotateY(-2deg)' },
          '50%': { transform: 'translateY(-15px) rotateX(-2deg) rotateY(2deg)' },
        },
        'particle-drift': {
          '0%': { transform: 'translate(0, 0) scale(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translate(var(--drift-x, 100px), var(--drift-y, -200px)) scale(1)', opacity: '0' },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        'count-up': 'count-up 0.5s ease-out forwards',
        'aurora': 'aurora 15s ease infinite',
        'light-streak': 'light-streak 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'slide-up-slow': 'slide-up-slow 1s ease-out forwards',
        'card-float': 'card-float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
