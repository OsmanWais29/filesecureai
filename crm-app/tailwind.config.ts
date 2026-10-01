import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Every colour comes from a CSS variable in src/index.css (light + dark themes)
const token = (name: string) => `hsl(var(--${name}))`;
const pair = (name: string) => ({ DEFAULT: token(name), foreground: token(`${name}-foreground`) });

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        primary: pair("primary"),
        secondary: pair("secondary"),
        destructive: pair("destructive"),
        muted: pair("muted"),
        accent: pair("accent"),
        popover: pair("popover"),
        card: pair("card"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [animate],
} satisfies Config;
