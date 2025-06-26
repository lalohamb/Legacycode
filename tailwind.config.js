/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7cc6ff',
          400: '#38a8ff',
          500: '#0a91ff',
          600: '#0068df',
          700: '#0050b3',
          800: '#004494',
          900: '#00397a',
          950: '#00224d',
        },
        purple: {
          50: '#fbf6fe',
          100: '#f5ebfd',
          200: '#edd9fb',
          300: '#dfb9f7',
          400: '#cb8ef1',
          500: '#b460e7',
          600: '#a043d8',
          700: '#8830be',
          800: '#702a9c',
          900: '#5c247e',
          950: '#40124f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px 5px rgba(56, 168, 255, 0.15)',
      },
    },
  },
  plugins: [],
};