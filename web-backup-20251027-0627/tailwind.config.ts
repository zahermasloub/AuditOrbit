import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--ao-bg) / <alpha-value>)",
        fg: "rgb(var(--ao-fg) / <alpha-value>)",
        muted: "rgb(var(--ao-muted) / <alpha-value>)",
        primary: "rgb(var(--ao-primary) / <alpha-value>)",
        primaryfg: "rgb(var(--ao-primary-fg) / <alpha-value>)",
        border: "rgb(var(--ao-border) / <alpha-value>)",
        card: "rgb(var(--ao-card) / <alpha-value>)",
        cardfg: "rgb(var(--ao-card-fg) / <alpha-value>)",
        success: "rgb(var(--ao-success) / <alpha-value>)",
        warning: "rgb(var(--ao-warning) / <alpha-value>)",
        danger: "rgb(var(--ao-danger) / <alpha-value>)",
        brand: {
          DEFAULT: "#0EA5E9",
          dark: "#0369A1",
        },
      },
      boxShadow: {
        "ao-sm": "var(--ao-shadow-sm)",
        "ao-md": "var(--ao-shadow-md)",
        "ao-lg": "var(--ao-shadow-lg)",
        soft: "0 1px 2px rgba(0,0,0,.05), 0 8px 24px rgba(0,0,0,.08)",
      },
      borderRadius: {
        DEFAULT: "var(--ao-radius-lg)",
        md: "var(--ao-radius-md)",
        lg: "var(--ao-radius-xl)",
        "2xl": "var(--ao-radius-2xl)",
        xl: "1rem",
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
