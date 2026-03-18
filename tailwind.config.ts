// tailwind.config.ts
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#faf9f5',
          dark: '#f0eee6',
          medium: '#e8e6dc',
        },
        'slate-custom': {
          '000': '#ffffff',
          100: '#f5f4ed',
          200: '#e8e6dc',
          300: '#d1cfc5',
          400: '#b0aea5',
          500: '#87867f',
          600: '#5e5d59',
          700: '#3d3d3a',
          800: '#262624',
          900: '#1a1918',
          950: '#141413',
        },
        clay: '#d97757',
        olive: '#788c5d',
        oat: '#e3dacc',
        cactus: '#bcd1ca',
        sky: '#6a9bcc',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif KR"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [typography],
}

export default config
