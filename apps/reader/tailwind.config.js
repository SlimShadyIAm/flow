/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts}', './node_modules/@literal-ui/core/**/*.js'],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#030711',
          light: colors.zinc[50],
          sepia: '#F1E2C9',
          sepia_old: colors.yellow[100],
        },
        text: {
          dark: '#E6E6E6',
          light: colors.zinc[800],
          sepia: '#34281C',
          sepia_old: '#01010A',
        },
        pageTurning: {
          dark: colors.zinc[700],
          light: colors.gray[300],
          sepia: '#D3C8C4',
          sepia_old: colors.amber[200],
        },
        border: {
          dark: '#FFC700',
          light: colors.purple[700],
          sepia: '#367699',
          sepia_old: colors.blue[700],
        },
      },
    },
    container: {
      center: true,
      padding: '1rem',
    },
  },
  plugins: [require('@flow/tailwind'), require('@tailwindcss/line-clamp')],
}
