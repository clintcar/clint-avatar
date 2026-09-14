/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        chwe: {
          blue: "#006a86",
          "blue-dark": "#004f66",
          "blue-deep": "#173b4a",
          green: "#7a9a2d",
          "green-dark": "#617d20",
          ink: "#232323",
          muted: "#5f666b",
          line: "#d8dde0",
          soft: "#f4f6f6",
          mist: "#eef5f7",
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
