/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        chwe: {
          blue: "#24211a",
          "blue-dark": "#302a1d",
          "blue-deep": "#29251c",
          green: "#cfb87c",
          "green-dark": "#70581e",
          ink: "#232323",
          muted: "#5f666b",
          line: "#d8dde0",
          soft: "#f6f5f2",
          mist: "#f4eee0",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        chwe: "0 12px 30px rgba(20, 48, 60, 0.10)",
      },
    },
  },
};
