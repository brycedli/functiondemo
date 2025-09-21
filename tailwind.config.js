/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      inter: ['var(--font-inter)', 'sans-serif'],
      sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
    extend: {
      colors: {
        black: "#000000",
        gray: {
          950: "#0E0E10",
          900: "#1C1D1F",
          850: "#2A2B2F",
          800: "#3C3D42",
          700: "#4F5355",
          600: "#616867",
          500: "#838C8B",
          400: "#9FA6A5",
          300: "#B0B6B5",
          200: "#C1C6C5",
          150: "#D3D6D5",
          100: "#E4E6E5",
          50: "#F5F6F5"
        },
        blue: {
          500: "#38587D",

        },
        teal: {
          500: "#507173",

        },
        khaki: {
          150: "#E0DCD3",
          100: "#F4EFE6",
          50: "#FEF9EF"
        },
        violet: {
          500: "#786BC4",
        },
        green: {
          500: "#78BD8B",
        },
        red: {
          500: "#9C4D4E",
        },
        orange: {
          500: "#C07858",
        },
        yellow: {
          500: "#D3B35B",
        },
        white: "#FFFFFF"
      }
    },
  },
  plugins: [],
}
