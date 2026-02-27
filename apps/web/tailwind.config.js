/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        calsans: ["var(--font-calsans)"],
      },
      colors: {
        primary: "#0066FF",
        secondary: "#F5A623",
      },
    },
  },
  plugins: [],
};
