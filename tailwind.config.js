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
          500: "#488AD5",
          300: "#A3C1E2",
        },
        teal: {
          500: "#507173",

        },
        khaki: {
          150: "#E0DCD3",
          100: "#F4EFE6",
          50: "#FEF9EF"
        },
        purple: {
          500: "#786BC4",
          300: "#BBB2D9",
        },
        green: {
          500: "#78BD8B",
        },
        red: {
          500: "#9C4D4E",
          400: "#D18582",
          300: "#DFA8A3",
        },
        orange:{
          500: "#C07858",
          400: "#D19C82",
          300: "#DFB8A3",
          200: "#EACEBD",
          150: "#F1DECF",
          100: "#F7EADD",
          50: "#FAF0E4"
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
