/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sdm: {
          black: "#111111",
          gold: "#cfb87c",
          ink: "#222222",
          muted: "#555555",
          line: "#dddddd",
          soft: "#f4f4f4",
          panel: "#111827",
          panel2: "#0b1220",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        sdm: "0 3px 10px rgba(0, 0, 0, 0.06)",
      },
    },
  },
};
