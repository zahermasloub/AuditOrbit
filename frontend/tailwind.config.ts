import type { Config } from "tailwindcss";
export default <Partial<Config>>{
darkMode: ["class"],
content: ["./src/**/*.{ts,tsx}"],
theme: {
extend: {
colors: {
bg: "rgb(var(--bg) / <alpha-value>)",
fg: "rgb(var(--fg) / <alpha-value>)",
muted: "rgb(var(--muted) / <alpha-value>)",
surface: "rgb(var(--surface) / <alpha-value>)",
border: "rgb(var(--border) / <alpha-value>)",
accent: { DEFAULT: "hsl(var(--accent-h) var(--accent-s) var(--accent-l))", foreground: "#fff" },
},
borderRadius: { DEFAULT: "var(--r)", lg: "var(--r-lg)" },
boxShadow: { soft: "var(--shadow-1)" },
},
},
plugins: [],
};
