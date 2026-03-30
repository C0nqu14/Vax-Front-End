/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vax: {
          primary: "#1A3A4C",
          bg: "#FFFFFF",
          input: "#F8FAFC",
          error: {
            DEFAULT: "#B91C1C",
            light: "#FFF8F8",
          },
          success: {
            DEFAULT: "#065F46",
            light: "#ECFDF5",
          },
          secondary: "#64748B",
          border: "#E2E8F0",
        }
      },
      fontFamily: {
        interface: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'vax': '0.75rem',
      },
    }
  },
  plugins: [],
}

