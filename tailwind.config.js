/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./node_modules/preline/dist/preline.js",
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('preline/plugin'),
  ],
}

