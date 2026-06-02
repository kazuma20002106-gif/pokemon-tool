/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          red: '#EE1515',
          blue: '#222224',
          yellow: '#F0C000',
        }
      }
    },
  },
  plugins: [],
}
