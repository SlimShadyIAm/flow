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
          sepia: colors.yellow[100],
        },
        text: {
          dark: '#FFFFFF',
          light: colors.zinc[800],
          sepia: '#01010A',
        },
        pageTurning: {
          dark: colors.zinc[700],
          light: colors.gray[300],
          sepia: colors.amber[200],
        },
        border: {
          dark: '#FFC700',
          light: colors.purple[700],
          sepia: colors.blue[700],
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
