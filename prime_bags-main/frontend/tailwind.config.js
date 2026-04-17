/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#0b1220",
          900: "#0f172a",
          700: "#334155",
        },
        accent: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        success: {
          DEFAULT: "#16a34a",
          hover: "#15803d",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(2, 6, 23, 0.10)",
        card: "0 22px 70px rgba(2, 6, 23, 0.14)",
        subtle: "0 8px 24px rgba(2, 6, 23, 0.08)",
      },
    },
  },
  plugins: [],
};
