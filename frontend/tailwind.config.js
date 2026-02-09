/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#F5F5F7',
          text: '#1D1D1F',
        },
      },
      fontFamily: {
        sans: ['"ZCOOL KuaiLe"', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'sans-serif'],
        zcool: ['"ZCOOL KuaiLe"', 'cursive'],
      },
      backdropBlur: {
        '30': '30px',
      },
      borderRadius: {
        '40': '40px',
      },
    },
  },
  plugins: [],
}
