/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ame: {
          black: "var(--ame-black)",
          charcoal: "var(--ame-charcoal)",
          gold: "var(--ame-gold)",
          ink: "var(--ame-ink)",
          muted: "var(--ame-muted)",
          line: "var(--ame-line)",
          panel: "var(--ame-panel)",
          soft: "var(--ame-soft)",
          mist: "var(--ame-mist)",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        ame: "0 5px 24px rgba(0, 0, 0, 0.045)",
      },
    },
  },
};
