/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./node_modules/preline/dist/preline.js", "./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        sidebarBlue: "#d8e9f6",
        navbarBlue: "#0d75bc",
      },
    },
  },
  plugins: [require("preline/plugin")],
};
