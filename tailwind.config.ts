import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fire: {
          50:  '#FFF4EE',
          100: '#FFE0CC',
          200: '#FDBA74',
          400: '#F97316',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
        },
        ember: {
          50:  '#FFFBEB',
          200: '#FDE68A',
          400: '#FBBF24',
          600: '#D97706',
        },
        ash: {
          900: '#0D0B09',
          800: '#161310',
          700: '#1E1A16',
          600: '#262019',
          500: '#2E2820',
          400: '#3D3228',
          300: '#6B5A4A',
          200: '#A89880',
          100: '#F5EFE8',
        },
      },
      fontFamily: {
        sans:  ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      keyframes: {
        flicker: {
          '0%,100%': { transform: 'scaleY(1) scaleX(1)', opacity: '1' },
          '20%':     { transform: 'scaleY(1.07) scaleX(.96)', opacity: '.92' },
          '40%':     { transform: 'scaleY(.93) scaleX(1.05)', opacity: '.97' },
          '60%':     { transform: 'scaleY(1.09) scaleX(.95)', opacity: '.88' },
          '80%':     { transform: 'scaleY(.96) scaleX(1.03)', opacity: '.95' },
        },
        treesway: {
          '0%,100%': { transform: 'rotate(0deg)' },
          '50%':     { transform: 'rotate(.6deg)' },
        },
        twinkle: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '.3', transform: 'scale(.7)' },
        },
        moonpulse: {
          '0%,100%': { boxShadow: '0 0 22px rgba(254,249,195,.6),0 0 55px rgba(254,249,195,.25)' },
          '50%':     { boxShadow: '0 0 28px rgba(254,249,195,.75),0 0 65px rgba(254,249,195,.3)' },
        },
        groundglow: {
          '0%,100%': { opacity: '.55' },
          '50%':     { opacity: '.85' },
        },
        emberFloat: {
          '0%':   { transform: 'translate(0,0) scale(1)', opacity: '.95' },
          '100%': { transform: 'translate(var(--tw-translate-x),var(--tw-translate-y)) scale(0)', opacity: '0' },
        },
      },
      animation: {
        flicker:     'flicker 1.8s ease-in-out infinite',
        treesway:    'treesway 7s ease-in-out infinite',
        twinkle:     'twinkle 3s ease-in-out infinite',
        moonpulse:   'moonpulse 4s ease-in-out infinite',
        groundglow:  'groundglow 2s ease-in-out infinite',
        emberFloat:  'emberFloat 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
