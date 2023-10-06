/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts}', './node_modules/@literal-ui/core/**/*.js'],
  theme: {
    extend: {
      colors: {
        foregroundDark: "#020204",
        "backgroundDark": "#030711"
      }
    },
    container: {
      center: true,
      padding: '1rem',
    },
  },
  plugins: [require('@flow/tailwind'), require('@tailwindcss/line-clamp')],
}
