import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF7F2",
        beige: "#F5EDE3",
        gold: "#C8A96E",
        "gold-light": "#E8D5A3",
        red: "#C41E3A",
        "red-dark": "#A01830",
        brown: "#3C2415",
        "soft-brown": "#8B7355",
        star: "#F5A623",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
