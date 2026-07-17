/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F1E',
        surface: '#1A1A2E',
        primary: '#441b91',
        secondary: '#2E2E4E',
        success: '#4CAF50',
        danger: '#F44336',
        accent: '#BB86FC',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
