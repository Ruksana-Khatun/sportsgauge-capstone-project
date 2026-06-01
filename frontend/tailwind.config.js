/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'sg-black': '#000000',
        'sg-yellow': '#FDBA12',
        'sg-yellow-dark': '#F5A623',
        'sg-green': '#A3E635',
        'sg-gray': '#1a1a1a',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}