/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#0f5a2e',
        leaf: '#3aa233',
        leafbright: '#57c437',
        sun: '#f4b400',
        mist: '#f2f7f0',
        ink: '#182a1c', 
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}